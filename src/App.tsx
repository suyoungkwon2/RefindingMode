import { useState, useCallback, useRef, useEffect } from 'react';
import type { AppMode, SearchResult, Session, UTTask } from './types';
import Sidebar from './components/Sidebar';
import SearchView from './components/SearchView';
import SessionView from './components/SessionView';
import SplitView from './components/SplitView';
import Minimap from './components/Minimap';
import { ChevronDown, Share, MoreHorizontal, Mic, BarChart2, Paperclip, Globe, BookOpen } from 'lucide-react';

const A1_QUERY = '생성형 AI 피드백을 받은 그룹의 글쓰기 수정에 대한 대화에서, effect size를 어떻게 해석하는지 설명한 부분을 찾아주세요';
const A2_QUERY = "예전에 알림 관련 연구 설계를 논의하다가 연구 조건, 변인, 측정 지표 등을 정리한 '표'가 나왔는데, 정확한 단어는 기억이 안 나고 대화 중간쯤이었던 것 같아요. 그 표를 찾아 주세요.";
const A2_FOLLOW_UP_QUERY = '참조범위를 수정했습니다. 다시 찾아주세요.';
const A3_QUERY = "'타당도'랑 '신뢰도' 개념을 공부하다가 UT 에 적용해서 타당도를 설명한게 있었는데 찾아주세요";
const A4_QUERY = '스마트워치로 수면 단계 연구를 하는것에 대한 가장 최종적인 Abstract 초안을 찾아줘';

