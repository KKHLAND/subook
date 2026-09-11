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

/* ── 문제 유형 공통 스키마 ─────────────────────────────
   제목·요지·주제·빈칸·함축·요약·순서·삽입·무관한문장·어법/어휘 객관식이
   전부 이 하나를 쓴다. 유형별로 필요 없는 칸은 빈 값으로 둔다. */

const QUESTION = {
  type: 'OBJECT',
  properties: {
    type: S('문항 유형 이름. 예) 제목, 빈칸 추론, 글의 순서'),
    directive: S('발문. 예) 다음 글의 제목으로 가장 적절한 것은?'),
    lead: S('본문 앞에 따로 제시하는 글. 문장 삽입의 «주어진 문장», 글의 순서의 «주어진 글». 없으면 빈 문자열'),
    parts: ARR({
      type: 'OBJECT',
      properties: {
        text: S('본문 조각. 원문을 그대로 쓴다'),
        mark: {
          type: 'INTEGER',
          description: '①②③④⑤ 로 표시할 자리면 1~5. 표시하지 않을 평범한 부분이면 0',
        },
      },
      required: ['text', 'mark'],
      propertyOrdering: ['text', 'mark'],
    }),
    blocks: ARR({
      type: 'OBJECT',
      properties: {
        label: S('A, B, C 중 하나'),
        text: S('그 단락의 원문'),
      },
      required: ['label', 'text'],
      propertyOrdering: ['label', 'text'],
    }),
    tail: S('본문 뒤에 제시하는 글. 요약문 완성의 요약문. 없으면 빈 문자열'),
    choices: ARR(S('선택지 하나. 번호(①, 1.)는 붙이지 말 것')),
    answer: { type: 'INTEGER', description: '정답 번호 1~5' },
    explanation: S('정답인 이유. 지문의 근거 표현을 영어 그대로 인용해 밝힌다. 2~3문장'),
    wrongNotes: ARR(S('매력적인 오답 하나가 왜 틀렸는지. "②번: …" 처럼 번호로 시작. 2~3개')),
  },
  required: ['type', 'directive', 'lead', 'parts', 'blocks', 'tail', 'choices', 'answer', 'explanation', 'wrongNotes'],
  propertyOrdering: ['type', 'directive', 'lead', 'parts', 'blocks', 'tail', 'choices', 'answer', 'explanation', 'wrongNotes'],
}

/** 문장마다 네 개 중 고르기 */
const SENTENCE_DRILL = {
  type: 'OBJECT',
  properties: {
    items: ARR({
      type: 'OBJECT',
      properties: {
        sentence: S('원문 문장. 고를 자리를 정확히 "( )" 로 바꿔 둔다'),
        choices: ARR(S('선택지 한 개. 번호는 붙이지 말 것')),
        answer: { type: 'INTEGER', description: '정답 번호 1~4' },
        note: S('정답 근거를 한 줄로. 우리말'),
      },
      required: ['sentence', 'choices', 'answer', 'note'],
      propertyOrdering: ['sentence', 'choices', 'answer', 'note'],
    }),
  },
  required: ['items'],
}

/** 문장마다 둘 중 고르기 */
const PAIR_DRILL = {
  type: 'OBJECT',
  properties: {
    items: ARR({
      type: 'OBJECT',
      properties: {
        before: S('고를 자리 앞의 원문'),
        a: S('왼쪽 선택지'),
        b: S('오른쪽 선택지'),
        after: S('고를 자리 뒤의 원문'),
        answer: S('A 또는 B'),
        note: S('정답 근거를 한 줄로. 우리말'),
      },
      required: ['before', 'a', 'b', 'after', 'answer', 'note'],
      propertyOrdering: ['before', 'a', 'b', 'after', 'answer', 'note'],
    }),
  },
  required: ['items'],
}

/** 영작·서술형 */
const WRITING = {
  type: 'OBJECT',
  properties: {
    topic: S('글의 주제 한 줄'),
    items: ARR({
      type: 'OBJECT',
      properties: {
        question: S('학생에게 제시할 문항. 우리말 지시 + 필요하면 우리말 문장'),
        condition: S('조건. 예) 주어진 어휘를 모두 사용할 것 / 8단어 이내. 없으면 빈 문자열'),
        answer: S('모범 답안 영어 문장'),
        points: ARR(S('채점 포인트 한 줄. 예) 관계대명사 who 를 바르게 썼는가')),
      },
      required: ['question', 'condition', 'answer', 'points'],
      propertyOrdering: ['question', 'condition', 'answer', 'points'],
    }),
  },
  required: ['topic', 'items'],
}

// 문제 유형은 전부 같은 스키마를 쓴다
for (const k of [
  'title', 'main_point', 'topic', 'title_hard', 'main_hard',
  'blank_1', 'blank_2', 'implication', 'summary',
  'order', 'insertion', 'irrelevant',
  'grammar_mcq', 'vocab_mcq',
]) {
  SCHEMAS[k] = QUESTION
}
for (const k of ['grammar_pick4', 'vocab_pick4']) SCHEMAS[k] = SENTENCE_DRILL
for (const k of ['grammar_pair', 'vocab_pair']) SCHEMAS[k] = PAIR_DRILL
for (const k of ['condition_writing', 'sentence_completion', 'summary_writing']) SCHEMAS[k] = WRITING
