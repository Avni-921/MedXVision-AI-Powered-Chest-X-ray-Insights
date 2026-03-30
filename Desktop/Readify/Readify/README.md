# Readify Smart Classroom

Readify is a Google Classroom–like Smart Classroom platform designed to revolutionize structured course delivery and assignment management. Built with a modern tech stack, it emphasizes seamless student-teacher interaction, robust workflow management, and AI-powered learning assistance.

 HEAD
##  Tech Stack

## Tech Stack
8453a79760606f45b5e4e33eb911efd8398f543e

- **Frontend:** React (Vite)
- **Backend:** Node.js, Express
- **Database:** MongoDB
- **Styling:** Tailwind CSS, shadcn/ui

##  Key Features

 HEAD
###  Structured Course Delivery

### Structured Course Delivery
8453a79760606f45b5e4e33eb911efd8398f543e
- Organized curriculum management
- Module-based learning paths
- Rich media content support

### Assignments & Classroom Workflow
- Streamlined assignment creation and submission
- Gradebook and feedback systems
- Deadline tracking and notifications

 HEAD
###  Student–Teacher Roles & Access Control

### Student–Teacher Roles & Access Control
 8453a79760606f45b5e4e33eb911efd8398f543e
- Distinct dashboards for Students and Teachers
- granular permission capabilities
- Secure authentication and role management

###  AI-Assisted Content Processing
- **Smart Summaries:** Automated summarization of uploaded materials
- **Instant Explanations:** AI-generated explanations for complex topics
- **Content Analysis:** Intelligent insights from course resources

 HEAD

   npm run build
   ```
# Project Status: Readify Smart Classroom

**Last Updated:** 2026-01-08
**Current Phase:** Phase 1 Completed

##  Project Overview
Readify has been successfully updated to a **Smart Classroom Platform** (Google Classroom-like), focusing on structured course delivery, assignments, and AI assistance.

## Completed Features

### 1. Project Rebranding & Configuration
- Updated Project Name to `readify-smart-classroom`.
- Configured `favicon` and manifest for new branding.
- Created granular tasks tracking in `task.md`.

### 2. Backend Infrastructure
- **Server Setup:** initialized `server/` with Node.js & Express.
- **Database:** Connected to **MongoDB** (`readify-smart-classroom` DB).
- **Security:** Configured `cors`, `dotenv` for environment variables.

### 3. Authentication & Security
- **User Model:** Created Mongoose schema for Users with:
  - Role-Based Access Control (`Student`, `Teacher`, `Admin`).
  - Password Hashing (bcryptjs).
- **Auth API:**
  - `POST /register`: User signup with role selection.
  - `POST /login`: Secure login returning JWT.
  - `GET /me`: Protected User User profile retrieval.
- **Middleware:** Implemented JWT verification and Role checks.

### 4. Frontend Integration
- **API Client:** Configured `Axios` interceptors for automatic token handling.
- **State Management:** Built `AuthContext` for global user session management (`signIn`, `signUp`, `logout`).
- **Protected Routes:** Implemented `ProtectedRoute` component to guard pages based on login status and roles.
- **UI Implementation:**
  - Connected `Login` and `Register` pages to the real backend.
  - Verified Landing Page and Login Flow.

## Next Steps (Phase 2)
- Structured Course Delivery (Schema & APIs).
- Assignment Creation & Submission workflow.
- Teacher Dashboard implementation.

 8453a79760606f45b5e4e33eb911efd8398f543e
