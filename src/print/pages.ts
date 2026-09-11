import type { GeneratedPage } from '../store/useDoc'
import type {
  CloseReadingData,
  SentenceReadData,
  TranslationData,
  VocabListData,
} from '../ai/types'

/**
 * 생성 결과를 A4 페이지 배열로 나눈다.
 *
 * 한 항목이 A4 한 장을 넘길 수 있어서(단어 30개, 문장 12개 …) 항목마다 한 장에 들어갈
 * 분량을 정해 두고 쪼갠다. 넘쳐서 잘리는 것보다 두 장으로 나오는 편이 낫다.
 */

export interface RenderPage {
  id: string
  itemKey: string
  questionNo: number
  /** 같은 항목이 여러 장일 때 몇 번째인지 (1부터) */
  part: number
  partCount: number
  data: unknown
  excluded: boolean
}

/** 항목별 한 장 분량 */
const PER_PAGE: Record<string, number> = {
  translation: 7, // 문장
  sentence_read: 6, // 문장
  vocab_list: 18, // 단어
  meaning_test: 20, // 단어 (2단 × 10줄)
  spelling_test: 20,
}

export function paginate(generated: GeneratedPage[]): RenderPage[] {
  const out: RenderPage[] = []

  for (const g of generated) {
    const chunks = chunkOf(g)
    chunks.forEach((data, i) => {
      out.push({
        id: chunks.length > 1 ? `${g.id}-${i + 1}` : g.id,
        itemKey: g.itemKey,
        questionNo: g.questionNo ?? 1,
        part: i + 1,
        partCount: chunks.length,
        data,
        excluded: g.excluded,
      })
    })
  }

  return out
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

/** 정밀 판독은 질문 6개 + 해설이 한 장에 들어간다는 전제. 넘치면 경고용으로 쓴다. */
export function looksLong(itemKey: string, data: unknown): boolean {
  if (itemKey !== 'close_reading') return false
  const d = data as CloseReadingData
  const chars = (d.items ?? []).reduce((a, i) => a + i.question.length + i.answer.length, 0)
  return chars > 1400
}
