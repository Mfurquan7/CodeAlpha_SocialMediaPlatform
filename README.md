# Vibely — Modern Social Media Web Platform

> **CodeAlpha Internship — Task 2: Social Media Platform**  
> Built with React, Vite, Node.js, Express, and SQLite.  
> Designed with the **Midnight Violet** editorial design system.

---

## 1. Project Overview

**Vibely** is a full-stack social networking web application designed to deliver an elevated, modern social media experience. Built from the ground up for CodeAlpha's Web Development Internship Task 2, Vibely allows users to create accounts, authenticate securely with JWT, manage customized profiles, compose text posts with live character counters, like and unlike posts with instant feedback, engage via threaded comments, and discover and follow other community members.

The application follows clean architectural principles: a decoupled React + Vite single-page application frontend styled with CSS variables and Lucide icons, backed by a modular Express.js REST API and SQLite database with foreign keys, uniqueness constraints, and indexing.

---

## 2. Visual Design System — Midnight Violet

Vibely implements an intentional **Midnight Violet** aesthetic inspired by modern editorial and dashboard layouts, avoiding generic templates and neon clutter.

| Token | Hex Code | Purpose |
|---|---|---|
| **Primary Violet** | `#6C4CF1` | Brand accents, primary buttons, active tabs, highlights |
| **Primary Hover** | `#5635D8` | Hover and active interaction states |
| **Soft Lavender** | `#EEE9FF` | Active navigation backgrounds, badges, subtle pills |
| **Main Background** | `#F7F7FC` | Clean canvas background |
| **Card Background** | `#FFFFFF` | Elevated cards, forms, and dialog surfaces |
| **Primary Text** | `#19162B` | Headings, author names, high-contrast typography |
| **Secondary Text** | `#77758A` | Body copy, timestamps, supporting captions |
| **Border** | `#EAE8F2` | Subtle dividing lines and input borders |
| **Like Accent** | `#FF6B9A` | Heart toggle and emotional interactions |

### Design Highlights
- **Editorial Typography**: Scaled using *Plus Jakarta Sans* with crisp letter-spacing and hierarchy.
- **Three-Column Desktop Layout**: Left navigation sidebar, center focused feed, and right discovery/trending sidebar.
- **Responsive Mobile Layout**: Single-column feed with fixed bottom navigation bar on screens `< 768px`.
- **Micro-interactions & States**: Restrained hover transitions, loading spinners, and empty states.

---

## 3. Key Features

- **Authentication & Security**:
  - Secure account registration with input validation.
  - Password hashing using `bcryptjs` (10 salt rounds).
  - Stateless JSON Web Token (`JWT`) authentication with 7-day expiration.
  - Client session persistence with automatic token re-verification on reload.
  - Protected backend routes with centralized ownership authorization.
- **Social Feed & Post Creation**:
  - Home feed featuring real-time posts from community members.
  - Inline post composer with a 1,000-character limit counter.
  - Relative timestamps (e.g., "Just now", "5m ago", "2h ago").
  - Post deletion strictly restricted to the post author.
- **Engagement & Interactions**:
  - Like/unlike toggle with instant optimistic UI updates and backend synchronization.
  - Duplicate likes prevented at both application and database constraint levels.
  - Inline comments drawer on post cards with comment counter.
  - Comment deletion restricted to the comment owner.
- **Explore & Social Graph**:
  - Real-time search by creator full name or `@username`.
  - Suggested creators filter.
  - Follow and unfollow controls with dynamic state management.
  - Self-follow prevention enforced by database `CHECK` constraint.
- **User Profiles**:
  - Profile banner and avatar with deterministic color assignments.
  - Author statistics: Post count, Followers count, and Following count.
  - Tabbed feed of posts published by the specific user.
  - In-place "Edit Profile" modal to update Full Name and Biography.

---

## 4. Technology Stack

### Frontend
- **React 18** — Component-driven reactive UI architecture.
- **Vite 5** — Next-generation fast frontend tooling and development server.
- **React Router DOM 6** — Client-side declarative routing.
- **Lucide React** — Modern, consistent iconography.
- **Plain CSS & CSS Variables** — Midnight Violet tokens and reusable components with zero CSS framework bloat.
- **Fetch API** — Standardized asynchronous HTTP client with Bearer token injection.

