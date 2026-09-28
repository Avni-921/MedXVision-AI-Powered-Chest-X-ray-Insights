# Readify: AI-Enabled Smart Classroom Platform
**Master Documentation & Technical Overview**

## 1. Executive Summary
**Readify** is a modern, AI-enabled Learning Management System (LMS) designed to bridge the gap between traditional classroom management and self-paced online learning. It mimics the core functionality of platforms like Google Classroom but with a premium, SaaS-oriented aesthetic (inspired by Thinkific) and integrated AI capabilities.

**Core Value Proposition:**
- **For Teachers:** Streamlined course creation, assignment tracking, and automated grading/feedback.
- **For Students:** A distraction-free learning environment with progress tracking and role-specific dashboards.
- **Role-Based Access:** Distinct portals for Students, Teachers, and Administrators.

---

## 2. Technology Stack

### Frontend (Client-Side)
- **Framework:** [React v18](https://react.dev/) + [Vite](https://vitejs.dev/) (Fast operational speed).
- **Language:** TypeScript (Strict type safety).
- **Styling Engine:** [Tailwind CSS](https://tailwindcss.com/) (Utility-first styling).
- **Component Library:** [Shadcn/UI](https://ui.shadcn.com/) (Headless, accessible components based on Radix UI).
- **Animations:** [Framer Motion](https://www.framer.com/motion/) (Complex page transitions, scroll reveals, hover effects).
- **Icons:** [Lucide React](https://lucide.dev/).
- **State Management:** React Context API (`AuthContext` for user sessions).

### Backend & Infrastructure
- **Authentication:** **Supabase Auth** (Replaced legacy Node.js/JWT system).
  - Supports Email/Password login.
  - Handles session persistence and security tokens.
- **Database:** **Supabase (PostgreSQL)**.
  - Real-time capabilities.
  - Row Level Security (RLS) policies for data protection.
- **Legacy Server (Deprecated but present):** Node.js + Express (located in `/server`). *Note: Auth logic has moved to Supabase; this server may be repurposed for complex AI API handling in Phase 3.*

---

## 3. Key Features & Implementation Status

### A. Brand & UI Design (Phase 2 - Completed)
- **Visual Identity:**
  - **Logo:** Custom Geometric 'R' + Book icon (`src/components/Logo.tsx`).
  - **Colors:** Deep Charcoal (`#1B141E`), Golden Yellow (`#FFD23F`), Off-White (`#F9F9F7`).
  - **Typography:** *Lora* (Serif) for headings, *Inter* (Sans-serif) for UI text.
- **Flying Navbar:** A sticky navigation bar that transforms (shrinks, curves, blurs) as the user scrolls (`src/components/Navbar.tsx`).
- **Landing Page:** High-conversion layout with Hero section, Feature grid, and Social proof.

### B. Authentication System (Completed)
- **Split Role Selection:** A unique "Login" page design where users first select "Student" or "Teacher" via large interactive cards.
- **Supabase Integration:**
  - Direct connection to Supabase Auth API.
  - **Automatic Profile Creation:** A PostgreSQL Database Trigger (`handle_new_user`) automatically creates a public `profile` entry whenever a new user registers.
  - **Metadata Handling:** User Role (`student` or `teacher`) is stored in User Metadata and synced to the database.

### C. Core Portals (In Progress / Static)
- **Student Dashboard:** View enrolled courses, progress bars, and recent activity.
- **Teacher Dashboard:** Course creation tools, student analytics.
- **Course Player:** A dedicated view for consuming video/text content.

---

## 4. Database Schema (Supabase PostgreSQL)

### Table: `profiles`
Stores public user information. Linked 1:1 with `auth.users`.
- `id` (uuid, PK): References `auth.users`.
- `email` (text): User's email.
- `name` (text): Full display name.
- `role` (text): 'student', 'teacher', or 'admin'.
- `bio` (text): User biography.
- `avatar` (text): URL to profile picture.

### Table: `courses` (Planned)
- `id` (uuid, PK)
- `instructor_id` (uuid, FK to profiles)
- `title`, `description`, `thumbnail_url`
- `content` (json/text)
- `published` (boolean)

---

## 5. Project Structure

```bash
project/
├── .env                # Environment variables (VITE_SUPABASE_URL, etc.)
├── index.html          # Entry point
├── package.json        # Dependencies
├── server/             # (Legacy) Node.js Backend Code
└── src/
    ├── components/     # Reusable UI components
    │   ├── ui/         # Shadcn (Button, Card, Input...)
    │   ├── Logo.tsx    # Brand Logo
    │   ├── Navbar.tsx  # Main Navigation
    │   └── ...
    ├── contexts/       # React Contexts
    │   └── AuthContext.tsx # Supabase Auth Logic
    ├── lib/
    │   ├── supabase.ts # Supabase Client Utils
    │   └── utils.ts    # Tailwind Class Merger
    ├── pages/          # Full Page Views
    │   ├── Landing.tsx # Home Page
    │   ├── Login.tsx   # Auth Page
    │   └── ...
    └── App.tsx         # Main Router Setup
```

## 6. Setup & Run Instructions

1.  **Environment Setup:**
    Ensure you have a `.env` file in the root with your Supabase keys:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

2.  **Install Dependencies:**
    ```bash
    npm install
    ```

3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:5173`.

---

## 7. Roadmap (Phase 3 & Beyond)
- **Dynamic Course Data:** Connect `CourseDetail` and `StudentDashboard` to real Supabase data instead of hardcoded arrays.
- **File Uploads:** Allow Teachers to upload PDF/Video course materials (using Supabase Storage).
- **AI Integration:** Implement the "AI Summarizer" for course content.
