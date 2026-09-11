/**
 * PDF 글자 조각을 사람이 읽는 순서의 텍스트로 바꾸는 순수 로직.
 * pdfjs 에 의존하지 않아 따로 테스트할 수 있다.
 */

export interface TextItem {
  str: string
  transform: number[]
  width?: number
  hasEOL?: boolean
}

/**
 * 한 쪽의 글자 조각을 읽기 순서대로 잇는다.
 *
 * 모의고사·EBS 교재 PDF 는 대부분 2단 편집이다. y 좌표만 보고 줄을 묶으면 왼쪽 단과
 * 오른쪽 단이 한 줄로 섞여 지문이 망가진다. 그래서 가운데가 비어 있는지 먼저 확인하고,
 * 2단이면 왼쪽 단을 다 읽은 뒤 오른쪽 단을 읽는다.
 */
export function readPage(items: TextItem[], pageWidth: number): string {
  const real = items.filter((it) => it.str && it.str.trim())
  if (!real.length) return ''

  const cut = findGutter(real, pageWidth)
  if (cut === null) return joinByLine(real)

  // 시작 x 로 가르므로 어떤 조각도 빠지지 않는다.
  // 쪽을 가로지르는 머리글은 왼쪽 단 맨 위에 붙는다.
  const left = real.filter((it) => it.transform[4] < cut)
  const right = real.filter((it) => it.transform[4] >= cut)
  return `${joinByLine(left)}\n${joinByLine(right)}`.trim()
}

/**
 * 쪽 가운데에 «아무 글자도 걸치지 않는» 세로 여백이 있는지 찾는다.
 * 있으면 그 한가운데 x 좌표를, 없으면 null 을 돌려준다.
 */
export function findGutter(items: TextItem[], pageWidth: number): number | null {
  const MIN_GUTTER = 14 // 단 사이 여백으로 인정할 최소 폭(pt)
  const STEP = 2
  const from = pageWidth * 0.33
  const to = pageWidth * 0.67

  // 머리글·꼬리말처럼 쪽을 가로지르는 줄 몇 개 때문에 2단 인식이 깨지지 않도록,
  // 경계를 걸치는 조각이 아주 적으면 여백으로 인정한다.
  const allowed = Math.max(1, Math.floor(items.length * 0.02))

  const spans = items.map((it) => [it.transform[4], it.transform[4] + (it.width ?? 0)] as const)

  let bestStart: number | null = null
  let best = 0
  let runStart: number | null = null

  for (let x = from; x <= to; x += STEP) {
    const blockers = spans.filter(([a, b]) => a < x && b > x).length
    if (blockers > allowed) {
      runStart = null
      continue
    }
    if (runStart === null) runStart = x
    const run = x - runStart
    if (run > best) {
      best = run
      bestStart = runStart
    }
  }

  if (bestStart === null || best < MIN_GUTTER) return null

  const cut = bestStart + best / 2
  // 양쪽에 실제로 내용이 있어야 2단으로 본다
  const leftCount = items.filter((it) => it.transform[4] < cut).length
  const ratio = leftCount / items.length
  return ratio > 0.2 && ratio < 0.8 ? cut : null
}

/** 같은 높이(y)에 있는 조각을 한 줄로 묶는다 */
export function joinByLine(items: TextItem[]): string {
  const sorted = [...items].sort((a, b) => {
    const dy = b.transform[5] - a.transform[5] // 위에서 아래로
    return Math.abs(dy) > 3 ? dy : a.transform[4] - b.transform[4] // 같은 줄이면 왼쪽부터
  })

  const lines: string[] = []
  let buf = ''
  let lastY: number | null = null
  let lastX1 = 0

  for (const it of sorted) {
    const y = it.transform[5]
    const x0 = it.transform[4]
    const size = Math.abs(it.transform[0]) || 10

    if (lastY !== null && Math.abs(y - lastY) > 3) {
      if (buf.trim()) lines.push(buf.trim())
      buf = ''
    } else if (buf && needsSpace(buf, it.str, x0 - lastX1, size)) {
      // pdf.js 는 단어를 따로 내보내며 공백을 빼먹는 일이 잦다.
      // 조각 사이가 벌어져 있으면 공백을 넣어 준다.
      buf += ' '
    }

    buf += it.str
    lastY = y
    lastX1 = x0 + (it.width ?? 0)
  }
  if (buf.trim()) lines.push(buf.trim())

  return lines.join('\n')
}

export function needsSpace(buf: string, next: string, gap: number, fontSize: number): boolean {
  if (/\s$/.test(buf) || /^\s/.test(next)) return false
  return gap > fontSize * 0.2
}
