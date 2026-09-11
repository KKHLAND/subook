import { spawnSync } from 'node:child_process'
import {
  closeSync,
  existsSync,
  lstatSync,
  openSync,
  readFileSync,
  readdirSync,
  rmdirSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { join } from 'node:path'

/**
 * 빌드 실행기.
 *
 * 이 프로젝트를 Windows 에서 빌드할 때 부딪힌 문제 두 가지를 여기서 막는다.
 *
 *  1) `fs.rmSync(dir, { recursive: true })` 가 Node 24 + Windows 11 조합에서 프로세스를
 *     통째로 죽인다(0xC0000409). 예외가 아니라 크래시라 try/catch 로도 못 잡는다.
 *     → 아래 removeDir() 로 파일을 하나씩 지운다.
 *
 *  2) 빌드 도구의 출력이 터미널 파이프로 흘러가면 결과물을 다 쓰고 종료하는 순간 같은 코드로
 *     죽는다. 결과물은 멀쩡한데 빌드가 실패한 것처럼 보인다.
 *     → 자식 출력을 파일(build.log)로 직접 내보내고, 종료 코드 대신 결과물로 판정한다.
 *
 * 타입 검사는 `npm run check` 로 분리했다.
 */

const TEARDOWN_CRASH = -1073740791
const OUT = 'dist/index.html'
const LOG = 'build.log'
const MIN_BYTES = 50_000

for (const dir of ['dist', 'node_modules/.vite', 'node_modules/.vite-temp', 'node_modules/.tmp']) {
  removeDir(dir)
}
writeFileSync(LOG, `[${new Date().toISOString()}] subook build\n`)

const fd = openSync(LOG, 'a')
// shell 없이 vite 의 JS 진입점을 직접 실행한다 (셸 인용 문제·경고 회피)
const r = spawnSync(process.execPath, ['node_modules/vite/bin/vite.js', 'build'], {
  stdio: ['ignore', fd, fd],
})
closeSync(fd)

if (r.status !== 0 && r.status !== TEARDOWN_CRASH) fail(`vite build 실패 (code ${r.status})`)

let size = 0
try {
  size = statSync(OUT).size
} catch {
  fail(`${OUT} 이 생성되지 않았습니다.`)
}
if (size < MIN_BYTES) fail(`${OUT} 이 너무 작습니다 (${size} bytes). 빌드가 중간에 끊긴 것 같습니다.`)

console.log(`OK  ${OUT}  ${(size / 1024).toFixed(0)} KB  단일 파일`)

/** rmSync(recursive) 대신 쓰는 폴더 삭제 */
function removeDir(dir) {
  if (!existsSync(dir)) return
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (lstatSync(p).isDirectory()) removeDir(p)
    else unlinkSync(p)
  }
  rmdirSync(dir)
}

function fail(msg) {
  console.error(`FAIL  ${msg}`)
  if (existsSync(LOG)) console.error(readFileSync(LOG, 'utf8').slice(-2000))
  process.exit(1)
}
