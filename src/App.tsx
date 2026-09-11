import { useState } from 'react'
import Stepper from './components/Stepper'
import Step1Input from './components/Step1Input'
import Step2Config from './components/Step2Config'
import Step3Generate from './components/Step3Generate'
import Step4Result from './components/Step4Result'
import ApiKeyBar from './components/ApiKeyBar'
import { useDoc } from './store/useDoc'
import { useSettings } from './store/useSettings'

export default function App() {
  const step = useDoc((s) => s.step)
  const connected = useSettings((s) => s.connected)
  const hasKey = useSettings((s) => Boolean(s.apiKey))
  const [keyOpen, setKeyOpen] = useState(false)

  return (
    <div className="flex min-h-full flex-col">
      <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-extrabold tracking-tight text-brand-700">수북</span>
            <span className="hidden text-[11px] font-semibold tracking-widest text-slate-400 sm:inline">
              SUBOOK
            </span>
          </div>

          <div className="mx-auto hidden sm:block">
            <Stepper />
          </div>

          <button
            onClick={() => setKeyOpen(true)}
            className={`ml-auto flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition sm:ml-0 ${
              connected
                ? 'border-brand-200 bg-brand-50 text-brand-700 hover:bg-brand-100'
                : hasKey
                  ? 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
          >
            <span className={`size-1.5 rounded-full ${connected ? 'bg-brand-500' : hasKey ? 'bg-slate-400' : 'bg-amber-500'}`} />
            {connected ? 'AI 연결됨' : hasKey ? 'AI 키 확인' : 'AI 연결'}
          </button>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3 sm:hidden">
          <Stepper />
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {step === 1 && <Step1Input />}
        {step === 2 && <Step2Config />}
        {step === 3 && <Step3Generate />}
        {step === 4 && <Step4Result />}
      </main>

      {keyOpen && <ApiKeyBar onClose={() => setKeyOpen(false)} />}
    </div>
  )
}
