# NoTo — Note Your Todos
> **A Complete, Full-Stack Notes + Todo Management Web Application**

NoTo combines the timeless elegance of a vintage personal stationery journal with the organizational power of a modern task manager.

Built with **React 19**, **Vite**, **Tailwind CSS**, and backed by **Supabase** for managed Authentication, PostgreSQL database, and Row Level Security (RLS).

---

## 🖋️ Key Features

### 1. Authentication System (Supabase Auth)
- **Email & Password Authentication ONLY**: Pure email/password authentication without third-party or Google OAuth dependencies.
- **Login & Registration**: Built with React Hook Form and Zod schemas for robust client-side validation.
- **Passcode Recovery**: Complete self-service forgot passcode and reset flow (`/reset-password`).
- **Protected Routing**: Authenticated sessions persist via Supabase and route guards prevent unauthorized access.

### 2. Complete Theme Management System
NoTo features a centralized CSS variable-driven theme engine with **zero page reloads** required when switching.
*No conventional dark/light mode toggle is used.*

#### Default Neutral Theme
- **Soft Gray**: `#F5F5F4`
- **White**: `#FFFFFF`
- **Black**: `#252525`
- **Neutral Gray**: `#777777`

#### Eight Named Vintage Themes
All eight themes preserve their exact specified names and HEX foundation:
1. **Fresh Salmon** — Light: `#FF765A` | Dark: `#191513`
2. **Dirty White** — Light: `#EFE9E9` | Dark: `#500A1F`
3. **Sandy Shore** — Light: `#F3E8BC` | Dark: `#062E2D`
4. **Glossy Gold** — Light: `#FFE081` | Dark: `#1F0E06`
5. **Lemon Twist** — Light: `#FFD85F` | Dark: `#102414`
6. **Soft Pale Blue** — Light: `#CFF9FF` | Dark: `#032337`
7. **Lavender Tonic** — Light: `#C8BEFA` | Dark: `#1C0539`
8. **Emerald Green** — Light: `#00D37F` | Dark: `#002A30`

Themes synchronize directly to the authenticated user's `profiles` record in Supabase and persist in `localStorage`.

### 3. Cabinet Archive (Sticky Notes)
- Create, view, edit, pin, unpin, archive, and discard notes.
- Select from 7 paper tones (Parchment, Kraft, Rose, Sage, Ledger Cyan, Antique Gold, Lilac).
- Tagging and categories (Work, Personal, Ideas, etc.).
- Filter by Active, Pinned, Archived, or Category.
- Sort by Recently Modified, Newly Penned, or Title.
- Confirmation dialog before permanent deletion.

### 4. Task & Todo Management
- Dedicated task manager with support for:
  - Task title & rich description
  - Due date & due time
  - Urgency Priorities: **Low**, **Medium**, **High**
  - Category organization
  - One-click task completion with strikethrough animation
- 5 Tailored Views:
  1. **All Tasks**
  2. **Today**
  3. **Upcoming**
  4. **Overdue** (highlighted in crimson)
  5. **Completed**
- Bulk "Purge Completed" action.

### 5. Main Dashboard
- Personalized greeting and live formatted date.
- Real-time statistics calculated from live user records: Total Notes, Total Tasks, Pending, Completed, Due Today, Overdue.
- Recent Notes canvas with click-to-edit.
- Urgent & Upcoming Tasks with inline fulfillment checkbox.
- Quick action triggers for new notes and todos.

### 6. Global Search
- Real-time instant search bar in header querying note titles, contents, tags, and task titles/descriptions.
- Grouped results panel with direct navigation.

### 7. User Profile & Settings
- Update pen name and select an archival stationery seal emoji (`🪶`, `📜`, `✒️`, `⌨️`, `📖`, `⏳`).
- Password change interface.
- Notification dispatch preferences.
- **Data & Privacy Exports**: Download complete transcripts as formatted **JSON** or **CSV** (for both Notes and Todos).
- Ledger dissolution request with safety confirmation.

### 8. Mobile Responsiveness
- Tested and styled for viewports from 320px up to 1440px+.
- Adaptive collapsible sidebar with mobile drawer overlay.
- Touch-friendly controls, fluid inputs, zero horizontal scrollbar overflow.

---

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS + Custom CSS Variables & Vintage Typography
- **Icons**: Lucide React
- **Navigation**: React Router DOM (v7)
- **State Management**: Zustand
- **Forms & Validation**: React Hook Form + Zod
- **Backend Services**: Supabase (Auth, PostgreSQL, Row Level Security)
- **Deployment**: Vercel ready (`vercel.json`)

---

## 🗄️ Supabase Database Setup

### 1. Create a Supabase Project
1. Log in to [Supabase](https://supabase.com).
2. Create a new project named `noto`.

### 2. Run Database Migrations
Open the **SQL Editor** in your Supabase dashboard and run the script located at:
`supabase/migrations/20261107_init.sql` (or `Frontend/supabase/schema.sql`).

This migration creates:
- `public.profiles`: Stores username, avatar seal, selected theme, notification settings.
- `public.notes`: Stores sticky notes with user foreign key, category, tags, pin/archive flags.
- `public.todos`: Stores tasks with due date, time, priority, category, completion status.
- Trigger `on_auth_user_created`: Automatically creates a `profile` row upon sign up.
- Row Level Security (RLS) policies ensuring each user can only read, insert, update, and delete their own records.

### 3. Environment Variables
Copy `.env.example` to `.env` inside `Frontend/`:
```bash
cp Frontend/.env.example Frontend/.env
```
Populate with your project keys:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

*Note: If credentials are not yet supplied, NoTo runs in local archive mode, allowing full evaluation without crashing.*

---

## 💻 Local Development

### 1. Install Dependencies
```bash
npm --prefix Frontend install
```

### 2. Start Dev Server
From the root or Frontend folder:
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🚀 Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. In Vercel, import the repository.
3. Configure settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `Frontend` (or use the included root `vercel.json`)
   - **Environment Variables**: Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Deploy!

