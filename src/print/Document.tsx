import { useDoc, type LayoutMode } from '../store/useDoc'
import { labelOf } from '../ai/runner'
import Cover from './Cover'
import { Foot, Head, Paper } from './Paper'
import { CloseReading, KeyGuide, SentenceRead, Translation, VocabList, VocabTest } from './items'
import { AnswerSheet, PairDrill, QuestionPage, SentenceDrill, Writing } from './questionItems'
import type { RenderPage } from './pages'
import { usePages } from './usePages'

/**
 * 완성된 자료 전체(표지 + 본문). 화면 미리보기와 인쇄가 같은 DOM 을 쓴다.
 * `only` 를 주면 그 한 장만 그린다 (미리보기 캐러셀용).
 */
export default function Document({ only }: { only?: number }) {
  const doc = useDoc()
  const setDoc = useDoc((s) => s.set)

  const pages = usePages().filter((p) => !p.excluded)
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
        showQuestionNo={multiQuestion && p.role !== 'answer'}
        itemKeys={itemKeys}
        currentItem={p.itemKey}
        part={p.part}
        partCount={p.partCount}
        note={p.role === 'answer' ? '해설지' : undefined}
      />
      <Item page={p} layout={doc.layoutMode} multiQuestion={multiQuestion} />
      <Foot page={i + 2} total={total} />
    </Paper>
  ))

  const all = [cover, ...body]
  if (only !== undefined) return all[only] ?? null
  return <>{all}</>
}

function Item({
  page,
  layout,
  multiQuestion,
}: {
  page: RenderPage
  layout: LayoutMode
  multiQuestion: boolean
}) {
  const startNo = (page.data as { startNo?: number })?.startNo ?? 1
  const props = { data: page.data, layout, startNo }

  if (page.role === 'answer') {
    return <AnswerSheet data={page.data} startNo={startNo} multiQuestion={multiQuestion} />
  }
  if (page.itemKey === '__questions') {
    return <QuestionPage data={page.data} startNo={startNo} multiQuestion={multiQuestion} />
  }

  switch (page.itemKey) {
    /* 공부용 자료 */
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

    /* 어법·어휘 문장 훈련 */
    case 'grammar_pick4':
    case 'vocab_pick4':
      return <SentenceDrill data={page.data} startNo={startNo} heading={labelOf(page.itemKey)} />
    case 'grammar_pair':
    case 'vocab_pair':
      return <PairDrill data={page.data} startNo={startNo} heading={labelOf(page.itemKey)} />

    /* 영작·서술형 */
    case 'condition_writing':
    case 'sentence_completion':
    case 'summary_writing':
      return <Writing data={page.data} startNo={startNo} heading={labelOf(page.itemKey)} />

    default:
      return <div className="doc-content flex-1" />
  }
}
