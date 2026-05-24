import { useState, useRef, useEffect } from 'react';
import type { SearchResult } from '../types';

interface Props {
  result: SearchResult;
  onSelect: (result: SearchResult) => void;
  onGoToSession?: (result: SearchResult) => void;
  isSelected: boolean;
}

export default function ResultCard({ result, onSelect, onGoToSession, isSelected }: Props) {
  const { session, anchor, matchReasonTags } = result;
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const formattedDate = session.date.replace(/-/g, '.').slice(0, 10);
  const breadcrumb = `${session.title} > ${anchor.label}`;

  useEffect(() => {
    if (!contextMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [contextMenu]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(anchor.preview).catch(() => {});
    setContextMenu(null);
  };

  const handleGoTo = () => {
    onGoToSession?.(result);
    setContextMenu(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => onSelect(result)}
        onContextMenu={handleContextMenu}
        className={`w-full text-left rounded-xl border transition-all ${
          isSelected
            ? 'border-blue-300 bg-blue-50/60'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/60'
        }`}
      >
        {/* header row */}
        <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-gray-100">
          <span className="text-xs text-gray-500 truncate mr-4 flex-1">{breadcrumb}</span>
          <span className="text-xs text-gray-400 flex-shrink-0">{formattedDate}</span>
        </div>

        {/* content */}
        <div className="px-4 py-2.5">
          <p className="text-sm text-gray-800 leading-relaxed line-clamp-3">{anchor.preview}</p>
        </div>

        {/* tags */}
        <div className="flex flex-wrap gap-1.5 px-4 pb-3">
          {matchReasonTags.map((tag) => (
            <span key={tag} className="text-xs text-gray-500">
              {tag}
            </span>
          ))}
        </div>
      </button>

      {/* context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-xl border border-gray-200 shadow-xl py-1 min-w-[140px]"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <button
            onClick={handleCopy}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            복사
          </button>
          <button
            onClick={handleGoTo}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            이 대화로 이동
          </button>
        </div>
      )}
    </div>
  );
}
