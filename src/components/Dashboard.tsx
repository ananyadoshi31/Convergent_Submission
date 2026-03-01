"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type HistoryEntry = {
  quarter: number;
  revenue: number;
  net_income: number;
  units_sold: number;
};

type Props = {
  cash: number;
  engineers: number;
  salesStaff: number;
  quarter: number;
  yearQ: string;
  history: HistoryEntry[];
};

export function Dashboard({ cash, engineers, salesStaff, quarter, yearQ, history }: Props) {
  const lastQuarter = history.length > 0 ? history[history.length - 1] : null;
  const chartData = history.map((h) => ({
    quarter: `Q${h.quarter}`,
    revenue: Number(h.revenue),
    net_income: Number(h.net_income),
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <MetricCard label="Cash on hand" value={`$${cash.toLocaleString()}`} />
        <MetricCard label="Revenue (last Q)" value={lastQuarter != null ? `$${Number(lastQuarter.revenue).toLocaleString()}` : "—"} />
        <MetricCard label="Net income (last Q)" value={lastQuarter != null ? `$${Number(lastQuarter.net_income).toLocaleString()}` : "—"} />
        <MetricCard label="Headcount" value={`${engineers} eng / ${salesStaff} sales`} />
        <MetricCard label="Quarter" value={yearQ} />
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
        <h3 className="text-sm font-medium text-slate-400 mb-4">Last 4 quarters</h3>
        {chartData.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="quarter" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #475569" }}
                  formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, ""]}
                />
                <Legend />
                <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="net_income" name="Net income" fill="#22c55e" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Advance a quarter to see history.</p>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="text-xl font-semibold mt-1">{value}</p>
    </div>
  );
}
