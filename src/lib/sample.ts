import type { GeneratedPage, Question } from '../store/useDoc'
import type {
  CloseReadingData,
  KeyGuideData,
  SentenceReadData,
  TranslationData,
  VocabListData,
  Word,
} from '../ai/types'

/**
 * 샘플 자료.
 * API 키를 발급하기 전에 "무엇이 나오는지" 먼저 보여주기 위한 것이고,
 * 조판을 손볼 때 기준 데이터로도 쓴다.
 */

const PASSAGE = `Many people believe that reading is a solitary activity, but research suggests otherwise. When students discuss a text with peers, their comprehension improves markedly. The act of explaining an idea forces the reader to reorganize information, revealing gaps in understanding that silent reading conceals. Teachers who build structured discussion into reading lessons therefore see stronger long-term retention among their students.`

const SENTENCES = [
  {
    en: 'Many people believe that reading is a solitary activity, but research suggests otherwise.',
    ko: '많은 사람들은 읽기가 혼자 하는 활동이라고 믿지만, 연구는 그렇지 않음을 시사한다.',
  },
  {
    en: 'When students discuss a text with peers, their comprehension improves markedly.',
    ko: '학생들이 또래와 글에 관해 토론할 때, 그들의 이해력은 눈에 띄게 향상된다.',
  },
  {
    en: 'The act of explaining an idea forces the reader to reorganize information, revealing gaps in understanding that silent reading conceals.',
    ko: '어떤 생각을 설명하는 행위는 독자가 정보를 재구성하도록 만들며, 묵독이 감추던 이해의 빈틈을 드러낸다.',
  },
  {
    en: 'Teachers who build structured discussion into reading lessons therefore see stronger long-term retention among their students.',
    ko: '따라서 읽기 수업에 체계적인 토론을 넣는 교사들은 학생들에게서 더 강한 장기 기억을 확인한다.',
  },
]

const WORDS: Word[] = [
  { word: 'solitary', pos: '형', meaning: '혼자 하는, 고립된', syn: 'alone, isolated', ant: 'social, communal' },
  { word: 'suggest', pos: '동', meaning: '시사하다, 암시하다', syn: 'indicate, imply', ant: 'conceal, deny' },
  { word: 'otherwise', pos: '부', meaning: '그렇지 않게, 달리', syn: 'differently', ant: 'likewise' },
  { word: 'discuss', pos: '동', meaning: '토론하다, 논의하다', syn: 'debate, talk over', ant: 'ignore, avoid' },
  { word: 'peer', pos: '명', meaning: '또래, 동료', syn: 'equal, colleague', ant: 'superior' },
  { word: 'comprehension', pos: '명', meaning: '이해력, 이해', syn: 'understanding, grasp', ant: 'confusion' },
  { word: 'markedly', pos: '부', meaning: '눈에 띄게, 현저히', syn: 'noticeably, significantly', ant: 'slightly, barely' },
  { word: 'reorganize', pos: '동', meaning: '재구성하다', syn: 'rearrange, restructure', ant: 'disorganize' },
  { word: 'reveal', pos: '동', meaning: '드러내다, 밝히다', syn: 'expose, disclose', ant: 'hide, conceal' },
  { word: 'gap', pos: '명', meaning: '빈틈, 격차', syn: 'hole, shortfall', ant: 'completeness' },
  { word: 'conceal', pos: '동', meaning: '감추다', syn: 'hide, cover', ant: 'reveal, expose' },
  { word: 'structured', pos: '형', meaning: '체계적인, 짜임새 있는', syn: 'organized, systematic', ant: 'random' },
  { word: 'retention', pos: '명', meaning: '기억, 보유', syn: 'memory, preservation', ant: 'forgetting, loss' },
]

const TOPIC = '읽기 이해력과 장기 기억을 높이는 또래 토론의 효과'

const translation: TranslationData = {
  titleEn: 'Reading Through Discussion',
  titleKo: '토론으로 깊어지는 독해',
  sentences: SENTENCES,
  words: WORDS.slice(0, 6),
}