### Backend
- **Node.js** — Asynchronous server runtime environment.
- **Express.js** — Lightweight REST API framework.
- **SQLite (`node:sqlite`)** — Zero-setup, embedded ACID-compliant relational database.
- **bcryptjs** — Industry-standard salted password hashing.
- **jsonwebtoken (JWT)** — Signed bearer token authentication.
- **CORS & dotenv** — Cross-Origin Resource Sharing and environment variable configuration.

---

## 5. Project Directory Structure

```
social media/
├── backend/
│   ├── controllers/
│   │   ├── authController.js       # Register, Login, Me handlers
│   │   ├── commentController.js    # Comments retrieval, creation, deletion
│   │   ├── likeController.js       # Like & unlike handlers
│   │   ├── postController.js       # Posts retrieval, creation, deletion
│   │   └── userController.js       # User profiles, search, follow/unfollow
│   ├── data/
│   │   └── vibely.db               # SQLite database file (auto-generated)
│   ├── middleware/
│   │   ├── auth.js                 # JWT verification (requireAuth & optionalAuth)
│   │   └── error.js                # Centralized error & 404 handlers
│   ├── routes/
│   │   ├── authRoutes.js           # /api/auth routes
│   │   ├── commentRoutes.js        # /api/comments routes
│   │   ├── postRoutes.js           # /api/posts routes
│   │   └── userRoutes.js           # /api/users routes
│   ├── scripts/
│   │   ├── seed.js                 # Optional fictional demo data seeder
│   │   └── test-api.js             # Automated 23-step API integration test suite
│   ├── database.js                 # SQLite schema initialization & connection
│   ├── server.js                   # Express application entrypoint
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Avatar.jsx          # User avatar with initials and dynamic colors
│   │   │   ├── CreatePostModal.jsx # Post composer modal dialog
│   │   │   ├── EditProfileModal.jsx# Profile editing modal dialog
│   │   │   ├── MobileNav.jsx       # Fixed bottom navigation for mobile
│   │   │   ├── PostCard.jsx        # Post item with likes, comments & deletion
│   │   │   ├── PostComposer.jsx    # Post composer textarea & validation
│   │   │   ├── SidebarLeft.jsx     # Desktop navigation sidebar & branding
│   │   │   ├── SidebarRight.jsx    # Search, suggested users & trending topics
│   │   │   ├── TopHeader.jsx       # Responsive header with notification pill
│   │   │   └── UserCard.jsx        # User listing card with follow/unfollow
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # User session, login, register, logout
│   │   │   └── ToastContext.jsx    # Floating animated notification toasts
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx       # 3-column desktop & responsive shell
│   │   ├── pages/
│   │   │   ├── ExplorePage.jsx     # Search & discover community members
│   │   │   ├── HomePage.jsx        # Main feed and post creation
│   │   │   ├── LoginPage.jsx       # User login page
│   │   │   ├── NotFoundPage.jsx    # 404 error page
│   │   │   ├── ProfilePage.jsx     # User profile, statistics & user posts
│   │   │   └── RegisterPage.jsx    # User registration page
│   │   ├── services/
│   │   │   └── api.js              # Centralized Fetch wrapper & API methods
│   │   ├── styles/
│   │   │   ├── globals.css         # Global resets, typography, cards & buttons
│   │   │   └── variables.css       # Midnight Violet CSS tokens
│   │   ├── utils/
│   │   │   └── helpers.js          # timeAgo, getInitials, formatCount helpers
│   │   ├── App.jsx                 # Client-side routes configuration
│   │   └── main.jsx                # React DOM root entrypoint
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore                      # Git ignore rules for node_modules, DB, .env
├── .env.example                    # Placeholder environment configuration
├── package.json                    # Root workspace orchestration scripts
└── README.md                       # Comprehensive documentation
```

---

## 6. Database Schema Design

The SQLite relational database enforces integrity using foreign keys, check constraints, unique indexes, and performance indexes.

