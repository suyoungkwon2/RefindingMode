import { useEffect, useRef } from 'react';
import type { UTTask, UTTaskId } from '../types';

interface Props {
  currentTask: UTTask | null;
  onSelect: (task: UTTask) => void;
  onClose: () => void;
}

const TASK_IDS: UTTaskId[] = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];

function makeTask(id: UTTaskId): UTTask {
  return { id, set: id[0] as 'A' | 'B', num: Number(id[1]) };
}

export default function UTTaskSelector({ currentTask, onSelect, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(e: PointerEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  const setA = TASK_IDS.filter((id) => id.startsWith('A'));
  const setB = TASK_IDS.filter((id) => id.startsWith('B'));

  return (
    <div
      ref={ref}
      className="absolute left-3 top-11 z-50 w-52 rounded-xl border border-gray-200 bg-white shadow-lg py-3"
    >
      <p className="px-3 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
        UT 태스크 선택
      </p>

      <TaskGroup
        label="태스크 세트 A"
        ids={setA}
        currentId={currentTask?.id ?? null}
        onSelect={(id) => onSelect(makeTask(id))}
      />

      <div className="my-2 border-t border-gray-100" />

      <TaskGroup
        label="태스크 세트 B"
        ids={setB}
        currentId={currentTask?.id ?? null}
        onSelect={(id) => onSelect(makeTask(id))}
      />
    </div>
  );
}

function TaskGroup({
  label,
  ids,
  currentId,
  onSelect,
}: {
  label: string;
  ids: UTTaskId[];
  currentId: UTTaskId | null;
  onSelect: (id: UTTaskId) => void;
}) {
  return (
    <div className="px-3">
      <p className="text-xs text-gray-400 mb-1.5">{label}</p>
      <div className="grid grid-cols-4 gap-1.5">
        {ids.map((id) => {
          const active = id === currentId;
          return (
            <button
              key={id}
              onClick={() => onSelect(id)}
              className={`rounded-lg py-1.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {id}
            </button>
          );
        })}
      </div>
    </div>
  );
}
