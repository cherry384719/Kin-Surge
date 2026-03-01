-- Ensure per-user isolation for user_profiles and poet_progress
-- Run in Supabase SQL editor or as a migration

-- Cleanup orphaned rows (optional but recommended)
DELETE FROM poet_progress WHERE user_id IS NULL;
DELETE FROM user_profiles WHERE user_id IS NULL;

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE poet_progress ENABLE ROW LEVEL SECURITY;

-- user_profiles: only owner can read/write
DROP POLICY IF EXISTS "user_profiles_self_select" ON user_profiles;
CREATE POLICY "user_profiles_self_select"
  ON user_profiles FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_self_upsert" ON user_profiles;
CREATE POLICY "user_profiles_self_upsert"
  ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "user_profiles_self_update" ON user_profiles;
CREATE POLICY "user_profiles_self_update"
  ON user_profiles FOR UPDATE USING (user_id = auth.uid());

-- poet_progress: only owner can read/write
DROP POLICY IF EXISTS "poet_progress_self_select" ON poet_progress;
CREATE POLICY "poet_progress_self_select"
  ON poet_progress FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "poet_progress_self_upsert" ON poet_progress;
CREATE POLICY "poet_progress_self_upsert"
  ON poet_progress FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "poet_progress_self_update" ON poet_progress;
CREATE POLICY "poet_progress_self_update"
  ON poet_progress FOR UPDATE USING (user_id = auth.uid());

-- Optional: allow deletes only by owner
DROP POLICY IF EXISTS "poet_progress_self_delete" ON poet_progress;
CREATE POLICY "poet_progress_self_delete"
  ON poet_progress FOR DELETE USING (user_id = auth.uid());
