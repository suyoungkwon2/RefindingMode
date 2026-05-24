import { useRef, useEffect } from 'react';

export interface ScopeSelection {
  time: string[];
  range: string[];
  form: string[];
}

interface Props {
  selection: ScopeSelection;
  onChange: (next: ScopeSelection) => void;
  onClose: () => void;
}

const TIME_OPTIONS = ['전체', '오늘', '이번 주', '일주일 전', '전 달'];
const RANGE_OPTIONS = ['프로젝트', '활성화 채팅', '전 달', '전체'];
const FORM_OPTIONS_1 = ['이미지', '코드', '텍스트', '수식'];
const FORM_OPTIONS_2 = ['연구설계', '연구'];

export default function ScopeModal({ selection, onChange, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const toggle = (category: keyof ScopeSelection, value: string) => {
    const current = selection[category];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    onChange({ ...selection, [category]: next });
  };

  return (
    <div className="absolute bottom-full left-0 mb-2 z-50" ref={ref}>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4 w-[480px]">
        <div className="text-xs font-semibold text-gray-500 mb-3">참조 범위 설정</div>

        <div className="space-y-3">
          <ScopeRow
            label="시간"
            options={TIME_OPTIONS}
            selected={selection.time}
            onToggle={(v) => toggle('time', v)}
          />
          <ScopeRow
            label="답변범위"
            options={RANGE_OPTIONS}
            selected={selection.range}
            onToggle={(v) => toggle('range', v)}
          />
          <div>
            <ScopeRow
              label="답변형태"
              options={FORM_OPTIONS_1}
              selected={selection.form}
              onToggle={(v) => toggle('form', v)}
            />
            <div className="flex gap-1.5 mt-1.5 ml-[68px]">
              {FORM_OPTIONS_2.map((opt) => (
                <Chip
                  key={opt}
                  label={opt}
                  active={selection.form.includes(opt)}
                  onClick={() => toggle('form', opt)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ScopeRow({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-[60px] flex-shrink-0 text-right">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <Chip key={opt} label={opt} active={selected.includes(opt)} onClick={() => onToggle(opt)} />
        ))}
      </div>
    </div>
  );
}

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active
          ? 'bg-blue-600 text-white border-blue-600'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}
