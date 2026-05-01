# ⚡ TaskFlow — AI Communication Platform

Live demo: https://task-flow-me3d.vercel.app/
> Real-time team chat, task management, video meetings, and AI-powered summaries — all in one place.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | MongoDB + Mongoose |
| Auth | JWT (7-day expiry) + bcryptjs |
| Real-time | Socket.io (Phase 2) |
| AI | Google Gemini API (Phase 3–4) |
| Video | Jitsi Meet (Phase 4) |
| Payments | Razorpay + Stripe (Phase 5) |
| Email | Nodemailer (Phase 4) |
| Storage | Cloudinary (avatars) |
| Deployment | Render (backend) + Vercel (frontend) |

---

## 🗂️ Project Structure

```
taskflow/
├── package.json              ← Root: runs both servers with concurrently
│
├── server/                   ← Express API
│   ├── index.js              ← Server entry point
│   ├── config/
│   │   ├── db.js             ← MongoDB connection
│   │   └── cloudinary.js     ← Cloudinary + multer setup
│   ├── controllers/
│   │   └── authController.js ← Register, login, logout, profile
│   ├── middleware/
│   │   ├── authMiddleware.js  ← JWT protect middleware
│   │   └── errorMiddleware.js ← Global error handler + 404
│   ├── models/
│   │   └── User.js           ← User schema (bcrypt, toPublicJSON)
│   ├── routes/
│   │   └── authRoutes.js     ← Auth endpoints + validation
│   └── utils/
│       └── generateToken.js  ← JWT sign/verify helpers
│
└── client/                   ← React frontend
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx          ← React root + Toaster
        ├── App.jsx           ← Router + route definitions
        ├── index.css         ← Design tokens + component classes
        ├── api/
        │   ├── axios.js      ← Axios instance + interceptors
        │   └── auth.js       ← Auth API service functions
        ├── context/
        │   └── AuthContext.jsx ← Global auth state (user, token, login/logout)
        ├── components/
        │   ├── auth/
        │   │   └── ProtectedRoute.jsx
        │   ├── layout/
        │   │   ├── AppLayout.jsx ← Sidebar + Header wrapper
        │   │   ├── Sidebar.jsx   ← Navigation sidebar
        │   │   └── Header.jsx    ← Top header bar
        │   └── ui/
        │       ├── Avatar.jsx    ← Initials fallback avatar
        │       ├── Button.jsx    ← Reusable button variants
        │       ├── Input.jsx     ← Input with label, icon, error
        │       └── LoadingScreen.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useDebounce.js
        │   └── useLocalStorage.js
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── RegisterPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── ProfilePage.jsx
        │   └── NotFoundPage.jsx
        └── utils/
            └── helpers.js    ← Date formatting, string utils, config maps
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier is fine)
- Cloudinary account (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/taskflow.git
cd taskflow
npm run install:all
```

### 2. Configure Environment

```bash
cd server
cp .env.example .env
# Fill in your values in .env
```

**Required for Phase 1:**
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_long_random_secret
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 3. Run in Development

```bash
# From project root — starts both servers
npm run dev

# Server runs on: http://localhost:5000
# Client runs on: http://localhost:5173
```

---

## ✅ Phase 1 Deliverables — Gate Checklist

Before proceeding to Phase 2, verify:

- [ ] `POST /api/auth/register` creates a user and returns a JWT
- [ ] `POST /api/auth/login` returns a JWT for valid credentials
- [ ] `POST /api/auth/logout` marks user as offline
- [ ] `GET /api/auth/me` returns current user (requires JWT)
- [ ] `PUT /api/auth/profile` updates name/avatar
- [ ] `PUT /api/auth/change-password` changes password correctly
- [ ] `GET /api/health` returns `{ success: true }`
- [ ] Login page loads and authenticates
- [ ] Register page creates an account with password strength indicator
- [ ] App shell renders (sidebar + header)
- [ ] Dashboard shows user info
- [ ] Profile page updates name and avatar
- [ ] Protected routes redirect to `/login` when unauthenticated
- [ ] JWT token stored in localStorage and sent with all requests
- [ ] 401 responses clear session and redirect to login
- [ ] Mobile responsive (sidebar collapses on small screens)

---

## 🔌 API Reference — Phase 1

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | ❌ | Server health check |
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login and get JWT |
| POST | `/api/auth/logout` | ✅ | Logout (sets status offline) |
| GET | `/api/auth/me` | ✅ | Get current user |
| PUT | `/api/auth/profile` | ✅ | Update name + avatar |
| PUT | `/api/auth/change-password` | ✅ | Change password |
| GET | `/api/auth/users?search=` | ✅ | Search users (for chat) |

---

## 🗺️ Phase Roadmap

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Foundation — Auth + App Shell | ✅ **Current** |
| 2 | Real-Time Chat — Socket.io + Channels | ⏳ Next |
| 3 | Task Management + AI Priority | ⏳ |
| 4 | Video Meetings + AI Summaries + Notifications | ⏳ |
| 5 | Payments — Razorpay + Stripe | ⏳ |
| 6 | Polish + Deployment | ⏳ |

---

## 🎨 Design System

The frontend uses a dark-first design with:

- **Primary:** `#6C63FF` (brand purple)
- **Font Display:** Syne (headings)
- **Font Body:** Inter (body text)
- **Surfaces:** `#0f0f1a` → `#1a1a2e` → `#16213e`

Reusable CSS classes are in `client/src/index.css` under `@layer components`:
`btn-primary`, `btn-secondary`, `btn-ghost`, `btn-danger`, `input`, `card`, `card-hover`, `glass`, `badge-*`, `nav-item`, `nav-item-active`

---

## 📝 Notes for Next Phase

When starting Phase 2 (Real-Time Chat):

1. Install `socket.io` in server, `socket.io-client` in client
2. Uncomment `initSocket(server)` in `server/index.js`
3. Create `server/config/socket.js`
4. Create `Message` and `Channel` models
5. Uncomment channel/message routes in `server/index.js`
6. Create `ChatPage.jsx` and uncomment its route in `App.jsx`
