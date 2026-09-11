/**
 * 수북(SUBOOK) 자료 세트 정의
 * ─────────────────────────────────────────────────────────
 * "세트(Set)" = 한 번에 생성되는 학습자료 묶음.
 * 각 세트는 여러 "항목(Item)"으로 구성되고, 항목 하나가 A4 한 페이지(또는 여러 장)가 된다.
 */

export type SetKey = 'analysis' | 'drill' | 'gist' | 'inference' | 'structure' | 'writing'

/** 입력 지문의 형태. 항목 세트가 갈린다. */
export type InputShape = 'short' | 'long'
//  short = 수능형 짧은 지문 여러 개  /  long = 교과서 단원처럼 긴 글 하나

export interface SetItem {
  key: string
  label: string
  /** 결과물에서 무엇을 만드는지 — 설정 화면 툴팁 및 프롬프트 설명에 사용 */
  desc: string
  /** 생성 부담(1~3). 예상 소요시간·토큰 추정에 사용 */
  weight: 1 | 2 | 3
}

export interface StudySet {
  key: SetKey
  /** 화면에 크게 보이는 이름 */
  name: string
  /** 한 줄 설명 */
  desc: string
  /** 커버·배지에 쓰는 영문 라벨 */
  en: string
  color: string
  ready: boolean
}

export const STUDY_SETS: StudySet[] = [
  { key: 'analysis',  name: '지문 분석',   desc: '해석·구조·단어까지 한 번에 정리한 학습용 자료', en: 'ANALYSIS',  color: '#0D8466', ready: true },
  { key: 'drill',     name: '어법·어휘',   desc: '문장 단위 어법/어휘 훈련과 객관식 복습 문제',    en: 'DRILL',     color: '#EA580C', ready: true },
  { key: 'gist',      name: '대의 파악',   desc: '제목·요지·주제·주장 유형 변형 문제',           en: 'GIST',      color: '#2563EB', ready: true },
  { key: 'inference', name: '추론',       desc: '빈칸 추론·함축 의미·요약문 유형 변형 문제',      en: 'INFERENCE', color: '#7C3AED', ready: true },
  { key: 'structure', name: '글의 구조',   desc: '글의 순서·문장 삽입 유형 변형 문제',            en: 'STRUCTURE', color: '#DB2777', ready: true },
  { key: 'writing',   name: '영작·서술형', desc: '조건 영작과 서술형 문항, 모범답안과 채점 포인트', en: 'WRITING',   color: '#0F172A', ready: true },
]

