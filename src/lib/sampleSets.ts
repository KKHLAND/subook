import type { GeneratedPage } from '../store/useDoc'
import type {
  PairDrillData,
  QuestionData,
  SentenceDrillData,
  WritingData,
} from '../ai/types'

/**
 * 문제 세트 샘플.
 * API 키 없이도 «무엇이 나오는지» 보여 주고, 조판을 손볼 때 기준 데이터로 쓴다.
 * 지문은 sample.ts 와 같은 글(또래 토론과 독해)을 쓴다.
 */

const S1 = 'Many people believe that reading is a solitary activity, but research suggests otherwise.'
const S2 = 'When students discuss a text with peers, their comprehension improves markedly.'
const S3 =
  'The act of explaining an idea forces the reader to reorganize information, revealing gaps in understanding that silent reading conceals.'
const S4 =
  'Teachers who build structured discussion into reading lessons therefore see stronger long-term retention among their students.'

const full = [S1, S2, S3, S4].join(' ')

const q = (d: QuestionData): QuestionData => d

/* ── 대의 파악 ───────────────────────────────────────── */

const title = q({
  type: '제목',
  directive: '다음 글의 제목으로 가장 적절한 것은?',
  lead: '',
  parts: [{ text: full }],
  blocks: [],
  tail: '',
  choices: [
    'Reading Alone: The Path to Deep Focus',
    'Why Talking About Texts Makes Us Better Readers',
    'The Decline of Reading in the Classroom',
    'How Teachers Can Measure Reading Speed',
    'Silent Reading as a Test of Memory',
  ],
  answer: 2,
  explanation:
    '글은 읽기가 혼자 하는 활동이라는 통념을 부정하고(but research suggests otherwise), 또래와의 토론이 이해력과 장기 기억을 높인다고 말한다. 따라서 «텍스트에 관해 말하는 것이 더 나은 독자를 만든다»가 제목으로 적절하다.',
  wrongNotes: [
    '①번: 글이 부정하는 통념(reading is a solitary activity)을 오히려 제목으로 삼았다.',
    '⑤번: silent reading 은 이해의 빈틈을 감추는 것(conceals)으로 언급될 뿐, 기억을 시험하는 수단이 아니다.',
  ],
})

const mainPoint = q({
  type: '요지·주장',
  directive: '다음 글의 요지로 가장 적절한 것은?',
  lead: '',
  parts: [{ text: full }],
  blocks: [],
  tail: '',
  choices: [
    '읽기 능력은 타고난 집중력에 좌우된다.',
    '교사는 학생의 읽기 속도를 주기적으로 점검해야 한다.',
    '또래와 글에 관해 토론하면 이해력과 장기 기억이 향상된다.',
    '묵독은 이해의 빈틈을 스스로 드러내 준다.',
    '읽기 수업에서는 개인의 몰입 시간을 가장 먼저 확보해야 한다.',
  ],
  answer: 3,
  explanation:
    '토론이 정보를 재구성하게 하고(reorganize information) 이해의 빈틈을 드러내(revealing gaps in understanding) 장기 기억을 강화한다(stronger long-term retention)는 것이 글 전체의 흐름이다.',
  wrongNotes: [
    '④번: 묵독은 빈틈을 «감춘다»(silent reading conceals). 방향이 반대다.',
    '⑤번: 지문의 소재(읽기 수업)만 가져왔을 뿐 필자의 판단과 어긋난다.',
  ],
})

const topic = q({
  type: '주제',
  directive: '다음 글의 주제로 가장 적절한 것은?',
  lead: '',
  parts: [{ text: full }],
  blocks: [],
  tail: '',
  choices: [
    'the effect of peer discussion on reading comprehension',
    'the history of silent reading in schools',
    'the difficulty of measuring long-term memory',
    'the role of teachers in managing classroom noise',
    'the limits of group work in language learning',
  ],
  answer: 1,
  explanation:
    '글은 또래 토론이 독해에 미치는 «영향»을 다룬다. 주제 문항은 주장이 아니라 무엇에 관한 글인지를 묻는다.',
  wrongNotes: ['⑤번: 모둠 활동의 «한계»는 글에서 다루지 않는다. 글은 오히려 효과를 말한다.'],
})

/* ── 추론 ────────────────────────────────────────────── */

