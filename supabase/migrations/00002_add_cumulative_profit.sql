-- Add cumulative_profit if migrating from older schema
ALTER TABLE game_states ADD COLUMN IF NOT EXISTS cumulative_profit DECIMAL(15, 2) NOT NULL DEFAULT 0;
