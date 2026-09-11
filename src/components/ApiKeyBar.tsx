import { useState } from 'react'
import { useSettings } from '../store/useSettings'
import { testKey } from '../ai/gemini'

export default function ApiKeyBar({ onClose }: { onClose: () => void }) {
  const { apiKey, rememberKey, connected } = useSettings()
  const set = useSettings((s) => s.set)
  const [draft, setDraft] = useState(apiKey)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function connect() {
    const key = draft.trim()
    if (!key) return
    setBusy(true)
    setMsg(null)
    try {
      const models = await testKey(key)
      set('apiKey', key)
      set('connected', true)
      setMsg({ ok: true, text: `연결됐습니다. 사용 가능한 모델 ${models.length}개를 확인했어요.` })
    } catch (e) {
      set('connected', false)
      setMsg({ ok: false, text: e instanceof Error ? e.message : '연결에 실패했습니다.' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900">AI 연결</h2>
        <p className="mt-1.5 break-keep text-sm text-slate-600">
          수북은 선생님의 <strong>구글 AI Studio 무료 키</strong>로 동작합니다. 키는 이 컴퓨터의
          브라우저에만 저장되고, 수북 서버로는 아무것도 전송되지 않습니다.
        </p>

        <ol className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
          <li>
            1. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="font-semibold text-brand-700 underline">aistudio.google.com/apikey</a> 접속 (구글 계정 로그인)
          </li>
          <li>2. <strong>Create API key</strong> 클릭</li>
          <li>3. 생성된 키를 복사해 아래에 붙여넣기</li>
        </ol>

        <div className="mt-4">
          <input
            type="password"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && connect()}
            placeholder="AIza..."
            autoComplete="off"
            className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 font-mono text-sm outline-none focus:border-brand-600 focus:ring-2 focus:ring-brand-500/20"
          />
          <label className="mt-2.5 flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={rememberKey}
              onChange={(e) => set('rememberKey', e.target.checked)}
              className="size-4 accent-[#0d8466]"
            />
            이 컴퓨터에 키 저장 (공용 컴퓨터라면 해제하세요)
          </label>
        </div>

        {msg && (
          <p
            className={`mt-3 break-keep rounded-lg px-3 py-2 text-sm ${
              msg.ok ? 'bg-brand-50 text-brand-800' : 'bg-rose-50 text-rose-700'
            }`}
          >
            {msg.text}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100">
            닫기
          </button>
          <button
            onClick={connect}
            disabled={busy || !draft.trim()}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-300"
          >
            {busy ? '확인 중…' : connected ? '다시 연결' : '연결하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
