import { useState } from 'react';
import { SquarePen, Search, ScanSearch, PanelLeft } from 'lucide-react';
import type { Session, AppMode, UTTask } from '../types';
import { sessions } from '../data/sessions';
import UTTaskSelector from './UTTaskSelector';

interface Props {
  activeSessionId: string | null;
  mode: AppMode;
  currentTask: UTTask | null;
  onSelectSession: (session: Session) => void;
  onEnterSearch: () => void;
  onNewChat: () => void;
  onSelectTask: (task: UTTask) => void;
  extraSessions?: Session[];
}

export default function Sidebar({ activeSessionId, mode, currentTask, onSelectSession, onEnterSearch, onNewChat, onSelectTask, extraSessions = [] }: Props) {
  const isSearchMode = mode === 'search' || mode === 'split';
  const sortedSessions = [
    ...extraSessions,
    ...[...sessions].sort((a, b) => b.date.localeCompare(a.date)),
  ];
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  function handleSelectTask(task: UTTask) {
    onSelectTask(task);
    setShowTaskSelector(false);
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col h-full flex-shrink-0">
      {/* top bar */}
      <div className="flex items-center justify-between px-3 py-3 relative">
        <button
          onClick={() => setShowTaskSelector((v) => !v)}
          className="relative w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
          title="UT 태스크 선택"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#111" strokeWidth="1.5" strokeDasharray="3 2" />
            <circle cx="10" cy="10" r="3" fill="#111" />
          </svg>
          {currentTask && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gray-900 text-white text-[9px] font-bold flex items-center justify-center leading-none">
              {currentTask.id}
            </span>
          )}
        </button>

        {showTaskSelector && (
          <UTTaskSelector
            currentTask={currentTask}
            onSelect={handleSelectTask}
            onClose={() => setShowTaskSelector(false)}
          />
        )}

        <button className="p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors">
          <PanelLeft size={16} />
        </button>
      </div>

      {/* nav */}
      <div className="px-2 space-y-0.5">
        <NavButton icon={<SquarePen size={15} />} label="새 채팅" onClick={onNewChat} />
        <NavButton icon={<Search size={15} />} label="채팅 검색" onClick={() => {}} />
        <NavButton
          icon={<ScanSearch size={15} />}
          label="탐색 모드"
          onClick={onEnterSearch}
          active={isSearchMode}
        />
      </div>

      {/* chats section */}
      <div className="px-4 pt-4 pb-1">
        <span className="text-xs text-gray-400 font-medium">Chats</span>
      </div>

      {/* session list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-3">
        {sortedSessions.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectSession(s)}
            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors truncate block ${
              activeSessionId === s.id && mode === 'session'
                ? 'bg-gray-100 text-gray-900 font-medium'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            title={s.title}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* user profile */}
      <div className="border-t border-gray-100 px-3 py-3 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
          A
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-gray-900 leading-none">Username</div>
          <div className="text-xs text-gray-400 mt-0.5">Plus</div>
        </div>
      </div>
    </aside>
  );
}

function NavButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-gray-100 text-gray-900 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
