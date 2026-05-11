# 🔄 CoSync — Professional Project Management & Matchmaking Platform

> **A full-stack, cloud-deployed platform for students and professionals to create projects, find teammates through intelligent skill-based matchmaking, and collaborate in real-time workspaces.**

## 🌐 Live Deployment

| Service | URL |
|---------|-----|
| **Frontend** | [cosync-frontend.vercel.app](https://co-sync-a-professional-project-mana.vercel.app) |
| **Backend API** | [Railway (Auto-deployed)](https://cosync-a-professional-project-management-matchma-production.up.railway.app) |
| **Database** | MongoDB Atlas (Cloud) |
| **File Storage** | Cloudinary (Cloud) |

---

## 🚀 Features

### 🎯 Core Platform
- **Skill-Based Matchmaking Engine** — Intelligent recommendation algorithm that matches users with projects based on their skill sets, tech stacks, and role preferences.
- **Project Board & Feed** — Browse, filter, and search active projects by category, tech stack, and availability status.
- **Application System** — Apply to join projects with color-coded status tracking:
  - 🔵 **Apply** — Not yet applied
  - 🟡 **Pending** — Application submitted, awaiting review
  - 🟢 **Joined** — Application accepted
  - 🔴 **Declined** — Application not accepted

### 🛠️ Real-Time Collaboration Workspace
- **Kanban Board** — Drag-and-drop task management with priority levels (Urgent / High / Medium / Low).
- **Team Discussion** — Real-time messaging within project workspaces.
- **Activity Feed** — Live stream of project changes, member activity, and milestones.
- **Resources Manager** — Upload and organize project files, documents, and links via Cloudinary cloud storage.

### 👤 User Management
- **User Profiles & Reputation** — Track completed projects, display skills, and build a portfolio.
- **JWT Authentication** — Secure login/registration with token-based session management.
- **Comprehensive Notifications** — Real-time updates for application statuses, project invites, and team activity.

### 🎨 UI/UX
- **Dark-Mode Focused Design** — Premium, modern interface with glassmorphism effects and micro-animations.
- **Fully Responsive** — Optimized for desktop and mobile viewports.
- **Dynamic Interactions** — Hover effects, smooth transitions, and real-time visual feedback.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS, Redux Toolkit, `@dnd-kit` (Drag & Drop), Lucide React |
| **Backend** | Node.js, Express.js, REST API |
| **Database** | MongoDB with Mongoose ODM (hosted on MongoDB Atlas) |
| **File Storage** | Cloudinary (persistent cloud storage for uploads) |
| **Authentication** | JWT (JSON Web Tokens) with bcrypt password hashing |
| **Deployment** | Vercel (Frontend), Railway (Backend) |

---

## ⚙️ Local Development Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (local instance or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Asad-NCS/CoSync-a-Professional-Project-Management-Matchmaking-Platform.git
cd CoSync-a-Professional-Project-Management-Matchmaking-Platform
```

### 2. Backend Setup (`server/`)

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/cosync
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the server:
```bash
npm run dev
```

### 3. Frontend Setup (`cosync-frontend/`)

```bash
cd cosync-frontend
npm install
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.

---

## 🧪 End-to-End Testing Flow

1. **Registration/Login** — Create a new account with your skills, university, and role preferences.
2. **Project Creation** — Navigate to the dashboard and create a new project with specific roles and tech stack requirements.
3. **Matchmaking & Application** — View the project feed, test the "Recommended for You" matchmaking tab, and apply to an open project.
4. **Application Management** — As a project owner, review incoming applications and accept/reject team members.
5. **Workspace Collaboration** — Navigate to the project workspace to manage tasks on the Kanban board, chat with teammates, and upload resources.
6. **Status Tracking** — Observe the color-coded application statuses (Pending → Joined) across the Project Board and Detail pages.

---

## 📁 Project Structure

```
CoSync/
├── cosync-frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components (auth, projects, workspace, public)
│   │   ├── store/            # Redux Toolkit slices (auth, projects)
│   │   └── lib/              # API client, utilities
│   └── vercel.json           # Vercel routing configuration
├── server/                   # Express.js backend
│   ├── controllers/          # Route handlers (auth, projects, resources, etc.)
│   ├── middleware/            # Auth middleware, Cloudinary upload middleware
│   ├── models/               # Mongoose schemas (User, Project, Workspace, etc.)
│   ├── routes/               # Express route definitions
│   └── index.js              # Server entry point
├── package.json              # Root package (deployment scripts)
└── README.md
```

---

## 👥 Team

- **Muhammad Asad Kashif** — Full-Stack Developer
- **Hammad Ajmal** — Full-Stack Developer
- **Azaan Murtaza** — UI/UX Designer

## 📄 License

This project was created for academic purposes as part of the Web Technologies course (4th Semester, NUST).
