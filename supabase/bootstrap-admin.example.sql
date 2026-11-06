do $$
declare
  v_admin_user_id uuid;
begin
  if exists (select 1 from public.admin_profiles) then
    raise exception 'An administrative account is already provisioned.';
  end if;

  select id
    into v_admin_user_id
    from auth.users
   where lower(email) = lower('replace-with-admin-email@example.com');

  if v_admin_user_id is null then
    raise exception 'Create the administrator in Supabase Auth before running this script.';
  end if;

  insert into public.admin_profiles (singleton, user_id, must_change_password)
  values (true, v_admin_user_id, false);
end;
$$;