const blank1 = q({
  type: '빈칸 추론',
  directive: '다음 빈칸에 들어갈 말로 가장 적절한 것은?',
  lead: '',
  parts: [
    { text: `${S1} ${S2} The act of explaining an idea forces the reader to ` },
    { text: '________' },
    { text: `, revealing gaps in understanding that silent reading conceals. ${S4}` },
  ],
  blocks: [],
  tail: '',
  choices: [
    'memorize the exact wording',
    'reorganize information',
    'read at a steady pace',
    'avoid unfamiliar vocabulary',
    'compare several translations',
  ],
  answer: 2,
  explanation:
    '빈칸 뒤의 revealing gaps in understanding 이 단서다. 설명하는 과정에서 «정보를 다시 구성»하기 때문에 미처 몰랐던 빈틈이 드러난다.',
  wrongNotes: [
    '①번: 정확한 표현을 외우는 것은 빈틈을 드러내는 일과 이어지지 않는다.',
    '③번: 읽는 «속도»는 글에서 한 번도 언급되지 않는다.',
  ],
})

const summary = q({
  type: '요약문 완성',
  directive:
    '다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은?',
  lead: '',
  parts: [{ text: full }],
  blocks: [],
  tail:
    'Discussing a text with peers pushes readers to (A) what they have read, which in turn strengthens their (B) of the material.',
  choices: [
    '(A) restructure …… (B) retention',
    '(A) memorize …… (B) speed',
    '(A) restructure …… (B) speed',
    '(A) simplify …… (B) retention',
    '(A) translate …… (B) enjoyment',
  ],
  answer: 1,
  explanation:
    '토론은 정보를 재구성하게 하고(reorganize information) 그 결과 장기 기억이 강해진다(stronger long-term retention). 따라서 (A)는 restructure, (B)는 retention 이다.',
  wrongNotes: [
    '③번: (A)는 맞지만 (B)가 틀렸다. 글은 읽기 «속도»를 다루지 않는다.',
    '④번: 토론은 내용을 «단순화»하는 것이 아니라 재구성하게 한다.',
  ],
})

/* ── 글의 구조 ───────────────────────────────────────── */

const order = q({
  type: '글의 순서',
  directive: '주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은?',
  lead: S1,
  parts: [],
  blocks: [
    { label: 'A', text: `In short, ${S4.charAt(0).toLowerCase()}${S4.slice(1)}` },
    { label: 'B', text: S2 },
    { label: 'C', text: S3 },
  ],
  tail: '',
  choices: ['(A)-(C)-(B)', '(B)-(A)-(C)', '(B)-(C)-(A)', '(C)-(A)-(B)', '(C)-(B)-(A)'],
  answer: 3,
  explanation:
    '주어진 글이 통념을 뒤집은 뒤, (B)가 토론의 «효과»를 제시하고 (C)가 그 효과가 일어나는 «원리»를 설명한다. (A)의 In short 는 마무리를 이끄는 연결어이므로 맨 뒤에 온다.',
  wrongNotes: ['①번: (A)의 In short 로 시작하면 요약이 앞서고 근거가 뒤따르는 어색한 흐름이 된다.'],
})

const insertion = q({
  type: '문장 삽입',
  directive: '글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은?',
  lead: S3,
  parts: [
    { text: '', mark: 1 },
    { text: ` ${S1} ` },
    { text: '', mark: 2 },
    { text: ` ${S2} ` },
    { text: '', mark: 3 },
    { text: ' This is why explanation matters more than repetition. ' },
    { text: '', mark: 4 },
    { text: ` ${S4} ` },
    { text: '', mark: 5 },
  ],
  blocks: [],
  tail: '',
  answer: 3,
  choices: ['①', '②', '③', '④', '⑤'],
  explanation:
    '주어진 문장은 «설명하는 행위»가 하는 일을 밝힌다. 뒤 문장의 This is why explanation matters 가 이를 그대로 받으므로 그 앞자리인 ③에 들어가야 한다.',
  wrongNotes: ['④번에 넣으면 This 가 가리킬 내용이 앞에 없어 지시가 끊긴다.'],
})

/* ── 어법·어휘 ───────────────────────────────────────── */

