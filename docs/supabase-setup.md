# Supabase setup

## Что сделать вручную в Supabase

1. Открой существующий проект Supabase.
2. Перейди в SQL Editor.
3. Выполни SQL из файла `supabase/migrations/20260807120000_user_layer.sql`.
4. Перейди в Authentication → Providers → Email и включи email/password авторизацию.
5. В Authentication → URL Configuration добавь локальный адрес сайта в Site URL, например `http://localhost:3000`.
6. В Redirect URLs добавь:
   - `http://localhost:3000/auth/confirm`
   - `http://localhost:3000/profile`
   - `http://localhost:3000/reset-password`
7. Проверь `.env.local` в корне проекта:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
8. Не добавляй service role key в frontend-проект.

## Что хранится в базе

- `profiles`: отображаемое имя пользователя.
- `favorites`: сохранённые статьи по `article_slug`.
- `article_progress`: отметка статьи как прочитанной или непрочитанной.

MDX-файлы остаются главным источником текста статей.

