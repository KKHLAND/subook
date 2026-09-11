/**
 * Gemini responseSchema (OpenAPI 부분집합).
 * 스키마를 강제해야 파싱 실패·항목 누락이 사라진다.
 */
const S = (description?: string) => ({ type: 'STRING', ...(description ? { description } : {}) })
const ARR = (items: object) => ({ type: 'ARRAY', items })

const WORD = {
  type: 'OBJECT',
  properties: {
    word: S('영어 표제어 (원형)'),
    pos: S('품사를 한 글자로: 명 동 형 부 전 접 감 (분사는 "분사")'),
    meaning: S('우리말 뜻. 쉼표로 최대 2개'),
    syn: S('영어 유의어 1~2개, 쉼표 구분'),
    ant: S('영어 반의어 1~2개, 쉼표 구분. 없으면 빈 문자열'),
  },
  required: ['word', 'pos', 'meaning', 'syn', 'ant'],
  propertyOrdering: ['word', 'pos', 'meaning', 'syn', 'ant'],
}

export const SCHEMAS: Record<string, object> = {
  translation: {
    type: 'OBJECT',
    properties: {
      titleEn: S('지문에 어울리는 영어 제목 3~6단어'),
      titleKo: S('영어 제목의 우리말 표현 (15자 이내)'),
      sentences: ARR({
        type: 'OBJECT',
        properties: {
          en: S('원문 문장을 한 글자도 바꾸지 말고 그대로'),
          ko: S('자연스러운 우리말 해석'),
        },
        required: ['en', 'ko'],
        propertyOrdering: ['en', 'ko'],
      }),
      words: ARR(WORD),
    },
    required: ['titleEn', 'titleKo', 'sentences', 'words'],
    propertyOrdering: ['titleEn', 'titleKo', 'sentences', 'words'],
  },

  key_guide: {
    type: 'OBJECT',
    properties: {
      titleEn: S('영어 제목 3~6단어'),
      titleKo: S('우리말 제목 15자 이내'),
      topic: S('글의 주제 한 줄 (30자 내외)'),
      summary: S('지문 요약 3문장. 250자 내외'),
      structure: ARR({
        type: 'OBJECT',
        properties: {
          phase: S('도입 / 전개 / 결론 중 하나'),
          subtopic: S('그 부분의 핵심 소주제 (20자 이내)'),
          points: ARR(S('세부 핵심 한 줄 (30자 내외)')),
          role: S('글 전체에서 이 부분이 하는 논리적 역할 (25자 이내)'),
        },
        required: ['phase', 'subtopic', 'points', 'role'],
        propertyOrdering: ['phase', 'subtopic', 'points', 'role'],
      }),
      keywords: ARR(S('지문의 핵심 영어 표현')),
      examLogic: S('이 지문이 어떤 유형으로 출제될지와 그 근거. 2문장'),
      syntaxPoint: S('주목할 구문 1~2개를 원문 인용과 함께 설명. 2~3문장'),
      vocabPrep: S('시험에 나올 만한 어휘 정리. 2문장'),
      contentPoint: S('필자의 주장을 학생이 이해하도록 풀어쓴 설명. 2문장'),
      insight: {
        type: 'OBJECT',
        properties: {
          coreQuestion: S('이 지문이 던지는 핵심 질문과 그 답. 2문장'),
          causeToEffect: S('원인에서 결과로 이어지는 논리 흐름. 1~2문장'),
          examinerView: S('출제위원이라면 어디를 물을지. 앞에 (주제 / 빈칸) 처럼 유형을 밝힐 것'),
        },
        required: ['coreQuestion', 'causeToEffect', 'examinerView'],
        propertyOrdering: ['coreQuestion', 'causeToEffect', 'examinerView'],
      },
    },
    required: ['titleEn', 'titleKo', 'topic', 'summary', 'structure', 'keywords', 'examLogic', 'syntaxPoint', 'vocabPrep', 'contentPoint', 'insight'],
    propertyOrdering: ['titleEn', 'titleKo', 'topic', 'summary', 'structure', 'keywords', 'examLogic', 'syntaxPoint', 'vocabPrep', 'contentPoint', 'insight'],
  },

  sentence_read: {
    type: 'OBJECT',
    properties: {
      topic: S('글의 주제 한 줄 (30자 내외)'),
      items: ARR({
        type: 'OBJECT',
        properties: {
          ko: S('그 문장의 우리말 해석'),
          summary: S('[앞 개념] → [뒤 개념] 형식의 한 줄 요약. 대괄호와 화살표를 반드시 사용'),
          example: S('중학생도 이해할 쉬운 예시. "~예요/~어요" 말투로 1문장'),
        },
        required: ['ko', 'summary', 'example'],
        propertyOrdering: ['ko', 'summary', 'example'],
      }),
    },
    required: ['topic', 'items'],
    propertyOrdering: ['topic', 'items'],
  },

  close_reading: {
    type: 'OBJECT',
    properties: {
      items: ARR({
        type: 'OBJECT',
        properties: {
          category: S('정보 확인 / 핵심 원리 / 함정 주의 / 인과 관계 / 지칭 추론 / 요지 파악 중 하나'),
          question: S('우리말 질문 한 문장 (40자 내외)'),
          answer: S('우리말 정답 해설. 근거가 되는 영어 표현을 괄호로 병기. 2문장 이내'),
        },
        required: ['category', 'question', 'answer'],
        propertyOrdering: ['category', 'question', 'answer'],
      }),
    },
    required: ['items'],
  },

  vocab_list: {
    type: 'OBJECT',
    properties: {
      topic: S('글의 주제 한 줄 (30자 내외)'),
      words: ARR(WORD),
    },
    required: ['topic', 'words'],
    propertyOrdering: ['topic', 'words'],
  },
}
