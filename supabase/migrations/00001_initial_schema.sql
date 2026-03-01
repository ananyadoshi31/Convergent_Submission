-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Games table: one row per game session, linked to auth.users
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Game state: current quarter state (single row per game for latest state)
CREATE TABLE game_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  quarter INT NOT NULL DEFAULT 1,
  cash DECIMAL(15, 2) NOT NULL DEFAULT 1000000,
  engineers INT NOT NULL DEFAULT 4,
  sales_staff INT NOT NULL DEFAULT 2,
  product_quality DECIMAL(6, 2) NOT NULL DEFAULT 50,
  status TEXT NOT NULL DEFAULT 'playing' CHECK (status IN ('playing', 'won', 'lost')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id)
);

-- Quarter history: outcomes per quarter for chart/table
CREATE TABLE quarter_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  quarter INT NOT NULL,
  revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,
  net_income DECIMAL(15, 2) NOT NULL DEFAULT 0,
  units_sold INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(game_id, quarter)
);

-- Pending decisions: player inputs before advancing (stored per game for next advance)
CREATE TABLE pending_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE UNIQUE,
  price DECIMAL(10, 2) NOT NULL DEFAULT 100,
  new_engineers INT NOT NULL DEFAULT 0,
  new_sales INT NOT NULL DEFAULT 0,
  salary_pct INT NOT NULL DEFAULT 100 CHECK (salary_pct >= 50 AND salary_pct <= 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_states ENABLE ROW LEVEL SECURITY;
ALTER TABLE quarter_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own games" ON games
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own game states" ON game_states
  FOR ALL USING (
    game_id IN (SELECT id FROM games WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own quarter history" ON quarter_history
  FOR ALL USING (
    game_id IN (SELECT id FROM games WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can manage own pending decisions" ON pending_decisions
  FOR ALL USING (
    game_id IN (SELECT id FROM games WHERE user_id = auth.uid())
  );

-- Indexes
CREATE INDEX idx_games_user_id ON games(user_id);
CREATE INDEX idx_quarter_history_game_id ON quarter_history(game_id);
