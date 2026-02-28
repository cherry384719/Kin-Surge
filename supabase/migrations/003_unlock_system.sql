-- Add unlock fields to dynasties
ALTER TABLE dynasties ADD COLUMN unlock_requirement int NOT NULL DEFAULT 0;

-- Add ordering and boss flag to poets
ALTER TABLE poets ADD COLUMN sort_order int NOT NULL DEFAULT 0;
ALTER TABLE poets ADD COLUMN is_boss boolean NOT NULL DEFAULT false;

-- Create new progress table for per-poet tracking
CREATE TABLE poet_progress (
  id          serial PRIMARY KEY,
  user_id     uuid REFERENCES auth.users(id) NOT NULL,
  poet_id     int REFERENCES poets(id) NOT NULL,
  stars       int NOT NULL DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  completed   boolean NOT NULL DEFAULT false,
  mistakes    int NOT NULL DEFAULT 0,
  used_reveal boolean NOT NULL DEFAULT false,
  UNIQUE(user_id, poet_id)
);

ALTER TABLE poet_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users manage own poet_progress"
  ON poet_progress FOR ALL USING (auth.uid() = user_id);
