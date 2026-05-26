import { useLayoutEffect, useRef } from 'react';
import { X, Download } from 'lucide-react';
import type { SearchResult, Session } from '../types';
import SessionView from './SessionView';

interface Props {
  result: SearchResult;
  onClose: () => void;
  onContinueHere: () => void;
  onBranchAtTurn?: (turnId: string, session: Session) => void;
}

export default function SplitView({ result, onClose, onContinueHere, onBranchAtTurn }: Props) {
  const { session, anchor } = result;
  const anchorTurnId = session.anchors.find((a) => a.id === anchor.id)?.turnId;
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (anchorTurnId && scrollRef.current) {
      const turns = session.turns;
      const anchorIdx = turns.findIndex((t) => t.id === anchorTurnId);
      let scrollTargetId = anchorTurnId;
      if (anchorIdx !== -1 && turns[anchorIdx].role === 'assistant') {
        const precedingUser = turns.slice(0, anchorIdx).reverse().find((t) => t.role === 'user');
        if (precedingUser) scrollTargetId = precedingUser.id;
      }
      const el = scrollRef.current.querySelector(`#${scrollTargetId}`);
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, [anchorTurnId, session.turns]);

  const breadcrumb = anchor.label
    ? `${session.title} > ${anchor.label}`
    : session.title;

  return (
    <div className="flex flex-col h-full bg-white border-l border-gray-200">
      {/* tab header */}
      <div className="flex items-center justify-between pl-4 pr-3 py-2.5 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="min-w-0 flex-1">
          <div className="text-sm text-gray-800 font-medium truncate">{breadcrumb}</div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <button
            onClick={onContinueHere}
            title="이어쓰기"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Download size={15} />
          </button>
          <button
            onClick={onClose}
            title="닫기"
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <SessionView
          session={session}
          highlightAnchorId={anchor.id}
          onBranchAtTurn={onBranchAtTurn ? (turnId) => onBranchAtTurn(turnId, session) : undefined}
        />
      </div>
    </div>
  );
}
