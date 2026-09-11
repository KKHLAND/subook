import { useDoc } from '../store/useDoc'
import Cover from './Cover'
import { Foot, Head, Paper } from './Paper'
import { CloseReading, KeyGuide, SentenceRead, Translation, VocabList, VocabTest } from './items'
import { paginate, type RenderPage } from './pages'

/**
 * 완성된 자료 전체(표지 + 본문). 화면 미리보기와 인쇄가 같은 DOM 을 쓴다.
 * `only` 를 주면 그 한 장만 그린다 (미리보기 캐러셀용).
 */
export default function Document({ only }: { only?: number }) {
  const doc = useDoc()
  const setDoc = useDoc((s) => s.set)

  const pages = paginate(doc.generated).filter((p) => !p.excluded)
  const total = pages.length + 1 // 표지 포함
  const multiQuestion = doc.questions.length > 1
  const itemKeys = [...new Set(doc.generated.map((g) => g.itemKey))]

  const cover = (
    <Cover
      key="cover"
      setKey={doc.setKey}
      title={doc.title || '제목 없는 자료'}
      schoolName={doc.schoolName}
      classInfo={doc.classInfo}
      style={doc.coverStyle}
      onEdit={(f, v) => setDoc(f, v)}
    />
  )

  const body = pages.map((p, i) => (
    <Paper key={p.id} bordered={doc.showBorder}>
      <Head
        setKey={doc.setKey}
        title={doc.title || '제목 없는 자료'}
        questionNo={p.questionNo}
        showQuestionNo={multiQuestion}
        itemKeys={itemKeys}
        currentItem={p.itemKey}
        part={p.part}
        partCount={p.partCount}
      />
      <Item page={p} layout={doc.layoutMode} />
      <Foot page={i + 2} total={total} />
    </Paper>
  ))

  const all = [cover, ...body]
  if (only !== undefined) return all[only] ?? null
  return <>{all}</>
}

function Item({ page, layout }: { page: RenderPage; layout: ReturnType<typeof useDoc.getState>['layoutMode'] }) {
  const data = page.data as { startNo?: number }
  const startNo = data?.startNo ?? 1
  const props = { data: page.data, layout, startNo }

  switch (page.itemKey) {
    case 'translation':
      return <Translation {...props} />
    case 'key_guide':
      return <KeyGuide {...props} />
    case 'sentence_read':
      return <SentenceRead {...props} />
    case 'close_reading':
      return <CloseReading {...props} />
    case 'vocab_list':
      return <VocabList {...props} />
    case 'meaning_test':
      return <VocabTest {...props} mode="meaning" />
    case 'spelling_test':
      return <VocabTest {...props} mode="spelling" />
    default:
      return <div className="doc-content flex-1" />
  }
}