const keyGuide: KeyGuideData = {
  titleEn: 'Reading Through Discussion',
  titleKo: '토론으로 깊어지는 독해',
  topic: TOPIC,
  summary:
    '많은 사람은 읽기를 혼자 하는 활동으로 여기지만, 연구 결과는 다르다. 또래와 글을 논의하면 정보를 다시 구성하게 되어 스스로 놓쳤던 이해의 빈틈이 드러난다. 그래서 읽기 수업에 체계적인 토론을 넣은 교사들은 학생들의 장기 기억이 강화되는 것을 확인한다.',
  structure: [
    {
      phase: '도입',
      subtopic: '읽기에 대한 통념과 연구 결과',
      points: ['읽기를 혼자 하는 활동으로 보는 견해', '연구는 이와 다른 결과를 시사함'],
      role: '통념을 제시한 뒤 중심 주제로 전환한다.',
    },
    {
      phase: '전개',
      subtopic: '토론이 이해력에 작용하는 원리',
      points: ['또래와 토론하면 이해력이 향상됨', '설명 과정에서 정보를 재구성하게 됨', '묵독이 감추던 빈틈이 드러남'],
      role: '효과가 생기는 구체적 원리를 설명한다.',
    },
    {
      phase: '결론',
      subtopic: '수업 적용과 장기 기억',
      points: ['교사가 구조화된 토론을 수업에 넣음', '학생들의 장기 기억이 강화됨'],
      role: '원리를 실제 수업에 적용한 결과로 마무리한다.',
    },
  ],
  keywords: [
    'solitary activity',
    'peer discussion',
    'comprehension',
    'reorganize information',
    'gaps in understanding',
    'long-term retention',
  ],
  examLogic:
    '첫 문장의 통념과 but 이후 연구 결과가 이루는 대조, 그리고 therefore가 이끄는 결론이 이 글의 뼈대다. 주제·제목·빈칸 유형에서 토론의 효과와 그 작동 원리를 연결하는 문항이 나오기 쉽다.',
  syntaxPoint:
    '"When students discuss a text with peers, their comprehension improves markedly."에서 When은 시간·조건을 이끄는 종속접속사이며, 주절의 주어는 their comprehension이다. "Teachers who build structured discussion into reading lessons"의 who는 Teachers를 수식하는 주격 관계대명사로, 주어와 동사(see)가 멀어진 구조에 주의한다.',
  vocabPrep:
    'solitary(혼자 하는), comprehension(이해력), markedly(눈에 띄게)는 의미를 정확히 잡아야 한다. reorganize와 reveal은 토론이 이해에 작용하는 과정을 설명하는 핵심 동사이고, retention은 빈칸 자리에 자주 쓰이는 명사다.',
  contentPoint:
    '필자는 읽기를 개인적 활동으로 보는 생각을 수정한다. 또래에게 설명하는 과정이 정보를 재구성하게 하고 이해의 빈틈을 드러내기 때문에, 토론이 독해력과 장기 기억을 함께 높인다는 것이다.',
  insight: {
    coreQuestion:
      '토론은 왜 읽기 이해력과 장기 기억을 높이는가? 설명하는 과정이 정보를 재구성하게 만들고 숨어 있던 이해의 빈틈을 드러내기 때문이다.',
    causeToEffect:
      '또래와의 구조화된 토론 → 정보 재구성과 빈틈 발견 → 이해력 향상과 장기 기억 강화로 이어진다.',
    examinerView:
      '(주제 / 빈칸) 첫 문장의 통념과 연구 결과의 대조, 마지막 therefore와 long-term retention이 출제 근거가 된다.',
  },
}

const sentenceRead: SentenceReadData = {
  topic: TOPIC,
  items: [
    {
      ko: SENTENCES[0].ko,
      summary: '[읽기에 대한 통념] → [읽기가 반드시 혼자 하는 활동은 아님]',
      example: '혼자 책을 읽는 것 말고도 친구와 내용을 이야기하면 더 잘 이해할 수 있다는 거예요.',
    },
    {
      ko: SENTENCES[1].ko,
      summary: '[또래와의 토론] → [뚜렷한 이해력 향상]',
      example: '친구와 과학 지문을 서로 설명해 보면 혼자 읽을 때보다 내용이 더 잘 정리돼요.',
    },
    {
      ko: SENTENCES[2].ko,
      summary: '[설명과 정보 재구성] → [숨어 있던 이해의 빈틈 발견]',
      example: '배운 내용을 친구에게 설명하려 하면 내가 정확히 모르는 부분이 자연스럽게 드러나요.',
    },
    {
      ko: SENTENCES[3].ko,
      summary: '[체계적인 토론 수업] → [장기 기억 강화]',
      example: '선생님이 책을 읽은 뒤 정해진 순서로 토론하게 하면 배운 내용이 더 오래 남아요.',
    },
  ],
}

