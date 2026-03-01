"use client";

import { useState, useEffect } from "react";

type Decisions = {
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
} | null;

type Props = {
  decisions: Decisions;
  onAdvance: (form: { price: number; new_engineers: number; new_sales: number; salary_pct: number }) => void;
  loading: boolean;
  error: string | null;
};

export function DecisionPanel({ decisions, onAdvance, loading, error }: Props) {
  const [price, setPrice] = useState(100);
  const [newEngineers, setNewEngineers] = useState(0);
  const [newSales, setNewSales] = useState(0);
  const [salaryPct, setSalaryPct] = useState(100);

  useEffect(() => {
    if (decisions) {
      setPrice(Number(decisions.price));
      setNewEngineers(decisions.new_engineers);
      setNewSales(decisions.new_sales);
      setSalaryPct(decisions.salary_pct);
    }
  }, [decisions]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdvance({ price, new_engineers: newEngineers, new_sales: newSales, salary_pct: salaryPct });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-slate-700 bg-slate-900/50 p-6 space-y-4">
      <h2 className="text-lg font-semibold">Quarterly Decisions</h2>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <div>
        <label className="block text-sm text-slate-400 mb-1">Unit price ($)</label>
        <input
          type="number"
          min={1}
          step={1}
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">New engineers to hire</label>
        <input
          type="number"
          min={0}
          value={newEngineers}
          onChange={(e) => setNewEngineers(Number(e.target.value))}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">New sales staff to hire</label>
        <input
          type="number"
          min={0}
          value={newSales}
          onChange={(e) => setNewSales(Number(e.target.value))}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
        />
      </div>
      <div>
        <label className="block text-sm text-slate-400 mb-1">Salary (% of industry avg, default 100)</label>
        <input
          type="number"
          min={50}
          max={200}
          value={salaryPct}
          onChange={(e) => setSalaryPct(Number(e.target.value))}
          className="w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2 text-slate-100"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-emerald-600 px-4 py-2 font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {loading ? "Advancing…" : "Advance Quarter"}
      </button>
    </form>
  );
}
