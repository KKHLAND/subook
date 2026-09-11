import { useDoc, textToAnalyze } from '../store/useDoc'
import { SAMPLE_PAGES, SAMPLE_QUESTIONS, SAMPLE_TITLE } from '../lib/sample'
import { wordCount } from '../lib/segment'
import BottomBar from './BottomBar'
import FileInput from './FileInput'

const TITLE_MAX = 40

export default function Step1Input() {
  const doc = useDoc()
  const { title, inputMode, inputText, shape } = doc
  const set = useDoc((s) => s.set)
  const goto = useDoc((s) => s.goto)

  const chars = inputText.trim().length
  const words = wordCount(textToAnalyze(doc))

  const blockedBy =
    inputMode === 'text'
      ? chars < 40
        ? '분석할 영어 지문을 40자 이상 붙여넣어 주세요.'
        : !title.trim()
          ? '자료명을 입력해 주세요.'
          : null
      : !doc.pages.length
        ? '분석할 파일을 올려 주세요.'
        : words < 25
          ? '선택한 쪽에 영어 지문이 거의 없습니다. 다른 쪽을 골라 주세요.'
          : !title.trim()
            ? '자료명을 입력해 주세요.'
            : null

  return (
    <>
      <div className="mx-auto grid max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-3">
        {/* 좌측 — 입력 방식 */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-semibold tracking-widest text-slate-400">입력 방식</h2>

          <button
            onClick={() => set('inputMode', 'text')}
            className={`w-full rounded-xl border p-4 text-left transition ${
              inputMode === 'text'
                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-slate-900">직접 붙여넣기</div>
            <p className="mt-1 break-keep text-sm text-slate-500">
              지문을 복사해서 붙여넣으세요. 여러 지문을 한 번에 넣어도 됩니다.
            </p>
          </button>

          <button
            onClick={() => set('inputMode', 'file')}
            className={`w-full rounded-xl border p-4 text-left transition ${
              inputMode === 'file'
                ? 'border-brand-600 bg-brand-50 ring-2 ring-brand-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="font-semibold text-slate-900">파일 올리기</div>
            <p className="mt-1 break-keep text-sm text-slate-500">
              PDF · DOCX · HWPX · TXT 파일에서 지문을 뽑아냅니다.
            </p>
          </button>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-[11px] font-semibold tracking-widest text-slate-400">지문 형태</h3>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(
                [
                  { v: 'short', l: '짧은 지문 여러 개', d: '수능·모의고사형' },
                  { v: 'long', l: '긴 글 하나', d: '교과서 단원형' },
                ] as const
              ).map((o) => (
                <button
                  key={o.v}
                  onClick={() => set('shape', o.v)}
                  className={`rounded-lg border px-3 py-2 text-left transition ${
                    shape === o.v
                      ? 'border-brand-600 bg-white font-semibold text-brand-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm">{o.l}</div>
                  <div className="text-[11px] text-slate-400">{o.d}</div>
                </button>
              ))}
            </div>
            <p className="mt-3 break-keep text-xs text-slate-500">
              형태에 따라 만들 수 있는 자료 항목이 달라집니다. 헷갈리면 그대로 두세요 — 생성할 때
              수북이 한 번 더 확인합니다.
            </p>
          </div>

          <button
            onClick={() => {
              useDoc.setState({
                title: SAMPLE_TITLE,
                setKey: 'analysis',
                shape: 'short',
                selectedItems: SAMPLE_PAGES.map((p) => p.itemKey),
                questions: SAMPLE_QUESTIONS,
                generated: SAMPLE_PAGES,
                step: 4,
              })
            }}
            className="w-full rounded-xl border border-dashed border-slate-300 p-3 text-center transition hover:border-brand-400 hover:bg-brand-50/50"
          >
            <span className="text-sm font-semibold text-slate-700">완성된 자료 미리 보기</span>
            <span className="mt-0.5 block break-keep text-xs text-slate-500">
              AI 연결 없이, 수북이 만드는 자료 8장을 그대로 볼 수 있습니다.
            </span>
          </button>
        </div>

        {/* 우측 — 자료명 + 입력 영역 */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <div>
            <label htmlFor="doc-title" className="block text-sm font-medium text-slate-700">
              자료명
            </label>
            <div className="relative mt-1.5">
              <input
                id="doc-title"
                value={title}
                maxLength={TITLE_MAX}
                onChange={(e) => set('title', e.target.value)}
                placeholder="예) 2학년 3과 본문 / 9월 모의고사 31~34번"
                className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-16 text-sm outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                {title.length}/{TITLE_MAX}
              </span>
            </div>
            <p className="mt-1.5 text-xs text-slate-500">
              자료 표지와 각 페이지 머리글에 인쇄됩니다.
            </p>
          </div>

          {inputMode === 'text' ? (
            <div className="flex flex-1 flex-col">
              <textarea
                value={inputText}
                onChange={(e) => set('inputText', e.target.value)}
                placeholder={'영어 지문을 여기에 붙여넣으세요.\n\n지문 사이에 빈 줄을 두거나 번호(31., 32. …)를 붙이면\n수북이 문항을 자동으로 나눕니다.'}
                className="min-h-[380px] flex-1 resize-none rounded-xl border border-slate-300 bg-white p-4 font-sans text-sm leading-relaxed outline-none transition focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
              />
              <div className="mt-2 flex justify-between text-xs text-slate-400">
                <span>한글이 섞여 있어도 괜찮습니다.</span>
                <span>{chars.toLocaleString()}자</span>
              </div>
            </div>
          ) : (
            <FileInput />
          )}
        </div>
      </div>

      <BottomBar blockedBy={blockedBy} onNext={() => goto(2)} />
    </>
  )
}
