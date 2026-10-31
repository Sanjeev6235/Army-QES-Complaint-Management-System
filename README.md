# 🪖 Army Quarter Engineering Services (QES)
### Complaint Management System — MERN Stack

A full-stack web application for managing engineering service complaints in Army quarters. Built with MongoDB, Express.js, React + Vite, and Node.js.

---


## Local setup

1. Install Node.js (LTS) and MongoDB, or create a MongoDB Atlas database.
2. In `server/`, copy `.env.example` to `.env` and set a private `JWT_SECRET` and your `MONGODB_URI`.
3. Install dependencies in both folders: `cd server && npm install`, then `cd ../client && npm install`.
4. Start the API with `cd server && npm run dev`. Start the UI in a second terminal with `cd client && npm run dev`.
5. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

### First administrator account

Public registration always creates a standard `user` account. For the first deployment, register your own account, then promote that account to `admin` directly in your trusted MongoDB database (for example, using MongoDB Compass). Do not expose an unauthenticated public admin-registration endpoint. After the first admin exists, create engineer/admin accounts from the admin interface.

### Environment variables

`PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`, and `NODE_ENV` are read by the server. Never commit `.env`; use `server/.env.example` as a template. Uploaded complaint files are local runtime data and are excluded from Git.

### Security notes

- Use a long, random `JWT_SECRET` and rotate any secret that may have been shared.
- Use HTTPS in production and set `CLIENT_URL` to the exact deployed frontend origin.
- Restrict database access and back up MongoDB regularly.
- Configure persistent/private object storage before deploying uploads to ephemeral hosting.

## 📁 Project Structure

```
army-qes/
├── client/                   # React + Vite frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/       # Reusable UI components
│   │   │   ├── complaints/   # Complaint-specific components
│   │   │   └── layout/       # Navbar, Sidebar, Layout
│   │   ├── context/          # AuthContext, NotificationContext
│   │   ├── pages/            # All page components
│   │   └── utils/            # API instance, helpers
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── server/                   # Node.js + Express backend
│   ├── config/               # Notification helper
│   ├── middleware/           # Auth (JWT), Multer upload
│   ├── models/               # Mongoose schemas
│   ├── routes/               # REST API endpoints
│   └── uploads/              # Uploaded images (auto-created)
│
└── README.md
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** (local or Atlas)
- **npm** v9+

---

## 🚀 Quick Setup

### 1. Clone / Extract the project

```bash
cd army-qes
```

### 2. Setup the Server

```bash
cd server
npm install
```

Create a `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/army-qes
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **MongoDB Atlas users:** Replace `MONGODB_URI` with your Atlas connection string.

### 3. Setup the Client

```bash
cd ../client
npm install
```

### 4. Run the Application

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🔐 Authentication & First Login

1. **Register** the first account at `/register`
   - The **first registered user automatically becomes Admin**
   - All subsequent registrations default to **User** role
2. Login at `/login`
3. Admin can **assign Engineer role** from the Users panel

### Role Permissions

| Feature                   | User | Engineer | Admin |
|---------------------------|------|----------|-------|
| Submit complaint          | ✅   | ❌       | ✅    |
| View own complaints       | ✅   | ❌       | ✅    |
| View assigned complaints  | ❌   | ✅       | ✅    |
| Update complaint status   | ❌   | ✅       | ✅    |
| Add remarks               | ❌   | ✅       | ✅    |
| Assign engineer           | ❌   | ❌       | ✅    |
| Manage users              | ❌   | ❌       | ✅    |
| View analytics dashboard  | ❌   | ❌       | ✅    |

---

## 📡 API Reference

### Auth
| Method | Endpoint             | Description       | Auth     |
|--------|----------------------|-------------------|----------|
| POST   | /api/auth/register   | Register user     | Public   |
| POST   | /api/auth/login      | Login             | Public   |
| GET    | /api/auth/me         | Get current user  | JWT      |

### Complaints
| Method | Endpoint                | Description              | Auth          |
|--------|-------------------------|--------------------------|---------------|
| POST   | /api/complaints         | Create complaint         | User/Admin    |
| GET    | /api/complaints         | List (role-filtered)     | All           |
| GET    | /api/complaints/:id     | Get single complaint     | All           |
| PUT    | /api/complaints/:id     | Update complaint         | Role-based    |
| DELETE | /api/complaints/:id     | Delete complaint         | User/Admin    |

### Users (Admin only)
| Method | Endpoint                   | Description        |
|--------|----------------------------|--------------------|
| GET    | /api/users                 | List all users     |
| GET    | /api/users/engineers       | List engineers     |
| POST   | /api/users/create          | Create user        |
| PUT    | /api/users/:id/role        | Update role        |
| PUT    | /api/users/:id             | Update user info   |
| DELETE | /api/users/:id             | Deactivate user    |

### Notifications
| Method | Endpoint                          | Description           |
|--------|-----------------------------------|-----------------------|
| GET    | /api/notifications                | Get my notifications  |
| PUT    | /api/notifications/read-all       | Mark all read         |
| PUT    | /api/notifications/:id/read       | Mark one read         |

### Dashboard
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| GET    | /api/dashboard/stats        | Admin analytics          |
| GET    | /api/dashboard/engineer-stats | Engineer stats         |
| GET    | /api/dashboard/user-stats   | User stats               |

---

## 🔄 Complaint Workflow

```
User Submits → [Pending]
     ↓ Admin assigns engineer
[Assigned] → Engineer notified
     ↓ Engineer starts work
[In Progress] → User notified
     ↓ Engineer marks complete
[Completed] → User notified
```

---

## ✨ Features

- **JWT Authentication** with role-based access control
- **Real-time notifications** via Socket.io (in-app only, no email)
- **Image uploads** (before & after repair photos, local storage)
- **Analytics dashboard** with Recharts (bar chart, pie chart, monthly trend)
- **Complaint workflow** with status tracking
- **Search & filter** complaints by status, category, priority
- **Pagination** on all list views
- **Toast notifications** for user feedback
- **Mobile responsive** design

---

## 🎨 Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS        |
| Icons     | Lucide React                        |
| Charts    | Recharts                            |
| HTTP      | Axios                               |
| Realtime  | Socket.io client                    |
| Backend   | Node.js, Express.js                 |
| Database  | MongoDB, Mongoose                   |
| Auth      | JWT, bcryptjs                       |
| Upload    | Multer (local storage)              |
| Realtime  | Socket.io server                    |

---

## 🔒 Security

- Passwords hashed with **bcryptjs** (12 salt rounds)
- **JWT** tokens expire in 7 days
- All sensitive routes protected by middleware
- Role-based authorization on every endpoint
- File upload validation (images only, 5MB max)

---

## 🐛 Troubleshooting

**MongoDB connection error:**
- Ensure MongoDB is running: `mongod --dbpath /data/db`
- Or use MongoDB Atlas and update `MONGODB_URI` in `.env`

**Port already in use:**
- Change `PORT` in server `.env`
- Vite uses 5173 by default; change in `vite.config.js`

**Images not loading:**
- The `/uploads` directory is served statically from the server
- Ensure both server and client are running

---

## 📄 License

MIT — For internal Army use.
