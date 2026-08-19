-- Run this in Supabase SQL Editor if signup shows: Database error saving new user

drop trigger if exists on_auth_user_created on auth.users;

grant usage on schema public to supabase_auth_admin;
grant insert, select on public.workspaces to supabase_auth_admin;
grant insert, select on public.profiles to supabase_auth_admin;
grant execute on function public.handle_new_user() to supabase_auth_admin;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
