import { useEffect, useRef, useState } from 'react';
import { X, Download, Map } from 'lucide-react';
import type { SearchResult } from '../types';
import SessionView from './SessionView';
import Minimap from './Minimap';

interface Props {
  result: SearchResult;
  onClose: () => void;
  onContinueHere: () => void;
}

export default function SplitView({ result, onClose, onContinueHere }: Props) {
  const { session, anchor } = result;
  const anchorTurnId = session.anchors.find((a) => a.id === anchor.id)?.turnId;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showMinimap, setShowMinimap] = useState(false);

  useEffect(() => {
    if (anchorTurnId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`#${anchorTurnId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [anchorTurnId]);

  const handleMinimapClick = (turnId: string) => {
    if (scrollRef.current) {
      const el = scrollRef.current.querySelector(`#${turnId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

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
            onClick={() => setShowMinimap((v) => !v)}
            title="미니맵 토글"
            className={`p-1.5 rounded-lg transition-colors ${
              showMinimap ? 'bg-gray-100 text-gray-700' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Map size={15} />
          </button>
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

      {/* content + optional minimap */}
      <div className="flex flex-1 min-h-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin">
          <SessionView session={session} highlightAnchorId={anchor.id} />

          {/* branched from footer */}
          <div className="px-6 pb-6 pt-2">
            <div className="text-xs text-gray-400 mb-4">
              Branched from <span className="text-gray-600">{session.title}</span>
            </div>

            {/* continue input */}
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm px-4 py-3 flex items-center gap-3">
              <span className="text-sm text-gray-400">+ Ask anything</span>
              <div className="ml-auto flex items-center gap-2 text-gray-400">
                <button className="hover:text-gray-600 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="22"/>
                  </svg>
                </button>
                <button className="hover:text-gray-600 transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="8" y1="6" x2="8" y2="18"/>
                    <line x1="12" y1="3" x2="12" y2="21"/>
                    <line x1="16" y1="8" x2="16" y2="16"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        {showMinimap && (
          <div className="w-44 flex-shrink-0 border-l border-gray-200 flex flex-col bg-white">
            <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100">
              <span className="text-xs font-medium text-gray-600">Mini Map</span>
              <button
                onClick={() => setShowMinimap(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <Minimap session={session} anchorId={anchor.id} onClickTurn={handleMinimapClick} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
