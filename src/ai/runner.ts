import { generate, GeminiError } from './gemini'
import { PROMPTS, SYSTEM } from './prompts'
import { SCHEMAS } from './schemas'
import type { VocabListData } from './types'
import { splitSentences } from '../lib/segment'
import { SET_ITEMS } from '../lib/sets'
import type { GeneratedPage, Question } from '../store/useDoc'

/** 무료 티어 분당 호출 한도에 맞춘 최소 간격(ms) */
const MIN_GAP: Record<string, number> = {
  'gemini-2.5-pro': 12_500,        // 5 RPM
  'gemini-2.5-flash': 6_500,       // 10 RPM
  'gemini-2.5-flash-lite': 4_200,  // 15 RPM
}

/** 단어 리스트에서 파생되는 항목 — AI를 부르지 않는다 */
const DERIVED: Record<string, string> = {
  meaning_test: 'vocab_list',
  spelling_test: 'vocab_list',
}

export type LogLevel = 'busy' | 'done' | 'warn' | 'fail'

export interface RunHandlers {
  onLog: (level: LogLevel, text: string) => void
  onProgress: (done: number, total: number) => void
  onPage: (page: GeneratedPage) => void
}

export interface RunOptions extends RunHandlers {
  questions: Question[]
  /** 사용자가 고른 항목 key. 화면 표시 순서 그대로 */
  items: string[]
  apiKey: string
  model: string
  signal: AbortSignal
}

export async function runGeneration(o: RunOptions): Promise<void> {
  const { questions, items, model, signal } = o

  // 파생 항목이 있으면 원본 항목을 내부적으로 먼저 만든다
  const needed = new Set(items)
  for (const it of items) if (DERIVED[it]) needed.add(DERIVED[it])
  const aiItems = [...needed].filter((k) => !DERIVED[k])

  const total = questions.length * aiItems.length
  let done = 0
  let lastCall = 0

  o.onLog('done', `지문 ${questions.length}개 · 항목 ${items.length}종 — 총 ${total}회 분석`)

  for (const q of questions) {
    const sentences = splitSentences(q.text)
    const ctx = { passage: q.text, sentences }
    const results = new Map<string, unknown>()

    o.onLog('busy', `${questions.length > 1 ? `${q.no}번 ` : ''}지문 — 문장 ${sentences.length}개`)

    for (const itemKey of aiItems) {
      signal.throwIfAborted()

      // 호출 간격 유지 (무료 한도 초과 방지)
      const gap = (MIN_GAP[model] ?? 6_500) - (Date.now() - lastCall)
      if (lastCall && gap > 0) {
        o.onLog('busy', `무료 한도 간격 대기 ${(gap / 1000).toFixed(1)}초`)
        await sleep(gap, signal)
      }

      const label = labelOf(itemKey)
      o.onLog('busy', `${label} 생성 중…`)

      const data = await withRetry(
        () => {
          lastCall = Date.now()
          return generate<unknown>({
            apiKey: o.apiKey,
            model,
            system: SYSTEM,
            prompt: PROMPTS[itemKey](ctx),
            schema: SCHEMAS[itemKey],
            temperature: itemKey === 'vocab_list' ? 0.2 : 0.4,
            signal,
          })
        },
        o.onLog,
        signal,
      )

      results.set(itemKey, data)
      done += 1
      o.onProgress(done, total)
      o.onLog('done', `${label} 완료 ${summarize(itemKey, data)}`)

      if (items.includes(itemKey)) {
        o.onPage(makePage(itemKey, q.no, data))
      }
    }

    // 파생 항목 (단어 테스트) — 호출 없이 단어 리스트를 재사용
    for (const itemKey of items) {
      const src = DERIVED[itemKey]
      if (!src) continue
      const base = results.get(src) as VocabListData | undefined
      if (!base) continue
      o.onPage(makePage(itemKey, q.no, base))
      o.onLog('done', `${labelOf(itemKey)} 완료 (단어 리스트에서 생성)`)
    }
  }

  o.onLog('done', '모든 자료가 준비됐습니다.')
}

/* ── 재시도 ─────────────────────────────────────────────── */

const MAX_TRY = 4

async function withRetry<T>(
  fn: () => Promise<T>,
  onLog: RunHandlers['onLog'],
  signal: AbortSignal,
): Promise<T> {
  let lastErr: unknown
  for (let attempt = 1; attempt <= MAX_TRY; attempt++) {
    try {
      return await fn()
    } catch (e) {
      lastErr = e
      if (signal.aborted) throw e
      const retryable = e instanceof GeminiError && e.retryable
      if (!retryable || attempt === MAX_TRY) break
      const backoff = Math.min(60_000, 5_000 * 2 ** (attempt - 1))
      onLog('warn', `${(e as Error).message} — ${backoff / 1000}초 후 재시도 (${attempt}/${MAX_TRY - 1})`)
      await sleep(backoff, signal)
    }
  }
  throw lastErr
}

function sleep(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => {
      signal.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(t)
      reject(signal.reason ?? new DOMException('중단됨', 'AbortError'))
    }
    signal.addEventListener('abort', onAbort, { once: true })
  })
}

/* ── 보조 ───────────────────────────────────────────────── */

/** 항목 key → 화면에 보여 줄 이름. 세트 정의에서 그대로 끌어온다 */
const LABELS: Record<string, string> = Object.fromEntries(
  Object.values(SET_ITEMS).flatMap((items) => items.map((i) => [i.key, i.label])),
)
export const labelOf = (k: string) => LABELS[k] ?? k

function makePage(itemKey: string, questionNo: number, data: unknown): GeneratedPage {
  return {
    id: `${questionNo}-${itemKey}`,
    itemKey,
    questionNo,
    data,
    excluded: false,
  }
}

function summarize(itemKey: string, data: unknown): string {
  const d = data as Record<string, unknown>
  if (itemKey === 'translation') return `(문장 ${(d.sentences as unknown[])?.length ?? 0}개)`
  if (itemKey === 'vocab_list') return `(단어 ${(d.words as unknown[])?.length ?? 0}개)`
  if (itemKey === 'sentence_read') return `(문장 ${(d.items as unknown[])?.length ?? 0}개)`
  if (itemKey === 'close_reading') return `(질문 ${(d.items as unknown[])?.length ?? 0}개)`
  return ''
}
