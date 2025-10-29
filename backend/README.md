# 🚀 FlowDeck API

A production-ready FlowDeck backend with multi-tenant architecture, built with Node.js, Express, TypeScript, Prisma, and PostgreSQL.

## ✨ Features

- 🔐 **JWT Authentication** - Access & refresh token system
- 🏢 **Multi-tenant Architecture** - Complete data isolation
- 📋 **Kanban Boards** - Boards, Lists, Cards with drag-drop
- 💬 **Comments** - Threaded discussions on cards
- 🏷️ **Tags** - Colored labels for organization
- 📊 **Activity Logging** - Complete audit trail
- ✅ **Type-safe Validation** - Zod input validation
- 🎯 **Error Handling** - Centralized error management
- 📝 **Professional Logging** - Winston logger with file rotation

## 🛠️ Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Logging:** Winston

## 📦 Installation

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

1. **Clone the repository**
   git clone <your-repo-url>
   cd flowdeck/backend

2. **Install dependencies**
   npm install

3. **Set up environment variables**
   cp .env.example .env

4. **Start PostgreSQL with Docker**
   docker compose up -d postgres

5. **Run database migrations**
   npx prisma migrate dev

6. **Start development server**
   npm run dev

## 🏗️ Project Structure

    backend/
    ├── src/
    │ ├── config/ # Configuration (logger, etc.)
    │ ├── controllers/ # Request handlers
    │ ├── errors/ # Custom error classes
    │ ├── lib/ # Prisma client
    │ ├── middleware/ # Auth, validation, error handling
    │ ├── routes/ # API routes
    │ ├── services/ # Business logic
    │ ├── utils/ # Helper functions
    │ ├── validators/ # Zod schemas
    │ └── index.ts # App entry point
    ├── prisma/
    │ ├── schema.prisma # Database schema
    │ └── migrations/ # Database migrations
    ├── logs/ # Application logs
    ├── .env # Environment variables (gitignored)
    ├── .env.example # Environment template
    ├── package.json
    └── tsconfig.json

## 🚀 Deployment

### Railway / Render

1. Create PostgreSQL database
2. Set environment variables
3. Deploy from GitHub
4. Run migrations: `npx prisma migrate deploy`

## 🧪 Testing

Run Postman collection or use the provided test scripts.

## 📝 License

MIT

## 👨‍💻 Author

Built by [Sahil Yuvraj Kamble]
