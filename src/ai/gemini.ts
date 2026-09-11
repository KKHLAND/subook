/**
 * 구글 AI Studio(Gemini) REST 호출 래퍼.
 * 서버 없이 브라우저에서 직접 호출한다 — 선생님의 키는 이 컴퓨터 밖으로 나가지 않는다.
 */
const BASE = 'https://generativelanguage.googleapis.com/v1beta'

export class GeminiError extends Error {
  status: number
  retryable: boolean
  constructor(message: string, status: number, retryable: boolean) {
    super(message)
    this.status = status
    this.retryable = retryable
  }
}

/** 키가 살아 있는지 확인하고, 쓸 수 있는 모델 id 목록을 돌려준다. */
export async function testKey(apiKey: string): Promise<string[]> {
  const res = await fetch(`${BASE}/models?key=${encodeURIComponent(apiKey)}`)
  if (!res.ok) {
    const body = await res.text()
    throw new GeminiError(humanize(res.status, body), res.status, false)
  }
  const json = (await res.json()) as { models?: { name: string; supportedGenerationMethods?: string[] }[] }
  return (json.models ?? [])
    .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
    .map((m) => m.name.replace(/^models\//, ''))
}

interface GenOpts {
  apiKey: string
  model: string
  system?: string
  prompt: string
  /** JSON 스키마를 강제하고 파싱된 객체를 돌려받는다 */
  schema?: object
  temperature?: number
  signal?: AbortSignal
}

/** 한 번 호출. 재시도는 호출부(runner)가 담당. */
export async function generate<T = string>(o: GenOpts): Promise<T> {
  const body: Record<string, unknown> = {
    contents: [{ role: 'user', parts: [{ text: o.prompt }] }],
    generationConfig: {
      temperature: o.temperature ?? 0.4,
      ...(o.schema
        ? { responseMimeType: 'application/json', responseSchema: o.schema }
        : {}),
    },
  }
  if (o.system) body.systemInstruction = { parts: [{ text: o.system }] }

  const res = await fetch(
    `${BASE}/models/${encodeURIComponent(o.model)}:generateContent?key=${encodeURIComponent(o.apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: o.signal,
    },
  )

  if (!res.ok) {
    const text = await res.text()
    const retryable = res.status === 429 || res.status === 503 || res.status >= 500
    throw new GeminiError(humanize(res.status, text), res.status, retryable)
  }

  const json = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[]
  }
  const cand = json.candidates?.[0]
  const text = cand?.content?.parts?.map((p) => p.text ?? '').join('') ?? ''

  if (!text) {
    const reason = cand?.finishReason ?? 'EMPTY'
    throw new GeminiError(
      reason === 'MAX_TOKENS'
        ? '답변이 너무 길어 잘렸습니다. 지문을 나눠서 다시 시도해 주세요.'
        : `AI가 빈 응답을 보냈습니다. (${reason})`,
      200,
      reason === 'MAX_TOKENS' ? false : true,
    )
  }

  if (!o.schema) return text as T
  try {
    return JSON.parse(text) as T
  } catch {
    // 모델이 ```json 으로 감싸는 경우가 있어 한 번 걷어낸다
    const stripped = text.replace(/^\s*```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '')
    return JSON.parse(stripped) as T
  }
}

function humanize(status: number, body: string): string {
  if (status === 400 && /API key not valid/i.test(body)) return 'API 키가 올바르지 않습니다. 다시 확인해 주세요.'
  if (status === 401 || status === 403) return 'API 키에 권한이 없습니다. 구글 AI Studio에서 키를 새로 발급해 주세요.'
  if (status === 429) return '무료 사용 한도에 걸렸습니다. 잠시 후 자동으로 다시 시도합니다.'
  if (status === 503) return '구글 서버가 혼잡합니다. 잠시 후 다시 시도합니다.'
  if (status >= 500) return `구글 서버 오류 (${status}). 잠시 후 다시 시도합니다.`
  try {
    const j = JSON.parse(body) as { error?: { message?: string } }
    if (j.error?.message) return j.error.message
  } catch { /* 본문이 JSON이 아니면 그대로 둔다 */ }
  return `요청 실패 (${status})`
}
