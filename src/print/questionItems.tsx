import type {
  PairDrillData,
  PassagePart,
  QuestionData,
  SentenceDrillData,
  WritingData,
} from '../ai/types'
import type { EntriesPageData } from './pages'

/**
 * 문제 유형 조판.
 * 제목·요지·빈칸·순서·삽입 … 열한 가지가 <Question> 하나를 함께 쓴다.
 */

const CIRCLED = ['①', '②', '③', '④', '⑤']

interface Props {
  data: unknown
  /** 여러 장으로 나뉜 경우 이 장의 첫 번호 */
  startNo: number
}

type Chunked<T> = T & { startNo?: number }

/* ── 문제 ────────────────────────────────────────────── */

/** 본문 조각. mark 가 붙은 자리는 ①②③ 로 표시한다 */
function Parts({ parts, slots }: { parts: PassagePart[]; slots: boolean }) {
  return (
    <p className="doc-en leading-[1.8]">
      {parts.map((p, i) => {
        if (!p.mark) return <span key={i}>{p.text}</span>
        // 문장 삽입 — 문장 «사이»의 들어갈 자리만 표시한다
        if (slots) {
          return (
            <span key={i} className="mx-[0.8mm] font-bold text-slate-900">
              ({CIRCLED[p.mark - 1]})
            </span>
          )
        }
        // 밑줄 문제 — 해당 부분에 번호와 밑줄
        return (
          <span key={i} className="underline decoration-slate-500 underline-offset-2">
            <sup className="doc-sup font-bold text-slate-900">{CIRCLED[p.mark - 1]}</sup>
            {p.text}
          </span>
        )
      })}
    </p>
  )
}

/** 서술형 자료인지 — 문제 유형과 틀이 다르다 */
function isWritingData(data: unknown): boolean {
  return Array.isArray((data as WritingData)?.items)
}

/** 지문이 같은지 가리는 열쇠 — 같으면 한 장 안에서 한 번만 싣는다 */
function passageKey(data: unknown): string {
  const d = data as QuestionData
  return JSON.stringify([d.lead ?? '', d.parts ?? [], d.blocks ?? [], d.tail ?? ''])
}