const closeReading: CloseReadingData = {
  items: [
    {
      category: '정보 확인',
      question: '학생들의 이해력이 눈에 띄게 향상되는 상황은 무엇인가?',
      answer: '또래와 글에 관해 토론할 때이다(discuss a text with peers). 본문은 이때 이해력이 markedly 향상된다고 말한다.',
    },
    {
      category: '핵심 원리',
      question: '어떤 생각을 설명하는 행위는 독자에게 무엇을 하게 만드는가?',
      answer: '정보를 재구성하게 만든다(reorganize information). 그 과정에서 이해의 빈틈도 함께 드러난다.',
    },
    {
      category: '함정 주의',
      question: '조용히 읽기만 해도 이해의 빈틈이 드러난다고 보는가?',
      answer: '아니다. 묵독은 빈틈을 감추며(silent reading conceals), 설명하는 과정이 그것을 드러낸다.',
    },
    {
      category: '인과 관계',
      question: '체계적인 토론을 읽기 수업에 넣은 결과는 무엇인가?',
      answer: '학생들의 장기 기억이 더 강해진다(stronger long-term retention). therefore가 앞선 원리와 이 결과를 잇는다.',
    },
    {
      category: '지칭 추론',
      question: 'their comprehension에서 their가 가리키는 대상은 누구인가?',
      answer: '학생들(students)이다. When절의 students가 주절의 소유격 their로 이어진다.',
    },
    {
      category: '요지 파악',
      question: '필자가 읽기를 단순한 개인 활동으로 보지 않는 이유는 무엇인가?',
      answer: '또래 토론이 이해력과 장기 기억을 함께 높이기 때문이다. 설명은 정보 재구성과 오류 발견을 이끌어 낸다.',
    },
  ],
}

const vocabList: VocabListData = { topic: TOPIC, words: WORDS }

export const SAMPLE_QUESTIONS: Question[] = [{ no: 1, text: PASSAGE }]

export const SAMPLE_TITLE = '샘플 — 토론으로 깊어지는 독해'

export const SAMPLE_PAGES: GeneratedPage[] = [
  { id: '1-translation', itemKey: 'translation', questionNo: 1, data: translation, excluded: false },
  { id: '1-key_guide', itemKey: 'key_guide', questionNo: 1, data: keyGuide, excluded: false },
  { id: '1-sentence_read', itemKey: 'sentence_read', questionNo: 1, data: sentenceRead, excluded: false },
  { id: '1-close_reading', itemKey: 'close_reading', questionNo: 1, data: closeReading, excluded: false },
  { id: '1-vocab_list', itemKey: 'vocab_list', questionNo: 1, data: vocabList, excluded: false },
  { id: '1-meaning_test', itemKey: 'meaning_test', questionNo: 1, data: vocabList, excluded: false },
  { id: '1-spelling_test', itemKey: 'spelling_test', questionNo: 1, data: vocabList, excluded: false },
]

/* ── 세트별 샘플 ─────────────────────────────────────── */

import { SAMPLE_BY_SET } from './sampleSets'
import type { SetKey } from './sets'

/** 세트별 샘플 자료. 미리 보기와 조판 점검에 쓴다 */
export function sampleFor(setKey: SetKey): { title: string; pages: GeneratedPage[] } | null {
  if (setKey === 'analysis') return { title: SAMPLE_TITLE, pages: SAMPLE_PAGES }
  const pages = SAMPLE_BY_SET[setKey]
  if (!pages?.length) return null
  return { title: `샘플 — ${SAMPLE_TITLE.replace('샘플 — ', '')}`, pages }
}
