export type SessionType = 'target' | 'distractor' | 'dummy';
export type ContentType = 'text' | 'table' | 'code' | 'list';

export interface Turn {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  contentType?: ContentType;
}

export interface Anchor {
  id: string;
  turnId: string;
  label: string;
  tags: string[];
  preview: string;
}

export interface Session {
  id: string;
  title: string;
  type: SessionType;
  date: string;
  lastMessage: string;
  turns: Turn[];
  anchors: Anchor[];
  externalChatUrl?: string;
}

export type ScopeRange = 'all' | 'current' | 'related';
export type ScopeTime = 'all-time' | 'recent7' | 'recent30';
export type ScopeForm = 'all-form' | 'table' | 'research' | 'concept';

export interface SearchResult {
  session: Session;
  anchor: Anchor;
  matchReasonTags: string[];
  rank: number;
}

export type AppMode = 'empty' | 'search' | 'session' | 'split';

export type UTTaskSet = 'A' | 'B';
export type UTTaskId = 'A1' | 'A2' | 'A3' | 'A4' | 'B1' | 'B2' | 'B3' | 'B4';

export interface UTTask {
  id: UTTaskId;
  set: UTTaskSet;
  num: number;
}

export interface SearchChatMessage {
  id: string;
  type: 'user' | 'results' | 'scope-change';
  text?: string;
  results?: SearchResult[];
  aiIntro?: string;
  queryTags?: string[];
}

export interface AppState {
  mode: AppMode;
  activeSessionId: string | null;
  searchQuery: string;
  searchResults: SearchResult[];
  selectedResult: SearchResult | null;
  hoveredResultId: string | null;
  scopeRange: ScopeRange;
  scopeTime: ScopeTime;
  scopeForm: ScopeForm;
}
