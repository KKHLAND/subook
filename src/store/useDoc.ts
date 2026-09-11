import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { InputShape, SetKey } from '../lib/sets'
import { itemsFor } from '../lib/sets'

export type Step = 1 | 2 | 3 | 4
export type LayoutMode = 'side-by-side' | 'stacked' | 'both'

/** 업로드/붙여넣기로 확보한 원본 페이지 한 장 */
export interface SourcePage {
  index: number
  text: string
  /** 미리보기 썸네일 (dataURL). PDF만 생성, DOCX/TXT는 없음 */
  thumb?: string
  selected: boolean
}

/** 분리된 문항(지문) 하나 */
export interface Question {
  no: number
  title?: string
  text: string
}

export interface GeneratedPage {
  id: string
  itemKey: string
  questionNo: number | null
  /** 항목별 생성 결과 (렌더러가 해석). 커버는 null */
  data: unknown
  excluded: boolean
}

interface DocState {
  step: Step
  /* STEP 1 — 입력 */
  title: string
  inputMode: 'file' | 'text'
  fileName: string | null
  sourceKind: string | null
  sourceNotice: string | null
  pages: SourcePage[]
  inputText: string
  shape: InputShape
  /** auto = 자동 분리 결과 그대로, single = 지문 하나로 합쳐서 분석 */
  splitMode: 'auto' | 'single'

  /* STEP 2 — 설정 */
  setKey: SetKey
  selectedItems: string[]
  level: string

  /* STEP 3/4 — 결과 */
  questions: Question[]
  generated: GeneratedPage[]

  /* 출력 옵션 */
  layoutMode: LayoutMode
  showBorder: boolean
  coverStyle: 'A' | 'B'
  /** 해설지를 함께 낼지 */
  includeAnswers: boolean
  /** 문제 순서 */
  sortMode: 'byQuestion' | 'byType'
  schoolName: string
  classInfo: string

  /* actions */
  set: <K extends keyof DocState>(k: K, v: DocState[K]) => void
  goto: (s: Step) => void
  chooseSet: (k: SetKey) => void
  toggleItem: (k: string) => void
  toggleAllItems: (on: boolean) => void
  resetDoc: () => void
  togglePage: (index: number) => void
  selectAllPages: (on: boolean) => void
}

/**
 * 실제로 AI 에게 보낼 지문.
 * 파일을 올렸으면 «선택한 쪽»만, 직접 입력이면 입력창 내용 그대로.
 */
export function textToAnalyze(s: Pick<DocState, 'inputMode' | 'pages' | 'inputText'>): string {
  if (s.inputMode !== 'file') return s.inputText
  return s.pages
    .filter((p) => p.selected)
    .map((p) => p.text)
    .join('\n\n')
    .trim()
}

const initial = {
  step: 1 as Step,
  title: '',
  inputMode: 'text' as const,
  fileName: null,
  sourceKind: null,
  sourceNotice: null,
  pages: [] as SourcePage[],
  inputText: '',
  shape: 'short' as InputShape,
  splitMode: 'auto' as const,
  setKey: 'analysis' as SetKey,
  selectedItems: itemsFor('analysis', 'short').map((i) => i.key),
  level: 'auto',
  questions: [] as Question[],
  generated: [] as GeneratedPage[],
  layoutMode: 'side-by-side' as LayoutMode,
  showBorder: false,
  coverStyle: 'A' as const,
  includeAnswers: true,
  sortMode: 'byQuestion' as const,
  schoolName: '',
  classInfo: '',
}

export const useDoc = create<DocState>()(
  persist(
    (set, get) => ({
      ...initial,

      set: (k, v) => set({ [k]: v } as never),
      goto: (s) => set({ step: s }),

      chooseSet: (k) =>
        set({ setKey: k, selectedItems: itemsFor(k, get().shape).map((i) => i.key) }),

      toggleItem: (k) =>
        set((s) => ({
          selectedItems: s.selectedItems.includes(k)
            ? s.selectedItems.filter((x) => x !== k)
            : [...s.selectedItems, k],
        })),

      toggleAllItems: (on) =>
        set((s) => ({ selectedItems: on ? itemsFor(s.setKey, s.shape).map((i) => i.key) : [] })),

      resetDoc: () => set({ ...initial, schoolName: get().schoolName }),

      togglePage: (index) =>
        set((s) => ({
          pages: s.pages.map((p) => (p.index === index ? { ...p, selected: !p.selected } : p)),
        })),

      selectAllPages: (on) => set((s) => ({ pages: s.pages.map((p) => ({ ...p, selected: on })) })),
    }),
    {
      name: 'subook-doc',
      version: 1,
      // 썸네일 dataURL 은 용량이 커서 저장하지 않는다
      partialize: (s) => ({
        ...s,
        pages: s.pages.map(({ thumb: _thumb, ...rest }) => rest),
      }),
    },
  ),
)