```
+-------------------------------------------------------------+
|                            USERS                            |
+-------------------------------------------------------------+
| id            INTEGER PRIMARY KEY AUTOINCREMENT             |
| name          TEXT NOT NULL                                 |
| username      TEXT NOT NULL UNIQUE                          |
| email         TEXT NOT NULL UNIQUE                          |
| password_hash TEXT NOT NULL                                 |
| bio           TEXT DEFAULT ''                               |
| avatar_color  TEXT DEFAULT '#6C4CF1'                        |
| created_at    DATETIME DEFAULT CURRENT_TIMESTAMP            |
+-------------------------------------------------------------+
         |                                  |
         | 1:N                              | 1:N
         v                                  v
+-------------------------------+  +--------------------------+
|             POSTS             |  |         FOLLOWS          |
+-------------------------------+  +--------------------------+
| id         INTEGER PK AUTOINC |  | id          INTEGER PK   |
| user_id    FK -> users(id)    |  | follower_id FK->users(id)|
| content    TEXT NOT NULL      |  | following_id FK->users(id|
| created_at DATETIME           |  | created_at  DATETIME     |
+-------------------------------+  | UNIQUE(follower, follow) |
         |                         | CHECK(follower!=following|
         | 1:N                     +--------------------------+
         +--------------------+
         |                    |
         v                    v
+------------------+  +---------------------------------------+
|      LIKES       |  |               COMMENTS                |
+------------------+  +---------------------------------------+
| id        PK     |  | id         INTEGER PK AUTOINCREMENT   |
| user_id   FK     |  | user_id    FK -> users(id)            |
| post_id   FK     |  | post_id    FK -> posts(id)            |
| created_at       |  | content    TEXT NOT NULL              |
| UNIQUE(user,post)|  | created_at DATETIME                   |
+------------------+  +---------------------------------------+
```

---

## 7. Installation & Setup Instructions

### Prerequisites
- **Node.js** v18.0.0 or higher (Tested and certified on Node.js v24 LTS).
- **npm** v9.0.0 or higher.

### Step 1: Clone or Navigate to the Workspace
```bash
cd "social media"
```

### Step 2: Install Dependencies
You can install dependencies for both the backend and frontend in one step:
```bash
npm run install:all
```
*Or manually:*
```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend/` directory (a template is provided in `backend/.env.example`):
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_vibely_2026
DB_PATH=./data/vibely.db
```

### Step 4: Database Initialization & Optional Demo Seeding
The database schema initializes **automatically** whenever the backend boots up.

To populate realistic demo users, initial posts, likes, comments, and followers:
```bash
npm run seed
```
> **Pre-configured Demo Accounts:**
> - `sarah@vibely.dev` / `Password123!` (Sarah Chen — Product Designer)
> - `alex@vibely.dev` / `Password123!` (Alex Rivera — Software Engineer)
> - `priya@vibely.dev` / `Password123!` (Priya Patel — UI/UX Architect)

---

## 8. Running the Application

### Development Mode

Open two terminal tabs:

**Terminal 1 — Start the Backend Server:**
```bash
npm run dev:backend
# Starts Express API at http://localhost:5000
```

**Terminal 2 — Start the Frontend Application:**
```bash
npm run dev:frontend
# Starts Vite React dev server at http://localhost:3000
```

Open your browser and navigate to: **`http://localhost:3000`**

### Production Build
To create a production-ready optimized build of the frontend:
```bash
npm run build
```
Build assets will be generated in `frontend/dist/`.

---

## 9. REST API Overview

All API endpoints return standard JSON responses and status codes:

### Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | No |
| `POST` | `/api/auth/login` | Authenticate credentials & return JWT | No |
| `GET` | `/api/auth/me` | Fetch currently logged in user | Yes (`Bearer <token>`) |

### Posts
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts` | Retrieve feed posts with like/comment counts | Optional |
| `POST` | `/api/posts` | Publish a new text post (1–1000 chars) | Yes |
| `GET` | `/api/posts/:id` | Retrieve single post details | Optional |
| `DELETE` | `/api/posts/:id` | Delete post (restricted to owner) | Yes |

### Likes
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/posts/:id/like` | Like a post (prevents duplicates) | Yes |
| `DELETE` | `/api/posts/:id/like` | Remove like from a post | Yes |

### Comments
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/posts/:id/comments` | List comments for a post | No |
| `POST` | `/api/posts/:id/comments` | Add comment to a post | Yes |
| `DELETE` | `/api/comments/:id` | Delete comment (restricted to owner) | Yes |

### Users & Social Graph
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/users` | List/search users (`?q=...` or `?suggested=true`) | Optional |
| `GET` | `/api/users/:id` | Get user profile and follower statistics | Optional |
| `PUT` | `/api/users/me` | Update authenticated user's name & bio | Yes |
| `GET` | `/api/users/:id/posts` | Retrieve posts authored by a user | Optional |
| `POST` | `/api/users/:id/follow` | Follow a user (prevents self-follow) | Yes |
| `DELETE` | `/api/users/:id/follow` | Unfollow a user | Yes |

