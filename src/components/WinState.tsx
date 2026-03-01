"use client";

type Props = {
  cumulativeProfit: number;
  onNewGame: () => void;
  loading: boolean;
};

export function WinState({ cumulativeProfit, onNewGame, loading }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md space-y-6 rounded-lg border border-emerald-700 bg-emerald-900/20 p-8">
        <h1 className="text-2xl font-bold text-emerald-400">Congratulations!</h1>
        <p className="text-slate-300">You reached Year 10 with positive cash.</p>
        <p className="text-xl font-semibold text-emerald-300">
          Cumulative profit: ${cumulativeProfit.toLocaleString()}
        </p>
        <button
          onClick={onNewGame}
          disabled={loading}
          className="rounded-md bg-emerald-600 px-6 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {loading ? "Starting…" : "New Game"}
        </button>
      </div>
    </main>
  );
}
