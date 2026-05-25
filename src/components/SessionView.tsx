import { useState } from 'react';
import { Copy, Check, Bookmark, Share2, RotateCcw, GitBranch, MoreHorizontal } from 'lucide-react';
import type { Session } from '../types';

interface Props {
  session: Session;
  highlightAnchorId?: string;
  compact?: boolean;
  onBranchAtTurn?: (turnId: string) => void;
}

export default function SessionView({ session, highlightAnchorId, compact, onBranchAtTurn }: Props) {
  const anchorTurnId = highlightAnchorId
    ? session.anchors.find((a) => a.id === highlightAnchorId)?.turnId
    : undefined;

  return (
    <div className={`flex flex-col ${compact ? 'p-3 gap-2' : 'px-8 py-6 gap-0 max-w-3xl mx-auto w-full'}`}>
      {session.turns.map((turn) => {
        const isHighlighted = turn.id === anchorTurnId;
        if (turn.role === 'user') {
          return <UserTurn key={turn.id} id={turn.id} content={turn.content} highlighted={isHighlighted} />;
        }
        return (
          <AiTurn
            key={turn.id}
            id={turn.id}
            content={turn.content}
            highlighted={isHighlighted}
            onBranch={onBranchAtTurn ? () => onBranchAtTurn(turn.id) : undefined}
          />
        );
      })}
    </div>
  );
}

