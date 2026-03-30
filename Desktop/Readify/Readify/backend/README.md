# Readify LMS — Backend (Supabase Database)

## Architecture

Readify uses **Supabase** as its backend — the frontend communicates directly with Supabase via the `@supabase/supabase-js` client. There is no separate Express/Node.js API server.

```
┌─────────────┐     ┌──────────────────┐
│   React     │────▶│   Supabase       │
│   Frontend  │     │  ┌─ Auth         │
│   (Vite)    │◀────│  ├─ PostgreSQL   │
│             │     │  ├─ Storage      │
│             │     │  └─ RLS Policies │
└─────────────┘     └──────────────────┘
```

### Database Tables

| Table | Purpose |
|---|---|
| `profiles` | User profiles (linked 1:1 with `auth.users`) |
| `courses` | Course catalog (title, description, pricing, etc.) |
| `lessons` | Individual lessons within courses |
| `enrollments` | Student enrollment + progress tracking |

### Security

- **Row-Level Security (RLS)** is enabled on all tables
- Profiles: users can only update their own
- Courses: only teachers/admins can create; only creators can edit/delete
- Enrollments: users can only see/modify their own
- A database trigger (`handle_new_user`) auto-creates a profile row when a new user signs up

---

## Files in this directory

| File | Purpose |
|---|---|
| `supabase_migration.sql` | Complete database schema — tables, indexes, triggers, RLS policies |
| `supabase_storage.sql` | Storage bucket policies for file uploads |
| `seed_data.sql` | Sample courses and lessons for demo content |
| `.env.example` | Environment variable template |
| `README.md` | This file |

---

## Setup Instructions

### 1. Create a Supabase Project

If you haven't already, create a project at [supabase.com](https://supabase.com).

### 2. Apply the database migration

Go to **Supabase Dashboard → SQL Editor** and run:

```sql
-- Copy and paste the contents of supabase_migration.sql
```

### 3. Insert seed data

In the same SQL Editor, run:

```sql
-- Copy and paste the contents of seed_data.sql
```

### 4. Set up storage (optional)

Go to **Supabase Dashboard → Storage** and:
1. Create a new bucket called `resources` (private)
2. Set file size limit to 50MB
3. Run `supabase_storage.sql` in the SQL Editor for upload policies

### 5. Configure frontend environment

Update the root `.env` file with your Supabase project credentials:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

You can find these values in **Supabase Dashboard → Settings → API**.

### 6. Create an admin user

1. Register a new user through the app
2. In the Supabase SQL Editor, promote them to admin:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'your-admin@email.com';
```

### 7. Start the frontend

```bash
cd ..   # back to project root
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) — you should see seeded courses on the Courses page.

---

## Roles

| Role | Capabilities |
|---|---|
| `student` | Browse courses, enroll, track progress, update profile |
| `teacher` | All student capabilities + create/edit/delete own courses and lessons |
| `admin` | All teacher capabilities + manage all courses, view all users, access admin dashboard |
