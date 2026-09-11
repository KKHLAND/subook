import { useEffect, useRef, useState } from 'react'
import { useDoc, textToAnalyze } from '../store/useDoc'
import { useSettings } from '../store/useSettings'
import { runGeneration, labelOf, type LogLevel } from '../ai/runner'
import { segment, mergeQuestions } from '../lib/segment'
import { itemsFor } from '../lib/sets'
import BottomBar from './BottomBar'

interface Line {
  t: string
  level: LogLevel
  text: string
}

const TIPS = [
  '지문 사이에 번호(31. 32.)를 붙이면 문항이 자동으로 나뉩니다.',
  '뜻쓰기·스펠링 테스트는 단어 리스트에서 바로 만들어져 시간이 들지 않습니다.',
  '무료 한도 때문에 중간중간 기다립니다. 창을 닫지 말고 두세요.',
  '결과 화면에서 필요 없는 페이지만 빼고 인쇄할 수 있습니다.',
  '만들어진 자료는 브라우저에 저장돼서, 실수로 창을 닫아도 남아 있습니다.',
]

export default function Step3Generate() {
  const doc = useDoc()
  const setDoc = useDoc((s) => s.set)
  const goto = useDoc((s) => s.goto)
  const { apiKey, model } = useSettings()

  const [lines, setLines] = useState<Line[]>([])
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [finished, setFinished] = useState(false)
  const [tip, setTip] = useState(0)

  const abortRef = useRef<AbortController | null>(null)
  const logRef = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  const log = (level: LogLevel, text: string) =>
    setLines((prev) => [
      ...prev.slice(-200),
      { t: new Date().toLocaleTimeString('ko-KR', { hour12: false }), level, text },
    ])

  useEffect(() => {
    const id = setInterval(() => setTip((i) => (i + 1) % TIPS.length), 7000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight })
  }, [lines])

  useEffect(() => {
    if (started.current) return
    started.current = true

    const ac = new AbortController()
    abortRef.current = ac

    const detected = segment(textToAnalyze(doc))
    if (!detected.questions.length) {
      setError('분석할 지문을 찾지 못했습니다. 1단계로 돌아가 영어 지문을 확인해 주세요.')
      return
    }
    // 2단계에서 선생님이 "하나로 합치기"를 골랐으면 그 뜻을 따른다
    const questions =
      doc.splitMode === 'single' ? mergeQuestions(detected.questions) : detected.questions

    setDoc('questions', questions)
    setDoc('generated', [])
    log(
      'done',
      questions.length === 1
        ? '지문 1개로 분석합니다.'
        : `${detected.method === 'numbered' ? '문항 번호' : '빈 줄'}를 기준으로 지문 ${questions.length}개를 나눴습니다.`,
    )

    // 화면에 보이는 순서대로 페이지가 쌓이도록 항목 순서를 맞춘다
    const ordered = itemsFor(doc.setKey, doc.shape)
      .map((i) => i.key)
      .filter((k) => doc.selectedItems.includes(k))

    runGeneration({
      questions,
      items: ordered,
      apiKey,
      model,
      signal: ac.signal,
      onLog: log,
      onProgress: (done, total) => setProgress({ done, total }),
      onPage: (page) => useDoc.setState((s) => ({ generated: [...s.generated, page] })),
    })
      .then(() => setFinished(true))
      .catch((e: unknown) => {
        if (ac.signal.aborted) return
        const msg = e instanceof Error ? e.message : '알 수 없는 오류'
        setError(msg)
        log('fail', msg)
      })

    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const madeCount = doc.generated.length

  return (
    <>
      <div className="mx-auto grid max-w-7xl flex-1 gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_1.3fr]">
        {/* 좌측 — 상태 */}
        <div className="flex flex-col justify-center">
          <div className="relative mx-auto grid size-28 place-items-center">
            {!finished && !error && (
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-200/60" />
            )}
            <span className="relative grid size-28 place-items-center rounded-full bg-brand-600 text-3xl font-extrabold text-white">
              {error ? '!' : finished ? '✓' : '수북'}
            </span>
          </div>

          <h2 className="mt-6 break-keep text-center text-xl font-bold text-slate-900">
            {error
              ? '생성이 멈췄습니다'
              : finished
                ? '자료가 준비됐습니다'
                : '학습 자료를 만들고 있습니다'}
          </h2>
          <p className="mt-2 break-keep text-center text-sm text-slate-500">
            {error
              ? error
              : finished
                ? `${madeCount}장을 만들었습니다. 결과 화면에서 확인하세요.`
                : '지문 분량과 무료 한도에 따라 몇 분 걸릴 수 있어요.'}
          </p>

          {!error && (
            <div className="mx-auto mt-6 w-full max-w-sm">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>
                  {progress.done} / {progress.total} 분석
                </span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )}

          <div className="mx-auto mt-8 max-w-sm rounded-xl border border-slate-200 bg-white p-4">
            <span className="text-[11px] font-semibold tracking-widest text-slate-400">TIP</span>
            <p className="mt-1 break-keep text-sm text-slate-600">{TIPS[tip]}</p>
          </div>
        </div>

        {/* 우측 — 만들어진 페이지 + 로그 */}
        <div className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-slate-400">
              만들어진 자료 · {madeCount}장
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {doc.generated.map((p) => (
                <span
                  key={p.id}
                  className="rounded-md bg-brand-50 px-2 py-1 text-xs font-medium text-brand-800"
                >
                  {doc.questions.length > 1 && `${p.questionNo}번 · `}
                  {labelOf(p.itemKey)}
                </span>
              ))}
              {!madeCount && <span className="text-sm text-slate-400">아직 없습니다</span>}
            </div>
          </div>

          <div className="flex min-h-[320px] flex-1 flex-col overflow-hidden rounded-xl bg-slate-900 shadow-lg">
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="size-2.5 rounded-full bg-rose-400" />
              <span className="size-2.5 rounded-full bg-amber-400" />
              <span className="size-2.5 rounded-full bg-emerald-400" />
              <span className="ml-2 text-[11px] font-semibold tracking-widest text-slate-400">
                작업 기록
              </span>
            </div>
            <div
              ref={logRef}
              className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[11px] leading-relaxed"
            >
              {lines.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <span className="shrink-0 text-slate-500">{l.t}</span>
                  <span
                    className={`shrink-0 font-semibold ${
                      l.level === 'done'
                        ? 'text-emerald-400'
                        : l.level === 'warn'
                          ? 'text-amber-400'
                          : l.level === 'fail'
                            ? 'text-rose-400'
                            : 'text-sky-400'
                    }`}
                  >
                    [{l.level.toUpperCase()}]
                  </span>
                  <span className="break-keep text-slate-300">{l.text}</span>
                </div>
              ))}
              {!finished && !error && <span className="animate-pulse text-slate-400">_</span>}
            </div>
          </div>
        </div>
      </div>

      <BottomBar
        onBack={finished || error ? () => goto(2) : undefined}
        right={
          finished ? (
            <button
              onClick={() => goto(4)}
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
            >
              결과 보기 →
            </button>
          ) : error ? (
            <button
              onClick={() => goto(2)}
              className="rounded-lg bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-900"
            >
              설정으로 돌아가기
            </button>
          ) : (
            <button
              onClick={() => {
                abortRef.current?.abort()
                goto(2)
              }}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
            >
              중단
            </button>
          )
        }
      />
    </>
  )
}
