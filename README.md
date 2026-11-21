# Army QES — Complaint Management System

![MERN](https://img.shields.io/badge/Stack-MERN-16a34a?style=flat-square)
![React](https://img.shields.io/badge/Frontend-React-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=nodedotjs)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-47a248?style=flat-square&logo=mongodb)
![Socket.io](https://img.shields.io/badge/Notifications-Socket.io-010101?style=flat-square)

A full-stack complaint management application designed around an Army Quarter Engineering Services (QES) workflow. It helps users submit and follow complaints, engineers handle assigned work, and administrators coordinate users, assignments, and operational reporting.

## Core Capabilities

### Role-based access
- JWT authentication
- User, Engineer, and Admin roles
- Protected routes and role-based permissions
- Secure password hashing

### Complaint lifecycle
- Submit and view complaints
- Track complaint status
- Assign complaints to engineers
- Add work remarks and progress updates
- Support before-and-after image uploads
- Search and filter by status, category, and priority

### Dashboards and notifications
- Role-specific dashboard views
- Analytics and complaint summaries
- In-app notifications
- Real-time updates using Socket.io
- Responsive interface for desktop and mobile

## Complaint Workflow

1. A user submits a complaint.
2. An administrator reviews and assigns it to an engineer.
3. The engineer updates progress and adds remarks.
4. The complaint moves through its status workflow.
5. The user can follow the complaint progress.

## Technology Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite, Tailwind CSS |
| UI and charts | Lucide React, Recharts |
| API client | Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Uploads | Multer |
| Real-time | Socket.io |

## Project Structure

- `client/` — React interface, components, pages, context, and utilities
- `server/` — Express API, database models, routes, middleware, and upload handling

## Local Installation

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB local instance or MongoDB Atlas

### 1. Clone the repository

`git clone https://github.com/Sanjeev6235/Army-QES-Complaint-Management-System.git`

### 2. Install dependencies

From the repository root, run `npm run install:all`.

### 3. Configure the server

Copy `server/.env.example` to `server/.env`. Set the MongoDB connection string, a strong JWT secret, the server port, and the frontend origin. Never commit the real `.env` file.

### 4. Start the application

Open two terminals:

- Backend: `npm run dev:server`
- Frontend: `npm run dev:client`

The frontend normally runs at `http://localhost:5173`; use the exact URL printed by Vite.

## First Administrator Setup

Public registration should create a standard user account. For an initial deployment, create the first administrator through a trusted database setup process or the project's controlled administrative bootstrap procedure. Do not expose an unauthenticated admin-registration route.

## Production Security Checklist

- Use HTTPS and a strong, private JWT secret.
- Restrict MongoDB network access and configure backups.
- Set the correct production frontend origin.
- Validate file uploads and enforce file-size limits.
- Use persistent, access-controlled storage for uploaded files.
- Review role permissions before deploying with real users.

## Project Purpose

This project demonstrates practical full-stack development concepts: authentication, role-based authorisation, REST API design, database modelling, file uploads, real-time notifications, and dashboard reporting.

## Author

**Sanjeev Kumar** · [GitHub](https://github.com/Sanjeev6235)

---

Developed as a full-stack workflow management project.