const grammarMcq = q({
  type: '어법 객관식',
  directive: '다음 글의 밑줄 친 부분 중, 어법상 틀린 것은?',
  lead: '',
  parts: [
    { text: 'Many people ' },
    { text: 'believe', mark: 1 },
    { text: ' that reading is a solitary activity, but research suggests otherwise. When students discuss a text with peers, their comprehension ' },
    { text: 'improves', mark: 2 },
    { text: ' markedly. The act of explaining an idea ' },
    { text: 'force', mark: 3 },
    { text: ' the reader to reorganize information, revealing gaps in understanding that silent reading ' },
    { text: 'conceals', mark: 4 },
    { text: '. Teachers ' },
    { text: 'who', mark: 5 },
    { text: ' build structured discussion into reading lessons see stronger retention.' },
  ],
  blocks: [],
  tail: '',
  choices: ['①', '②', '③', '④', '⑤'],
  answer: 3,
  explanation:
    '주어가 The act (단수)이므로 동사는 forces 여야 한다. 사이에 낀 of explaining an idea 에 이끌려 수를 틀리기 쉬운 자리다.',
  wrongNotes: ['⑤번: Teachers 를 수식하는 주격 관계대명사 who 는 알맞게 쓰였다.'],
})

const grammarPick4: SentenceDrillData = {
  items: [
    {
      sentence: 'Many people believe that reading ( ) a solitary activity.',
      choices: ['is', 'are', 'being', 'to be'],
      answer: 1,
      note: '명사절의 주어 reading 이 단수이므로 is.',
    },
    {
      sentence: 'The act of explaining an idea ( ) the reader to reorganize information.',
      choices: ['force', 'forces', 'forcing', 'to force'],
      answer: 2,
      note: '주어는 The act 로 단수. 사이에 낀 of 구에 끌리지 않도록 주의.',
    },
    {
      sentence: 'Teachers ( ) build structured discussion into lessons see stronger retention.',
      choices: ['which', 'whose', 'who', 'whom'],
      answer: 3,
      note: '선행사가 사람이고 관계절 안에서 주어 자리이므로 주격 who.',
    },
  ],
}

const vocabPair: PairDrillData = {
  items: [
    {
      before: 'Research suggests that reading is not a purely ',
      a: 'solitary',
      b: 'social',
      after: ' activity.',
      answer: 'A',
      note: '통념은 «혼자 하는» 활동이라는 것. 뒤에서 이를 뒤집는다.',
    },
    {
      before: 'When students discuss a text, comprehension improves ',
      a: 'barely',
      b: 'markedly',
      after: '.',
      answer: 'B',
      note: '효과가 뚜렷하다는 맥락이므로 «눈에 띄게».',
    },
    {
      before: 'Explaining an idea ',
      a: 'reveals',
      b: 'conceals',
      after: ' gaps in understanding.',
      answer: 'A',
      note: '빈틈을 «드러낸다». 감추는 쪽은 묵독이다.',
    },
  ],
}

/* ── 영작·서술형 ─────────────────────────────────────── */

const conditionWriting: WritingData = {
  topic: '읽기 이해력과 장기 기억을 높이는 또래 토론의 효과',
  items: [
    {
      question: '학생들이 또래와 글에 관해 토론할 때, 그들의 이해력은 눈에 띄게 향상된다. (영어로 쓰시오)',
      condition: '주어진 어휘를 모두 사용할 것 (discuss, comprehension, markedly)',
      answer: 'When students discuss a text with peers, their comprehension improves markedly.',
      points: [
        '시간·조건을 나타내는 접속사 When 으로 종속절을 이끌었는가',
        '주어 comprehension 과 동사 improves 의 수일치',
        '제시된 어휘 세 개를 모두 사용했는가',
      ],
    },
    {
      question: '읽기 수업에 체계적인 토론을 넣는 교사들은 더 강한 장기 기억을 확인한다. (영어로 쓰시오)',
      condition: '관계대명사를 사용할 것',
      answer:
        'Teachers who build structured discussion into reading lessons see stronger long-term retention.',
      points: [
        '주격 관계대명사 who 로 Teachers 를 수식했는가',
        '주어와 본동사(see)가 멀어진 구조에서 수일치를 지켰는가',
      ],
    },
  ],
}

/* ── 세트별로 묶기 ───────────────────────────────────── */

const page = (itemKey: string, data: unknown): GeneratedPage => ({
  id: `1-${itemKey}`,
  itemKey,
  questionNo: 1,
  data,
  excluded: false,
})

export const SAMPLE_BY_SET: Record<string, GeneratedPage[]> = {
  drill: [
    page('grammar_pick4', grammarPick4),
    page('vocab_pair', vocabPair),
    page('grammar_mcq', grammarMcq),
  ],
  gist: [page('title', title), page('main_point', mainPoint), page('topic', topic)],
  inference: [page('blank_1', blank1), page('summary', summary)],
  structure: [page('order', order), page('insertion', insertion)],
  writing: [page('condition_writing', conditionWriting)],
}
