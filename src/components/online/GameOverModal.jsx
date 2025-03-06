export default function GameOverModal({ result, isDark }) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className={`p-6 rounded-lg shadow-xl ${
          isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
        }`}>
          <h2 className="text-2xl font-bold mb-4">Game Over</h2>
          <div className="space-y-2">
            <p>Result: {result.status}</p>
            {result.winner && (
              <p>Winner: {result.winner} ({result.color})</p>
            )}
            <p>Game ended by: {result.over_type}</p>
          </div>
        </div>
      </div>
    );
  };