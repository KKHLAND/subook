import type { ReactNode } from 'react'
import { useDoc } from '../store/useDoc'

interface Props {
  /** 다음으로 못 가는 이유. 있으면 버튼 비활성 + 안내 표시 */
  blockedBy?: string | null
  nextLabel?: string
  onNext?: () => void
  onBack?: () => void
  right?: ReactNode
}

export default function BottomBar({ blockedBy, nextLabel = '다음 단계', onNext, onBack, right }: Props) {
  const step = useDoc((s) => s.step)
  const blocked = Boolean(blockedBy)

  return (
    <div className="no-print sticky bottom-0 z-20 border-t border-slate-200 bg-white/90 backdrop-blur">
      <div className="h-0.5 w-full bg-slate-100">
        <div className="h-full bg-brand-500 transition-all" style={{ width: `${(step / 4) * 100}%` }} />
      </div>
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <div className="w-24">
          {onBack && (
            <button
              onClick={onBack}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              ← 이전
            </button>
          )}
        </div>

        <div className="flex flex-1 items-center justify-center gap-3 text-center">
          <span className="text-[11px] font-semibold tracking-widest text-slate-400">
            STEP {step} OF 4
          </span>
          {blockedBy && (
            <span className="break-keep text-xs text-amber-700">{blockedBy}</span>
          )}
        </div>

        <div className="flex w-auto min-w-24 justify-end">
          {right ??
            (onNext && (
              <button
                onClick={onNext}
                disabled={blocked}
                className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {nextLabel} →
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}
