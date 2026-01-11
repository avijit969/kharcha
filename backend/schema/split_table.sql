-- Create the split table to track how expenses are shared
create table if not exists public.splits (
  id uuid default gen_random_uuid() primary key,
  kharcha_id uuid references public.kharcha(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null, -- The member who owes this share
  amount numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies (optional but recommended)
alter table public.splits enable row level security;

create policy "Enable read access for all users" on public.splits
  for select using (true);

create policy "Enable insert for authenticated users only" on public.splits
  for insert with check (auth.role() = 'authenticated');

create policy "Enable update for users based on email" on public.splits
  for update using (auth.uid() = user_id);
