# 🎬 MovieVerse Pro

MovieVerse Pro is a full-stack movie streaming, discovery, and recommendation platform built with modern web technologies.

## 🚀 Stack & Features

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Lucide Icons, Dark/Light Mode.
- **Backend**: Node.js, Express.js, MongoDB Atlas with Mongoose ORM.
- **Auth**: JWT Access & Refresh Token strategy, OAuth ready, Password hashing.
- **Features**: User Profiles, Movie CRUD, Recommendation Engine, Reviews & Star Ratings, Favorites, Watch Later, Video Player with Subtitles & Quality Control, Analytics Dashboard, Settings & Customization.

## 📁 Monorepo Structure

```
movieverse-pro/
├── client/          # Next.js Frontend App
├── server/          # Express REST API Server
├── docs/            # Project & API Documentation
├── .env.example     # Environment variable template
└── package.json     # Workspace management
```

## 🛠️ Quick Start

1. **Install Dependencies**
   ```bash
   npm run install:all
   ```

2. **Configure Environment Variables**
   Copy `.env.example` to `server/.env` and update the values.

3. **Run Development Servers**
   ```bash
   npm run dev
   ```
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:5000`
