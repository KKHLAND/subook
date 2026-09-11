import type { GeneratedPage } from '../store/useDoc'
import { kindOf } from '../lib/sets'
import type {
  QuestionData,
  SentenceReadData,
  TranslationData,
  VocabListData,
  WritingData,
} from '../ai/types'

/**
 * 생성 결과를 A4 페이지 배열로 나눈다.
 *
 * 두 가지를 한다.
 *  1) 한 항목이 A4 한 장을 넘기면(단어 30개, 문장 12개 …) 정해진 분량으로 쪼갠다.
 *  2) 문제 유형은 «문제»와 «해설»을 따로 떼어 낸다. 문제지만 뽑아 나눠 주고
 *     해설지는 교사가 따로 갖는 것이 실제 수업 방식이기 때문이다.
 *     해설은 종이를 아끼려고 여러 문항을 한 장에 모은다.
 */

export type PageRole = 'study' | 'question' | 'answer'

export interface RenderPage {
  id: string
  itemKey: string
  questionNo: number
  role: PageRole
  /** 같은 항목이 여러 장일 때 몇 번째인지 (1부터) */
  part: number
  partCount: number
  data: unknown
  excluded: boolean
}

/** 해설 한 장에 담을 문항 수 */
const ANSWERS_PER_PAGE = 3

/** 문제 한 장에서 본문이 쓸 수 있는 높이(px). A4 1123px 에서 여백·머리글·바닥글을 뺀 실측값 */
const PAGE_BODY = 955
/** 문항 사이 여백(px) */
const QUESTION_GAP = 23

/** 문제지·해설지에 실리는 문항 하나 */
export interface QuestionEntry {
  itemKey: string
  /** 몇 번째 지문에서 나온 문항인지 */
  questionNo: number
  label: string
  /** 문제지에 인쇄되는 문항 번호 (1부터 이어서) */
  no: number
  data: unknown
}
export interface EntriesPageData {
  entries: QuestionEntry[]
}
/** 이전 이름 — 해설지가 쓰던 것 */
export type AnswerEntry = QuestionEntry
export type AnswerPageData = EntriesPageData

/** 항목별 한 장 분량 */
const PER_PAGE: Record<string, number> = {
  translation: 7, // 문장
  sentence_read: 6, // 문장
  vocab_list: 18, // 단어
  meaning_test: 20, // 단어 (2단 × 10줄)
  spelling_test: 20,
  grammar_pick4: 8, // 문장
  vocab_pick4: 8,
  grammar_pair: 12,
  vocab_pair: 12,
}

export type SortMode = 'byQuestion' | 'byType'

export interface PaginateOptions {
  /** 해설지를 함께 낼지 */
  includeAnswers?: boolean
  /** 문제 순서 — 문항 번호 순 / 문제 유형 순 */
  sort?: SortMode
  /** 항목 표시 순서 (세트에 정의된 순서) */
  itemOrder?: string[]
  labelOf?: (k: string) => string
}

export function paginate(generated: GeneratedPage[], opts: PaginateOptions = {}): RenderPage[] {
  const { includeAnswers = true, sort = 'byQuestion', itemOrder = [], labelOf = (k) => k } = opts

  const study: RenderPage[] = []
  const pending: (QuestionEntry & { excluded: boolean })[] = []

  for (const g of generated) {
    if (kindOf(g.itemKey) === 'study') {
      study.push(...chunkStudy(g))
      continue
    }
    pending.push({
      itemKey: g.itemKey,
      questionNo: g.questionNo ?? 1,
      label: labelOf(g.itemKey),
      no: 0, // 정렬한 뒤에 매긴다
      data: g.data,
      excluded: g.excluded,
    })
  }

  const rank = (k: string) => {
    const i = itemOrder.indexOf(k)
    return i < 0 ? 999 : i
  }
  pending.sort((a, b) =>
    sort === 'byQuestion'
      ? a.questionNo - b.questionNo || rank(a.itemKey) - rank(b.itemKey)
      : rank(a.itemKey) - rank(b.itemKey) || a.questionNo - b.questionNo,
  )

  // 인쇄에 남는 문항에만 번호를 매긴다
  const live = pending.filter((p) => !p.excluded)
  live.forEach((p, i) => {
    p.no = i + 1
  })

  // 문제지 — 한 장이 찰 때까지 문항을 채워 넣는다
  const questionPages: RenderPage[] = []
  let bucket: QuestionEntry[] = []
  let used = 0

  const flush = () => {
    if (!bucket.length) return
    questionPages.push({
      id: `questions-${questionPages.length + 1}`,
      itemKey: '__questions',
      questionNo: bucket[0].questionNo,
      role: 'question',
      part: questionPages.length + 1,
      partCount: 0, // 아래에서 채운다
      data: { entries: bucket } satisfies EntriesPageData,
      excluded: false,
    })
    bucket = []
    used = 0
  }

  for (const entry of live) {
    const h = estimateHeight(entry.data)
    if (bucket.length && used + h > PAGE_BODY) flush()
    bucket.push(entry)
    used += h + QUESTION_GAP
  }
  flush()
  questionPages.forEach((p) => {
    p.partCount = questionPages.length
  })

  // 해설지 — 같은 순서로 장당 몇 개씩 묶는다
  const answerPages: RenderPage[] = []
  if (includeAnswers) {
    for (let i = 0; i < live.length; i += ANSWERS_PER_PAGE) {
      const entries = live.slice(i, i + ANSWERS_PER_PAGE)
      answerPages.push({
        id: `answers-${answerPages.length + 1}`,
        itemKey: '__answers',
        questionNo: entries[0].questionNo,
        role: 'answer',
        part: answerPages.length + 1,
        partCount: Math.ceil(live.length / ANSWERS_PER_PAGE),
        data: { entries } satisfies EntriesPageData,
        excluded: false,
      })
    }
  }

  return [...study, ...questionPages, ...answerPages]
}

