import type { ReactNode } from 'react'
import { setByKey, type SetKey } from '../lib/sets'
import { labelOf } from '../ai/runner'

interface PaperProps {
  children: ReactNode
  bordered?: boolean
}

/** A4 한 장. 미리보기와 인쇄가 같은 DOM 을 쓴다. */
export function Paper({ children, bordered }: PaperProps) {
  return (
    <div className={`a4-page ${bordered ? 'a4-bordered' : ''}`}>
      <div className="flex h-full flex-col">{children}</div>
    </div>
  )
}

interface HeadProps {
  setKey: SetKey
  title: string
  questionNo: number
  showQuestionNo: boolean
  /** 이 자료에 포함된 항목 전체 — 현재 항목만 진하게 */
  itemKeys: string[]
  currentItem: string
  part: number
  partCount: number
  /** 머리글 오른쪽에 덧붙일 표시. 해설지 등 */
  note?: string
}

/** 본문 페이지 머리글 */
export function Head(p: HeadProps) {
  const s = setByKey(p.setKey)
  return (
    <header className="mb-[4mm] shrink-0">
      <div className="flex items-end justify-between">
        <div className="flex items-center gap-[2mm]">
          {p.showQuestionNo && (
            <span
              className="grid size-[6mm] place-items-center rounded-[1pt] text-[9pt] font-bold text-white"
              style={{ background: s.color }}
            >
              {p.questionNo}
            </span>
          )}
          <span className="text-[13pt] font-bold tracking-tight" style={{ color: s.color }}>
            {s.name}
          </span>
          <span className="text-[7pt] font-semibold tracking-[0.2em] text-slate-400">{s.en}</span>
        </div>
        <span className="flex items-center gap-[2mm] text-[8pt] font-semibold text-slate-500">
          {p.note && (
            <span className="rounded-[1pt] bg-slate-800 px-[1.5mm] py-[0.3mm] text-[7pt] text-white">
              {p.note}
            </span>
          )}
          수북 학습자료
        </span>
      </div>

      <div className="mt-[1.5mm] flex items-baseline justify-between gap-[4mm]">
        <p className="truncate text-[7pt] text-slate-400">
          {p.itemKeys.map((k, i) => (
            <span key={k} className={k === p.currentItem ? 'font-bold text-slate-700' : ''}>
              {i > 0 && <span className="mx-[1mm] text-slate-300">·</span>}
              {labelOf(k)}
            </span>
          ))}
        </p>
        <p className="shrink-0 text-[7.5pt] text-slate-500">
          {p.title}
          {p.partCount > 1 && (
            <span className="ml-[1.5mm] text-slate-400">
              ({p.part}/{p.partCount})
            </span>
          )}
        </p>
      </div>

      <div className="mt-[1.5mm] h-[0.6pt] w-full bg-slate-300" />
    </header>
  )
}

/** 본문 페이지 바닥글 */
export function Foot({ page, total }: { page: number; total: number }) {
  return (
    <footer className="mt-auto flex shrink-0 items-baseline justify-between pt-[3mm] text-[7.5pt] text-slate-400">
      <span />
      <span className="text-slate-600">
        {page} / {total}
      </span>
      <span className="tracking-[0.15em]">수북 SUBOOK</span>
    </footer>
  )
}
