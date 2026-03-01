"use client";

const DESKS_ENGINEERING = 12;
const DESKS_SALES = 12;

type Props = {
  engineers: number;
  salesStaff: number;
};

export function OfficeVisualization({ engineers, salesStaff }: Props) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900/50 p-6">
      <h2 className="text-lg font-semibold mb-4">Office</h2>
      <div className="flex gap-8">
        <Section
          label="Engineering"
          occupied={engineers}
          total={DESKS_ENGINEERING}
          role="engineer"
        />
        <div className="w-px bg-slate-600 self-stretch" />
        <Section
          label="Sales & Admin"
          occupied={salesStaff}
          total={DESKS_SALES}
          role="sales"
        />
      </div>
      <div className="flex gap-4 mt-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-800" /> Engineers
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Sales
        </span>
      </div>
    </div>
  );
}

function Section({
  label,
  occupied,
  total,
  role,
}: {
  label: string;
  occupied: number;
  total: number;
  role: "engineer" | "sales";
}) {
  return (
    <div className="flex-1">
      <p className="text-sm font-medium text-slate-400 mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <Desk key={i} hasEmployee={i < occupied} role={role} />
        ))}
      </div>
    </div>
  );
}

function Desk({ hasEmployee, role }: { hasEmployee: boolean; role: "engineer" | "sales" }) {
  const fillColor = role === "engineer" ? "bg-slate-800" : "bg-slate-500";
  return (
    <div className="relative w-12 h-10 flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-700/50 rounded border border-slate-600 flex items-center justify-center">
        <div className="w-3 h-2 bg-slate-600 rounded-sm" />
      </div>
      {hasEmployee && (
        <span
          className={`absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full ${fillColor} border border-slate-600 z-10`}
        />
      )}
    </div>
  );
}
