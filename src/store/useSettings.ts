import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/** 구글 AI Studio 무료 티어에서 쓸 수 있는 모델들 */
export const MODELS = [
  { id: 'gemini-2.5-flash',      label: '빠름 (Flash)',      hint: '가장 빠르고 무료 한도가 넉넉합니다. 평소엔 이걸로 충분해요.' },
  { id: 'gemini-2.5-pro',        label: '정확 (Pro)',        hint: '분석 품질이 가장 높지만 느리고 무료 한도가 적습니다.' },
  { id: 'gemini-2.5-flash-lite', label: '아주 빠름 (Lite)',  hint: '단어 리스트처럼 단순한 작업에 적합합니다.' },
] as const

interface SettingsState {
  apiKey: string
  rememberKey: boolean
  model: string
  connected: boolean
  set: <K extends keyof SettingsState>(k: K, v: SettingsState[K]) => void
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      apiKey: '',
      rememberKey: true,
      model: 'gemini-2.5-flash',
      connected: false,
      set: (k, v) => set({ [k]: v } as never),
    }),
    {
      name: 'subook-settings',
      version: 1,
      partialize: (s) => ({
        model: s.model,
        rememberKey: s.rememberKey,
        apiKey: s.rememberKey ? s.apiKey : '',
        connected: false,
      }),
    },
  ),
)
