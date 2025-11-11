# 🩺 Medical Annotations

> Sistema web mobile-first para registro e acompanhamento de anotações médicas diárias de pacientes.

[![CI](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 📖 Índice

- [Sobre](#-sobre)
- [Funcionalidades](#-funcionalidades)
- [Stack Tecnológica](#-stack-tecnológica)
- [Início Rápido](#-início-rápido)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Database Schema](#-database-schema)
- [Testes](#-testes)
- [Deploy](#-deploy)
- [Contribuindo](#-contribuindo)

## 🎯 Sobre

Med Notes é uma aplicação Progressive Web App (PWA) desenvolvida para profissionais de saúde registrarem e acompanharem anotações médicas diárias de seus pacientes. Com design mobile-first e funcionalidade offline, permite o acompanhamento contínuo de métricas importantes como humor, padrões de sono e eventos específicos ao longo do dia.

### Destaques

✨ **PWA Instalável** - Funciona como app nativo no celular
🔒 **Multi-tenant Seguro** - Isolamento total de dados por usuário
📊 **Dashboard Analytics** - Visualize estatísticas e tendências
📱 **Mobile-First** - Interface otimizada para dispositivos móveis
🎨 **Dark Mode** - Design moderno em tema escuro
📄 **Export PDF** - Gere relatórios profissionais
🏷️ **Tags Flexíveis** - Organize anotações com tags personalizadas

## ✨ Funcionalidades

### Gestão de Pacientes
- ✅ Cadastro completo com nome e data de nascimento
- ✅ Lista paginada com busca
- ✅ Visualização de histórico completo
- ✅ Edição e exclusão com confirmação
- ✅ Isolamento de dados por usuário (RLS)

### Anotações Diárias
- ✅ Registro de data, horários de sono e humor
- ✅ Campo de detalhes extras com texto livre
- ✅ Sistema de tags (pré-definidas + personalizadas)
- ✅ Limite de 30 caracteres por tag
- ✅ Visualização em timeline
- ✅ Edição e exclusão

### Registros Horários
- ✅ Eventos em horários específicos do dia
- ✅ Adicionar/remover dinamicamente
- ✅ Ordenação automática por horário
- ✅ Integrado às anotações diárias

### Dashboard & Analytics
- ✅ Total de pacientes, anotações e registros
- ✅ Últimas 5 anotações criadas
- ✅ Top 5 pacientes mais ativos
- ✅ Gráfico dos últimos 7 dias
- ✅ Filtros por período (7/30/90 dias)

### Export & Relatórios
- ✅ Exportação em PDF profissional
- ✅ Filtro por período de datas
- ✅ Filtro por tags específicas
- ✅ Suporte a timezone brasileiro (GMT-3)
- ✅ Deduplicação automática de registros

### Autenticação & Segurança
- ✅ Login/Registro com Supabase Auth
- ✅ Verificação de email
- ✅ Row Level Security (RLS)
- ✅ Isolamento completo entre usuários
- ✅ Proteção contra CSRF e XSS

### PWA Features
- ✅ Instalável em iOS/Android/Desktop
- ✅ Ícones e splash screens
- ✅ Service Worker em produção
- ✅ Manifest configurado

## 🛠 Stack Tecnológica

### Frontend
```
Next.js 16          App Router + Server Components
React 19            Concurrent Features
TypeScript 5        Type Safety
Tailwind CSS 4      Utility-First Styling
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
Prisma 6            ORM & Migrations
Supabase            Auth + Hosting + RLS
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

## 🚀 Início Rápido

### Pré-requisitos

- Node.js 20+ e npm
- Conta Supabase (gratuita)

### 1. Clone o Repositório

```bash
git clone https://github.com/felippe-fernandes/medical_annotations.git
cd medical_annotations
```

### 2. Configure o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. Vá em **Settings** > **Database** > **Connection String**
3. Copie a **URI** (formato: `postgresql://postgres:...`)
4. Vá em **Settings** > **API** e copie:
   - `Project URL` (NEXT_PUBLIC_SUPABASE_URL)
   - `anon public` key (NEXT_PUBLIC_SUPABASE_ANON_KEY)

### 3. Configure Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite `.env` com suas credenciais:

```env
# Database
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Instale Dependências

```bash
npm install
```

### 5. Configure o Banco de Dados

Execute a migration SQL completa no **SQL Editor** do Supabase:

```bash
# O arquivo está em: supabase_complete_migration.sql
```

Ou use Prisma para criar as tabelas:

```bash
npx prisma db push
```

### 6. Execute em Desenvolvimento

```bash
npm run dev
```

Acesse: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
medical_annotations/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── dashboard/        # Dashboard stats
│   │   ├── notes/            # Daily notes CRUD
│   │   ├── patients/         # Patients CRUD
│   │   └── tags/             # Tags API (deprecated)
│   ├── dashboard/            # Dashboard page
│   ├── login/                # Authentication
│   ├── patients/             # Patient management
│   └── register/             # User registration
├── components/               # React Components
│   ├── layout/               # Layout components
│   ├── notes/                # Note forms & views
│   ├── patients/             # Patient components
│   ├── pdf/                  # PDF export
│   └── ui/                   # Reusable UI
├── lib/                      # Utilities
│   ├── dateUtils.ts          # Date helpers
│   ├── pdf-export.ts         # PDF generation
│   ├── prisma.ts             # Prisma client
│   └── supabase/             # Supabase setup
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed data
├── e2e/                      # E2E tests (Playwright)
└── public/                   # Static assets
```

## 🗄 Database Schema

```prisma
model Patient {
  id             String      @id @default(cuid())
  userId         String      // Supabase user ID
  nome           String
  dataNascimento DateTime?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  dailyNotes     DailyNote[]

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
```

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS que garantem:
- Usuários veem apenas seus próprios pacientes
- Anotações são acessíveis apenas pelo dono do paciente
- Registros horários seguem a mesma regra

## 🧪 Testes

### Unit Tests (Jest)

```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

**Cobertura atual:** 80%+ em componentes críticos

### E2E Tests (Playwright)

```bash
npm run test:e2e            # Run E2E tests
npm run test:e2e:ui         # UI mode
npm run test:e2e:headed     # Headed mode
npm run test:e2e:debug      # Debug mode
```

**30 testes E2E** cobrindo fluxos principais.

### CI/CD

Todos os testes rodam automaticamente no GitHub Actions:
- ✅ Unit tests
- ✅ E2E tests
- ✅ Build verification
- ✅ TypeScript check

## 🚢 Deploy

### Vercel (Recomendado)

1. Fork este repositório
2. Conecte no [Vercel](https://vercel.com)
3. Configure as **Environment Variables**
4. Deploy automático a cada push

### Build Manual

```bash
npm run build
npm start
```

## 📝 Comandos Úteis

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

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/MinhaFeature`
3. Commit: `git commit -m 'Add: MinhaFeature'`
4. Push: `git push origin feature/MinhaFeature`
5. Abra um Pull Request

### Guidelines

- Siga o padrão de código existente
- Adicione testes para novas features
- Atualize a documentação quando necessário
- Use commits semânticos (feat, fix, docs, etc)

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](LICENSE) para mais detalhes.

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Vercel](https://vercel.com/)
- [Prisma](https://www.prisma.io/)

---

**Desenvolvido com ❤️ para profissionais de saúde**

🤖 *Este projeto utiliza [Claude Code](https://claude.com/claude-code) para desenvolvimento assistido por IA*
