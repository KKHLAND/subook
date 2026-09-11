/** 항목별 생성 결과의 모양. 렌더러(A4 조판)가 이 타입을 그대로 그린다. */

export interface Word {
  word: string
  pos: string          // 명 · 동 · 형 · 부 · 전 · 접 · 감 · 분사
  meaning: string      // 우리말 뜻 (쉼표로 2개까지)
  syn: string          // 유의어, 쉼표 구분
  ant: string          // 반의어, 쉼표 구분
}

/** 지문 해석 */
export interface TranslationData {
  titleEn: string
  titleKo: string
  sentences: { en: string; ko: string }[]
  words: Word[]
}

/** 핵심 가이드 */
export interface KeyGuideData {
  titleEn: string
  titleKo: string
  topic: string
  summary: string
  structure: {
    phase: string      // 도입 / 전개 / 결론
    subtopic: string
    points: string[]
    role: string
  }[]
  keywords: string[]
  examLogic: string
  syntaxPoint: string
  vocabPrep: string
  contentPoint: string
  insight: {
    coreQuestion: string
    causeToEffect: string
    examinerView: string
  }
}

/** 한 문장 읽기 */
export interface SentenceReadData {
  topic: string
  items: { ko: string; summary: string; example: string }[]
}

/** 정밀 판독 — 6개 관점 고정 */
export const CLOSE_CATEGORIES = ['정보 확인', '핵심 원리', '함정 주의', '인과 관계', '지칭 추론', '요지 파악'] as const
export interface CloseReadingData {
  items: { category: string; question: string; answer: string }[]
}

/** 단어 리스트 — 뜻쓰기·스펠링 테스트는 여기서 파생된다 (AI 호출 없음) */
export interface VocabListData {
  topic: string
  words: Word[]
}

export interface ItemDataMap {
  translation: TranslationData
  key_guide: KeyGuideData
  sentence_read: SentenceReadData
  close_reading: CloseReadingData
  vocab_list: VocabListData
  meaning_test: VocabListData
  spelling_test: VocabListData
}