/** 문제지 한 장 — 들어갈 만큼 문항을 담는다 */
export function QuestionPage({ data, multiQuestion }: Props & { multiQuestion: boolean }) {
  const d = data as EntriesPageData
  const entries = d.entries ?? []

  // 나란히 놓인 문항들이 같은 지문을 쓰면 한 덩어리로 묶는다
  const groups: { key: string; entries: typeof entries }[] = []
  for (const e of entries) {
    const key = passageKey(e.data)
    const last = groups[groups.length - 1]
    if (last && last.key === key) last.entries.push(e)
    else groups.push({ key, entries: [e] })
  }

  // 서술형은 답을 쓸 칸이 필요해 다른 틀로 그린다
  const writingOnly = entries.length === 1 && isWritingData(entries[0].data)
  if (writingOnly) {
    const e = entries[0]
    return <Writing data={e.data} startNo={e.no} heading={`${e.no}. ${e.label}`} />
  }

  return (
    <div className="doc-content flex-1">
      <div className="space-y-[6mm]">
        {groups.map((g, gi) => (
          <div key={gi}>
            {/* 한 지문에 여러 문항이면 발문을 위에 모아 보여 준다 */}
            {g.entries.length > 1 && (
              <div className="mb-[2mm] space-y-[0.8mm]">
                {g.entries.map((e) => (
                  <Directive
                    key={e.no}
                    no={e.no}
                    text={(e.data as QuestionData).directive}
                    source={multiQuestion ? e.questionNo : undefined}
                  />
                ))}
              </div>
            )}
            {g.entries.length === 1 && (
              <Directive
                no={g.entries[0].no}
                text={(g.entries[0].data as QuestionData).directive}
                source={multiQuestion ? g.entries[0].questionNo : undefined}
              />
            )}

            <Passage data={g.entries[0].data} />

            <div className={g.entries.length > 1 ? 'space-y-[3mm]' : ''}>
              {g.entries.map((e) => (
                <Choices
                  key={e.no}
                  no={g.entries.length > 1 ? e.no : undefined}
                  choices={(e.data as QuestionData).choices ?? []}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Directive({ no, text, source }: { no: number; text: string; source?: number }) {
  return (
    <h2 className="mb-[2mm] flex items-baseline gap-[1.5mm] text-[10.5pt] font-bold text-slate-900">
      <span>{no}.</span>
      <span className="flex-1">{text}</span>
      {source !== undefined && (
        <span className="shrink-0 text-[7pt] font-normal text-slate-400">지문 {source}</span>
      )}
    </h2>
  )
}

/** 문항의 «읽을거리» 부분 — 주어진 글, 본문, (A)(B)(C), 요약문 */
function Passage({ data }: { data: unknown }) {
  const d = data as QuestionData
  const parts = d.parts ?? []
  // 표시된 자리에 글이 없으면 «문장 삽입» 처럼 자리만 가리키는 문제다
  const slots = parts.some((p) => p.mark && !p.text.trim())

  return (
    <>
      {d.lead && (
        <div className="mb-[3mm] border border-slate-400 px-[3mm] py-[2mm]">
          <p className="doc-en">{d.lead}</p>
        </div>
      )}

      {parts.length > 0 && (
        <div className="mb-[3mm] bg-slate-50 px-[3mm] py-[2.5mm]">
          <Parts parts={parts} slots={slots} />
        </div>
      )}

      {(d.blocks ?? []).length > 0 && (
        <div className="mb-[3mm] space-y-[2mm]">
          {d.blocks!.map((b) => (
            <div key={b.label} className="flex gap-[2mm]">
              <span className="shrink-0 text-[10pt] font-bold text-slate-900">({b.label})</span>
              <p className="doc-en flex-1">{b.text}</p>
            </div>
          ))}
        </div>
      )}

      {d.tail && (
        <div className="mb-[3mm] border-y border-slate-300 py-[2.5mm]">
          <p className="doc-en text-center">{d.tail}</p>
        </div>
      )}
    </>
  )
}

function Choices({ no, choices }: { no?: number; choices: string[] }) {
  return (
    <div>
      {no !== undefined && (
        <p className="mb-[0.8mm] text-[8.5pt] font-bold text-slate-500">{no}번 답</p>
      )}
      <ol className="space-y-[1.5mm]">
        {choices.map((c, i) => (
          <li key={i} className="flex gap-[1.5mm] text-[9.5pt]">
            <span className="shrink-0 font-semibold text-slate-700">{CIRCLED[i]}</span>
            <span className="flex-1">{c}</span>
          </li>
        ))}
      </ol>
    </div>
  )
}

/* ── 해설지 ──────────────────────────────────────────── */

export function AnswerSheet({ data, multiQuestion }: Props & { multiQuestion: boolean }) {
  const d = data as EntriesPageData

  return (
    <div className="doc-content flex-1">
      <h2 className="doc-section">정답 및 해설</h2>

      <div className="space-y-[4mm]">
        {(d.entries ?? []).map((e) => {
          const writing = e.data as WritingData
          const isWriting = Array.isArray(writing.items)
          const q = e.data as QuestionData

          return (
            <div key={`${e.questionNo}-${e.itemKey}`}>
              <div className="mb-[1.5mm] flex items-baseline gap-[2mm] border-b border-slate-300 pb-[1mm]">
                <span className="rounded-[1pt] bg-slate-800 px-[1.5mm] py-[0.3mm] text-[8pt] font-bold text-white">
                  {e.no}
                </span>
                <span className="text-[9.5pt] font-bold text-slate-900">{e.label}</span>
                {multiQuestion && (
                  <span className="text-[7pt] text-slate-400">지문 {e.questionNo}</span>
                )}
                {!isWriting && (
                  <span className="ml-auto text-[10pt] font-bold text-slate-900">
                    정답 {CIRCLED[(q.answer ?? 1) - 1] ?? q.answer}
                  </span>
                )}
              </div>

              {isWriting ? (
                <WritingAnswers data={writing} />
              ) : (
                <div className="doc-note space-y-[1.2mm] text-slate-700">
                  <p>{q.explanation}</p>
                  {(q.wrongNotes ?? []).length > 0 && (
                    <div className="border-l-[1.5pt] border-slate-200 pl-[2mm] text-slate-500">
                      {q.wrongNotes.map((w, i) => (
                        <p key={i}>{w}</p>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WritingAnswers({ data }: { data: WritingData }) {
  return (
    <div className="space-y-[2mm]">
      {(data.items ?? []).map((it, i) => (
        <div key={i} className="doc-note">
          <p className="text-slate-500">
            {i + 1}. {it.question}
          </p>
          <p className="mt-[0.5mm] font-semibold text-slate-900">→ {it.answer}</p>
          {(it.points ?? []).length > 0 && (
            <p className="mt-[0.5mm] text-slate-500">
              채점 {it.points.map((p, j) => `${j + 1}) ${p}`).join('  ')}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

/* ── 어법·어휘 문장 훈련 ─────────────────────────────── */

export function SentenceDrill({ data, startNo, heading }: Props & { heading: string }) {
  const d = data as Chunked<SentenceDrillData>
  const items = d.items ?? []

  return (
    <div className="doc-content flex flex-1 flex-col">
      <h2 className="doc-section">{heading}</h2>

      <div className="space-y-[3mm]">
        {items.map((it, i) => (
          <div key={i} className="flex gap-[2mm]">
            <span className="w-[6mm] shrink-0 text-[8.5pt] font-bold text-slate-400">
              {startNo + i}.
            </span>
            <div className="flex-1">
              <p className="doc-en">{it.sentence}</p>
              <div className="mt-[1mm] flex flex-wrap gap-x-[6mm] gap-y-[0.5mm] pl-[2mm] text-[8.5pt]">
                {(it.choices ?? []).map((c, j) => (
                  <span key={j} className="text-slate-700">
                    <span className="font-semibold text-slate-500">{CIRCLED[j]}</span> {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <DrillAnswers
        rows={items.map((it) => ({
          answer: `${CIRCLED[(it.answer ?? 1) - 1] ?? ''} ${it.choices?.[(it.answer ?? 1) - 1] ?? ''}`,
          note: it.note,
        }))}
        startNo={startNo}
      />
    </div>
  )
}

export function PairDrill({ data, startNo, heading }: Props & { heading: string }) {
  const d = data as Chunked<PairDrillData>
  const items = d.items ?? []

  return (
    <div className="doc-content flex flex-1 flex-col">
      <h2 className="doc-section">{heading}</h2>

      <div className="space-y-[2.5mm]">
        {items.map((it, i) => (
          <div key={i} className="flex gap-[2mm]">
            <span className="w-[6mm] shrink-0 text-[8.5pt] font-bold text-slate-400">
              {startNo + i}.
            </span>
            <p className="doc-en flex-1">
              {it.before}
              <span className="mx-[1mm] whitespace-nowrap rounded-[1pt] border border-slate-400 px-[1.5mm] py-[0.3mm]">
                {it.a} <span className="text-slate-400">/</span> {it.b}
              </span>
              {it.after}
            </p>
          </div>
        ))}
      </div>

      <DrillAnswers
        rows={items.map((it) => ({ answer: it.answer === 'A' ? it.a : it.b, note: it.note }))}
        startNo={startNo}
      />
    </div>
  )
}

/** 문장 훈련의 정답은 같은 장 아래쪽에 모아 둔다 (접어서 가리고 풀 수 있게) */
function DrillAnswers({
  rows,
  startNo,
}: {
  rows: { answer: string; note: string }[]
  startNo: number
}) {
  return (
    <div className="mt-auto border-t border-dashed border-slate-400 pt-[2mm]">
      <h3 className="mb-[1mm] text-[8pt] font-bold text-slate-500">정답 및 해설</h3>
      <div className="doc-note grid grid-cols-2 gap-x-[5mm] gap-y-[0.6mm] text-slate-600">
        {rows.map((r, i) => (
          <p key={i}>
            <span className="font-bold text-slate-900">
              {startNo + i}. {r.answer}
            </span>
            <span className="text-slate-500"> — {r.note}</span>
          </p>
        ))}
      </div>
    </div>
  )
}

/* ── 영작·서술형 ─────────────────────────────────────── */

export function Writing({ data, heading }: Props & { heading: string }) {
  const d = data as WritingData
  return (
    <div className="doc-content flex flex-1 flex-col">
      <h2 className="doc-section">{heading}</h2>
      <p className="mb-[3mm] text-[9pt] text-slate-600">{d.topic}</p>

      <div className="flex flex-1 flex-col gap-[3mm]">
        {(d.items ?? []).map((it, i) => (
          <div key={i} className="flex flex-1 flex-col border border-slate-300">
            <div className="border-b border-slate-200 bg-slate-50 px-[3mm] py-[1.5mm]">
              <p className="text-[9pt] font-semibold text-slate-900">
                {i + 1}. {it.question}
              </p>
              {it.condition && (
                <p className="mt-[0.5mm] text-[7.5pt] text-slate-500">〈조건〉 {it.condition}</p>
              )}
            </div>
            {/* 학생이 답을 쓰는 칸 */}
            <div className="flex-1 px-[3mm] py-[2.5mm]">
              <div className="h-full border-b border-dotted border-slate-400" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
