/**
 * Server-side simulation model. Clients must not compute outcomes.
 * Based on the provided spec: initial state, per-quarter calculations, game loop.
 */

const INDUSTRY_AVG_SALARY = 30_000;
const NEW_HIRE_COST = 5_000;

export type GameState = {
  quarter: number;
  cash: number;
  engineers: number;
  sales_staff: number;
  product_quality: number;
  status: "playing" | "won" | "lost";
  cumulative_profit?: number;
};

export type QuarterOutcome = {
  quarter: number;
  revenue: number;
  net_income: number;
  units_sold: number;
};

export type PlayerDecisions = {
  price: number;
  new_engineers: number;
  new_sales: number;
  salary_pct: number;
};

export function getInitialState(): GameState {
  return {
    quarter: 1,
    cash: 1_000_000,
    engineers: 4,
    sales_staff: 2,
    product_quality: 50,
    status: "playing",
    cumulative_profit: 0,
  };
}

export function runQuarter(
  state: GameState,
  decisions: PlayerDecisions
): { state: GameState; outcome: QuarterOutcome } {
  const { price, new_engineers, new_sales, salary_pct } = decisions;

  // Apply new hires (affects next quarter headcount)
  const engineers = state.engineers + new_engineers;
  const sales_staff = state.sales_staff + new_sales;
  const new_hires = new_engineers + new_sales;
  const new_hire_cost = new_hires * NEW_HIRE_COST;

  // Salary cost per person
  const salary_cost = (salary_pct / 100) * INDUSTRY_AVG_SALARY;

  // Product quality: += engineers * 0.5 (cap 100)
  const product_quality = Math.min(100, state.product_quality + state.engineers * 0.5);

  // Market demand: quality * 10 - price * 0.0001 (floor 0)
  const demand = Math.max(0, product_quality * 10 - price * 0.0001);

  // Units sold: demand * sales_staff * 0.5 (integer)
  const units_sold = Math.floor(demand * state.sales_staff * 0.5);

  // Revenue
  const revenue = price * units_sold;

  // Total payroll (current headcount before new hires take effect this quarter)
  const total_payroll = salary_cost * (state.engineers + state.sales_staff);

  // Net income
  const net_income = revenue - total_payroll;

  // Cash: start + net_income - new_hire_cost (one-time deduction)
  let cash = Number(state.cash) + net_income - new_hire_cost;

  const nextQuarter = state.quarter + 1;
  let status: GameState["status"] = "playing";
  const cumulative_profit = (state.cumulative_profit ?? 0) + net_income;

  if (cash <= 0) {
    status = "lost";
    cash = 0;
  } else if (nextQuarter > 40) {
    status = "won";
  }

  const newState: GameState = {
    quarter: nextQuarter,
    cash,
    engineers,
    sales_staff,
    product_quality,
    status,
    cumulative_profit,
  };

  const outcome: QuarterOutcome = {
    quarter: state.quarter,
    revenue,
    net_income,
    units_sold,
  };

  return { state: newState, outcome };
}
