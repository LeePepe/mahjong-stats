create extension if not exists pgcrypto;

create table players (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 1 and 30),
  aliases text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table matches (
  id uuid primary key default gen_random_uuid(),
  played_on date not null,
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table match_results (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references matches(id) on delete cascade,
  player_id uuid not null references players(id),
  score numeric(10,2) not null,
  unique(match_id, player_id)
);

create table special_events (
  id uuid primary key default gen_random_uuid(),
  player_id uuid not null references players(id),
  match_id uuid references matches(id),
  occurred_on date not null,
  type text not null check (type in ('tianhu')),
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table snapshots (
  id uuid primary key default gen_random_uuid(),
  month text not null check (month ~ '^\\d{4}-(0[1-9]|1[0-2])$'),
  image_url text not null,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table audit_log (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('player','match','special_event','snapshot')),
  entity_id uuid not null,
  action text not null check (action in ('create','update','delete','restore')),
  actor text not null check (char_length(actor) between 1 and 30),
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index matches_played_on_idx on matches(played_on desc) where deleted_at is null;
create index special_events_player_date_idx on special_events(player_id, occurred_on desc) where deleted_at is null;
create index audit_log_created_at_idx on audit_log(created_at desc);

alter table players enable row level security;
alter table matches enable row level security;
alter table match_results enable row level security;
alter table special_events enable row level security;
alter table snapshots enable row level security;
alter table audit_log enable row level security;

comment on table audit_log is 'Append-only edit history; accessed only through the server service role.';
