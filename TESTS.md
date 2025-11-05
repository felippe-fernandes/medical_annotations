# Testes Unitários - Medical Annotations

Este projeto inclui uma suite completa de testes unitários para backend (APIs) e frontend (componentes React).

## 🎯 Objetivo de Cobertura

- **Meta**: 80% de cobertura de código
- **Tipos de testes**: Unit tests para APIs e componentes
- **Framework**: Jest + React Testing Library

## 📦 Dependências Instaladas

```json
{
  "@testing-library/react": "^16.3.0",
  "@testing-library/jest-dom": "^6.9.1",
  "@testing-library/user-event": "^14.6.1",
  "jest": "^30.2.0",
  "jest-environment-jsdom": "^30.2.0",
  "@types/jest": "^30.0.0"
}
```

## 🏗️ Estrutura de Testes

### Backend (APIs)

#### `/api/patients`
- ✅ GET - Listar pacientes (com autenticação)
- ✅ POST - Criar paciente
- ✅ Validação de userId
- ✅ Tratamento de erros

**Arquivo**: `app/api/patients/__tests__/route.test.ts`

**Cenários testados**:
- Retorna 401 sem autenticação
- Lista apenas pacientes do usuário autenticado
- Cria paciente com userId correto
- Valida campos obrigatórios (nome)
- Permite data de nascimento opcional
- Trata erros de banco de dados

#### `/api/patients/[id]`
- ✅ GET - Buscar paciente por ID
- ✅ PUT - Atualizar paciente
- ✅ DELETE - Deletar paciente
- ✅ Verificação de propriedade (userId)

**Arquivo**: `app/api/patients/[id]/__tests__/route.test.ts`

**Cenários testados**:
- Verifica autenticação em todas operações
- Retorna 404 se paciente não pertence ao usuário
- Atualiza dados corretamente
- Deleta apenas se pertence ao usuário
- Trata erros de banco

#### `/api/notes`
- ✅ POST - Criar anotação diária
- ✅ Verificação de paciente do usuário
- ✅ Validação de anotação duplicada
- ✅ Suporte a tags

**Arquivo**: `app/api/notes/__tests__/route.test.ts`

**Cenários testados**:
- Verifica autenticação
- Valida que paciente pertence ao usuário
- Impede anotações duplicadas no mesmo dia
- Permite campos opcionais (humor, sono, etc)
- Permite associar tags
- Trata erros de validação

### Frontend (Componentes)

#### `PatientForm`
- ✅ Modo criação e edição
- ✅ Validação de formulário
- ✅ Integração com API
- ✅ Feedback de erros

**Arquivo**: `components/patients/__tests__/PatientForm.test.tsx`

**Cenários testados**:
- Renderiza formulário vazio (modo criar)
- Renderiza com dados iniciais (modo editar)
- Valida campo nome obrigatório
- Remove espaços em branco do nome
- Envia dados corretamente para API
- Mostra erros da API
- Desabilita botão durante envio
- Permite data de nascimento opcional

#### `Logo`
- ✅ Renderização com diferentes tamanhos
- ✅ Estilos corretos

**Arquivo**: `components/layout/__tests__/Logo.test.tsx`

#### `DeleteButton`
- ✅ Confirmação antes de deletar
- ✅ Integração com diferentes tipos (patient, note, tag)
- ✅ Feedback de erros
- ✅ Estado de loading

**Arquivo**: `components/ui/__tests__/DeleteButton.test.tsx`

**Cenários testados**:
- Mostra diálogo de confirmação
- Não deleta se usuário cancelar
- Deleta paciente corretamente
- Deleta nota corretamente
- Deleta tag corretamente
- Trata erros de API
- Desabilita botão durante deleção

### Utilitários

#### `dateUtils`
- ✅ parseLocalDate - Converte string para Date
- ✅ formatLocalDate - Converte Date para string
- ✅ adjustToLocalTimezone - Ajusta fuso horário GMT-3

**Arquivo**: `lib/__tests__/dateUtils.test.ts`

**Cenários testados**:
- Parse de datas em formato YYYY-MM-DD
- Formatação de dates para YYYY-MM-DD
- Suporte a anos bissextos
- Ajuste de timezone UTC-3 (Brasil)
- Não mutação de objetos originais

## 🧪 Como Rodar os Testes

### Rodar todos os testes
```bash
npm test
```

### Rodar em modo watch
```bash
npm run test:watch
```

### Gerar relatório de cobertura
```bash
npm run test:coverage
```

## 📊 Cobertura de Código

O Jest está configurado para exigir no mínimo:
- **80% cobertura de branches**
- **80% cobertura de funções**
- **80% cobertura de linhas**
- **80% cobertura de statements**

Arquivos incluídos na cobertura:
- `app/**/*.{js,jsx,ts,tsx}`
- `components/**/*.{js,jsx,ts,tsx}`
- `lib/**/*.{js,jsx,ts,tsx}`

Arquivos excluídos:
- Arquivos de tipo (`.d.ts`)
- Layouts do Next.js
- Loading/Error pages
- Stories do Storybook
- node_modules

## 🔧 Configuração

### jest.config.js
Configuração principal do Jest com integração Next.js

### jest.setup.js
Mocks globais:
- Next.js Router
- Supabase Client/Server
- Prisma
- Request/Response globais

## 🎯 Padrões de Teste

### APIs
```typescript
describe('/api/endpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    // Mock sem usuário
    // Chamar API
    // Verificar status 401
  })

  it('should filter by userId', async () => {
    // Mock com usuário
    // Chamar API
    // Verificar filtro userId aplicado
  })
})
```

### Componentes
```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    render(<ComponentName />)
    expect(screen.getByRole('button')).toBeInTheDocument()
  })

  it('should handle user interaction', async () => {
    render(<ComponentName />)
    await userEvent.click(screen.getByRole('button'))
    // Verificar comportamento
  })
})
```

## 📝 Próximos Passos

Para atingir 100% de cobertura, adicionar testes para:

1. **APIs faltantes**:
   - `/api/notes/[id]` (GET, PUT, DELETE)
   - `/api/notes/[id]/hourly` (POST)
   - `/api/notes/[id]/hourly/[hourlyId]` (DELETE)
   - `/api/tags` (GET, POST)
   - `/api/tags/[id]` (PUT, DELETE)
   - `/api/dashboard/stats` (GET)

2. **Componentes faltantes**:
   - `DailyNoteForm`
   - `StartDailyNote`
   - `ExportPDFButton`
   - `BottomNav`

3. **Páginas**:
   - Login/Register pages
   - Dashboard page
   - Patient pages
   - Note pages

4. **Integração E2E**:
   - Playwright ou Cypress para testes end-to-end
   - Testar fluxos completos de usuário

## 🐛 Debugging

### Ver output detalhado
```bash
npm test -- --verbose
```

### Rodar teste específico
```bash
npm test -- PatientForm
```

### Ver apenas testes falhando
```bash
npm test -- --onlyFailures
```

## 📚 Recursos

- [Jest Documentation](https://jestjs.io/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
