# English Excellence - Course Management System

A modern, comprehensive English course management system built with Next.js 15, TypeScript, Prisma, and NextAuth.js. This system provides a complete solution for managing English language courses, student registrations, class assignments, and attendance tracking.

## 🌟 Features

### Phase 1 (Current Implementation)
- ✅ **Professional Homepage**: Modern landing page showcasing institutional strengths
- ✅ **Authentication System**: Role-based access control (Admin/Teacher/Student)
- ✅ **Database Integration**: Prisma ORM with MySQL database
- ✅ **Responsive Design**: Mobile-first design with shadcn/ui components
- ✅ **Theme System**: Light/dark mode support

### Upcoming Features
- 📚 **Course Registration**: Student course browsing and registration
- 👥 **Class Management**: Admin tools for class assignment and management
- 📅 **Schedule Management**: Class scheduling and calendar integration
- ✅ **Attendance Tracking**: Digital attendance system
- 📊 **Analytics Dashboard**: Progress tracking and reporting

## 🚀 Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js with credentials provider
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+
- MySQL database
- npm/yarn/pnpm

## 🛠️ Installation & Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd english-course-system
```

### 2. Install dependencies
```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup
Copy the environment template and configure your variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/english_course_system"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 👤 Demo Accounts

The system comes with pre-configured demo accounts:

| Role | Email | Password | Access |
|------|-------|----------|---------|
| Admin | admin@example.com | admin123 | Full system access |
| Teacher | teacher.a@example.com | teacher123 | Class management |
| Student | student.c@example.com | student123 | Course registration |

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── homepage/          # Homepage sections
│   ├── layout/            # Layout components
│   ├── providers/         # Context providers
│   └── ui/                # shadcn/ui components
├── lib/                   # Utilities
│   ├── auth.ts           # NextAuth configuration
│   ├── db.ts             # Database connection
│   └── utils.ts          # Helper functions
└── types/                 # TypeScript types
```

## 📚 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run db:studio    # Open Prisma Studio
npm run db:seed      # Seed database with sample data
```

## 🎯 Next Steps

### Phase 2: Course Registration System
- [ ] Course catalog with filtering
- [ ] Student registration workflow
- [ ] Admin class assignment tools

### Phase 3: Schedule & Attendance
- [ ] Calendar integration
- [ ] Attendance tracking
- [ ] Schedule management

---

Built with ❤️ for English Excellence