export default function App() {
  const [mode, setMode] = useState<AppMode>('empty');
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [activeSession, setActiveSession] = useState<Session | null>(null);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [hasSearchResults, setHasSearchResults] = useState(false);
  const [utTask, setUtTask] = useState<UTTask | null>(null);
  const [prefillQuery, setPrefillQuery] = useState<string | undefined>(undefined);
  const [followUpQuery, setFollowUpQuery] = useState<string | undefined>(undefined);
  const [scrollToTurnId, setScrollToTurnId] = useState<string | null>(null);
  const [sessionHighlightAnchorId, setSessionHighlightAnchorId] = useState<string | undefined>(undefined);
  const [branchedFromTitle, setBranchedFromTitle] = useState<string | null>(null);
  const [branchSessions, setBranchSessions] = useState<Session[]>([]);
  const sessionScrollContainerRef = useRef<HTMLDivElement>(null);
  const [sessionScrollProgress, setSessionScrollProgress] = useState(0);

  useEffect(() => {
    const container = sessionScrollContainerRef.current;
    if (!container || mode !== 'session') return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const max = scrollHeight - clientHeight;
      setSessionScrollProgress(max > 0 ? scrollTop / max : 0);
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [mode]);

  useEffect(() => {
    if (!scrollToTurnId || mode !== 'session') return;
    const container = sessionScrollContainerRef.current;
    if (!container) return;
    const tryScroll = () => {
      const el = container.querySelector(`#${scrollToTurnId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setScrollToTurnId(null);
      }
    };
    const timer = setTimeout(tryScroll, 150);
    return () => clearTimeout(timer);
  }, [scrollToTurnId, mode]);

  const handleSelectTask = useCallback((task: UTTask) => {
    setUtTask(task);
    setActiveSession(null);
    setActiveSessionId(null);
    setSelectedResult(null);
    setHasSearchResults(false);
    setSessionHighlightAnchorId(undefined);
    if (task.id === 'A1') {
      setPrefillQuery(A1_QUERY);
      setFollowUpQuery(undefined);
    } else if (task.id === 'A2') {
      setPrefillQuery(A2_QUERY);
      setFollowUpQuery(A2_FOLLOW_UP_QUERY);
    } else if (task.id === 'A3') {
      setPrefillQuery(A3_QUERY);
      setFollowUpQuery(undefined);
    } else if (task.id === 'A4') {
      setPrefillQuery(A4_QUERY);
      setFollowUpQuery(undefined);
    } else {
      setPrefillQuery(undefined);
      setFollowUpQuery(undefined);
    }
    setMode('empty');
  }, []);

  const handleSelectSession = useCallback((session: Session) => {
    setActiveSession(session);
    setActiveSessionId(session.id);
    setSelectedResult(null);
    setBranchedFromTitle(null);
    setMode('session');
  }, []);

  const handleEnterSearch = useCallback(() => {
    setSelectedResult(null);
    setHasSearchResults(false);
    setBranchedFromTitle(null);
    setMode('search');
  }, []);

  const handleNewChat = useCallback(() => {
    setActiveSession(null);
    setActiveSessionId(null);
    setSelectedResult(null);
    setHasSearchResults(false);
    setBranchedFromTitle(null);
    setMode('empty');
  }, []);

  const handleBranchAtTurn = useCallback((turnId: string, session: Session) => {
    const anchorTurnIdx = session.turns.findIndex((t) => t.id === turnId);
    const turnsUpToAnchor = anchorTurnIdx >= 0 ? session.turns.slice(0, anchorTurnIdx + 1) : session.turns;
    const anchor = session.anchors.find((a) => a.turnId === turnId);

    const branchSession: Session = {
      id: `branch-${Date.now()}`,
      title: anchor ? `${anchor.label} — 이어쓰기` : `${session.title} — 이어쓰기`,
      type: session.type,
      date: session.date,
      lastMessage: anchor?.preview ?? '',
      turns: turnsUpToAnchor,
      anchors: anchor ? [anchor] : [],
    };

    setBranchSessions((prev) => [branchSession, ...prev]);
    setActiveSession(branchSession);
    setActiveSessionId(branchSession.id);
    setSelectedResult(null);
    setHasSearchResults(false);
    setSessionHighlightAnchorId(undefined);
    setBranchedFromTitle(session.title);
    setMode('session');
  }, []);

  const handleSelectResult = useCallback((result: SearchResult) => {
    setSelectedResult(result);
    setHasSearchResults(true);
    setMode('split');
  }, []);

  const handleCloseSplit = useCallback(() => {
    setSelectedResult(null);
    setMode('search');
  }, []);

  const handleContinueHere = useCallback(() => {
    if (selectedResult) {
      setActiveSession(selectedResult.session);
      setActiveSessionId(selectedResult.session.id);
      setSelectedResult(null);
      setMode('session');
    }
  }, [selectedResult]);

  const handleGoToSession = useCallback((result: SearchResult) => {
    setActiveSession(result.session);
    setActiveSessionId(result.session.id);
    setSelectedResult(null);
    setScrollToTurnId(result.anchor.turnId);
    setSessionHighlightAnchorId(result.anchor.id);
    setMode('session');
  }, []);

  const modeLabel =
    mode === 'empty'
      ? 'Found It'
      : mode === 'session' && activeSession
      ? activeSession.title
      : '탐색 모드';

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <Sidebar
        activeSessionId={activeSessionId}
        mode={mode}
        currentTask={utTask}
        onSelectSession={handleSelectSession}
        onEnterSearch={handleEnterSearch}
        onNewChat={handleNewChat}
        onSelectTask={handleSelectTask}
        extraSessions={branchSessions}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* header bar */}
        <header className="flex items-center justify-between px-5 py-2.5 border-b border-gray-100 flex-shrink-0 bg-white">
          <button className="flex items-center gap-1 text-sm font-medium text-gray-800 hover:text-gray-600 transition-colors">
            <span className="max-w-[320px] truncate">{modeLabel}</span>
            <ChevronDown size={14} />
          </button>

          <div className="flex items-center gap-2">
            {(mode === 'search' || mode === 'split') && hasSearchResults && (
              <>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200">
                  <Share size={13} />
                  <span>Share</span>
                </button>
                <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={16} />
                </button>
              </>
            )}
            {(mode === 'search' || mode === 'split') && !hasSearchResults && (
              <button className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            )}
            {/* target icon */}
            <div className="w-7 h-7 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="9" stroke="#ccc" strokeWidth="1.5" strokeDasharray="3 2" />
                <circle cx="10" cy="10" r="3" fill="#ccc" />
              </svg>
            </div>
          </div>
        </header>

        {/* content area */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <div
            className={`flex flex-col overflow-hidden transition-all duration-300 ${
              mode === 'split' ? 'w-[440px] flex-shrink-0 border-r border-gray-200' : 'flex-1'
            }`}
          >
            {mode === 'empty' && <EmptyState onEnterSearch={handleEnterSearch} />}

            {mode === 'session' && activeSession && (
              <div className="flex flex-1 min-h-0 overflow-hidden">
                <div className="flex flex-col flex-1 min-w-0 min-h-0">
                  <div ref={sessionScrollContainerRef} className="flex-1 overflow-y-auto scrollbar-thin">
                    <SessionView
                      session={activeSession}
                      highlightAnchorId={sessionHighlightAnchorId}
                      onBranchAtTurn={(turnId) => handleBranchAtTurn(turnId, activeSession)}
                    />
                  </div>
                  {branchedFromTitle && (
                    <div className="flex items-center gap-3 px-8 py-2 border-t border-gray-100 flex-shrink-0">
                      <span className="flex-1 h-px bg-gray-200" />
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        Branched from{' '}
                        <span className="text-gray-700 font-medium underline underline-offset-2 cursor-pointer hover:text-gray-900 transition-colors">
                          {branchedFromTitle}
                        </span>
                      </span>
                      <span className="flex-1 h-px bg-gray-200" />
                    </div>
                  )}
                  <SessionInputBar />
                </div>
                {/* minimap — 세션 모드에서만 표시 */}
                <div className="w-24 flex-shrink-0 border-l border-gray-100 flex flex-col bg-white">
                  <div className="px-1.5 py-2 border-b border-gray-100 flex-shrink-0 text-center">
                    <span className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest">Map</span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <Minimap
                      session={activeSession}
                      anchorId={sessionHighlightAnchorId ?? ''}
                      activeTurnId={
                        activeSession.turns[
                          Math.min(
                            Math.floor(sessionScrollProgress * activeSession.turns.length),
                            activeSession.turns.length - 1
                          )
                        ]?.id
                      }
                      onClickTurn={(turnId) => {
                        const el = sessionScrollContainerRef.current?.querySelector(`#${turnId}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {(mode === 'search' || mode === 'split') && (
              <SearchView
                activeSessionId={activeSessionId}
                onSelectResult={(result) => {
                  handleSelectResult(result);
                  setHasSearchResults(true);
                }}
                onGoToSession={handleGoToSession}
                selectedResult={selectedResult}
                compact={mode === 'split'}
                initialQuery={prefillQuery}
                followUpQuery={followUpQuery}
                utTaskId={utTask?.id}
              />
            )}
          </div>

          {mode === 'split' && selectedResult && (
            <div className="flex-1 min-w-0 overflow-hidden">
              <SplitView
                result={selectedResult}
                onClose={handleCloseSplit}
                onContinueHere={handleContinueHere}
                onBranchAtTurn={handleBranchAtTurn}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SessionInputBar() {
  const [draft, setDraft] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      setDraft('');
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }
  };

  return (
    <div className="flex-shrink-0 px-8 pb-6 pt-3 max-w-3xl mx-auto w-full">
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything"
          rows={1}
          className="w-full px-5 pt-4 pb-2 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none bg-transparent leading-relaxed"
          style={{ minHeight: '52px' }}
        />
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <ToolChip icon={<Paperclip size={13} />} label="Attach" />
            <ToolChip icon={<Globe size={13} />} label="Search" />
            <ToolChip icon={<BookOpen size={13} />} label="Study" />
          </div>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
            <BarChart2 size={13} />
            <span>Voice</span>
          </button>
        </div>
      </div>
      <p className="text-center text-xs text-gray-400 mt-2">
        AI가 실수를 할 수 있습니다. 중요한 내용은 확인하세요.
      </p>
    </div>
  );
}

function ToolChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
      {icon}
      <span>{label}</span>
    </button>
  );
}

function EmptyState({ onEnterSearch }: { onEnterSearch: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900">Ready when you are.</h1>
      </div>

      {/* bottom input */}
      <div className="px-8 pb-8">
        <div
          onClick={onEnterSearch}
          className="rounded-2xl border border-gray-200 bg-white shadow-sm px-5 py-3.5 flex items-center gap-3 cursor-pointer hover:border-gray-300 transition-colors"
        >
          <span className="flex-1 text-sm text-gray-400">Ask anything</span>
          <Mic size={16} className="text-gray-400" />
          <BarChart2 size={16} className="text-gray-400" />
        </div>
      </div>
    </div>
  );
}
