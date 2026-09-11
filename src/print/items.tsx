import type {
  CloseReadingData,
  KeyGuideData,
  SentenceReadData,
  TranslationData,
  VocabListData,
  Word,
} from '../ai/types'
import type { LayoutMode } from '../store/useDoc'

/** 항목 렌더러가 받는 것 */
export interface ItemProps {
  data: unknown
  layout: LayoutMode
  /** 여러 장으로 나뉜 경우 이 장의 첫 번호 */
  startNo: number
}

type Chunked<T> = T & { startNo?: number }

/* ── 문항 머리표 ─────────────────────────────────────── */

function QuestionBar({ no, en, ko }: { no: number; en: string; ko: string }) {
  return (
    <div className="mb-[3mm] flex items-stretch border border-slate-300">
      <div className="grid w-[12mm] shrink-0 place-items-center bg-slate-800 text-white">
        <div className="text-center leading-none">
          <div className="text-[5.5pt] tracking-[0.1em]">QST</div>
          <div className="mt-[0.5mm] text-[12pt] font-bold">{String(no).padStart(2, '0')}</div>
        </div>
      </div>
      <div className="flex-1 px-[3mm] py-[2mm]">
        <div className="text-[10pt] font-bold text-slate-900">{en}</div>
        <div className="mt-[0.5mm] text-[8pt] text-slate-600">[주제] {ko}</div>
      </div>
    </div>
  )
}

/* ── 지문 해석 ───────────────────────────────────────── */

