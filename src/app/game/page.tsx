import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GameClient } from "@/components/GameClient";

export default async function GamePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: game } = await supabase
    .from("games")
    .select("id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let gameId = game?.id ?? null;
  if (!gameId) {
    const { data: newGame } = await supabase.from("games").insert({ user_id: user.id }).select("id").single();
    if (newGame) {
      gameId = newGame.id;
      await supabase.from("game_states").insert({
        game_id: newGame.id,
        quarter: 1,
        cash: 1000000,
        engineers: 4,
        sales_staff: 2,
        product_quality: 50,
        status: "playing",
        cumulative_profit: 0,
      });
      await supabase.from("pending_decisions").insert({
        game_id: newGame.id,
        price: 100,
        new_engineers: 0,
        new_sales: 0,
        salary_pct: 100,
      });
    }
  }

  const [stateRes, historyRes, decisionsRes] = await Promise.all([
    supabase.from("game_states").select("*").eq("game_id", gameId).single(),
    supabase.from("quarter_history").select("*").eq("game_id", gameId).order("quarter", { ascending: false }).limit(4),
    supabase.from("pending_decisions").select("*").eq("game_id", gameId).single(),
  ]);

  const state = stateRes.data;
  const history = (historyRes.data ?? []).reverse();
  const decisions = decisionsRes.data;

  return (
    <GameClient
      initialState={state}
      initialHistory={history}
      initialDecisions={decisions}
    />
  );
}
