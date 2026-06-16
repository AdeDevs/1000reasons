-- Run this SQL in your Supabase SQL Editor

-- 1. Create the system_status table
create table if not exists public.system_status (
  id integer primary key default 1,
  "isSiteUp" boolean default true,
  "trafficCount" integer default 0
);

-- Insert default row
insert into public.system_status (id, "isSiteUp", "trafficCount") 
values (1, true, 148) 
on conflict (id) do nothing;

-- 2. Create the reasons table
create table if not exists public.reasons (
  id uuid default gen_random_uuid() primary key,
  number integer,
  category text not null,
  title text not null,
  content text not null,
  citation text,
  "readMoreLink" text,
  status text default 'pending',
  "submittedBy" text,
  email text,
  anonymous boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable Row Level Security since we'll manage access through our Express server backend
alter table public.reasons disable row level security;
alter table public.system_status disable row level security;

-- Insert initial values (optional but recommended!)
insert into public.reasons (number, category, title, content, citation, status, "submittedBy") values
(1, 'Education', 'Education Rebirth in Anambra', 'Returned schools to missions and provided massive funding, moving Anambra from 24th to 1st in NECO/WAEC examinations.', 'https://vanguardngr.com', 'approved', 'Admin'),
(2, 'Economy', 'Fiscal Prudence', 'Saved approximately 75 billion Naira in local and foreign currencies for Anambra State before leaving office, unprecedented in Nigeria.', 'https://premiumtimesng.com', 'approved', 'Admin'),
(3, 'Infrastructure', 'Massive Road Networks', 'Constructed over 800km of roads, giving Anambra the best road network in Nigeria and opening up rural agricultural areas.', 'https://dailytrust.com', 'approved', 'Admin'),
(4, 'Governance', 'Reducing Cost of Governance', 'Cut down the governor''s convoy, removed excessive security aides, and stopped using sirens to forcefully clear traffic, demonstrating servant leadership.', 'https://punchng.com', 'approved', 'Admin')
on conflict do nothing;
