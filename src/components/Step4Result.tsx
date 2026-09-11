import { useEffect, useMemo, useState } from 'react'
import { useDoc, type LayoutMode } from '../store/useDoc'
import { labelOf } from '../ai/runner'
import { paginate } from '../print/pages'
import Document from '../print/Document'
import BottomBar from './BottomBar'

export default function Step4Result() {
  const doc = useDoc()
  const setDoc = useDoc((s) => s.set)
  const goto = useDoc((s) => s.goto)
  const resetDoc = useDoc((s) => s.resetDoc)

  const all = useMemo(() => paginate(doc.generated), [doc.generated])
  const visible = all.filter((p) => !p.excluded)
  const total = visible.length + 1
  const excludedCount = all.length - visible.length

  const [page, setPage] = useState(0)
  const [scale, setScale] = useState(0.62)

  useEffect(() => {
    if (page > total - 1) setPage(Math.max(0, total - 1))
  }, [total, page])

  // 화면 높이에 맞춰 미리보기 축소율을 잡는다
  useEffect(() => {
    const fit = () => setScale(Math.min(0.85, Math.max(0.35, (window.innerHeight - 230) / 1123)))
    fit()
    window.addEventListener('resize', fit)
    return () => window.removeEventListener('resize', fit)
  }, [])

  const toggleExcluded = (id: string) =>
    setDoc(
      'generated',
      doc.generated.map((g) => (g.id === id ? { ...g, excluded: !g.excluded } : g)),
    )

  const toggleItemAll = (itemKey: string, on: boolean) =>
    setDoc(
      'generated',
      doc.generated.map((g) => (g.itemKey === itemKey ? { ...g, excluded: !on } : g)),
    )

  const itemKeys = [...new Set(doc.generated.map((g) => g.itemKey))]

  return (
    <>
      {/* 화면에서만 보이는 상단 바 */}
      <div className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1500px] items-center gap-4 px-4 py-3 sm:px-6">
          <div>
            <h1 className="text-sm font-bold text-slate-900">{doc.title || '제목 없는 자료'}</h1>
            <p className="text-xs text-slate-500">
              {total}장 · 지문 {doc.questions.length}개
              {excludedCount > 0 && (
                <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">
                  {excludedCount}장 제외됨
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="ml-auto rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
          >
            인쇄 · PDF 저장
          </button>
        </div>
      </div>

      <div className="no-print mx-auto flex w-full max-w-[1500px] flex-1 gap-6 px-4 py-5 sm:px-6">
        {/* 미리보기 */}
        <div className="flex min-w-0 flex-1 flex-col items-center">
          <div
            className="overflow-hidden rounded-lg shadow-xl ring-1 ring-slate-200"
            style={{ width: 794 * scale, height: 1123 * scale }}
          >
            <div style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}>
              <Document only={page} />
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="grid size-9 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
              aria-label="이전 페이지"
            >
              ←
            </button>
            <span className="min-w-24 text-center text-sm font-medium text-slate-600">
              {page === 0 ? '표지' : `${page + 1} / ${total}`}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(total - 1, p + 1))}
              disabled={page >= total - 1}
              className="grid size-9 place-items-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-30"
              aria-label="다음 페이지"
            >
              →
            </button>
          </div>
        </div>

        {/* 출력 옵션 */}
        <aside className="w-[300px] shrink-0 space-y-4 overflow-y-auto">
          <Card title="페이지 구성">
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={doc.showBorder}
                onChange={(e) => setDoc('showBorder', e.target.checked)}
                className="size-4 accent-[#0d8466]"
              />
              본문 테두리
            </label>

            <Field label="표지 무늬">
              <Seg
                value={doc.coverStyle}
                options={[
                  { v: 'A', l: '글자' },
                  { v: 'B', l: '기호' },
                ]}
                onChange={(v) => setDoc('coverStyle', v as 'A' | 'B')}
              />
            </Field>

            <Field label="해석 배치">
              <Seg
                value={doc.layoutMode}
                options={[
                  { v: 'side-by-side', l: '좌우' },
                  { v: 'stacked', l: '상하' },
                  { v: 'both', l: '상하+선' },
                ]}
                onChange={(v) => setDoc('layoutMode', v as LayoutMode)}
              />
            </Field>
          </Card>

          <Card title="항목별 인쇄">
            <p className="mb-2 break-keep text-xs text-slate-500">
              체크를 해제하면 그 항목이 인쇄에서 빠집니다. 문제지와 해설지를 따로 뽑을 때 쓰세요.
            </p>
            {itemKeys.map((k) => {
              const pagesOfItem = all.filter((p) => p.itemKey === k)
              const on = pagesOfItem.some((p) => !p.excluded)
              return (
                <label
                  key={k}
                  className="flex items-center gap-2 rounded-md px-1 py-1 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={(e) => toggleItemAll(k, e.target.checked)}
                    className="size-4 accent-[#0d8466]"
                  />
                  <span className="flex-1">{labelOf(k)}</span>
                  <span className="text-xs text-slate-400">{pagesOfItem.length}장</span>
                </label>
              )
            })}
          </Card>

          <Card title="페이지별 인쇄">
            <div className="space-y-1">
              {all.map((p, i) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 rounded-md px-1 py-1 text-xs hover:bg-slate-50"
                >
                  <input
                    type="checkbox"
                    checked={!p.excluded}
                    onChange={() => toggleExcluded(p.id)}
                    className="size-3.5 accent-[#0d8466]"
                  />
                  <button
                    onClick={() => setPage(Math.min(total - 1, i + 1))}
                    className="flex-1 truncate text-left text-slate-600 hover:text-brand-700"
                  >
                    {doc.questions.length > 1 && (
                      <span className="text-slate-400">{p.questionNo}번 · </span>
                    )}
                    {labelOf(p.itemKey)}
                    {p.partCount > 1 && (
                      <span className="text-slate-400">
                        {' '}
                        ({p.part}/{p.partCount})
                      </span>
                    )}
                  </button>
                </label>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      {/* 인쇄용 — 화면에서는 숨기고 인쇄할 때만 전체를 펼친다 */}
      <div className="hidden print:block">
        <Document />
      </div>

      <BottomBar
        onBack={() => goto(3)}
        right={
          <button
            onClick={() => {
              if (confirm('만든 자료가 사라집니다. 처음부터 새로 시작할까요?')) {
                resetDoc()
                goto(1)
              }
            }}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            새로 만들기
          </button>
        }
      />
    </>
  )
}

/* ── 작은 조각들 ─────────────────────────────────────── */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="mb-2.5 text-[11px] font-semibold tracking-widest text-slate-400">{title}</h3>
      <div className="space-y-2.5">{children}</div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1 text-xs font-medium text-slate-500">{label}</div>
      {children}
    </div>
  )
}

function Seg({
  value,
  options,
  onChange,
}: {
  value: string
  options: { v: string; l: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition ${
            value === o.v ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {o.l}
        </button>
      ))}
    </div>
  )
}
