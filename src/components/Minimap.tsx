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
    <div className="flex flex-col h-full py-3 px-2 gap-0.5">
      {session.turns.map((turn, idx) => {
        const isAnchor = turn.id === anchorTurnId;
        const isActive = turn.id === activeTurnId && !isAnchor;
        const isUser = turn.role === 'user';
        // height proportional to content length (sqrt scale to avoid extremes)
        const flexVal = Math.max(1, Math.sqrt(turn.content.length / 12));

        return (
          <button
            key={turn.id}
            onClick={() => onClickTurn(turn.id)}
            title={`Turn ${idx + 1}: ${isUser ? '사용자' : 'AI'}`}
            style={{ flex: flexVal }}
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
