# 🩺 Medical Annotations

> Mobile-first web system for recording and tracking daily medical notes for patients with integrated AI.

[![CI](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-5B3FFF?logo=anthropic&logoColor=white)](https://claude.ai/claude-code)

🌐 **Live Demo:** [medical-annotations.vercel.app](https://medical-annotations.vercel.app)

📖 **[Leia em Português](README.PT.md)**

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Demo Account](#-demo-account)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

## 🎯 About

Med Notes is a Progressive Web App (PWA) developed for healthcare professionals to record and track daily medical notes for their patients. With a mobile-first design and offline functionality, it enables continuous monitoring of important metrics such as mood, sleep patterns, and specific events throughout the day.

### Highlights

✨ **Installable PWA** - Works like a native app on mobile devices
🤖 **Integrated AI** - Medical summaries with Groq (LLaMA 3.3 70B)
🔒 **Secure Multi-tenant** - Complete data isolation per user
📊 **Dashboard Analytics** - Visualize statistics and trends
📱 **Mobile-First** - Interface optimized for mobile devices
🎨 **Dark Mode** - Modern dark theme design
📄 **PDF Export** - Generate professional reports
🏷️ **Flexible Tags** - Organize notes with custom tags
💊 **Medication Management** - Complete change history tracking
⚡ **Built with Claude Code** - AI-powered development assistant

## ✨ Features

### Patient Management
- ✅ Complete registration with name and date of birth
- ✅ Paginated list with search
- ✅ Complete history viewing
- ✅ Edit and delete with confirmation
- ✅ Data isolation per user (RLS)

### Daily Notes
- ✅ Record date, sleep times, and mood
- ✅ Extra details field with free text
- ✅ Tag system (pre-defined + custom)
- ✅ 30 character limit per tag
- ✅ Timeline visualization
- ✅ Edit and delete

### Hourly Records
- ✅ Events at specific times of the day
- ✅ Add/remove dynamically
- ✅ Automatic sorting by time
- ✅ Integrated with daily notes

### Medication Management
- ✅ Active/inactive medication registration
- ✅ Dosage, frequency, and observations
- ✅ Complete change history
- ✅ Reason for changes recorded
- ✅ Automatic addition to notes
- ✅ Complete temporal tracking

### AI Summaries
- ✅ Professional medical summary generation
- ✅ Integration with Groq (LLaMA 3.3 70B)
- ✅ Custom period filtering
- ✅ Specific tag filtering
- ✅ Rendered markdown format
- ✅ Pattern and trend analysis

### Dashboard & Analytics
- ✅ Total patients, notes, and records
- ✅ Last 5 created notes
- ✅ Top 5 most active patients
- ✅ Last 7 days chart
- ✅ Period filters (7/30/90 days)

### Export & Reports
- ✅ Professional PDF export
- ✅ Date period filtering
- ✅ Specific tag filtering
- ✅ Brazilian timezone support (GMT-3)
- ✅ Automatic record deduplication

### Authentication & Security
- ✅ Login/Register with Supabase Auth
- ✅ Email verification
- ✅ Row Level Security (RLS)
- ✅ Complete isolation between users
- ✅ CSRF and XSS protection

### PWA Features
- ✅ Installable on iOS/Android/Desktop
- ✅ Icons and splash screens
- ✅ Service Worker in production
- ✅ Configured manifest

## 🛠 Tech Stack

### Frontend
```
Next.js 15.1.5      App Router + Server Components
React 19            Concurrent Features
TypeScript 5        Type Safety
Tailwind CSS 4      Utility-First Styling
React Query         Server State Management
React Hook Form     Form Management
Zod                 Schema Validation
Lucide React        Icon System
date-fns            Date Manipulation (+ timezone support)
jsPDF               PDF Generation
```

### Backend & Database
```
Next.js API Routes  Serverless Functions
PostgreSQL          Primary Database
Prisma 6.19         ORM & Migrations
Supabase            Auth + Database + RLS
```

### AI & Analysis
```
Groq SDK            AI API Client
LLaMA 3.3 70B       Large Language Model
Markdown            Formatted Summaries
```

### Testing & Quality
```
Jest                Unit Testing (67 tests)
React Testing Lib   Component Testing
Playwright          E2E Testing (30 tests)
GitHub Actions      CI/CD Pipeline
ESLint              Code Linting
```

### DevOps
```
Vercel              Production Hosting
GitHub Actions      Automated Testing
Supabase            Database Hosting
```

## 🎭 Demo Account

**For recruiters and evaluators:** A test account is available to explore the app!

```
Email: teste@teste.com
Password: 12345678
```

This account includes sample patients with medical notes, medications, and realistic data for evaluation.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- Supabase account (free)

### 1. Clone the Repository

```bash
git clone https://github.com/felippe-fernandes/medical_annotations.git
cd medical_annotations
```

### 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings** > **Database** > **Connection String**
3. Copy the **URI** (format: `postgresql://postgres:...`)
4. Go to **Settings** > **API** and copy:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Groq AI (optional - for AI summaries)
GROQ_API_KEY="your-groq-api-key"
```

**Get Groq API Key (free):**
1. Visit [console.groq.com](https://console.groq.com)
2. Create an account
3. Go to **API Keys** and generate a new key

### 4. Install Dependencies

```bash
npm install
```

### 5. Configure Database

Run the complete SQL migration in Supabase **SQL Editor**:

```bash
# The file is at: supabase_complete_migration.sql
```

Or use Prisma to create tables:

```bash
npx prisma db push
```

### 6. Run in Development

```bash
npm run dev
```

Access: **http://localhost:3000**

## 📁 Project Structure

```
medical_annotations/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── ai/resumo/        # AI summaries (Groq)
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── medications/      # Medications CRUD
│   │   ├── notes/            # Daily notes CRUD
│   │   ├── patients/         # Patients CRUD
│   │   └── tags/             # Tags API
│   ├── dashboard/            # Dashboard page
│   ├── login/                # Authentication
│   ├── patients/             # Patient management
│   └── register/             # User registration
├── components/               # React Components
│   ├── dashboard/            # Dashboard components
│   ├── layout/               # Layout components
│   ├── medications/          # Medication manager
│   ├── notes/                # Note forms & views
│   ├── patients/             # Patient components
│   ├── pdf/                  # PDF export
│   ├── providers/            # React Query provider
│   └── ui/                   # Reusable UI
├── lib/                      # Utilities
│   ├── dateUtils.ts          # Date helpers
│   ├── pdf-export.ts         # PDF generation
│   ├── prisma.ts             # Prisma client
│   ├── supabase/             # Supabase setup
│   └── utils/                # API utilities
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── scripts/
│   └── build-mobile.js       # Mobile build script
├── e2e/                      # E2E tests (Playwright)
└── public/                   # Static assets
```

## 🗄 Database Schema

```prisma
model Patient {
  id             String       @id @default(cuid())
  userId         String       // Supabase user ID
  nome           String
  dataNascimento DateTime?
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt
  dailyNotes     DailyNote[]
  medications    Medication[]

  @@index([userId])
  @@map("patients")
}

model DailyNote {
  id             String       @id @default(cuid())
  data           DateTime     @default(now())
  horaDormiu     String?      // "22:30"
  horaAcordou    String?      // "07:00"
  humor          Int?         // 1-5
  detalhesExtras String?      @db.Text
  tags           String[]     @default([]) // Max 30 chars each
  createdAt      DateTime     @default(now())
  updatedAt      DateTime     @updatedAt

  patientId      String
  patient        Patient      @relation(...)
  hourlyNotes    HourlyNote[]

  @@index([patientId])
  @@index([data])
  @@map("daily_notes")
}

model HourlyNote {
  id          String    @id @default(cuid())
  hora        String    // "08:00"
  descricao   String    @db.Text
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  dailyNoteId String
  dailyNote   DailyNote @relation(...)

  @@index([dailyNoteId])
  @@map("hourly_notes")
}

model Medication {
  id          String              @id @default(cuid())
  nome        String
  dosagem     String
  frequencia  String
  observacoes String?
  ativo       Boolean             @default(true)
  createdAt   DateTime            @default(now())
  updatedAt   DateTime            @updatedAt

  patientId   String
  patient     Patient             @relation(...)
  changes     MedicationChange[]

  @@index([patientId])
  @@index([ativo])
  @@map("medications")
}

model MedicationChange {
  id            String     @id @default(cuid())
  campo         String     // nome, dosagem, frequencia, observacoes, ativo
  valorAnterior String?
  valorNovo     String
  motivo        String?
  createdAt     DateTime   @default(now())

  medicationId  String
  medication    Medication @relation(...)

  @@index([medicationId])
  @@index([createdAt])
  @@map("medication_changes")
}
```

### Row Level Security (RLS)

All tables have RLS policies that ensure:
- Users see only their own patients
- Notes are accessible only by the patient's owner
- Hourly records follow the same rule

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

**Current coverage:** 80%+ on critical components

### E2E Tests (Playwright)

```bash
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # UI mode
npm run test:e2e:headed     # Headed mode
npm run test:e2e:debug      # Debug mode
```

**30 E2E tests** covering main flows.

### CI/CD

All tests run automatically on GitHub Actions:
- ✅ Unit tests
- ✅ E2E tests
- ✅ Build verification
- ✅ TypeScript check

## 🚢 Deployment

### Vercel (Recommended)

1. Fork this repository
2. Connect to [Vercel](https://vercel.com)
3. Configure **Environment Variables**
4. Automatic deploy on every push

### Manual Build

```bash
npm run build
npm start
```

## 📝 Useful Commands

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm start                  # Start production server

# Database
npx prisma studio          # Visual database editor
npx prisma db push         # Push schema changes
npx prisma generate        # Regenerate client
npx prisma migrate dev     # Create migration

# Testing
npm test                   # Unit tests
npm run test:e2e          # E2E tests
npm run lint              # Lint code

# Seed
npm run seed              # Seed database (if needed)
```

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch: `git checkout -b feature/MyFeature`
3. Commit: `git commit -m 'Add: MyFeature'`
4. Push: `git push origin feature/MyFeature`
5. Open a Pull Request

### Guidelines

- Follow existing code patterns
- Add tests for new features
- Update documentation when necessary
- Use semantic commits (feat, fix, docs, etc)

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## 🤖 AI-Assisted Development

This project was developed with the assistance of AI tools **for study and learning purposes**:

- **[Claude Code](https://claude.com/claude-code)** - Development assistant that helped with feature implementation, testing, and project architecture
- **[Groq](https://groq.com)** - Ultra-fast inference API with LLaMA 3.3 70B for generating professional medical summaries

> **📚 Educational Purpose:** This project serves as a practical example of how AI-powered development tools can accelerate learning and implementation of modern web technologies.

### How AI was used

1. **Architecture & Design**
   - Database structure planning
   - Code pattern definitions
   - Multi-tenant architecture design

2. **Implementation**
   - React component development
   - API route creation
   - Supabase and Prisma integration
   - Authentication and RLS system

3. **Advanced Features**
   - PDF generation with jsPDF
   - Groq integration for AI summaries
   - Medication management system
   - React Query for request optimization

4. **Testing & Quality**
   - 67 unit tests with Jest
   - 30 E2E tests with Playwright
   - CI/CD with GitHub Actions

5. **Documentation**
   - Complete README
   - Deployment guides
   - Testing documentation

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React Framework
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting & Deploy
- [Prisma](https://www.prisma.io/) - TypeScript ORM
- [Groq](https://groq.com) - Ultra-fast AI inference
- [Anthropic Claude](https://claude.ai) - Development Assistant

---

**Built with ❤️ for healthcare professionals**

🤖 *Project developed with [Claude Code](https://claude.com/claude-code) and summaries generated by [Groq LLaMA 3.3](https://groq.com)*
