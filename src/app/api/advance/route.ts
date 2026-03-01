import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { runQuarter } from "@/lib/simulation";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const price = Number(body.price ?? 100);
  const new_engineers = Math.max(0, Math.floor(Number(body.new_engineers ?? 0)));
  const new_sales = Math.max(0, Math.floor(Number(body.new_sales ?? 0)));
  const salary_pct = Math.max(50, Math.min(200, Math.floor(Number(body.salary_pct ?? 100))));

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!game) return NextResponse.json({ error: "No game" }, { status: 400 });

  const { data: state } = await supabase
    .from("game_states")
    .select("*")
    .eq("game_id", game.id)
    .single();

  if (!state) return NextResponse.json({ error: "No game state" }, { status: 400 });
  if (state.status !== "playing") {
    return NextResponse.json({ error: "Game is over" }, { status: 400 });
  }

  const { state: newState, outcome } = runQuarter(
    {
      quarter: state.quarter,
      cash: Number(state.cash),
      engineers: state.engineers,
      sales_staff: state.sales_staff,
      product_quality: Number(state.product_quality),
      status: state.status,
    },
    { price, new_engineers, new_sales, salary_pct }
  );

  const { error: stateError } = await supabase
    .from("game_states")
    .update({
      quarter: newState.quarter,
      cash: newState.cash,
      engineers: newState.engineers,
      sales_staff: newState.sales_staff,
      product_quality: newState.product_quality,
      status: newState.status,
      cumulative_profit: newState.cumulative_profit,
      updated_at: new Date().toISOString(),
    })
    .eq("game_id", game.id);

  if (stateError) return NextResponse.json({ error: "Failed to update state" }, { status: 500 });

  await supabase.from("quarter_history").upsert(
    {
      game_id: game.id,
      quarter: outcome.quarter,
      revenue: outcome.revenue,
      net_income: outcome.net_income,
      units_sold: outcome.units_sold,
    },
    { onConflict: "game_id,quarter" }
  );

  await supabase
    .from("pending_decisions")
    .update({
      price,
      new_engineers: 0,
      new_sales: 0,
      salary_pct,
      updated_at: new Date().toISOString(),
    })
    .eq("game_id", game.id);

  return NextResponse.json({ state: newState, outcome });
}
