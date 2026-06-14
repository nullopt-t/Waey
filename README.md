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
## 📦 Run with Docker (Recommended)

```bash
git clone git@github.com:nullopt-t/Waey.git
cd Waey
docker-compose up --build
