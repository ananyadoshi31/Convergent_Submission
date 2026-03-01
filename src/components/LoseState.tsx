"use client";

type Props = {
  onNewGame: () => void;
  loading: boolean;
};

export function LoseState({ onNewGame, loading }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6 rounded-lg border border-red-700 bg-red-900/20 p-8">
        <h1 className="text-2xl font-bold text-red-400">Game Over</h1>
        <p className="text-slate-300">Cash reached zero. Your startup has gone bankrupt.</p>
        <button
          onClick={onNewGame}
          disabled={loading}
          className="rounded-md bg-red-600 px-6 py-2 font-medium text-white hover:bg-red-500 disabled:opacity-50"
        >
          {loading ? "Starting…" : "New Game"}
        </button>
      </div>
    </main>
  );
}
