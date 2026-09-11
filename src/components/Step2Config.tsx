import { useMemo } from 'react'
import { STUDY_SETS, itemsFor } from '../lib/sets'
import { segment, wordCount } from '../lib/segment'
import { useDoc, textToAnalyze } from '../store/useDoc'
import { useSettings, MODELS } from '../store/useSettings'
import BottomBar from './BottomBar'

export default function Step2Config() {
  const doc = useDoc()
  const { setKey, shape, selectedItems, splitMode } = doc
  const setDoc = useDoc((s) => s.set)
  const chooseSet = useDoc((s) => s.chooseSet)
  const toggleItem = useDoc((s) => s.toggleItem)
  const toggleAllItems = useDoc((s) => s.toggleAllItems)
  const goto = useDoc((s) => s.goto)

  const { model, apiKey } = useSettings()
  const setSetting = useSettings((s) => s.set)

  const items = itemsFor(setKey, shape)
  const allOn = items.length > 0 && selectedItems.length === items.length

  const source = textToAnalyze(doc)
  const detected = useMemo(() => segment(source), [source])
  const qCount = splitMode === 'single' ? 1 : detected.questions.length

  // 대략의 소요 시간 — AI를 부르는 항목 수 × 지문 수 × 무료 한도 간격(6.5초)
  const aiItems = items.filter(
    (i) => selectedItems.includes(i.key) && !['meaning_test', 'spelling_test'].includes(i.key),
  )
  const calls = aiItems.length * qCount
  const estMin = Math.max(1, Math.ceil((calls * 13) / 60))

  const blockedBy = !apiKey.trim()
    ? '오른쪽 위 「AI 연결」에서 구글 AI Studio API 키를 먼저 입력해 주세요.'
    : selectedItems.length === 0
      ? '자료 항목을 하나 이상 선택해 주세요.'
      : null

  return (
    <>
      <div className="mx-auto grid max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[260px_1fr_280px]">
        {/* ① 자료 세트 */}
        <div>
          <h2 className="text-[11px] font-semibold tracking-widest text-slate-400">자료 종류</h2>
          <div className="mt-3 space-y-2">
            {STUDY_SETS.map((s) => {
              const on = s.key === setKey
              return (
                <button
                  key={s.key}
                  disabled={!s.ready}
                  onClick={() => chooseSet(s.key)}
                  title={s.ready ? s.desc : '준비 중입니다'}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    on
                      ? 'border-transparent text-white shadow-md'
                      : s.ready
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                  }`}
                  style={on ? { background: s.color } : undefined}
                >
                  <div className="flex items-center justify-between">
                    <span className={`font-semibold ${on ? 'text-white' : 'text-slate-900'}`}>
                      {s.name}
                    </span>
                    <span
                      className={`text-[10px] font-bold tracking-widest ${on ? 'text-white/70' : 'text-slate-300'}`}
                    >
                      {s.ready ? s.en : '준비 중'}
                    </span>
                  </div>
                  <p
                    className={`mt-1 break-keep text-xs ${on ? 'text-white/85' : 'text-slate-500'}`}
                  >
                    {s.desc}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        {/* ② 항목 선택 */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-semibold tracking-widest text-slate-400">
              구성 항목 · {selectedItems.length}/{items.length}
            </h2>
            <button
              onClick={() => toggleAllItems(!allOn)}
              className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
            >
              {allOn ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          <div className="mt-3 space-y-2">
            {items.map((it) => {
              const on = selectedItems.includes(it.key)
              return (
                <label
                  key={it.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                    on ? 'border-brand-300 bg-brand-50/60' : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => toggleItem(it.key)}
                    className="mt-0.5 size-4 accent-[#0d8466]"
                  />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-slate-900">{it.label}</span>
                    <span className="mt-0.5 block break-keep text-xs text-slate-500">{it.desc}</span>
                  </span>
                  <span className="text-[10px] text-slate-300">
                    {'●'.repeat(it.weight)}
                  </span>
                </label>
              )
            })}
            {items.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-400">
                준비 중인 자료입니다.
              </p>
            )}
          </div>
        </div>

        {/* ③ 생성 옵션 */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-slate-400">AI 모델</h3>
            <select
              value={model}
              onChange={(e) => setSetting('model', e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-600"
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
            <p className="mt-2 break-keep text-xs text-slate-500">
              {MODELS.find((m) => m.id === model)?.hint}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-semibold tracking-widest text-slate-400">
                나뉜 지문 · {qCount}개
              </h3>
              {detected.questions.length > 1 && (
                <button
                  onClick={() => setDoc('splitMode', splitMode === 'single' ? 'auto' : 'single')}
                  className="rounded-md px-2 py-1 text-xs font-medium text-brand-700 transition hover:bg-brand-50"
                >
                  {splitMode === 'single' ? '다시 나누기' : '하나로 합치기'}
                </button>
              )}
            </div>

            <div className="mt-2.5 space-y-1.5">
              {(splitMode === 'single'
                ? [{ no: 1, text: detected.questions.map((q) => q.text).join(' ') }]
                : detected.questions
              ).map((q) => (
                <div key={q.no} className="flex gap-2 text-xs">
                  <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
                    {q.no}
                  </span>
                  <span className="line-clamp-2 flex-1 text-slate-600">{q.text}</span>
                  <span className="shrink-0 text-slate-300">{wordCount(q.text)}단어</span>
                </div>
              ))}
              {!detected.questions.length && (
                <p className="text-xs text-amber-700">지문을 찾지 못했습니다. 1단계를 확인해 주세요.</p>
              )}
            </div>

            <p className="mt-2.5 break-keep text-[11px] text-slate-400">
              {detected.method === 'numbered'
                ? '문항 번호를 기준으로 나눴습니다.'
                : detected.method === 'blank-line'
                  ? '빈 줄을 기준으로 나눴습니다. 한 지문이라면 합쳐 주세요.'
                  : '지문 하나로 봅니다.'}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-slate-400">예상 소요</h3>
            <p className="mt-2 text-2xl font-bold text-slate-900">약 {estMin}분</p>
            <p className="mt-1 break-keep text-xs text-slate-500">
              AI 분석 {calls}회 + 무료 한도 간격. 뜻쓰기·스펠링 테스트는 단어 리스트에서 바로
              만들어져 시간이 들지 않습니다.
            </p>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-brand-700">비용</h3>
            <p className="mt-2 break-keep text-sm text-brand-900">
              수북은 <strong>완전 무료</strong>입니다. 선생님의 구글 AI Studio 무료 한도 안에서
              동작하며, 어떤 결제도 발생하지 않습니다.
            </p>
          </div>
        </div>
      </div>

      <BottomBar
        blockedBy={blockedBy}
        nextLabel="생성하기"
        onBack={() => goto(1)}
        onNext={() => goto(3)}
      />
    </>
  )
}
