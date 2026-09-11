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

/* ── 문제 유형 ───────────────────────────────────────────
   제목·요지·주제·빈칸·함축·요약·순서·삽입·무관한문장·어법객관식·어휘객관식
   — 열한 가지를 이 한 틀로 그린다. 틀이 하나라 조판을 한 번만 손보면 된다. */

export interface PassagePart {
  text: string
  /** ①②③④⑤ 로 표시할 자리. 밑줄 문제는 이 부분에 밑줄을 긋는다 */
  mark?: number
}

export interface QuestionData {
  /** 문항 위에 붙는 유형 이름 (제목 / 빈칸 추론 …) */
  type: string
  /** 발문. "다음 글의 제목으로 가장 적절한 것은?" */
  directive: string
  /** 본문 앞에 따로 제시되는 글 (문장 삽입의 주어진 문장, 글 순서의 주어진 글) */
  lead?: string
  /** 본문 */
  parts: PassagePart[]
  /** 따로 떨어진 단락 — 글의 순서의 (A)(B)(C) */
  blocks?: { label: string; text: string }[]
  /** 본문 뒤에 제시되는 글 — 요약문 */
  tail?: string
  choices: string[]
  /** 정답 번호 1~5 */
  answer: number
  explanation: string
  /** 매력적인 오답이 왜 틀렸는지 */
  wrongNotes: string[]
}

/** 문장마다 네 개 중 고르기 — 어법/어휘 4지선다 */
export interface SentenceDrillData {
  items: { sentence: string; choices: string[]; answer: number; note: string }[]
}

/** 문장마다 둘 중 고르기 — 어법/어휘 양자택일 */
export interface PairDrillData {
  items: { before: string; a: string; b: string; after: string; answer: 'A' | 'B'; note: string }[]
}

/** 영작·서술형 */
export interface WritingData {
  topic: string
  items: { question: string; condition?: string; answer: string; points: string[] }[]
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
