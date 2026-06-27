# 🔥 DACC — Agnichakra Club Membership Portal

A full-stack web application for the **Agnichakra Club** membership management system.

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** — React framework with App Router
- **Tailwind CSS** — Utility-first CSS framework
- **React 18** — UI library

### Backend
- **Express.js** — Node.js web framework
- **MongoDB + Mongoose** — Database & ODM
- **JWT** — Authentication
- **Resend** — Email service
- **Helmet + Rate Limiting** — Security middleware

## 📁 Project Structure

```
agnichakra/
├── frontend/           # Next.js frontend
│   ├── app/            # App Router pages
│   ├── components/     # Reusable UI components
│   └── lib/            # API utilities
├── backend/            # Express.js API
│   ├── models/         # Mongoose schemas
│   ├── routes/         # API route handlers
│   ├── middleware/     # Auth middleware
│   ├── lib/            # Email & plan utilities
│   └── server.js       # Entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance
- Resend API key (for emails)

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env    # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local    # Configure your environment variables
npm run dev
```

### ☁️ Vercel Deployment Settings
When deploying the frontend on Vercel, configure the project settings as follows:
- **Root Directory**: `frontend`
- **Framework Preset**: `Next.js`

## 🔐 Environment Variables

### Backend (`.env`)
- `MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `FRONTEND_URL` — Frontend URL for CORS
- `RESEND_API_KEY` — Resend email service API key

### Frontend (`.env.local`)
- `NEXT_PUBLIC_API_URL` — Backend API URL
- `NEXT_PUBLIC_CLUB_UPI` — Club UPI ID for payments
- `NEXT_PUBLIC_CLUB_NAME` — Club display name

## 📝 API Endpoints

| Route | Description |
|-------|-------------|
| `/api/v1/auth` | Authentication (login/register) |
| `/api/v1/members` | Member management |
| `/api/v1/payments` | Payment processing |
| `/api/v1/notifications` | Notification system |
| `/api/v1/messages` | Messaging system |
| `/api/v1/panel` | Admin panel |
| `/api/v1/terms` | Terms & conditions |

## 📄 License

This project is private and proprietary to Agnichakra Club.
