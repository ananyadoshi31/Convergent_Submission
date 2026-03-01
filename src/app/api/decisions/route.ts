import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
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

  const { error } = await supabase
    .from("pending_decisions")
    .upsert(
      {
        game_id: game.id,
        price,
        new_engineers,
        new_sales,
        salary_pct,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "game_id" }
    );

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
