import { useEffect, useRef, useState } from 'react'
import { extract, ExtractError } from '../lib/extract'
import { useDoc } from '../store/useDoc'
import { wordCount } from '../lib/segment'

const ACCEPT = '.pdf,.docx,.hwpx,.txt'

export default function FileInput() {
  const { fileName, pages, sourceKind, sourceNotice } = useDoc()
  const set = useDoc((s) => s.set)
  const togglePage = useDoc((s) => s.togglePage)
  const selectAllPages = useDoc((s) => s.selectAllPages)

  const inputRef = useRef<HTMLInputElement>(null)
  const thumbJob = useRef<AbortController | null>(null)
  const [busy, setBusy] = useState<{ done: number; total: number } | null>(null)
  const [thumbing, setThumbing] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  // 화면을 떠나면 뒤에서 돌던 썸네일 작업을 멈춘다
  useEffect(() => () => thumbJob.current?.abort(), [])

  async function load(file: File) {
    setError(null)
    setBusy({ done: 0, total: 0 })
    thumbJob.current?.abort()

    try {
      const r = await extract(file, (done, total) => setBusy({ done, total }))
      if (!r.pages.length) throw new ExtractError('문서에서 글자를 찾지 못했습니다.')

      set('fileName', file.name)
      set('sourceKind', r.kind)
      set('sourceNotice', r.notice ?? null)
      set(
        'pages',
        r.pages.map((p) => ({ ...p, selected: true })),
      )
      // 자료명이 비어 있으면 파일명(확장자 제외)을 채워 준다
      if (!useDoc.getState().title.trim()) {
        set('title', file.name.replace(/\.[^.]+$/, '').slice(0, 40))
      }
      setBusy(null)

      // 썸네일은 화면을 띄운 뒤 뒤에서 채운다
      if (r.renderThumbs) {
        const ac = new AbortController()
        thumbJob.current = ac
        setThumbing(r.pages.length)
        r.renderThumbs((index, thumb) => {
          setThumbing((n) => n - 1)
          useDoc.setState((s) => ({
            pages: s.pages.map((p) => (p.index === index ? { ...p, thumb } : p)),
          }))
        }, ac.signal).finally(() => setThumbing(0))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '파일을 열지 못했습니다.')
      set('pages', [])
      set('fileName', null)
      setBusy(null)
    }
  }

  const selected = pages.filter((p) => p.selected)
  const selectedWords = selected.reduce((a, p) => a + wordCount(p.text), 0)
  const allOn = pages.length > 0 && selected.length === pages.length

  /* ── 파일을 아직 안 골랐을 때 ── */
  if (!pages.length) {
    return (
      <div className="flex flex-1 flex-col">
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) load(f)
          }}
          onClick={() => !busy && inputRef.current?.click()}
          className={`grid flex-1 cursor-pointer place-items-center rounded-xl border-2 border-dashed p-10 text-center transition ${
            dragging ? 'border-brand-500 bg-brand-50' : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          <div>
            {busy ? (
              <>
                <div className="mx-auto size-10 animate-spin rounded-full border-[3px] border-slate-200 border-t-brand-600" />
                <p className="mt-4 font-medium text-slate-700">문서를 읽는 중입니다…</p>
                {busy.total > 0 && (
                  <p className="mt-1 text-sm text-slate-500">
                    {busy.done} / {busy.total} 쪽
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="mx-auto grid size-12 place-items-center rounded-xl bg-slate-100 text-2xl">
                  📄
                </div>
                <p className="mt-4 font-semibold text-slate-800">
                  파일을 여기에 끌어다 놓으세요
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  또는 <span className="font-semibold text-brand-700 underline">내 컴퓨터에서 찾기</span>
                </p>
                <p className="mt-4 text-xs text-slate-400">PDF · DOCX · HWPX · TXT</p>
              </>
            )}
          </div>
        </div>

        {error && (
          <p className="mt-3 break-keep rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm text-rose-700">
            {error}
          </p>
        )}

        <p className="mt-3 break-keep text-xs text-slate-500">
          파일은 이 컴퓨터의 브라우저 안에서만 열립니다. 어디로도 전송되지 않습니다.
        </p>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) load(f)
            e.target.value = ''
          }}
        />
      </div>
    )
  }

  /* ── 파일을 읽은 뒤 — 쪽 고르기 ── */
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <span className="truncate text-sm font-semibold text-slate-800">{fileName}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-slate-500">
          {sourceKind}
        </span>
        <span className="text-xs text-slate-500">
          {pages.length}{sourceKind === 'pdf' ? '쪽' : '덩어리'} 중 {selected.length}개 선택 ·{' '}
          {selectedWords.toLocaleString()}단어
        </span>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => selectAllPages(!allOn)}
            className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
          >
            {allOn ? '전체 해제' : '전체 선택'}
          </button>
          <button
            onClick={() => {
              thumbJob.current?.abort()
              setThumbing(0)
              useDoc.setState({ pages: [], fileName: null, sourceKind: null, sourceNotice: null })
            }}
            className="rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100"
          >
            다시 올리기
          </button>
        </div>
      </div>

      <p className="mt-1.5 break-keep text-xs text-slate-500">
        분석에서 빼고 싶은 쪽은 눌러서 해제하세요. 표지·정답지·문제 설명만 있는 쪽은 빼는 편이 좋습니다.
        {thumbing > 0 && (
          <span className="ml-1 text-slate-400">
            (미리보기 그림 {thumbing}장 만드는 중 — 기다리지 않고 바로 진행해도 됩니다)
          </span>
        )}
      </p>

      {sourceNotice && (
        <p className="mt-2 break-keep rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {sourceNotice}
        </p>
      )}

      <div className="mt-3 grid max-h-[440px] flex-1 grid-cols-2 gap-3 overflow-y-auto pr-1 sm:grid-cols-3 lg:grid-cols-4">
        {pages.map((p) => (
          <button
            key={p.index}
            onClick={() => togglePage(p.index)}
            className={`relative overflow-hidden rounded-lg border-2 text-left transition ${
              p.selected
                ? 'border-brand-600 shadow-sm'
                : 'border-slate-200 opacity-45 hover:opacity-70'
            }`}
          >
            {p.thumb ? (
              <img src={p.thumb} alt={`${p.index}쪽`} className="block w-full bg-white" />
            ) : (
              <div className="line-clamp-[12] h-[150px] overflow-hidden bg-white p-2 text-[8px] leading-[1.5] text-slate-600">
                {p.text}
              </div>
            )}

            <div className="flex items-center justify-between bg-white px-2 py-1">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400">
                {sourceKind === 'pdf' ? `PAGE ${p.index}` : `${p.index}번째`}
              </span>
              <span
                className={`grid size-4 place-items-center rounded-full text-[9px] font-bold ${
                  p.selected ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'
                }`}
              >
                {p.selected ? '✓' : ''}
              </span>
            </div>

            {/* 글자 자체가 거의 없는 쪽(빈 쪽·이미지 쪽)만 표시한다.
                한국어 해설 쪽은 영어 단어가 적어도 정상이므로 영어 단어 수로 판단하지 않는다. */}
            {p.text.trim().length < 40 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-amber-500 px-1.5 py-0.5 text-[9px] font-semibold text-white">
                글자 없음
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
