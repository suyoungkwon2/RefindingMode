import type { Session } from '../types';

interface Props {
  session: Session;
  anchorId: string;
  onClickTurn: (turnId: string) => void;
}

export default function Minimap({ session, anchorId, onClickTurn }: Props) {
  const anchorTurnId = session.anchors.find((a) => a.id === anchorId)?.turnId;

  return (
    <div className="flex flex-col items-center py-3 px-2 gap-0.5 overflow-y-auto h-full">
      {session.turns.map((turn, idx) => {
        const isAnchor = turn.id === anchorTurnId;
        const isUser = turn.role === 'user';

        return (
          <button
            key={turn.id}
            onClick={() => onClickTurn(turn.id)}
            title={`Turn ${idx + 1}: ${isUser ? '사용자' : 'AI'}`}
            className={`w-full rounded transition-all hover:opacity-70 ${
              isAnchor ? 'h-5' : isUser ? 'h-2' : 'h-3'
            } ${
              isAnchor
                ? 'bg-blue-400'
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