function UserTurn({ id, content, highlighted }: { id: string; content: string; highlighted: boolean }) {
  return (
    <div id={id} className={`flex justify-end mb-2 mt-6 ${highlighted ? 'ring-2 ring-blue-300 ring-offset-2 rounded-2xl' : ''}`}>
      <div className="max-w-[72%] bg-[#f0f4f9] rounded-3xl px-5 py-3 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function AiTurn({ id, content, highlighted, onBranch }: { id: string; content: string; highlighted: boolean; onBranch?: () => void }) {
  return (
    <div id={id} className={`flex gap-3 mb-1 mt-2 ${highlighted ? 'bg-blue-50 rounded-2xl px-3 py-2 border-l-4 border-blue-400' : ''}`}>
      <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
        <SparkleIcon />
      </div>
      <div className="flex-1 min-w-0 pb-2">
        <MarkdownContent content={content} />
        <div className={`flex items-center gap-0.5 mt-3 pt-2.5 border-t ${highlighted ? 'border-blue-100' : 'border-gray-100'}`}>
          <TurnAction icon={<Bookmark size={13} />} title="저장" />
          <TurnAction icon={<Copy size={13} />} title="복사" />
          <TurnAction icon={<Share2 size={13} />} title="공유" />
          <TurnAction icon={<RotateCcw size={13} />} title="재생성" />
          <TurnAction
            icon={<GitBranch size={13} />}
            title="새 브랜치에서 계속"
            onClick={onBranch}
          />
          <TurnAction icon={<MoreHorizontal size={13} />} title="더 보기" />
        </div>
      </div>
    </div>
  );
}

function TurnAction({ icon, title, onClick }: { icon: React.ReactNode; title: string; onClick?: () => void }) {
  return (
    <div className="relative group/ta">
      <button
        onClick={onClick}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        {icon}
      </button>
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-800 text-white text-[10px] rounded whitespace-nowrap z-50 pointer-events-none opacity-0 group-hover/ta:opacity-100 transition-none">
        {title}
      </div>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
    </svg>
  );
}

// ─── Search query code block ───────────────────────────────────────────────

function SearchQueryBlock({ lines }: { lines: string[] }) {
  const [copied, setCopied] = useState(false);
  const text = lines.join('\n');

  const handleCopy = () => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-start gap-2 bg-[#f7f7f8] border border-gray-200 rounded-xl px-4 py-2.5 my-1">
      <pre className="text-xs text-gray-800 font-mono flex-1 whitespace-pre-wrap leading-relaxed">{text}</pre>
      <button
        onClick={handleCopy}
        className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 transition-colors"
        title="복사"
      >
        {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
      </button>
    </div>
  );
}

// ─── Inline pipe table ─────────────────────────────────────────────────────

function InlinePipeTable({ lines }: { lines: string[] }) {
  const isSep = (l: string) => /^\|[\s\-|:]+\|$/.test(l.trim());
  const parseRow = (l: string) => l.split('|').map((c) => c.trim()).filter(Boolean);
  const dataLines = lines.filter((l) => !isSep(l));
  if (dataLines.length < 2) return null;
  const headers = parseRow(dataLines[0]);
  const bodyRows = dataLines.slice(1);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 my-3">
      <table className="text-xs w-full border-collapse">
        <thead>
          <tr className="bg-gray-50">
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200 whitespace-nowrap">
                {renderInline(h.replace(/\*\*/g, ''))}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyRows.map((row, ri) => (
            <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
              {parseRow(row).map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-gray-700 border-b border-gray-100 leading-relaxed">
                  {renderInline(cell.replace(/\*\*/g, ''))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function isSearchQuery(t: string) {
  return (
    (t.startsWith('"') && (t.includes(' AND ') || t.includes(' OR '))) ||
    (t.startsWith('(') && (t.includes(' OR ') || t.includes(' AND ')))
  );
}

function isQueryContinuation(t: string) {
  return t.startsWith('AND (') || t.startsWith('AND "');
}

// ─── Main markdown renderer ────────────────────────────────────────────────

function MarkdownContent({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];

  const prevBlankOrStart = (idx: number) => idx === 0 || lines[idx - 1].trim() === '';
  const nextBlankOrEnd   = (idx: number) => idx >= lines.length - 1 || lines[idx + 1].trim() === '';

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // ── Skip blank lines ──────────────────────────────────────────────────
    if (trimmed === '') { i++; continue; }

    // ── Pipe table ────────────────────────────────────────────────────────
    if (trimmed.startsWith('|')) {
      const tblLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) { tblLines.push(lines[i]); i++; }
      if (tblLines.length >= 2) elements.push(<InlinePipeTable key={`tbl-${i}`} lines={tblLines} />);
      continue;
    }

    // ── Explicit ## heading ───────────────────────────────────────────────
    if (trimmed.startsWith('## ')) {
      const text = trimmed.replace(/^## /, '');
      elements.push(
        <h2 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">{renderInline(text)}</h2>
      );
      i++; continue;
    }

    // ── Explicit ### heading ──────────────────────────────────────────────
    if (trimmed.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1.5">
          {renderInline(trimmed.replace(/^### /, ''))}
        </h3>
      );
      i++; continue;
    }

    // ── **bold text** on its own line ─────────────────────────────────────
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      elements.push(
        <p key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1">
          {trimmed.replace(/\*\*/g, '')}
        </p>
      );
      i++; continue;
    }

    // ── Horizontal rule ───────────────────────────────────────────────────
    if (/^-{3,}$/.test(trimmed)) {
      elements.push(<hr key={i} className="border-t border-gray-200 my-3" />);
      i++; continue;
    }

    // ── Numbered section heading (lone \d+. with short text) ──────────────
    {
      const m = trimmed.match(/^(\d+)\.\s(.+)$/);
      if (m) {
        const [, num, text] = m;
        const nextTrimmed = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
        const nextIsNum = /^\d+\.\s/.test(nextTrimmed);
        if (!nextIsNum && text.length <= 40) {
          elements.push(
            <h2 key={i} className="text-base font-bold text-gray-900 mt-6 mb-2">
              <span className="text-gray-500 font-bold">{num}.</span>{' '}{text}
            </h2>
          );
          i++; continue;
        }
        // else: fall through to numbered list handler below
      }
    }

    // ── Standalone short heading (surrounded by blanks, no end punctuation) ─
    if (
      trimmed.length >= 2 &&
      trimmed.length <= 40 &&
      prevBlankOrStart(i) &&
      nextBlankOrEnd(i) &&
      !/^[•\-\*]\s/.test(trimmed) &&
      !/^\d+\.\s/.test(trimmed) &&
      !trimmed.startsWith('|') &&
      !trimmed.startsWith('(') &&
      !trimmed.startsWith('"') &&
      !/[.?!,:]$/.test(trimmed)
    ) {
      elements.push(
        <p key={i} className="text-sm font-semibold text-gray-900 mt-4 mb-1">
          {trimmed}
        </p>
      );
      i++; continue;
    }

    // ── Search query code block ───────────────────────────────────────────
    if (isSearchQuery(trimmed)) {
      if (trimmed.startsWith('(')) {
        // Multi-line group: collect AND (...) continuations
        const queryLines: string[] = [trimmed];
        i++;
        while (i < lines.length && isQueryContinuation(lines[i].trim())) {
          queryLines.push(lines[i].trim());
          i++;
        }
        elements.push(<SearchQueryBlock key={`sq-${i}`} lines={queryLines} />);
      } else {
        elements.push(<SearchQueryBlock key={`sq-${i}`} lines={[trimmed]} />);
        i++;
      }
      continue;
    }

    // ── Bullet list ───────────────────────────────────────────────────────
    if (/^[•\-\*]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[•\-\*]\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[•\-\*]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="space-y-1 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
              <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // ── Numbered list ─────────────────────────────────────────────────────
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="space-y-2 my-2 ml-1">
          {items.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-sm text-gray-800 leading-relaxed">
              <span className="text-gray-400 flex-shrink-0 font-medium text-xs mt-0.5">{j + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // ── Code block (``` ... ```) ───────────────────────────────────────────
    if (trimmed.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-800 overflow-x-auto my-2 font-mono">
          {codeLines.join('\n')}
        </pre>
      );
      i++; continue;
    }

    // ── Regular paragraph ─────────────────────────────────────────────────
    elements.push(
      <p key={i} className="text-sm text-gray-800 leading-relaxed my-1">
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-gray-900">{part.replace(/\*\*/g, '')}</strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}