export const SET_ITEMS: Record<string, SetItem[]> = {
  /* ── 지문 분석 : 짧은 지문 여러 개 ── */
  'analysis-short': [
    { key: 'translation',   label: '지문 해석',       desc: '문장마다 번호를 붙여 영문과 우리말 해석을 나란히 배치', weight: 1 },
    { key: 'key_guide',     label: '핵심 가이드',     desc: '제목·주제·요약·전개 구조표·출제 포인트',              weight: 2 },
    { key: 'sentence_read', label: '한 문장 읽기',    desc: '문장별 해석 → 한 줄 요약 → 쉬운 예시',               weight: 2 },
    { key: 'close_reading', label: '정밀 판독',       desc: '6개 관점(정보/원리/함정/인과/지칭/요지) 질문과 해설',  weight: 2 },
    { key: 'vocab_list',    label: '단어 리스트',     desc: '품사·의미·유의어·반의어 표',                        weight: 1 },
    { key: 'meaning_test',  label: '뜻쓰기 테스트',   desc: '영단어 제시 → 의미 빈칸 (2단 배치)',                 weight: 1 },
    { key: 'spelling_test', label: '스펠링 테스트',   desc: '의미 제시 → 영단어 빈칸 (2단 배치)',                 weight: 1 },
  ],
  /* ── 지문 분석 : 긴 글 하나 ── */
  'analysis-long': [
    { key: 'overview',      label: '전체 글 구조',    desc: '단원 전체의 흐름과 문단별 역할 개관',                weight: 2 },
    { key: 'translation',   label: '지문 해석',       desc: '문단을 나눠 영문과 우리말 해석을 나란히 배치',        weight: 1 },
    { key: 'sentence_read', label: '한 문장 읽기',    desc: '핵심 문장 해석 → 한 줄 요약 → 쉬운 예시',            weight: 2 },
    { key: 'close_reading', label: '정밀 판독',       desc: '6개 관점 질문과 해설',                             weight: 2 },
    { key: 'vocab_list',    label: '단어 리스트',     desc: '품사·의미·유의어·반의어 표',                        weight: 1 },
    { key: 'meaning_test',  label: '뜻쓰기 테스트',   desc: '영단어 제시 → 의미 빈칸',                           weight: 1 },
    { key: 'spelling_test', label: '스펠링 테스트',   desc: '의미 제시 → 영단어 빈칸',                           weight: 1 },
  ],
  /* ── 어법·어휘 ── */
  drill: [
    { key: 'grammar_pick4', label: '어법 4지선다',    desc: '문장마다 어법상 알맞은 말 4개 중 고르기',            weight: 2 },
    { key: 'vocab_pick4',   label: '어휘 4지선다',    desc: '문장마다 문맥상 알맞은 말 4개 중 고르기',            weight: 2 },
    { key: 'grammar_pair',  label: '어법 양자택일',   desc: '문장마다 [A / B] 중 어법상 맞는 쪽 고르기',          weight: 1 },
    { key: 'vocab_pair',    label: '어휘 양자택일',   desc: '문장마다 [A / B] 중 문맥상 맞는 쪽 고르기',          weight: 1 },
    { key: 'grammar_mcq',   label: '어법 객관식',     desc: '지문 속 밑줄 5개 중 어법상 틀린 것 고르기',          weight: 2 },
    { key: 'vocab_mcq',     label: '어휘 객관식',     desc: '지문 속 밑줄 5개 중 문맥상 틀린 것 고르기',          weight: 2 },
  ],
  /* ── 대의 파악 ── */
  gist: [
    { key: 'title',         label: '제목',           desc: '글의 제목으로 가장 적절한 것 (5지선다)',             weight: 2 },
    { key: 'main_point',    label: '요지·주장',       desc: '글의 요지 또는 필자의 주장 (5지선다)',               weight: 2 },
    { key: 'topic',         label: '주제',           desc: '글의 주제로 가장 적절한 것 (5지선다)',               weight: 2 },
    { key: 'title_hard',    label: '제목 (고난도)',   desc: '매력적인 오답을 강화한 고난도 제목 문항',            weight: 3 },
    { key: 'main_hard',     label: '요지 (고난도)',   desc: '매력적인 오답을 강화한 고난도 요지 문항',            weight: 3 },
  ],
  /* ── 추론 ── */
  inference: [
    { key: 'blank_1',       label: '빈칸 추론 1',     desc: '핵심 개념 자리에 빈칸 (5지선다)',                   weight: 3 },
    { key: 'blank_2',       label: '빈칸 추론 2',     desc: '다른 위치에 빈칸을 뚫은 두 번째 문항',               weight: 3 },
    { key: 'implication',   label: '함축 의미',       desc: '밑줄 친 표현이 의미하는 바 (5지선다)',               weight: 3 },
    { key: 'summary',       label: '요약문 완성',     desc: '(A)/(B) 두 칸을 채우는 요약문 (5지선다)',            weight: 3 },
  ],
  /* ── 글의 구조 ── */
  structure: [
    { key: 'order',         label: '글의 순서',       desc: '주어진 글 다음에 이어질 (A)(B)(C) 순서',            weight: 3 },
    { key: 'insertion',     label: '문장 삽입',       desc: '주어진 문장이 들어가기에 가장 적절한 곳',            weight: 3 },
    { key: 'irrelevant',    label: '무관한 문장',     desc: '전체 흐름과 관계 없는 문장 고르기',                 weight: 2 },
  ],
  /* ── 영작·서술형 ── */
  writing: [
    { key: 'condition_writing',   label: '조건 영작',    desc: '주어진 어휘와 조건에 맞게 우리말을 영어 문장으로',  weight: 3 },
    { key: 'sentence_completion', label: '문장 완성',    desc: '본문 근거를 찾아 빈칸에 들어갈 표현 직접 쓰기',     weight: 2 },
    { key: 'summary_writing',     label: '요약문 쓰기',  desc: '지문을 영어 한 문장으로 요약하기',                weight: 3 },
  ],
}

/**
 * 항목이 어떤 결과물인지.
 *   study    — 공부용 자료. 문제가 아니다 (해석·단어장 …)
 *   question — 문제. 문제지와 해설지로 갈라서 인쇄한다
 *   writing  — 서술형. 문제와 모범답안·채점 포인트
 */
export type ItemKind = 'study' | 'question' | 'writing'

const QUESTION_ITEMS = new Set([
  'title', 'main_point', 'topic', 'title_hard', 'main_hard',
  'blank_1', 'blank_2', 'implication', 'summary',
  'order', 'insertion', 'irrelevant',
  'grammar_mcq', 'vocab_mcq',
])

const WRITING_ITEMS = new Set(['condition_writing', 'sentence_completion', 'summary_writing'])

export function kindOf(itemKey: string): ItemKind {
  if (QUESTION_ITEMS.has(itemKey)) return 'question'
  if (WRITING_ITEMS.has(itemKey)) return 'writing'
  return 'study'
}

/** 세트 + 지문 형태로 항목 목록 얻기 (분석 세트만 short/long 분기) */
export function itemsFor(setKey: SetKey, shape: InputShape): SetItem[] {
  if (setKey === 'analysis') return SET_ITEMS[`analysis-${shape}`] ?? []
  return SET_ITEMS[setKey] ?? []
}

export function setByKey(key: SetKey): StudySet {
  return STUDY_SETS.find((s) => s.key === key)!
}
