"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { DecisionPanel } from "./DecisionPanel";
import { Dashboard } from "./Dashboard";
import { OfficeVisualization } from "./OfficeVisualization";
import { WinState } from "./WinState";
import { LoseState } from "./LoseState";

type GameState = {
  id?: string;
  quarter: number;
  cash: number;
  engineers: number;
  sales_staff: number;
  product_quality: number;
  status: "playing" | "won" | "lost";
  cumulative_profit?: number;
};

type QuarterHistory = {
  quarter: number;
  revenue: number;
  net_income: number;
  units_sold: number;
}[];

type Decisions = {
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
} | null;

type Props = {
  initialState: GameState | null;
  initialHistory: QuarterHistory;
  initialDecisions: Decisions;
};

export function GameClient({ initialState, initialHistory, initialDecisions }: Props) {
  const [state, setState] = useState<GameState | null>(initialState);
  const [history, setHistory] = useState<QuarterHistory>(initialHistory);
  const [decisions, setDecisions] = useState<Decisions>(initialDecisions);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) router.push("/login");
    });
    return () => subscription.unsubscribe();
  }, [supabase.auth, router]);

  async function handleAdvance(form: { price: number; new_engineers: number; new_sales: number; salary_pct: number }) {
    if (!state || state.status !== "playing") return;
    setLoading(true);
    setError(null);
    const res = await fetch("/api/advance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Failed to advance");
      return;
    }
    setState(data.state);
    setHistory((h) => {
      const next = [...h, data.outcome];
      return next.slice(-4);
    });
    setDecisions({ ...form, new_engineers: 0, new_sales: 0 });
    router.refresh();
  }

  async function handleNewGame() {
    setLoading(true);
    const res = await fetch("/api/game", { method: "POST" });
    setLoading(false);
    if (!res.ok) return;
    router.push("/game");
    router.refresh();
  }

  if (!state) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-slate-400">Loading game…</p>
      </main>
    );
  }

  if (state.status === "lost") {
    return <LoseState onNewGame={handleNewGame} loading={loading} />;
  }

  if (state.status === "won") {
    const cumulativeProfit = Number((state as GameState & { cumulative_profit?: number }).cumulative_profit ?? 0);
    return <WinState cumulativeProfit={cumulativeProfit} onNewGame={handleNewGame} loading={loading} />;
  }

  const year = Math.floor((state.quarter - 1) / 4) + 1;
  const q = ((state.quarter - 1) % 4) + 1;

  return (
    <main className="min-h-screen p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Startup Simulation</h1>
        <button
          onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          Sign out
        </button>
      </div>

      <Dashboard
        cash={Number(state.cash)}
        engineers={state.engineers}
        salesStaff={state.sales_staff}
        quarter={state.quarter}
        yearQ={`Y${year} Q${q}`}
        history={history}
      />

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <div>
          <DecisionPanel
            decisions={decisions}
            onAdvance={handleAdvance}
            loading={loading}
            error={error}
          />
        </div>
        <div>
          <OfficeVisualization engineers={state.engineers} salesStaff={state.sales_staff} />
        </div>
      </div>
    </main>
  );
}