/**
 * 문항 하나가 지면에서 차지할 높이(px)를 어림한다.
 *
 * 실제로 그려 보고 재는 편이 정확하지만 인쇄 직전에야 알 수 있어 쓰기 어렵다.
 * 아래 수치는 브라우저에서 실제로 잰 값이다 — 지문 390자짜리 문항이 292px 였고,
 * 이 식으로 계산하면 293px 이 나온다.
 */
function estimateHeight(data: unknown): number {
  const d = data as QuestionData & WritingData

  // 서술형은 답을 쓸 칸이 지면을 채우도록 되어 있어 한 장을 통째로 쓴다
  if (Array.isArray(d.items)) return PAGE_BODY

  // 10pt 영문 한 줄에 들어가는 글자 수. 433자 지문이 정확히 5줄(120px)로 그려졌으므로 86.6자.
  // 한 줄을 덜 세는 쪽이 안전하지 않으니 살짝 넉넉히 88 로 잡고, PAGE_BODY 에 여유를 둔다.
  const CPL = 88
  const LINE = 24 // 줄 높이
  const CHOICE = 23 // 선택지 한 줄
  const BOX = 30 // 상자 안쪽 여백 + 아래 여백
  const lines = (t?: string) => (t ? Math.ceil(t.length / CPL) : 0)

  let h = 28 // 발문
  if (d.lead) h += lines(d.lead) * LINE + BOX
  const bodyChars = (d.parts ?? []).reduce((a, p) => a + p.text.length, 0)
  if (bodyChars) h += Math.ceil(bodyChars / CPL) * LINE + BOX
  h += (d.blocks ?? []).reduce((a, b) => a + lines(b.text) * LINE + 8, 0)
  if (d.tail) h += lines(d.tail) * LINE + BOX
  h += (d.choices ?? []).reduce((a, c) => a + Math.max(1, lines(c)) * CHOICE, 0)

  return h
}

/* ── 공부용 자료 쪼개기 ───────────────────────────────── */

function chunkStudy(g: GeneratedPage): RenderPage[] {
  const chunks = chunkOf(g)
  return chunks.map((data, i) => ({
    id: chunks.length > 1 ? `${g.id}-${i + 1}` : g.id,
    itemKey: g.itemKey,
    questionNo: g.questionNo ?? 1,
    role: 'study' as const,
    part: i + 1,
    partCount: chunks.length,
    data,
    excluded: g.excluded,
  }))
}

function chunkOf(g: GeneratedPage): unknown[] {
  const size = PER_PAGE[g.itemKey]
  if (!size) return [g.data]

  switch (g.itemKey) {
    case 'translation': {
      const d = g.data as TranslationData
      const groups = split(d.sentences ?? [], size)
      // 단어장은 마지막 장에만 붙인다
      return groups.map((sentences, i) => ({
        ...d,
        sentences,
        words: i === groups.length - 1 ? d.words : [],
        startNo: i * size + 1,
      }))
    }
    case 'sentence_read': {
      const d = g.data as SentenceReadData
      return split(d.items ?? [], size).map((items, i) => ({ ...d, items, startNo: i * size + 1 }))
    }
    case 'vocab_list':
    case 'meaning_test':
    case 'spelling_test': {
      const d = g.data as VocabListData
      return split(d.words ?? [], size).map((words, i) => ({ ...d, words, startNo: i * size + 1 }))
    }
    case 'grammar_pick4':
    case 'vocab_pick4':
    case 'grammar_pair':
    case 'vocab_pair': {
      const d = g.data as { items?: unknown[] }
      return split(d.items ?? [], size).map((items, i) => ({ ...d, items, startNo: i * size + 1 }))
    }
    default:
      return [g.data]
  }
}

function split<T>(arr: T[], size: number): T[][] {
  if (arr.length <= size) return [arr]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/* ── 넘침 경고 ────────────────────────────────────────── */

/** 한 장에 담기 어려워 보이는 항목인지 — 결과 화면에서 안내에 쓴다 */
export function looksLong(itemKey: string, data: unknown): boolean {
  if (kindOf(itemKey) === 'question') {
    const d = data as QuestionData
    const body =
      (d.lead ?? '').length +
      (d.parts ?? []).reduce((a, p) => a + p.text.length, 0) +
      (d.blocks ?? []).reduce((a, b) => a + b.text.length, 0) +
      (d.choices ?? []).join('').length
    return body > 2600
  }
  if (kindOf(itemKey) === 'writing') {
    const d = data as WritingData
    return (d.items ?? []).length > 5
  }
  return false
}
