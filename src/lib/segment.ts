import type { Question } from '../store/useDoc'

/**
 * 붙여넣은 텍스트를 문항(지문) 단위로 나눈다.
 *
 * 선생님들이 실제로 붙여넣는 형태를 순서대로 시도한다.
 *   1) 번호 매김  — "31." / "31)" / "[31]" / "※ 31~32" 로 시작하는 줄
 *   2) 빈 줄      — 문단 사이 빈 줄
 *   3) 통째로     — 나눌 근거가 없으면 지문 하나로 본다
 */

/** 줄 맨 앞의 문항 번호. 연도(2025.)나 소수점은 걸러낸다. */
const NUM_HEAD = /^\s*(?:\[\s*(\d{1,2})\s*\]|(\d{1,2})\s*[.)]|※\s*(\d{1,2}))(?!\d)\s+/

/** 지시문으로 자주 쓰이는 한국어 문구 — 지문 본문에서 떼어낸다 */
const DIRECTIVE = /^\s*(?:다음|위|아래)\s*(?:글|지문|문장)[^\n]{0,40}(?:고르시오|쓰시오|답하시오|것은\??)\s*[.?]?\s*$/

export interface SegmentResult {
  questions: Question[]
  /** 어떤 방법으로 나눴는지 — 화면에 그대로 보여준다 */
  method: 'numbered' | 'blank-line' | 'single'
}

/** 번호가 붙어 있으면 확실한 신호라 기준을 낮게 본다 */
const MIN_WORDS_NUMBERED = 25
/** 빈 줄은 한 지문 안의 문단 구분일 수도 있어 기준을 높게 잡는다 */
const MIN_WORDS_BLANK = 40

export function segment(raw: string): SegmentResult {
  const text = raw.replace(/\r\n?/g, '\n').trim()
  if (!text) return { questions: [], method: 'single' }

  const byNumber = splitByNumber(text)
  if (byNumber.length >= 2) return { questions: byNumber, method: 'numbered' }

  const byBlank = splitByBlankLine(text)
  if (byBlank.length >= 2) return { questions: byBlank, method: 'blank-line' }

  return { questions: [{ no: 1, text: clean(text) }], method: 'single' }
}

/** 나눠 놓은 지문을 하나로 되돌린다 (선생님이 분리를 취소할 때) */
export function mergeQuestions(questions: Question[]): Question[] {
  return [{ no: 1, text: questions.map((q) => q.text).join('\n\n') }]
}

function splitByNumber(text: string): Question[] {
  const lines = text.split('\n')
  const chunks: { no: number; lines: string[] }[] = []

  for (const line of lines) {
    const m = line.match(NUM_HEAD)
    if (m) {
      const no = Number(m[1] ?? m[2] ?? m[3])
      chunks.push({ no, lines: [line.slice(m[0].length)] })
    } else if (chunks.length) {
      chunks[chunks.length - 1].lines.push(line)
    }
    // 첫 번호 앞의 머리말은 버린다
  }

  return chunks
    .map((c) => ({ no: c.no, text: clean(c.lines.join('\n')) }))
    .filter((q) => wordCount(q.text) >= MIN_WORDS_NUMBERED)
}

function splitByBlankLine(text: string): Question[] {
  const chunks = text.split(/\n\s*\n+/).map(clean).filter(Boolean)
  // 한 덩어리라도 지문이라 보기 어려우면, 한 지문 안의 문단 구분으로 판단해 나누지 않는다
  if (chunks.some((t) => wordCount(t) < MIN_WORDS_BLANK)) return []
  return chunks.map((t, i) => ({ no: i + 1, text: t }))
}

/** 지시문 줄 제거 + 줄바꿈으로 끊긴 문장 잇기 */
function clean(t: string): string {
  const kept = t
    .split('\n')
    .filter((l) => !DIRECTIVE.test(l))
    .join('\n')

  return kept
    .split(/\n\s*\n+/)
    .map((para) =>
      para
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)
        .join(' '),
    )
    .filter(Boolean)
    .join('\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

/** 두 글자 이상 영어 단어 수 */
export function wordCount(t: string): number {
  return (t.match(/[A-Za-z]{2,}/g) ?? []).length
}

/** 뒤에 대문자가 와도 문장이 끝나지 않는 약어 (Dr. Smith …) */
const ABBR = /\b(?:Mr|Mrs|Ms|Dr|Prof|St|Sgt|Gen|Rev|Jr|Sr|Inc|Ltd|Co|Fig|No|vs|etc|approx|cf)\.$/i
/** a.m. / e.g. / U.S. 처럼 한 글자마다 마침표가 찍힌 약어 */
const DOTTED = /(?:^|[\s(])(?:[A-Za-z]\.)+$/

/**
 * 지문을 문장 단위로 나눈다 (해석·한 문장 읽기 항목에서 사용).
 *
 * 마침표만으로는 약어와 문장 끝을 구별할 수 없어서, **다음 조각이 대문자로 시작하는지**를
 * 함께 본다. 소문자로 이어지면 아직 한 문장이다. ("The U.S. study" → 안 끊음)
 * 닫는 따옴표·괄호는 앞 문장에 붙여 둔다.
 */
export function splitSentences(passage: string): string[] {
  const flat = passage.replace(/\s+/g, ' ').trim()
  if (!flat) return []

  // 마침표류 + 뒤따르는 닫는 부호까지를 한 덩어리로 집는다
  const chunks = flat.match(/[^.!?]*[.!?]+["'”’)\]]*\s*|[^.!?]+$/g) ?? [flat]

  const out: string[] = []
  let buf = ''

  for (let i = 0; i < chunks.length; i++) {
    buf += chunks[i]
    const trimmed = buf.trim()
    const next = chunks[i + 1]?.trimStart() ?? ''

    // 다음 조각이 대문자로 시작하지 않으면 아직 한 문장이다
    const nextIsLower = !/^["'“‘(]?[A-Z]/.test(next)
    // "U." 다음에 "S." 처럼 약어가 이어지는 경우
    const nextContinuesAbbr = /^[A-Za-z]\./.test(next)

    const continues =
      next !== '' &&
      (ABBR.test(trimmed) ||
        (DOTTED.test(trimmed) && (nextIsLower || nextContinuesAbbr)) ||
        (/\d\.$/.test(trimmed) && nextIsLower))

    if (continues) continue
    out.push(trimmed)
    buf = ''
  }
  if (buf.trim()) out.push(buf.trim())

  return out.filter((s) => /[A-Za-z]/.test(s))
}
