import { useDoc } from '../store/useDoc'
import { itemsFor } from '../lib/sets'
import { labelOf } from '../ai/runner'
import { paginate, type RenderPage } from './pages'

/** 현재 출력 설정에 맞춰 나눈 페이지 목록 */
export function usePages(): RenderPage[] {
  const doc = useDoc()
  return paginate(doc.generated, {
    includeAnswers: doc.includeAnswers,
    sort: doc.sortMode,
    itemOrder: itemsFor(doc.setKey, doc.shape).map((i) => i.key),
    labelOf,
  })
}
