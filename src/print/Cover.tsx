import { STUDY_SETS, setByKey, type SetKey } from '../lib/sets'
import { Paper } from './Paper'

interface Props {
  setKey: SetKey
  title: string
  schoolName: string
  classInfo: string
  style: 'A' | 'B'
  onEdit?: (field: 'schoolName' | 'classInfo', value: string) => void
}

/** 표지 한 장. 학교명과 반 정보는 화면에서 바로 고칠 수 있다. */
export default function Cover({ setKey, title, schoolName, classInfo, style, onEdit }: Props) {
  const s = setByKey(setKey)

  return (
    <Paper>
      {/* 워터마크 */}
      {style === 'A' ? (
        <span
          aria-hidden
          className="pointer-events-none absolute -right-[10mm] top-[52mm] select-none text-[220pt] font-black leading-none text-slate-100"
        >
          {s.name.slice(0, 1)}
        </span>
      ) : (
        <span
          aria-hidden
          className="pointer-events-none absolute right-[8mm] top-[70mm] select-none text-[150pt] font-black leading-none text-slate-100"
        >
          ⟩⟩
        </span>
      )}

      <div className="relative flex h-full flex-col">
        {/* 머리 */}
        <div className="flex items-start justify-between">
          <Editable
            value={schoolName}
            placeholder="학교 / 기관명"
            className="text-[14pt] font-bold text-slate-800"
            onChange={(v) => onEdit?.('schoolName', v)}
          />
          <span className="text-[7pt] font-semibold tracking-[0.25em] text-slate-400">
            MADE WITH 수북
          </span>
        </div>
        <div className="mt-[1mm] flex items-baseline justify-between">
          <span className="text-[6.5pt] tracking-[0.3em] text-slate-400">
            ENGLISH READING WORKBOOK
          </span>
          <span className="text-[7pt] text-slate-500">영어 지문으로 만든 수업 자료</span>
        </div>

        {/* 큰 제목 */}
        <div className="mt-[42mm]">
          <h1 className="text-[58pt] font-black leading-[0.95] tracking-tight text-slate-900">
            {s.name}
          </h1>
          <p
            className="mt-[2mm] text-[26pt] font-black leading-none tracking-[0.1em]"
            style={{ color: s.color }}
          >
            {s.en}
          </p>
          <p className="mt-[4mm] text-[9pt] text-slate-500">{s.desc}</p>
        </div>

        {/* 자료 종류 띠 */}
        <div className="mt-[14mm] grid grid-cols-6 gap-[1mm]">
          {STUDY_SETS.map((x) => {
            const on = x.key === setKey
            return (
              <div
                key={x.key}
                className={`rounded-[2pt] border px-[1mm] py-[2mm] text-center ${
                  on ? 'border-transparent text-white' : 'border-slate-200 text-slate-400'
                }`}
                style={on ? { background: x.color } : undefined}
              >
                <div className="text-[8pt] font-bold leading-tight">{x.name}</div>
                <div className={`mt-[0.5mm] text-[5.5pt] tracking-[0.1em] ${on ? 'text-white/70' : 'text-slate-300'}`}>
                  {x.en}
                </div>
              </div>
            )
          })}
        </div>

        {/* 바닥 정보 */}
        <div className="mt-auto grid grid-cols-2 gap-[6mm] border-t border-slate-200 pt-[4mm]">
          <div>
            <div className="text-[6.5pt] tracking-[0.2em] text-slate-400">STUDY BASED ON</div>
            <div className="mt-[1mm] text-[12pt] font-bold text-slate-800">{title}</div>
          </div>
          <div>
            <div className="text-[6.5pt] tracking-[0.2em] text-slate-400">CLASS / SESSION</div>
            <Editable
              value={classInfo}
              placeholder="반 / 시험 정보"
              className="mt-[1mm] text-[12pt] font-bold text-slate-800"
              onChange={(v) => onEdit?.('classInfo', v)}
            />
          </div>
        </div>
      </div>
    </Paper>
  )
}

function Editable({
  value,
  placeholder,
  className,
  onChange,
}: {
  value: string
  placeholder: string
  className: string
  onChange: (v: string) => void
}) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${className} w-full max-w-[70mm] border-none bg-transparent p-0 outline-none placeholder:font-normal placeholder:text-slate-300 focus:bg-brand-50/60 print:placeholder:text-transparent`}
    />
  )
}
