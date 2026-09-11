import { useDoc, type Step } from '../store/useDoc'

const STEPS: { n: Step; label: string }[] = [
  { n: 1, label: '입력' },
  { n: 2, label: '설정' },
  { n: 3, label: '생성' },
  { n: 4, label: '결과' },
]

export default function Stepper() {
  const step = useDoc((s) => s.step)
  const goto = useDoc((s) => s.goto)

  return (
    <nav className="flex items-center gap-1" aria-label="진행 단계">
      {STEPS.map(({ n, label }, i) => {
        const done = n < step
        const active = n === step
        // 생성 중(3)에는 뒤로 못 감. 이미 지난 단계로만 이동 허용.
        const clickable = done && step !== 3
        return (
          <div key={n} className="flex items-center">
            {i > 0 && (
              <div className={`mx-1.5 h-px w-6 sm:w-10 ${done || active ? 'bg-brand-500' : 'bg-slate-300'}`} />
            )}
            <button
              type="button"
              disabled={!clickable}
              onClick={() => clickable && goto(n)}
              className={`flex items-center gap-2 rounded-full py-1 pl-1 pr-3 transition ${
                clickable ? 'hover:bg-slate-100' : ''
              } ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`grid size-6 place-items-center rounded-full text-xs font-bold ${
                  active
                    ? 'bg-brand-600 text-white'
                    : done
                      ? 'bg-brand-100 text-brand-700'
                      : 'bg-slate-200 text-slate-500'
                }`}
              >
                {done ? '✓' : n}
              </span>
              <span
                className={`text-sm ${active ? 'font-semibold text-slate-900' : 'text-slate-500'}`}
              >
                {label}
              </span>
            </button>
          </div>
        )
      })}
    </nav>
  )
}
