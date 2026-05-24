import type { Session } from '../types';

interface Props {
  session: Session;
  highlightAnchorId?: string;
  compact?: boolean;
}

export default function SessionView({ session, highlightAnchorId, compact }: Props) {
  const anchorTurnId = highlightAnchorId
    ? session.anchors.find((a) => a.id === highlightAnchorId)?.turnId
    : undefined;

  return (
    <div className={`flex flex-col ${compact ? 'p-3 gap-2' : 'px-8 py-6 gap-0 max-w-3xl mx-auto w-full'}`}>
      {session.turns.map((turn) => {
        const isHighlighted = turn.id === anchorTurnId;
        if (turn.role === 'user') {
          return (
            <UserTurn
              key={turn.id}
              id={turn.id}
              content={turn.content}
              highlighted={isHighlighted}
            />
          );
        }
        return (
          <AiTurn
            key={turn.id}
            id={turn.id}
            content={turn.content}
            contentType={turn.contentType}
            highlighted={isHighlighted}
          />
        );
      })}
    </div>
  );
}

function UserTurn({ id, content, highlighted }: { id: string; content: string; highlighted: boolean }) {
  return (
    <div
      id={id}
      className={`flex justify-end mb-2 mt-6 ${highlighted ? 'ring-2 ring-blue-300 ring-offset-2 rounded-2xl' : ''}`}
    >
      <div className="max-w-[72%] bg-[#f0f4f9] rounded-3xl px-5 py-3 text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function AiTurn({
  id,
  content,
  contentType,
  highlighted,
}: {
  id: string;
  content: string;
  contentType?: string;
  highlighted: boolean;
}) {
  return (
    <div
      id={id}
      className={`flex gap-3 mb-1 mt-2 ${highlighted ? 'bg-blue-50 rounded-2xl px-3 py-2 border-l-4 border-blue-400' : ''}`}
    >
      {/* Gemini-style sparkle icon */}
      <div className="flex-shrink-0 mt-0.5 w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-br from-blue-500 via-purple-500 to-pink-400">
        <SparkleIcon />
      </div>

      <div className="flex-1 min-w-0 pb-4">
        {contentType === 'table' || content.includes('|---|') ? (
          <MarkdownContent content={content} isTable />
        ) : (
          <MarkdownContent content={content} />
        )}
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

function MarkdownContent({ content, isTable = false }: { content: string; isTable?: boolean }) {
  if (isTable) {
    return <MarkdownTable content={content} />;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === '') {
      i++;
      continue;
    }

    // H3 heading: ###
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1.5">
          {renderInline(line.replace(/^### /, ''))}
        </h3>
      );
      i++;
      continue;
    }

    // H2-style bold heading: **text** on its own line
    if (/^\*\*[^*]+\*\*$/.test(line.trim())) {
      elements.push(
        <p key={i} className="text-sm font-bold text-gray-900 mt-4 mb-1">
          {line.replace(/\*\*/g, '')}
        </p>
      );
      i++;
      continue;
    }

    // Bullet list item: • or -
    if (line.match(/^[•\-]\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^[•\-]\s/)) {
        listItems.push(lines[i].replace(/^[•\-]\s/, ''));
        i++;
      }
      elements.push(
        <ul key={i} className="space-y-1 my-2 ml-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2 text-sm text-gray-800 leading-relaxed">
              <span className="text-gray-400 flex-shrink-0 mt-0.5">•</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Numbered list: 1. 2. etc
    if (line.match(/^\d+\.\s/)) {
      const listItems: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s/)) {
        listItems.push(lines[i].replace(/^\d+\.\s/, ''));
        i++;
      }
      elements.push(
        <ol key={i} className="space-y-2 my-2 ml-1">
          {listItems.map((item, j) => (
            <li key={j} className="flex gap-2.5 text-sm text-gray-800 leading-relaxed">
              <span className="text-gray-400 flex-shrink-0 font-medium text-xs mt-0.5">{j + 1}.</span>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Code block
    if (line.startsWith('```')) {
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      elements.push(
        <pre key={i} className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-800 overflow-x-auto my-2 font-mono">
          {codeLines.join('\n')}
        </pre>
      );
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-gray-800 leading-relaxed my-1">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="space-y-0.5">{elements}</div>;
}

function renderInline(text: string): React.ReactNode {
  // Handle inline bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  if (parts.length === 1) return text;
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-gray-900">
            {part.replace(/\*\*/g, '')}
          </strong>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function MarkdownTable({ content }: { content: string }) {
  const lines = content.split('\n').filter((l) => l.trim());
  const tableLines = lines.filter((l) => l.includes('|'));
  if (tableLines.length < 2) {
    return <pre className="text-sm text-gray-700 whitespace-pre-wrap">{content}</pre>;
  }

  const parseRow = (line: string) =>
    line.split('|').map((c) => c.trim()).filter(Boolean);

  const headers = parseRow(tableLines[0]);
  const bodyRows = tableLines.slice(2);
  const preTableLines = lines.filter((l) => !l.includes('|'));

  return (
    <div className="text-sm text-gray-800 space-y-2 my-1">
      {preTableLines.length > 0 && (
        <p className="leading-relaxed">{renderInline(preTableLines.join(' '))}</p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="text-xs w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              {headers.map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-gray-700 border-b border-gray-200">
                  {h.replace(/\*\*/g, '')}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, i) => {
              const cells = parseRow(row);
              return (
                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                  {cells.map((cell, j) => (
                    <td key={j} className="px-3 py-2 text-gray-700 border-b border-gray-100 leading-relaxed">
                      {renderInline(cell.replace(/\*\*/g, ''))}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