export function Translation({ data, layout, startNo }: ItemProps) {
  const d = data as Chunked<TranslationData>
  const sentences = d.sentences ?? []

  return (
    <div className="doc-content flex-1">
      {startNo === 1 && <QuestionBar no={1} en={d.titleEn} ko={d.titleKo} />}

      <div className="space-y-[2.5mm]">
        {sentences.map((s, i) => {
          const no = startNo + i
          return layout === 'side-by-side' ? (
            <div key={no} className="flex gap-[4mm]">
              <p className="doc-en flex-1">
                <sup className="doc-sup">{no}</sup>
                {s.en}
              </p>
              <p className="doc-ko w-[46mm] shrink-0 border-l border-slate-200 pl-[3mm]">{s.ko}</p>
            </div>
          ) : (
            <div key={no}>
              <p className="doc-en">
                <sup className="doc-sup">{no}</sup>
                {s.en}
              </p>
              <p className="doc-ko mt-[0.8mm] pl-[3mm]">{s.ko}</p>
              {layout === 'both' && <div className="mt-[1mm] h-px bg-slate-100" />}
            </div>
          )
        })}
      </div>

      {d.words && d.words.length > 0 && (
        <div className="mt-[5mm] border-t border-slate-200 pt-[3mm]">
          <h3 className="mb-[2mm] text-[9pt] font-bold text-slate-700">[Words]</h3>
          <div className="grid grid-cols-3 gap-x-[4mm] gap-y-[2mm]">
            {d.words.map((w) => (
              <div key={w.word} className="text-[7.5pt] leading-[1.4]">
                <span className="font-bold text-slate-900">○ {w.word}</span>{' '}
                <span className="text-slate-700">{w.meaning}</span>{' '}
                <span className="text-slate-400">({w.pos})</span>
                <div className="text-slate-500">
                  {w.syn && <span>= {w.syn}</span>}
                  {w.ant && <span className="ml-[1.5mm]">↔ {w.ant}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ── 핵심 가이드 ─────────────────────────────────────── */

export function KeyGuide({ data }: ItemProps) {
  const d = data as KeyGuideData

  return (
    <div className="doc-content flex flex-1 flex-col">
      <h2 className="doc-section">
        제목 <span className="font-normal text-slate-400">|</span> {d.titleEn}
      </h2>
      <p className="mb-[3mm] pl-[4mm] text-[9.5pt] text-slate-600">({d.titleKo})</p>

      <h2 className="doc-section">
        주제 <span className="font-normal text-slate-400">|</span>{' '}
        <span className="font-normal">{d.topic}</span>
      </h2>

      <h2 className="doc-section mt-[4mm]">지문 요약</h2>
      <p className="doc-body mb-[4mm] pl-[1mm] text-slate-700">{d.summary}</p>

      <h2 className="doc-section">지문의 전개 구조</h2>
      <table className="doc-table mb-[4mm]">
        <thead>
          <tr>
            <th className="w-[14mm]">글 흐름</th>
            <th className="w-[32mm]">핵심 소주제</th>
            <th>세부 핵심</th>
            <th className="w-[34mm]">논리적 역할</th>
          </tr>
        </thead>
        <tbody>
          {(d.structure ?? []).map((r) => (
            <tr key={r.phase}>
              <td className="text-center font-bold">{r.phase}</td>
              <td>{r.subtopic}</td>
              <td>
                {(r.points ?? []).map((p, i) => (
                  <div key={i}>• {p}</div>
                ))}
              </td>
              <td className="text-slate-600">{r.role}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="doc-section">수업 포인트</h2>
      <div className="doc-note space-y-[1.5mm] pl-[1mm] text-slate-700">
        <Tagged tag="핵심 표현" body={(d.keywords ?? []).join(' / ')} />
        <Tagged tag="출제 예상" body={d.examLogic} />
        <Tagged tag="구문" body={d.syntaxPoint} />
        <Tagged tag="어휘 대비" body={d.vocabPrep} />
        <Tagged tag="내용 이해" body={d.contentPoint} />
      </div>

      {d.insight && (
        <div className="mt-auto border-t border-slate-300 pt-[3mm]">
          <h3 className="mb-[1.5mm] text-[9pt] font-bold text-slate-700">Teacher&rsquo;s Insight</h3>
          <div className="doc-note space-y-[1.2mm] text-slate-700">
            <Tagged tag="핵심 질문" body={d.insight.coreQuestion} />
            <Tagged tag="원인에서 결과로" body={d.insight.causeToEffect} />
            <Tagged tag="출제위원의 시선" body={d.insight.examinerView} />
          </div>
        </div>
      )}
    </div>
  )
}

function Tagged({ tag, body }: { tag: string; body?: string }) {
  if (!body) return null
  return (
    <p>
      <span className="font-bold text-slate-900">[{tag}]</span> {body}
    </p>
  )
}

/* ── 한 문장 읽기 ────────────────────────────────────── */

export function SentenceRead({ data, startNo }: ItemProps) {
  const d = data as Chunked<SentenceReadData>

  return (
    <div className="doc-content flex-1">
      <h2 className="doc-section">한 문장 요약과 쉬운 예시</h2>

      {startNo === 1 && (
        <div className="mb-[3mm] flex gap-[2mm] text-[9.5pt]">
          <span className="w-[10mm] shrink-0 font-bold text-slate-500">주제</span>
          <span className="text-slate-400">│</span>
          <span className="flex-1 font-medium text-slate-800">{d.topic}</span>
        </div>
      )}

      <div className="space-y-[3mm]">
        {(d.items ?? []).map((it, i) => (
          <div key={i} className="border-l-[1.5pt] border-slate-300 pl-[3mm]">
            <Row label="해석" value={it.ko} />
            <Row label="요약" value={it.summary} bold />
            <Row label="예시" value={it.example} muted />
          </div>
        ))}
      </div>
    </div>
  )
}

function Row({
  label,
  value,
  bold,
  muted,
}: {
  label: string
  value: string
  bold?: boolean
  muted?: boolean
}) {
  return (
    <div className="flex gap-[2mm] text-[9.5pt] leading-[1.5]">
      <span className="w-[8mm] shrink-0 text-slate-400">{label}</span>
      <span className="text-slate-300">│</span>
      <span className={`flex-1 ${bold ? 'font-semibold text-slate-900' : muted ? 'text-slate-500' : 'text-slate-700'}`}>
        {value}
      </span>
    </div>
  )
}

/* ── 정밀 판독 ───────────────────────────────────────── */

export function CloseReading({ data }: ItemProps) {
  const d = data as CloseReadingData
  const items = d.items ?? []

  return (
    <div className="doc-content flex-1">
      <h2 className="doc-section">정밀 판독 질문</h2>
      <table className="doc-table mb-[5mm]">
        <thead>
          <tr>
            <th className="w-[20mm]">구분</th>
            <th>정밀 판독 질문</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i}>
              <td className="text-center text-slate-600">{it.category}</td>
              <td>
                <span className="font-bold">Q{i + 1}.</span> {it.question}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 className="doc-section">정밀 판독 정답</h2>
      <div className="space-y-[2mm]">
        {items.map((it, i) => (
          <div key={i} className="text-[8.5pt] leading-[1.5]">
            <div className="font-bold text-slate-900">
              Q{i + 1}. <span className="font-normal text-slate-500">[{it.category}]</span>
            </div>
            <div className="pl-[3mm] text-slate-700">{it.answer}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── 단어 리스트 ─────────────────────────────────────── */

export function VocabList({ data, startNo }: ItemProps) {
  const d = data as Chunked<VocabListData>

  return (
    <div className="doc-content flex-1">
      <h2 className="doc-section">전체 단어 리스트</h2>
      <table className="doc-table">
        <thead>
          <tr>
            <th className="w-[9mm]">No.</th>
            <th className="w-[28mm]">단어</th>
            <th className="w-[10mm]">품사</th>
            <th className="w-[36mm]">의미</th>
            <th>유의어</th>
            <th>반의어</th>
          </tr>
        </thead>
        <tbody>
          {(d.words ?? []).map((w, i) => (
            <tr key={w.word + i}>
              <td className="num">{startNo + i}</td>
              <td className="font-semibold">{w.word}</td>
              <td className="text-center text-slate-500">{w.pos}</td>
              <td>{w.meaning}</td>
              <td className="text-slate-600">{w.syn}</td>
              <td className="text-slate-600">{w.ant}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ── 단어 테스트 (뜻 쓰기 / 스펠링) ──────────────────── */

export function VocabTest({ data, startNo, mode }: ItemProps & { mode: 'meaning' | 'spelling' }) {
  const d = data as Chunked<VocabListData>
  const words = d.words ?? []
  const half = Math.ceil(words.length / 2)
  const left = words.slice(0, half)
  const right = words.slice(half)

  const heading = mode === 'meaning' ? '단어 테스트 (뜻 쓰기)' : '단어 테스트 (스펠링)'
  const cols = mode === 'meaning' ? ['단어', '의미'] : ['의미', '단어']

  return (
    <div className="doc-content flex flex-1 flex-col">
      <h2 className="doc-section">{heading}</h2>
      <p className="mb-[3mm] text-[10pt] text-slate-600">{d.topic}</p>

      {/* 표를 지면 높이에 맞춰 늘린다 — 학생이 답을 쓸 공간이 넉넉해진다.
          다만 줄이 적을 때 한 칸이 지나치게 커지지 않도록 줄당 15mm 로 제한한다. */}
      <table className="doc-table h-full" style={{ maxHeight: `${left.length * 15}mm` }}>
        <thead>
          <tr>
            <th className="w-[9mm]">No.</th>
            <th className="w-[40mm]">{cols[0]}</th>
            <th>{cols[1]}</th>
            <th className="w-[9mm]">No.</th>
            <th className="w-[40mm]">{cols[0]}</th>
            <th>{cols[1]}</th>
          </tr>
        </thead>
        <tbody>
          {left.map((w, i) => (
            <tr key={i}>
              <Cell no={startNo + i} w={w} mode={mode} />
              {right[i] ? (
                <Cell no={startNo + half + i} w={right[i]} mode={mode} />
              ) : (
                <>
                  <td className="num" />
                  <td className="blank" />
                  <td className="blank" />
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function Cell({ no, w, mode }: { no: number; w: Word; mode: 'meaning' | 'spelling' }) {
  return (
    <>
      <td className="num">{no}</td>
      <td className={mode === 'meaning' ? 'font-semibold' : ''}>
        {mode === 'meaning' ? w.word : w.meaning}
      </td>
      <td className="blank" />
    </>
  )
}
