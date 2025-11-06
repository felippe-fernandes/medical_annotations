# 🩺 Medical Annotations

Sistema web mobile-first para registro e acompanhamento de anotações médicas diárias de pacientes.

[![CI](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/ci.yml)
[![E2E Tests](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/e2e.yml)
[![CodeQL](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/codeql.yml/badge.svg)](https://github.com/felippe-fernandes/medical_annotations/actions/workflows/codeql.yml)

## Funcionalidades

### ✅ Implementado

- **Dashboard**
  - Estatísticas gerais (total de pacientes, anotações, registros horários)
  - Últimas anotações criadas
  - Pacientes mais ativos
  - Anotações dos últimos 7 dias
  - Navegação rápida

- **Gestão de Pacientes**
  - Cadastrar pacientes com nome e data de nascimento
  - Listar todos os pacientes
  - Ver detalhes e histórico de cada paciente
  - Editar informações do paciente
  - Excluir paciente (com confirmação)

- **Anotações Diárias**
  - Registrar data da anotação
  - Hora que dormiu / acordou
  - Humor (escala visual de 1-5 com emojis)
  - Campo de detalhes extras (texto livre)
  - Visualizar anotações em formato de timeline
  - Editar anotação existente
  - Excluir anotação (com confirmação)

- **Registros por Hora**
  - Adicionar registros em horários específicos do dia
  - Cada registro contém hora e descrição
  - Adicionar/remover registros dinamicamente
  - Listagem ordenada por horário

- **Navegação Mobile**
  - Bottom navigation bar responsivo
  - Interface otimizada para mobile
  - Navegação entre Dashboard e Pacientes

- **PWA (Progressive Web App)**
  - Instalável no celular/desktop
  - Ícone na tela inicial
  - Manifest configurado
  - Service Worker (em produção)

- **Autenticação & Segurança**
  - Login/Registro com Supabase Auth
  - Email verification
  - Multi-usuário com isolamento de dados
  - Row Level Security (RLS)
  - Toast notifications

- **Testes**
  - 67 testes unitários (Jest + React Testing Library)
  - 30 testes E2E (Playwright)
  - Cobertura de código > 80%
  - CI/CD com GitHub Actions

### 🚀 Próximas Features (Sugeridas)

- Gráficos de evolução (humor, padrões de sono)
- Filtros avançados (por data, paciente, humor)
- Export de dados (PDF, CSV)
- Modo offline completo
- Tags/categorias para anotações
- Busca em texto completo
- Notificações push

## Stack Tecnológica

### Frontend
- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS** - Styling
- **React Hook Form** + **Zod** - Form validation
- **Lucide React** - Icons
- **date-fns** - Date manipulation
- **React Hot Toast** - Notifications
- **React DatePicker** - Date selection

### Backend & Database
- **Next.js API Routes** - Serverless functions
- **PostgreSQL** - Database (Supabase)
- **Prisma** - ORM
- **Supabase Auth** - Authentication

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **67 Unit Tests** + **30 E2E Tests**

### DevOps
- **GitHub Actions** - CI/CD pipeline
- **Vercel** - Deployment
- **CodeQL** - Security analysis
- **Dependabot** - Dependency updates

## Configuração do Projeto

### 1. Pré-requisitos

- Node.js 20+
- npm ou yarn
- Conta no Supabase (gratuita)

### 2. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova conta ou faça login
3. Clique em "New Project"
4. Preencha:
   - Nome do projeto: `medical-annotations`
   - Database Password: (crie uma senha forte)
   - Region: escolha a mais próxima
5. Aguarde o projeto ser criado (~2 minutos)

### 3. Obter Credenciais do Supabase

1. No dashboard do Supabase, vá em **Settings** > **Database**
2. Na seção **Connection String**, copie a URL de conexão:
   - Selecione o modo **URI**
   - Copie a string que começa com `postgresql://`
   - Substitua `[YOUR-PASSWORD]` pela senha que você criou

### 4. Configurar Variáveis de Ambiente

1. Copie o arquivo de exemplo:
   ```bash
   cp .env.example .env
   ```

2. Edite o arquivo `.env` e cole sua DATABASE_URL:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```

### 5. Instalar Dependências

```bash
npm install
```

### 6. Criar Tabelas no Banco de Dados

```bash
npx prisma db push
```

Este comando irá:
- Conectar ao Supabase
- Criar as tabelas: `patients`, `daily_notes`, `hourly_notes`
- Gerar o Prisma Client

### 7. Executar em Desenvolvimento

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

## Estrutura do Banco de Dados

### Modelo de Dados

```
Patient (Paciente)
├── id: String (UUID)
├── nome: String
├── dataNascimento: DateTime (opcional)
├── createdAt: DateTime
└── dailyNotes: DailyNote[]

DailyNote (Anotação Diária)
├── id: String (UUID)
├── data: DateTime
├── horaDormiu: String (formato "HH:mm")
├── horaAcordou: String (formato "HH:mm")
├── humor: Int (1-5)
├── detalhesExtras: Text
├── patientId: String (FK)
├── patient: Patient
└── hourlyNotes: HourlyNote[]

HourlyNote (Registro Horário)
├── id: String (UUID)
├── hora: String (formato "HH:mm")
├── descricao: Text
├── dailyNoteId: String (FK)
└── dailyNote: DailyNote
```

## Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build de produção
npm run build
npm start

# Prisma
npx prisma studio          # Interface visual do banco
npx prisma db push         # Aplicar mudanças no schema
npx prisma generate        # Regenerar Prisma Client

# Lint
npm run lint
```

## Fluxo de Uso

1. **Cadastrar Paciente**: Acesse a lista de pacientes e clique em "Novo"
2. **Criar Anotação**: Na página do paciente, clique em "Nova Anotação"
3. **Preencher Dados**:
   - Selecione a data
   - Informe horários de sono
   - Escolha o humor (visual)
   - Adicione detalhes extras
4. **Registros por Hora**: Na página da anotação, adicione eventos que ocorreram em horários específicos

## Design Mobile-First

O sistema foi desenvolvido com foco em dispositivos móveis:

- Layout responsivo
- Botões grandes e touch-friendly
- Formulários otimizados para mobile
- Interface limpa e intuitiva
- Cores e ícones para facilitar visualização rápida

## Personalização

### Escala de Humor

Atualmente usa escala de 1-5 com emojis. Para alterar:

Edite: `components/notes/DailyNoteForm.tsx` e `app/patients/[id]/notes/[noteId]/page.tsx`

### Campos Adicionais

Para adicionar novos campos:

1. Atualize o schema Prisma em `prisma/schema.prisma`
2. Execute `npx prisma db push`
3. Atualize os formulários e páginas correspondentes

## Problemas Comuns

### Erro de conexão com banco
- Verifique se a DATABASE_URL está correta
- Confirme que o projeto Supabase está ativo
- Teste a conexão: `npx prisma db push`

### Erro ao criar Prisma Client
- Execute: `npx prisma generate`
- Reinicie o servidor de desenvolvimento

## Licença

MIT

## Suporte

Para dúvidas ou sugestões, abra uma issue no repositório.
