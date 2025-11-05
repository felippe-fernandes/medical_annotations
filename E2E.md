# Testes E2E (End-to-End) - Medical Annotations

Este projeto utiliza **Playwright** para testes E2E, testando a aplicação completa do ponto de vista do usuário.

## 🎯 O que são Testes E2E?

Testes End-to-End simulam o comportamento real do usuário, testando:
- Navegação entre páginas
- Interação com formulários
- Autenticação e autorização
- Fluxos completos da aplicação
- Integração com o banco de dados real
- Responsividade e acessibilidade

## 📦 Tecnologias

- **Playwright**: Framework de automação de navegadores
- **TypeScript**: Tipagem para os testes
- **Next.js**: Servidor de desenvolvimento integrado

## 🏗️ Estrutura dos Testes

```
e2e/
├── helpers/
│   └── auth.ts           # Helpers de autenticação
├── auth.spec.ts          # Testes de autenticação
├── patients.spec.ts      # Testes de gerenciamento de pacientes
└── notes.spec.ts         # Testes de dashboard e notas
```

## 🧪 Suites de Testes

### 1. Authentication Flow (`e2e/auth.spec.ts`)

Testa todo o fluxo de autenticação:

✅ **Redirecionamento**
- Usuário não autenticado é redirecionado para `/login`

✅ **Página de Login**
- Exibe logo e branding
- Campos de email e senha visíveis
- Botão de login funcional
- Link para criar conta

✅ **Página de Registro**
- Formulário de criação de conta
- Validação de senhas diferentes
- Validação de senha curta (mínimo 6 caracteres)
- Link para voltar ao login

✅ **Navegação**
- Transição entre login e registro
- Tema escuro aplicado corretamente

**Cenários testados**: 8 testes

### 2. Patient Management (`e2e/patients.spec.ts`)

Testa o CRUD de pacientes:

✅ **Listagem de Pacientes**
- Exibe página com estrutura correta
- Logo e navegação presentes
- Botão "Novo" funcional

✅ **Criação de Paciente**
- Navegação para formulário de novo paciente
- Campos obrigatórios (nome)
- Campo opcional (data de nascimento)
- Validação de formulário vazio
- Botão cancelar

✅ **Interface**
- Estado vazio quando sem pacientes
- Tema escuro
- Navegação inferior em mobile
- Responsividade

**Cenários testados**: 10 testes

### 3. Notes & Dashboard (`e2e/notes.spec.ts`)

Testa dashboard e fluxo de notas:

✅ **Dashboard**
- Exibe estatísticas (pacientes, anotações, humor médio)
- Filtro de período por data
- Cards informativos
- Navegação para pacientes

✅ **Detalhes do Paciente**
- Página de detalhes estruturada
- Lista de anotações diárias
- Botões de ação

✅ **PWA & Meta Tags**
- Manifest.json presente
- Favicon configurado
- Meta tags de viewport e theme-color
- Sem erros críticos no console

✅ **Acessibilidade**
- Links com textos ou aria-labels
- Navegação acessível

**Cenários testados**: 12 testes

### 4. Helpers (`e2e/helpers/auth.ts`)

Funções auxiliares para os testes:

```typescript
// Login programático
await login(page, 'user@example.com', 'password123')

// Logout
await logout(page)

// Verificar autenticação
const isAuth = await isAuthenticated(page)
```

## 🚀 Como Rodar os Testes

### Instalar navegadores (primeira vez apenas)
```bash
npx playwright install
```

### Rodar todos os testes E2E
```bash
npm run test:e2e
```

### Rodar com interface visual (modo UI)
```bash
npm run test:e2e:ui
```

### Rodar em modo headed (ver navegador)
```bash
npm run test:e2e:headed
```

### Modo debug (step-by-step)
```bash
npm run test:e2e:debug
```

### Ver relatório da última execução
```bash
npm run test:e2e:report
```

### Rodar teste específico
```bash
npx playwright test auth.spec.ts
```

### Rodar apenas em um navegador
```bash
npx playwright test --project=chromium
```

## 🎭 Navegadores Suportados

Os testes rodam em múltiplos navegadores e dispositivos:

- **Desktop**: Chromium, Firefox, WebKit (Safari)
- **Mobile**: Chrome (Pixel 5), Safari (iPhone 12)

## 📊 Relatórios

Após rodar os testes, um relatório HTML é gerado automaticamente.

```bash
# Ver último relatório
npm run test:e2e:report
```

