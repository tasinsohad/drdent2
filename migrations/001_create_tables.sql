-- Create conversations table
create table if not exists conversations (
  id uuid default gen_random_uuid() primary key,
  phone text unique not null,
  name text,
  mode text not null default 'agent' check (mode in ('agent', 'human')),
  updated_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Create messages table
create table if not exists messages (
  id uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant')),
  content text not null,
  whatsapp_msg_id text unique,
  created_at timestamp with time zone default now()
);

-- Create AI settings table (single row)
create table if not exists ai_settings (
  id integer primary key default 1,
  provider text not null default 'openrouter',
  api_key text not null default '',
  base_url text,
  model text not null default 'anthropic/claude-sonnet-4',
  system_prompt text not null default 'You are a helpful WhatsApp assistant.',
  context_window_days integer not null default 90,
  constraint single_row check (id = 1)
);

-- Create dashboard settings table (single row)
create table if not exists dashboard_settings (
  id integer primary key default 1,
  password_hash text not null default '',
  constraint single_row check (id = 1)
);

-- Indexes
create index if not exists idx_messages_conversation on messages(conversation_id);
create index if not exists idx_conversations_updated on conversations(updated_at desc);

-- Enable realtime
alter publication supabase_realtime add table conversations;
alter publication supabase_realtime add table messages;
