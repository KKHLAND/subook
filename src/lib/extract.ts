import * as pdfjs from 'pdfjs-dist'
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?worker&inline'
import mammoth from 'mammoth'
import JSZip from 'jszip'
import { readPage, type TextItem } from './pdfText'

/**
 * 업로드한 문서에서 지문을 뽑아낸다. 전부 브라우저 안에서 처리하며,
 * 파일이 서버로 올라가는 일은 없다.
 */

// 워커를 번들 안에 인라인한다 — 단일 HTML 로 배포해도 PDF 가 열려야 하기 때문
pdfjs.GlobalWorkerOptions.workerPort = new PdfWorker()

export type SourceKind = 'pdf' | 'docx' | 'hwpx' | 'txt'

export interface ExtractedPage {
  index: number
  text: string
  /** PDF 만 생성. 화면에서 페이지를 고를 때 쓴다 */
  thumb?: string
}

export interface ExtractResult {
  kind: SourceKind
  pages: ExtractedPage[]
  /** 화면에 보여 줄 안내 (형식별 주의사항) */
  notice?: string
  /**
   * PDF 만. 썸네일은 쪽당 수 초가 걸려서, 글자 추출이 끝나면 화면을 먼저 띄우고
   * 썸네일은 뒤에서 하나씩 만들어 콜백으로 넘긴다.
   */
  renderThumbs?: (onThumb: (index: number, dataUrl: string) => void, signal?: AbortSignal) => Promise<void>
}

export class ExtractError extends Error {}

export async function extract(
  file: File,
  onProgress?: (done: number, total: number) => void,
): Promise<ExtractResult> {
  const name = file.name.toLowerCase()

  if (name.endsWith('.pdf')) return extractPdf(file, onProgress)
  if (name.endsWith('.docx')) return extractDocx(file)
  if (name.endsWith('.hwpx')) return extractHwpx(file)
  if (name.endsWith('.txt')) return extractTxt(file)

  if (name.endsWith('.hwp')) {
    throw new ExtractError(
      '구형 HWP 파일은 아직 열지 못합니다. 한글에서 «다른 이름으로 저장» → 파일 형식을 HWPX 또는 PDF 로 바꿔 저장한 뒤 올려 주세요.',
    )
  }
  if (name.endsWith('.doc')) {
    throw new ExtractError(
      '구형 DOC 파일은 아직 열지 못합니다. 워드에서 DOCX 또는 PDF 로 저장한 뒤 올려 주세요.',
    )
  }
  throw new ExtractError('PDF · DOCX · HWPX · TXT 파일만 열 수 있습니다.')
}

/* ── PDF ─────────────────────────────────────────────── */