O relatório inclui:
- Screenshots de falhas
- Traces para debug
- Tempo de execução
- Resultados por navegador

## ⚙️ Configuração

### `playwright.config.ts`

Principais configurações:

```typescript
{
  testDir: './e2e',              // Pasta dos testes
  fullyParallel: true,           // Testes em paralelo
  retries: 2,                    // Retry em CI
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',     // Trace quando falhar
    screenshot: 'only-on-failure'
  },
  webServer: {
    command: 'npm run dev',      // Inicia servidor automaticamente
    url: 'http://localhost:3000',
    reuseExistingServer: true
  }
}
```

## 🎯 Boas Práticas

### 1. Seletores Robustos
```typescript
// ✅ Bom - usa role e texto
await page.getByRole('button', { name: /entrar/i })

// ✅ Bom - usa label
await page.getByLabel(/email/i)

// ❌ Evitar - frágil
await page.locator('.btn-login')
```

### 2. Esperas Inteligentes
```typescript
// ✅ Bom - espera automática do Playwright
await expect(page.getByText('Sucesso')).toBeVisible()

// ✅ Bom - espera por navegação
await page.waitForURL('/dashboard')

// ❌ Evitar - espera arbitrária
await page.waitForTimeout(1000)
```

### 3. Isolamento de Testes
```typescript
test.beforeEach(async ({ page }) => {
  // Cada teste começa do zero
  await page.goto('/login')
})
```

### 4. Dados de Teste
```typescript
// Use dados consistentes
const testUser = {
  email: 'test@example.com',
  password: 'test123456'
}
```

## 🐛 Debugging

### Ver execução passo a passo
```bash
npm run test:e2e:debug
```

### Gerar trace para análise
```bash
npx playwright test --trace on
```

### Abrir trace viewer
```bash
npx playwright show-trace trace.zip
```

### Inspector do Playwright
O modo debug abre o Playwright Inspector onde você pode:
- Pausar execução
- Step over/into
- Ver DOM e console
- Editar seletores ao vivo

## 📸 Screenshots & Vídeos

### Habilitar vídeo
```typescript
// playwright.config.ts
use: {
  video: 'on-first-retry'
}
```

### Tirar screenshot manual
```typescript
await page.screenshot({ path: 'screenshot.png' })
```

## 🔒 Testes com Autenticação

### Opção 1: Setup Global
```typescript
// global-setup.ts
async function globalSetup() {
  const browser = await chromium.launch()
  const page = await browser.newPage()
  await page.goto('http://localhost:3000/login')
  // Fazer login e salvar estado
  await page.context().storageState({ path: 'auth.json' })
  await browser.close()
}
```

### Opção 2: Fixture
```typescript
test.use({ storageState: 'auth.json' })
```

## ⚠️ Considerações Importantes

### 1. Ambiente de Teste
- Use banco de dados de teste separado
- Considere mockar serviços externos (Supabase)
- Reset do banco entre testes se necessário

### 2. Dados Sensíveis
- **NUNCA** comite credenciais reais
- Use variáveis de ambiente para dados sensíveis
- `.env.test.local` para configurações de teste

### 3. CI/CD
```yaml
# .github/workflows/e2e.yml
- name: Install dependencies
  run: npm ci

- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
```

## 📈 Próximos Passos

Para expandir a cobertura E2E:

1. **Fluxo Completo de Notas**
   - Criar anotação diária
   - Adicionar notas horárias
   - Associar tags
   - Editar anotação
   - Deletar anotação

2. **Gerenciamento de Tags**
   - Criar tag personalizada
   - Editar cor da tag
   - Deletar tag

3. **Filtros e Buscas**
   - Filtrar por data
   - Buscar pacientes
   - Filtrar por tags

4. **Export PDF**
   - Gerar PDF de anotações
   - Verificar conteúdo do PDF

5. **Testes de Performance**
   - Tempo de carregamento
   - First Contentful Paint
   - Time to Interactive

6. **Testes de Acessibilidade**
   - Navegação por teclado
   - Screen readers
   - Contraste de cores

## 📚 Recursos

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Selectors Guide](https://playwright.dev/docs/selectors)
- [Debugging Guide](https://playwright.dev/docs/debug)

## 🎓 Comandos Úteis

```bash
# Gerar testes com codegen
npx playwright codegen http://localhost:3000

# Rodar em modo interativo
npx playwright test --ui

# Ver todos os projetos/navegadores
npx playwright test --list

# Rodar apenas testes marcados
npx playwright test --grep @smoke
```
