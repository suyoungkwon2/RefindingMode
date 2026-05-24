import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, ChevronDown, Mic, BarChart2, RotateCcw, Share2, Undo2, MoreHorizontal, X } from 'lucide-react';
import type { SearchResult, SearchChatMessage, ScopeRange, ScopeTime, ScopeForm } from '../types';
import { search } from '../data/search';
import ResultCard from './ResultCard';
import ScopeModal, { type ScopeSelection } from './ScopeModal';

interface Props {
  activeSessionId: string | null;
  onSelectResult: (result: SearchResult) => void;
  onGoToSession?: (result: SearchResult) => void;
  selectedResult: SearchResult | null;
  compact?: boolean;
}

function extractTags(query: string): string[] {
  const words = query.replace(/[.,?!]/g, '').split(/\s+/);
  const stopWords = new Set(['에', '을', '를', '이', '가', '은', '는', '에서', '으로', '로', '와', '과', '의', '대해', '대한', '관련', '찾아줘', '알려줘', '설명해', '줘', '해줘', '주세요', '부분', '내용', '것', '에서의', '하는', '하는데', '했는데', 'HCI', '연구중에', '연구중']);
  return words.filter((w) => w.length >= 2 && !stopWords.has(w)).slice(0, 4);
}

function makeAiIntro(results: SearchResult[]): string {
  if (results.length === 0) return '관련된 대화를 찾지 못했습니다.';
  const tags = results.flatMap((r) => r.anchor.tags.slice(0, 1)).join(', ');
  return `${tags.replace(/#/g, '')} 관련 답변입니다. 가장 관련성 높은 ${results.length}개 지점을 불러왔습니다.`;
}

export default function SearchView({ activeSessionId, onSelectResult, onGoToSession, selectedResult, compact }: Props) {
  const [messages, setMessages] = useState<SearchChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [scopeOpen, setScopeOpen] = useState(false);
  const [scopeSelection, setScopeSelection] = useState<ScopeSelection>({ time: [], range: [], form: [] });
  const [sortLabel] = useState('추천순');
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scopeRange: ScopeRange = 'all';
  const scopeTime: ScopeTime = 'all-time';
  const scopeForm: ScopeForm = 'all-form';

  const hasMessages = messages.length > 0;

  const scopeLabel = (() => {
    const parts = [...scopeSelection.time, ...scopeSelection.range, ...scopeSelection.form];
    return parts.length > 0 ? parts.join(', ') : undefined;
  })();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = useCallback(() => {
    const q = draft.trim();
    if (!q) return;

    const userMsg: SearchChatMessage = {
      id: `msg-${Date.now()}-user`,
      type: 'user',
      text: q,
    };

    const results = search(q, scopeRange, scopeTime, scopeForm, activeSessionId);
    const tags = extractTags(q);

    const resultsMsg: SearchChatMessage = {
      id: `msg-${Date.now()}-results`,
      type: 'results',
      results,
      aiIntro: makeAiIntro(results),
      queryTags: tags,
    };

    setMessages((prev) => [...prev, userMsg, resultsMsg]);
    setActiveTags(tags);
    setDraft('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }, [draft, activeSessionId, scopeRange, scopeTime, scopeForm]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDraft(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  const removeTag = (tag: string) => setActiveTags((prev) => prev.filter((t) => t !== tag));

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* conversation area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-6">
        {!hasMessages && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">어떤 대화를 찾아드릴까요?</h2>
            {!compact && (
              <p className="text-sm text-gray-400 leading-relaxed max-w-sm">
                기억나는 대화 조각이나 상황을 입력해 주세요.<br />
                질문·답변 구분이나 세션 범위를 지정하면 더 정확합니다.<br />
                자세히 설명할수록 원하는 맥락을 빠르게 찾을 수 있습니다.
              </p>
            )}
          </div>
        )}

        {hasMessages && (
          <div className="py-6 space-y-6">
            {messages.map((msg) => {
              if (msg.type === 'user') {
                return (
                  <div key={msg.id} className="flex justify-end">
                    <div className="max-w-[75%] bg-gray-100 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-gray-900 leading-relaxed">
                      {msg.text}
                    </div>
                  </div>
                );
              }

              if (msg.type === 'results') {
                return (
                  <div key={msg.id} className="space-y-3">
                    {msg.aiIntro && (
                      <p className="text-sm text-gray-700 font-medium">{msg.aiIntro}</p>
                    )}

                    {msg.results && msg.results.length > 0 ? (
                      <div className="space-y-2">
                        {msg.results.map((r) => (
                          <ResultCard
                            key={`${r.session.id}-${r.anchor.id}`}
                            result={r}
                            onSelect={onSelectResult}
                            onGoToSession={onGoToSession}
                            isSelected={
                              selectedResult?.session.id === r.session.id &&
                              selectedResult?.anchor.id === r.anchor.id
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">관련된 대화를 찾지 못했습니다. 다른 키워드로 시도해 보세요.</p>
                    )}

                    {/* action row */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-xs text-gray-400 mr-2">찾던 대화가 맞으신가요?</span>
                      <ActionIcon icon={<FileText size={14} />} title="저장" />
                      <ActionIcon icon={<Share2 size={14} />} title="공유" />
                      <ActionIcon icon={<RotateCcw size={14} />} title="다시 검색" />
                      <ActionIcon icon={<Undo2 size={14} />} title="이전으로" />
                      <ActionIcon icon={<MoreHorizontal size={14} />} title="더 보기" />
                    </div>
                  </div>
                );
              }

              return null;
            })}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* input area */}
      <div className="flex-shrink-0 px-6 pb-6 pt-2">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
          {/* active tags row */}
          {activeTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3 pb-1">
              {activeTags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-0.5 bg-gray-100 rounded-full text-xs text-gray-700"
                >
                  {tag}
                  <button onClick={() => removeTag(tag)} className="text-gray-400 hover:text-gray-600">
                    <X size={10} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* textarea */}
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            rows={1}
            className="w-full px-4 py-3 text-sm text-gray-900 placeholder-gray-400 resize-none focus:outline-none bg-transparent leading-relaxed"
            style={{ minHeight: '44px' }}
          />

          {/* bottom toolbar */}
          <div className="flex items-center justify-between px-3 pb-3 pt-0">
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setScopeOpen((v) => !v)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <FileText size={12} />
                  <span>
                    {scopeLabel ? `참조 범위: ${scopeLabel}` : '참조 범위'}
                  </span>
                </button>
                {scopeOpen && (
                  <ScopeModal
                    selection={scopeSelection}
                    onChange={setScopeSelection}
                    onClose={() => setScopeOpen(false)}
                  />
                )}
              </div>

              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
                <span>정렬: {sortLabel}</span>
                <ChevronDown size={11} />
              </button>
            </div>

            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-xs text-gray-600 hover:bg-gray-50 transition-colors">
              <BarChart2 size={12} />
              <span>Voice</span>
              <Mic size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionIcon({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
    >
      {icon}
    </button>
  );
}
