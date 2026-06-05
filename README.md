# ✦ Bucket List — avec authentification Supabase

## 1. Configuration Supabase

Exécute ce SQL dans **Supabase → SQL Editor** :

```sql
create table dreams (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  category text default 'adventure',
  photo text,
  done boolean default false,
  date text,
  location jsonb,
  note text,
  created_at timestamp with time zone default now()
);

alter table dreams enable row level security;

create policy "Users can manage their own dreams"
on dreams for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

## 2. Lancer en local

```bash
npm install
npm run dev
```

→ http://localhost:5173

## 3. Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

Ou pousse sur GitHub et connecte le dépôt sur vercel.com.

## Structure

```
bucket-list/
├── src/
│   ├── main.jsx
│   ├── App.jsx       ← toute l'application
│   └── supabase.js   ← client Supabase
├── public/
│   └── favicon.svg
├── index.html
├── vite.config.js
└── package.json
```
