drop policy if exists "Users can update own favorites" on public.favorites;
create policy "Users can update own favorites"
  on public.favorites
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant update on public.favorites to authenticated;
