-- Dynasties
create table dynasties (
  id   serial primary key,
  name text not null,
  display_name text not null,
  sort_order int not null
);

-- Poets
create table poets (
  id          serial primary key,
  dynasty_id  int references dynasties(id) not null,
  name        text not null,
  bio_short   text,
  avatar_url  text
);

-- Poems
create table poems (
  id               serial primary key,
  poet_id          int references poets(id) not null,
  dynasty_id       int references dynasties(id) not null,
  title            text not null,
  full_text        text not null,
  curriculum_grade text
);

-- Poem lines (used in 1v1 challenge)
create table poem_lines (
  id          serial primary key,
  poem_id     int references poems(id) not null,
  line_number int not null,
  text        text not null
);

-- User profiles (extends Supabase auth.users)
create table user_profiles (
  user_id          uuid primary key references auth.users(id),
  display_name     text not null,
  rank_level       int not null default 1,
  coins            int not null default 0,
  current_dynasty_id int references dynasties(id)
);

-- Learning progress per poem
create table progress (
  id               serial primary key,
  user_id          uuid references auth.users(id) not null,
  poem_id          int references poems(id) not null,
  mastery_level    int not null default 0, -- 0=unseen, 1=beginner, 2=intermediate, 3=master
  last_practiced_at timestamptz,
  unique(user_id, poem_id)
);

-- Scores (drives leaderboards)
create table scores (
  id          serial primary key,
  user_id     uuid references auth.users(id) not null,
  dynasty_id  int references dynasties(id) not null,
  score       int not null,
  created_at  timestamptz not null default now()
);

-- Row-level security: users can only read/write their own rows
alter table user_profiles enable row level security;
alter table progress enable row level security;
alter table scores enable row level security;

create policy "users manage own profile"
  on user_profiles for all using (auth.uid() = user_id);

create policy "users manage own progress"
  on progress for all using (auth.uid() = user_id);

create policy "users insert own scores"
  on scores for insert with check (auth.uid() = user_id);

create policy "scores are public for read"
  on scores for select using (true);

-- Public read for content tables
alter table dynasties enable row level security;
alter table poets enable row level security;
alter table poems enable row level security;
alter table poem_lines enable row level security;

create policy "public read dynasties" on dynasties for select using (true);
create policy "public read poets" on poets for select using (true);
create policy "public read poems" on poems for select using (true);
create policy "public read poem_lines" on poem_lines for select using (true);
