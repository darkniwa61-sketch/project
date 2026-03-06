-- Create custom types for roles
CREATE TYPE public.user_role AS ENUM ('admin', 'staff');

-- Create a table for public profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  role public.user_role default 'staff'::public.user_role,
  can_add_item boolean default false,
  can_edit_item boolean default false,
  can_delete_item boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS) for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by admin." on public.profiles
  for select using ( 
    (select role from public.profiles where id = auth.uid()) = 'admin' 
  );

create policy "Users can view their own profile." on public.profiles
  for select using ( auth.uid() = id );

create policy "Only admins can update profiles." on public.profiles
  for update using ( 
    (select role from public.profiles where id = auth.uid()) = 'admin' 
  );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update Inventory Policies to use RBAC
-- Drop existing policies if they exist to avoid conflicts (assuming basic authenticated policies from before)
DROP POLICY IF EXISTS "Enable read access for all users" ON "public"."inventory";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."inventory";
DROP POLICY IF EXISTS "Enable update for users based on email" ON "public"."inventory";
DROP POLICY IF EXISTS "Enable update for auth users" ON "public"."inventory";
DROP POLICY IF EXISTS "Enable delete for users based on user_id" ON "public"."inventory";
DROP POLICY IF EXISTS "Enable delete for auth users" ON "public"."inventory";


-- Select: All authenticated users can read inventory (both Admin and Staff)
CREATE POLICY "Inventory viewable by authenticated users" ON public.inventory
  FOR SELECT TO authenticated USING (true);

-- Insert: Admin OR Staff with 'can_add_item' true
CREATE POLICY "Inventory insertable by admin or permitted staff" ON public.inventory
  FOR INSERT TO authenticated WITH CHECK (
    (select role from public.profiles where auth.uid() = id) = 'admin' OR
    (select can_add_item from public.profiles where auth.uid() = id) = true
  );

-- Update: Admin OR Staff with 'can_edit_item' true
CREATE POLICY "Inventory updatable by admin or permitted staff" ON public.inventory
  FOR UPDATE TO authenticated USING (
    (select role from public.profiles where auth.uid() = id) = 'admin' OR
    (select can_edit_item from public.profiles where auth.uid() = id) = true
  );

-- Delete: Admin OR Staff with 'can_delete_item' true
CREATE POLICY "Inventory deletable by admin or permitted staff" ON public.inventory
  FOR DELETE TO authenticated USING (
    (select role from public.profiles where auth.uid() = id) = 'admin' OR
    (select can_delete_item from public.profiles where auth.uid() = id) = true
  );
