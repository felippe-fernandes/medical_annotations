# 🩺 Medical Annotations

> Sistema web mobile-first para registro e acompanhamento de anotações médicas diárias de pacientes com IA integrada.

[![CI](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

🌐 **Deploy:** [medical-annotations.vercel.app](https://medical-annotations.vercel.app)

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
🤖 **IA Integrada** - Resumos médicos com Groq (LLaMA 3.3 70B)
🔒 **Multi-tenant Seguro** - Isolamento total de dados por usuário
📊 **Dashboard Analytics** - Visualize estatísticas e tendências
📱 **Mobile-First** - Interface otimizada para dispositivos móveis
🎨 **Dark Mode** - Design moderno em tema escuro
📄 **Export PDF** - Gere relatórios profissionais
🏷️ **Tags Flexíveis** - Organize anotações com tags personalizadas
💊 **Gestão de Medicamentos** - Histórico completo de alterações

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

### Gestão de Medicamentos
- ✅ Cadastro de medicamentos ativos/inativos
- ✅ Dosagem, frequência e observações
- ✅ Histórico completo de alterações
- ✅ Motivo das mudanças registrado
- ✅ Adição automática às anotações
- ✅ Rastreamento temporal completo

### Resumos com IA
- ✅ Geração de resumos médicos profissionais
- ✅ Integração com Groq (LLaMA 3.3 70B)
- ✅ Filtro por período personalizado
- ✅ Filtro por tags específicas
- ✅ Formato markdown renderizado
- ✅ Análise de padrões e tendências

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

### IA & Análise
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

# Groq AI (opcional - para resumos com IA)
GROQ_API_KEY="your-groq-api-key"
```

**Obter Groq API Key (gratuita):**
1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma conta
3. Vá em **API Keys** e gere uma nova chave

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

## 🤖 Desenvolvimento Assistido por IA

Este projeto foi desenvolvido com auxílio de ferramentas de IA:

- **[Claude Code](https://claude.com/claude-code)** - Assistente de desenvolvimento que ajudou na implementação das funcionalidades, testes e arquitetura do projeto
- **[Groq](https://groq.com)** - API de inferência ultra-rápida com LLaMA 3.3 70B para geração de resumos médicos profissionais

### Como a IA foi utilizada

1. **Arquitetura e Design**
   - Planejamento da estrutura do banco de dados
   - Definição de padrões de código
   - Design da arquitetura multi-tenant

2. **Implementação**
   - Desenvolvimento dos componentes React
   - Criação das API routes
   - Integração com Supabase e Prisma
   - Sistema de autenticação e RLS

3. **Funcionalidades Avançadas**
   - Geração de PDFs com jsPDF
   - Integração com Groq para resumos com IA
   - Sistema de gerenciamento de medicamentos
   - React Query para otimização de requisições

4. **Testes e Qualidade**
   - 67 testes unitários com Jest
   - 30 testes E2E com Playwright
   - CI/CD com GitHub Actions

5. **Documentação**
   - README completo
   - Guias de deployment
   - Documentação de testes

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/) - Framework React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Vercel](https://vercel.com/) - Hosting e Deploy
- [Prisma](https://www.prisma.io/) - ORM TypeScript
- [Groq](https://groq.com) - Inferência de IA ultra-rápida
- [Anthropic Claude](https://claude.ai) - Assistente de desenvolvimento

---

**Desenvolvido com ❤️ para profissionais de saúde**

🤖 *Projeto desenvolvido com [Claude Code](https://claude.com/claude-code) e resumos gerados por [Groq LLaMA 3.3](https://groq.com)*
