import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getInitialState } from "@/lib/simulation";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!game) {
    return NextResponse.json({ game: null, state: null, history: [], decisions: null });
  }

  const [stateRes, historyRes, decisionsRes] = await Promise.all([
    supabase.from("game_states").select("*").eq("game_id", game.id).single(),
    supabase
      .from("quarter_history")
      .select("*")
      .eq("game_id", game.id)
      .order("quarter", { ascending: false })
      .limit(4),
    supabase.from("pending_decisions").select("*").eq("game_id", game.id).single(),
  ]);

  const state = stateRes.data;
  const history = historyRes.data ?? [];
  const decisions = decisionsRes.data;

  return NextResponse.json({
    game: { id: game.id },
    state,
    history: history.reverse(),
    decisions,
  });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const initialState = getInitialState();

  const { data: game, error: gameError } = await supabase
    .from("games")
    .insert({ user_id: user.id })
    .select("id")
    .single();

  if (gameError || !game) {
    return NextResponse.json({ error: gameError?.message ?? "Failed to create game" }, { status: 500 });
  }

  const { error: stateError } = await supabase.from("game_states").insert({
    game_id: game.id,
    quarter: initialState.quarter,
    cash: initialState.cash,
    engineers: initialState.engineers,
    sales_staff: initialState.sales_staff,
    product_quality: initialState.product_quality,
    status: initialState.status,
    cumulative_profit: initialState.cumulative_profit ?? 0,
  });

  if (stateError) {
    await supabase.from("games").delete().eq("id", game.id);
    return NextResponse.json({ error: "Failed to init game state" }, { status: 500 });
  }

  await supabase.from("pending_decisions").insert({
    game_id: game.id,
    price: 100,
    new_engineers: 0,
    new_sales: 0,
    salary_pct: 100,
  });

  return NextResponse.json({ game: { id: game.id } });
}