async function extractPdf(file: File, onProgress?: (d: number, t: number) => void): Promise<ExtractResult> {
  const data = new Uint8Array(await file.arrayBuffer())
  let doc
  try {
    doc = await pdfjs.getDocument({ data }).promise
  } catch {
    throw new ExtractError('PDF 를 열지 못했습니다. 암호가 걸려 있거나 파일이 손상됐을 수 있습니다.')
  }

  // 1단계 — 글자만 뽑는다 (빠르다)
  const pages: ExtractedPage[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    const width = page.getViewport({ scale: 1 }).width
    pages.push({ index: i, text: readPage(content.items as TextItem[], width) })
    onProgress?.(i, doc.numPages)
  }

  // 2단계 — 썸네일은 화면을 띄운 뒤 뒤에서 채운다
  const renderThumbs = async (
    onThumb: (index: number, dataUrl: string) => void,
    signal?: AbortSignal,
  ) => {
    for (let i = 1; i <= doc.numPages; i++) {
      if (signal?.aborted) return
      const thumb = await renderThumb(await doc.getPage(i))
      if (signal?.aborted) return
      if (thumb) onThumb(i, thumb)
      // 화면이 멈춘 것처럼 보이지 않게 매 쪽마다 렌더링 틈을 준다
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  const empty = pages.filter((p) => p.text.trim().length < 20).length
  return {
    kind: 'pdf',
    pages,
    renderThumbs,
    notice:
      empty === pages.length
        ? '글자를 하나도 뽑아내지 못했습니다. 스캔한 이미지 PDF 로 보입니다 — 이런 파일은 아직 지원하지 못합니다.'
        : empty > 0
          ? `${empty}쪽에서 글자를 거의 뽑지 못했습니다. 이미지로 된 쪽일 수 있으니 선택에서 빼 주세요.`
          : undefined,
  }
}

async function renderThumb(page: pdfjs.PDFPageProxy): Promise<string | undefined> {
  try {
    const viewport = page.getViewport({ scale: 0.34 })
    const canvas = document.createElement('canvas')
    canvas.width = Math.ceil(viewport.width)
    canvas.height = Math.ceil(viewport.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined
    await page.render({ canvas, canvasContext: ctx, viewport }).promise
    return canvas.toDataURL('image/jpeg', 0.6)
  } catch {
    return undefined // 썸네일은 없어도 진행에 지장이 없다
  }
}

/* ── DOCX ────────────────────────────────────────────── */

async function extractDocx(file: File): Promise<ExtractResult> {
  try {
    const { value } = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    return {
      kind: 'docx',
      pages: splitIntoPseudoPages(value),
      notice: 'Word 문서에는 쪽 구분이 없어, 문단을 기준으로 덩어리를 나눴습니다.',
    }
  } catch {
    throw new ExtractError('DOCX 를 열지 못했습니다. 파일이 손상됐을 수 있습니다.')
  }
}

/* ── HWPX ────────────────────────────────────────────── */

async function extractHwpx(file: File): Promise<ExtractResult> {
  let zip: JSZip
  try {
    zip = await JSZip.loadAsync(await file.arrayBuffer())
  } catch {
    throw new ExtractError('HWPX 를 열지 못했습니다. 파일이 손상됐을 수 있습니다.')
  }

  // 본문은 Contents/section0.xml, section1.xml … 에 나뉘어 있다
  const names = Object.keys(zip.files)
    .filter((n) => /Contents\/section\d+\.xml$/i.test(n))
    .sort((a, b) => sectionNo(a) - sectionNo(b))

  if (!names.length) throw new ExtractError('HWPX 안에서 본문을 찾지 못했습니다.')

  const parser = new DOMParser()
  const chunks: string[] = []

  for (const n of names) {
    const xml = await zip.files[n].async('text')
    const dom = parser.parseFromString(xml, 'application/xml')
    // 문단(hp:p) 단위로 묶고, 그 안의 글자 조각(hp:t)을 이어 붙인다
    const paras = dom.getElementsByTagName('hp:p')
    const list = paras.length ? paras : dom.getElementsByTagName('p')
    for (const p of Array.from(list)) {
      const ts = p.getElementsByTagName('hp:t')
      const tt = ts.length ? ts : p.getElementsByTagName('t')
      const line = Array.from(tt)
        .map((t) => t.textContent ?? '')
        .join('')
        .trim()
      if (line) chunks.push(line)
    }
  }

  if (!chunks.length) throw new ExtractError('HWPX 에서 글자를 뽑아내지 못했습니다.')

  return {
    kind: 'hwpx',
    pages: splitIntoPseudoPages(chunks.join('\n')),
    notice: '한글 문서에는 쪽 정보가 그대로 담기지 않아, 문단을 기준으로 덩어리를 나눴습니다.',
  }
}

const sectionNo = (n: string) => Number(n.match(/section(\d+)/i)?.[1] ?? 0)

/* ── TXT ─────────────────────────────────────────────── */

async function extractTxt(file: File): Promise<ExtractResult> {
  const text = await readTextAuto(file)
  return { kind: 'txt', pages: splitIntoPseudoPages(text) }
}

/** UTF-8 로 읽고, 깨지면 한국어 윈도우의 기본 인코딩으로 다시 읽는다 */
async function readTextAuto(file: File): Promise<string> {
  const buf = await file.arrayBuffer()
  const utf8 = new TextDecoder('utf-8', { fatal: false }).decode(buf)
  if (!utf8.includes('�')) return utf8
  try {
    return new TextDecoder('euc-kr').decode(buf)
  } catch {
    return utf8
  }
}

/* ── 공통 ────────────────────────────────────────────── */

/** 쪽 개념이 없는 형식을, 화면에서 고르기 좋은 크기로 나눈다 */
function splitIntoPseudoPages(text: string): ExtractedPage[] {
  const paras = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (!paras.length) return []

  const CHUNK = 1200 // 글자
  const pages: ExtractedPage[] = []
  let buf = ''

  for (const p of paras) {
    if (buf && buf.length + p.length > CHUNK) {
      pages.push({ index: pages.length + 1, text: buf })
      buf = ''
    }
    buf = buf ? `${buf}\n\n${p}` : p
  }
  if (buf) pages.push({ index: pages.length + 1, text: buf })

  return pages
}
