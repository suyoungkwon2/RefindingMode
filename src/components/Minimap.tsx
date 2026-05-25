import type { Session } from '../types';

interface Props {
  session: Session;
  anchorId: string;
  activeTurnId?: string;
  onClickTurn: (turnId: string) => void;
}

export default function Minimap({ session, anchorId, activeTurnId, onClickTurn }: Props) {
  const anchorTurnId = session.anchors.find((a) => a.id === anchorId)?.turnId;

  return (
    <div className="flex flex-col py-3 px-2 gap-0.5 overflow-y-auto">
      {session.turns.map((turn, idx) => {
        const isAnchor = turn.id === anchorTurnId;
        const isActive = turn.id === activeTurnId && !isAnchor;
        const isUser = turn.role === 'user';
        const px = Math.max(14, Math.min(Math.round(Math.sqrt(turn.content.length / 10) * 14), 96));

        return (
          <button
            key={turn.id}
            onClick={() => onClickTurn(turn.id)}
            title={`Turn ${idx + 1}: ${isUser ? '사용자' : 'AI'}`}
            style={{ height: `${px}px`, flexShrink: 0 }}
            className={`rounded transition-colors hover:opacity-60 ${
              isUser ? 'self-end w-[60%]' : 'w-full'
            } ${
              isAnchor
                ? 'bg-blue-400'
                : isActive
                ? 'bg-blue-200'
                : isUser
                ? 'bg-gray-300'
                : 'bg-gray-200'
            }`}
          />
        );
      })}
    </div>
  );
}
