# CoSync: Professional Project Management & Matchmaking Platform

CoSync is a full-stack, enterprise-grade project management and matchmaking platform designed for students and professionals. It allows users to create projects, find team members based on skill compatibility (matchmaking), manage tasks using a real-time Kanban board, and collaborate effectively.

## 🚀 Features

- **Skill-based Matchmaking**: Intelligent recommendation engine matching users with projects based on their skill sets and tech stacks.
- **Project Board & Feed**: Browse active projects, filter by categories, tech stack, and availability. Apply to join projects directly.
- **Real-time Collaboration Workspace**:
  - **Kanban Board**: Drag-and-drop task management with urgent/high/medium/low priority tags.
  - **Activity Feed**: Track project changes, member joins, and milestones.
  - **Resources Manager**: Upload and organize project-specific links, documents, and assets.
- **Enterprise UI/UX**: Fully responsive, dark-mode focused, modern user interface powered by Tailwind CSS and Lucide React icons.
- **Comprehensive Notification System**: Real-time updates for application statuses, project invites, and team activity.
- **User Profiles & Reputation**: Track completed projects, display skills, and build a portfolio of successful collaborations.

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Redux Toolkit, `@dnd-kit` (Kanban), Lucide React (Icons).
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose).
- **Authentication**: JWT-based secure authentication.

---

## ⚙️ Local Development Setup

To run the application locally, you will need to start both the backend server and the frontend client.

### Prerequisites

- Node.js (v18+ recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

### 1. Backend Setup (`server/`)

1. Open a terminal and navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Environment Configuration:
   The backend requires an `.env` file in the `server/` directory. Ensure you have the following variables configured (replace values with your own):
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/cosync
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

### 2. Frontend Setup (`cosync-frontend/`)

1. Open a **new** terminal and navigate to the `cosync-frontend` directory:
   ```bash
   cd cosync-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided by Vite (usually `http://localhost:5173`).

---

## 🧪 End-to-End Testing Flow

To verify the platform's functionality:

1. **Registration/Login**: Create a new account and set up your user profile with relevant skills.
2. **Project Creation**: Navigate to the dashboard and create a new project with specific roles and tech stack requirements.
3. **Matchmaking & Application**: View the project feed, test the matchmaking algorithm, and apply to an open project.
4. **Workspace Collaboration**: As a project owner, accept an application. Then, navigate to the project workspace to interact with the Kanban board, activity feed, and resources tab.
5. **Completion**: Use the project settings to mark a project as completed and observe the profile reputation updates.

## 📄 License

This project is created for academic purposes.
