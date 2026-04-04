# Flow Board — Kanban Task Manager

A polished, full-stack Kanban board built with React, TypeScript, and Supabase.

## Features

**Core**
- Drag-and-drop task management across 4 columns (To Do, In Progress, In Review, Done)
- Guest authentication via Supabase anonymous sign-in (no account needed)
- Row Level Security — each user only sees their own data
- Full task CRUD with title, description, priority, status, and due date

**Advanced**
- ✅ Team Members & Assignees — create team members with custom colors, assign to tasks
- ✅ Task Comments — comment on tasks with timestamps
- ✅ Activity Log — full history of status changes per task
- ✅ Labels / Tags — create custom color labels, filter board by label
- ✅ Due Date Indicators — overdue/today badges on task cards
- ✅ Search & Filtering — search by title/description, filter by priority, assignee, or label
- ✅ Board Stats — total, completed, and overdue counts in sidebar

## Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **Backend/DB**: Supabase (Auth + Postgres + RLS)
- **Hosting**: Vercel

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd kanban-board
npm install
```

### 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free project
2. In your project dashboard, go to **SQL Editor**
3. Paste and run the entire contents of `schema.sql`
4. Go to **Authentication → Providers** and ensure **Anonymous sign-ins** is enabled
   - Settings → Authentication → scroll to "Anonymous sign-ins" → toggle ON

### 3. Add Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Fill in your values from the Supabase dashboard (Settings → API):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

⚠️ **Never commit your `.env` file.** Only use the `anon` key — never the `service_role` key.

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### 5. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

When prompted, add your environment variables (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

Or deploy via the Vercel dashboard:
1. Push your repo to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add the two env vars in the Vercel project settings
4. Deploy

---

## Database Schema

See `schema.sql` for the full schema. Summary:

| Table | Description |
|-------|-------------|
| `tasks` | Core task data — title, description, status, priority, due_date, assignee_ids, label_ids |
| `team_members` | Team members with name, color, initials |
| `labels` | Custom labels with name and color |
| `comments` | Per-task comments |
| `activity_logs` | Audit trail of task changes |

All tables have RLS enabled. Users can only read/write their own rows (enforced by `auth.uid() = user_id`). A trigger auto-sets `user_id` on insert from `auth.uid()`.

---

## Security Notes

- All tables use Supabase Row Level Security (RLS)
- Only the public `anon` key is used in the frontend — never the `service_role` key
- Guest sessions are created automatically via Supabase anonymous auth
- Each user's data is fully isolated at the database level

---

## Tradeoffs & Future Improvements

- **Ordering**: Tasks don't have an explicit `position` field, so ordering within a column isn't persisted across sessions. Adding a `position float` and re-ordering on drag would fix this.
- **Real-time**: Supabase Realtime subscriptions could sync the board live across multiple browser tabs.
- **Optimistic UI**: Status updates are optimistic (instant UI update, revert on error). Other updates (create, edit) wait for the server.
- **Assignees across users**: Currently "team members" are per-user. A shared workspace model would require a different data model.
- **Image avatars**: Member avatars use initials + color. Uploading images via Supabase Storage would be a natural next step.
