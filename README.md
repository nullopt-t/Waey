# 🚀 Waey

Waey is a full-stack web application built with **NestJS (backend)** and **React + Vite (frontend)**. It provides a modular system with authentication, community features, AI chat, journeys, content platforms (articles, books, stories), notifications, and admin tools.

---

## 📁 Project Structure


backend/ → NestJS API (MongoDB, WebSockets, AI, Auth)
frontend/ → React + Vite client (TailwindCSS, Context API)
docs/ → Documentation
docker-compose.yml → Full stack setup


---

## ⚙️ Tech Stack

### Backend
- NestJS (TypeScript)
- MongoDB (Mongoose)
- JWT Authentication
- WebSockets (Chat + Notifications)
- AI integration (Gemini / Groq)
- File uploads (Multer)
- Docker support
- Modular architecture

### Frontend
- React + Vite
- TailwindCSS
- Context API
- Socket.io client
- Component-based architecture

---

## 📦 Requirements

- Node.js >= 18
- npm or yarn
- MongoDB (local or cloud)
- Docker (optional)

---

## 🚀 Setup & Run

### Clone repo

```bash
git clone git@github.com:nullopt-t/Waey.git
cd Waey
🐳 Run with Docker (recommended)
docker-compose up --build

Frontend:

http://localhost:5173

Backend:

http://localhost:3000
🧠 Run Backend manually
cd backend
npm install
npm run start:dev

Optional seed:

sh scripts/seed.sh
💻 Run Frontend manually
cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173
🔐 Environment Variables
backend/.env
MONGO_URI=your_mongo_url
JWT_SECRET=your_secret
PORT=3000
frontend/.env
VITE_API_URL=http://localhost:3000
✨ Features
JWT Authentication system
Role-based access (admin/user)
Real-time chat (WebSockets)
AI chat integration (Gemini / Groq)
Community posts & comments
Nested comments system
Reporting system
Articles system
Books system
Stories system
Mental health journey tracking system
Notifications (real-time + persistent)
Therapist module
Video system
File upload system
Admin dashboard
🧱 Backend Modules
auth
users
chat
community
article
book
story
journey
notification
therapist
feedback
video
upload
medical-contact

Each module is separated into controller, service, DTO, and schema.