---

## 10. Automated Testing

Vibely includes an automated 23-assertion test suite that boots an ephemeral instance of the API server and tests every required feature end-to-end.

To run the test suite:
```bash
npm test
```

### Verified Test Cases:
1. `[PASS]` API Health Check (`/api/health`)
2. `[PASS]` User registration with valid credentials
3. `[PASS]` Duplicate username and email rejected (`409 Conflict`)
4. `[PASS]` User login with correct credentials
5. `[PASS]` Invalid credentials rejected (`401 Unauthorized`)
6. `[PASS]` Protected routes reject unauthenticated requests (`401`)
7. `[PASS]` `/api/auth/me` returns verified user details
8. `[PASS]` Multi-user creation for relationship testing
9. `[PASS]` Authenticated user can create post
10. `[PASS]` User can like a post
11. `[PASS]` Duplicate like prevented (count maintained)
12. `[PASS]` User can unlike a post
13. `[PASS]` User can comment on a post
14. `[PASS]` Unauthorized user cannot delete another's comment (`403 Forbidden`)
15. `[PASS]` Author can delete their own comment
16. `[PASS]` User cannot follow themselves (`400 Bad Request`)
17. `[PASS]` User can follow another user
18. `[PASS]` Duplicate follow handled safely
19. `[PASS]` User can unfollow another user
20. `[PASS]` User can update profile name and bio
21. `[PASS]` Unauthorized user cannot delete another's post (`403 Forbidden`)
22. `[PASS]` Author can delete their own post
23. `[PASS]` Explore user search filters users by query

---

## 11. Screenshots Guide

To add screenshots of Vibely for your CodeAlpha submission:
1. Create a `screenshots/` directory at the project root:
   ```bash
   mkdir screenshots
   ```
2. Capture and save images with the following filenames:
   - `screenshots/01-home-feed.png` — Desktop 3-column feed showing posts and composer.
   - `screenshots/02-explore-page.png` — Explore page displaying creator search and suggested users.
   - `screenshots/03-user-profile.png` — Profile page with statistics and user posts.
   - `screenshots/04-comments-drawer.png` — Post card with active comments and reply form.
   - `screenshots/05-login-page.png` — Login page with Midnight Violet branding.
   - `screenshots/06-mobile-responsive.png` — Mobile viewport showing single-column layout and bottom navigation.
3. Link them in this section:

```markdown
![Home Feed](screenshots/01-home-feed.png)
![Explore Page](screenshots/02-explore-page.png)
![User Profile](screenshots/03-user-profile.png)
```

---

## 12. Security Notes & Project Limitations

### Security Features
- **Zero Plaintext Passwords**: All passwords salted and hashed with `bcryptjs`.
- **SQL Injection Prevention**: 100% of SQLite database interactions utilize parameterized prepared statements (`db.prepare('...').run(...)`).
- **Authorization Enforcement**: Ownership checks are derived strictly from the verified JWT payload, not from client-supplied body IDs.
- **Strict Git Hygiene**: Local SQLite database files, `.env` files, and build artifacts are excluded via `.gitignore`.

### Known Limitations (Designed for Student Internship Scope)
- **Text-Only Posts**: In accordance with project instructions, posts are text-only to maintain focus on design system polish and database relational integrity without introducing external blob storage dependencies.
- **Ephemeral JWT Secret**: In a production enterprise system, JWT tokens should be signed with rotating asymmetric keys (RS256) and stored in an external secret manager rather than local `.env`.
- **In-Memory Token Storage**: Tokens are stored in browser `localStorage`. A production banking or enterprise deployment would typically use `HttpOnly`, `SameSite=Strict` secure cookies.

---

## 13. How to Push to GitHub

When you are ready to upload this project to GitHub for your internship submission:

```bash
# 1. Initialize git repository
git init

# 2. Stage all project files (safe: .gitignore excludes .env, node_modules, .db)
git add .

# 3. Commit your changes
git commit -m "feat: complete Vibely social media platform for CodeAlpha Task 2"

# 4. Set main branch
git branch -M main

# 5. Link your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<your-username>/CodeAlpha_SocialMediaPlatform.git

# 6. Push to GitHub
git push -u origin main
```

---

## 14. Author & Acknowledgements

- **Developer**: CodeAlpha Web Development Intern
- **Project**: Task 2 — Social Media Platform
- **Application**: Vibely
- **License**: MIT
