# 📱 Guia Completo: Transformar App Web em App Android

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Opções de Conversão](#opções-de-conversão)
- [Etapas de Implementação](#etapas-de-implementação)
- [Requisitos da Play Store](#requisitos-da-play-store)
- [Checklist de Progresso](#checklist-de-progresso)

---

## 🎯 Visão Geral

**Recomendação:** Usar **Capacitor.js** para converter o app web em app Android nativo

**Por quê?**
- ⏱️ **Tempo:** 1-2 semanas (vs 2-3 meses com React Native)
- ♻️ **Reuso de código:** 95% do código atual funciona sem alteração
- 💰 **Custo:** Grátis (exceto $25 da Google Play Developer)
- 🔧 **Risco:** Muito baixo - quase zero bugs novos
- 🚀 **Manutenção:** Mesmo código para web e mobile

---

## 📊 Opções de Conversão

### Opção 1: Capacitor.js ⭐ RECOMENDADO

| Critério | Avaliação |
|----------|-----------|
| **Tempo** | 1-2 semanas |
| **Código Reaproveitado** | 95% |
| **Complexidade** | Baixa |
| **Desempenho** | Bom (WebView otimizado) |
| **Sensação Nativa** | Muito boa |
| **Custo** | Grátis |

**Vantagens:**
- ✅ Quase zero alteração no código existente
- ✅ Mantém Next.js, React, Tailwind, tudo igual
- ✅ Acesso a APIs nativas via plugins
- ✅ Mesmo time pode desenvolver
- ✅ Versão web continua funcionando

**Desvantagens:**
- ⚠️ App um pouco maior (~50-80MB)
- ⚠️ Performance ligeiramente inferior a nativo puro

---

### Opção 2: React Native

| Critério | Avaliação |
|----------|-----------|
| **Tempo** | 6-8 semanas |
| **Código Reaproveitado** | 70% |
| **Complexidade** | Média-Alta |
| **Desempenho** | Excelente |
| **Sensação Nativa** | Nativa |
| **Custo** | Grátis |

**Vantagens:**
- ✅ Performance nativa
- ✅ Melhor para animações complexas
- ✅ Grande ecossistema de libs

**Desvantagens:**
- ❌ Reescrever toda a UI (Tailwind → StyleSheet)
- ❌ Aprender React Native
- ❌ 6-8 semanas de desenvolvimento
- ❌ Mais complexo de manter

---

### Opção 3: PWA Aprimorado (Já existe!)

| Critério | Avaliação |
|----------|-----------|
| **Tempo** | 0 semanas (já funciona) |
| **Código Reaproveitado** | 100% |
| **Complexidade** | Nenhuma |
| **Desempenho** | Bom |
| **Sensação Nativa** | Web-like |
| **Custo** | Grátis |

**Como usar:**
1. Abrir app no Chrome (Android)
2. Menu → "Adicionar à tela inicial"
3. App abre como standalone

**Vantagens:**
- ✅ Já funciona agora
- ✅ Atualizações instantâneas
- ✅ Zero trabalho

**Desvantagens:**
- ❌ Não aparece na Play Store
- ❌ Descoberta limitada
- ❌ Recursos nativos limitados

---

## 🛠️ Etapas de Implementação (Capacitor)

### 📦 Etapa 1: Instalação do Capacitor

**O que fazer:**
```bash
# 1. Instalar dependências
npm install @capacitor/core @capacitor/cli
npm install @capacitor/android

# 2. Inicializar Capacitor
npx cap init

# Vai perguntar:
# - App name: "Anotações Médicas" ou "Med Notes"
# - App ID: "com.seudominio.medannotations" (formato: com.empresa.app)
# - Web directory: "out" (Next.js export)

# 3. Adicionar plataforma Android
npx cap add android
```

**Resultado esperado:**
- Pasta `android/` criada na raiz do projeto
- Arquivo `capacitor.config.ts` criado
- Pasta `out/` será usada para o build

**Tempo:** ~30 minutos

---

### ⚙️ Etapa 2: Configurar Capacitor

**2.1. Configurar Next.js para exportação estática**

Editar `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Adicionar esta linha
  images: {
    unoptimized: true, // Necessário para export estático
  },
};

export default nextConfig;
```

**2.2. Criar arquivo `capacitor.config.ts`**

```typescript
import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.seudominio.medannotations', // Trocar pelo seu domínio
  appName: 'Anotações Médicas',
  webDir: 'out',
  server: {
    androidScheme: 'https',
    // Para desenvolvimento, pode apontar para localhost:
    // url: 'http://192.168.1.X:3000',
    // cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#0f172a", // slate-900
      showSpinner: false,
    },
  },
};

export default config;
```

**2.3. Atualizar package.json com scripts**

Adicionar em `package.json`:
```json
{
  "scripts": {
    "cap:build": "next build && npx cap sync",
    "cap:open:android": "npx cap open android",
    "cap:sync": "npx cap sync"
  }
}
```

**Tempo:** ~30 minutos

---

### 🎨 Etapa 3: Assets Nativos (Ícones e Splash Screen)

**3.1. Criar ícone do app**

Criar arquivo: `public/icon.png` (512x512 pixels)
- Pode ser o logo do app
- Fundo sólido (sem transparência para Android)
- Formato PNG

**3.2. Criar splash screen**

Criar arquivo: `public/splash.png` (2732x2732 pixels)
- Imagem quadrada
- Centralizar logo/texto
- Fundo: `#0f172a` (slate-900, mesmo tema do app)

**3.3. Gerar ícones adaptativos (Android)**

Opções:
1. **Ferramenta online:** https://icon.kitchen/
   - Upload do `icon.png`
   - Baixar pacote Android
   - Copiar para `android/app/src/main/res/`

2. **Plugin Capacitor:**
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

**Estrutura esperada:**
```
android/app/src/main/res/
  ├── mipmap-hdpi/
  ├── mipmap-mdpi/
  ├── mipmap-xhdpi/
  ├── mipmap-xxhdpi/
  └── mipmap-xxxhdpi/
```

**Tempo:** ~1-2 horas

---

### 🏗️ Etapa 4: Build e Teste

**4.1. Build da aplicação**

```bash
# Build Next.js (gera pasta 'out/')
npm run build

# OU usar o script customizado
npm run cap:build
```

**⚠️ IMPORTANTE:** Next.js com `output: 'export'` tem limitações:
- ❌ Não pode usar API Routes (`app/api/**`)
- ❌ Não pode usar Server Components dinâmicos
- ❌ Não pode usar `revalidate`, ISR

**Solução:** Manter API no Vercel/servidor separado
- Backend continua em: `https://seuapp.vercel.app/api/**`
- App mobile faz requisições para lá

**4.2. Atualizar URLs da API**

Criar arquivo `.env.production`:
```env
NEXT_PUBLIC_API_URL=https://seuapp.vercel.app
```

Atualizar chamadas de API:
```typescript
// Antes
const response = await fetch('/api/dashboard/stats');

// Depois
const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
const response = await fetch(`${API_URL}/api/dashboard/stats`);
```

**4.3. Sincronizar com Android**

```bash
npx cap sync
```

Isso copia os arquivos de `out/` para o projeto Android.

**4.4. Abrir no Android Studio**

```bash
npx cap open android
```

Android Studio vai abrir. Aguardar sincronização do Gradle.

**4.5. Testar no emulador/dispositivo**

No Android Studio:
1. Criar AVD (Android Virtual Device) ou conectar celular
2. Clicar em "Run" (▶️)
3. App vai instalar e abrir

**Tempo:** ~2-3 horas

---

### 🐛 Etapa 5: Ajustes e Correções

**5.1. Problemas comuns e soluções**

**Problema:** API Routes não funcionam
- **Solução:** Manter backend separado (Vercel) e atualizar URLs

**Problema:** Imagens não carregam
- **Solução:** Usar `unoptimized: true` no next.config.ts

**Problema:** Navegação quebrada
- **Solução:** Verificar se todas as rotas estão usando `next/link`

**Problema:** CORS errors
- **Solução:** Adicionar domínio do app nos headers CORS do backend

**5.2. Testar todas as funcionalidades**

Checklist de testes:
- [ ] Login/Logout
- [ ] Listar pacientes
- [ ] Criar/editar paciente
- [ ] Criar/editar anotações diárias
- [ ] Adicionar anotações horárias
- [ ] Gerenciar medicamentos
- [ ] Gerar PDF
- [ ] Gerar resumo com IA
- [ ] Filtros por tag
- [ ] Dashboard com estatísticas
- [ ] Navegação entre telas

**Tempo:** ~1-2 dias

---

### 📱 Etapa 6: Configurar Detalhes do App Android

**6.1. Editar `android/app/src/main/AndroidManifest.xml`**

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application
        android:label="Anotações Médicas"
        android:icon="@mipmap/ic_launcher"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="false">
        <!-- ... -->
    </application>

    <!-- Permissões necessárias -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
</manifest>
```

**6.2. Editar `android/app/build.gradle`**

```gradle
android {
    namespace "com.seudominio.medannotations"
    compileSdk 34

    defaultConfig {
        applicationId "com.seudominio.medannotations"
        minSdk 24  // Android 7.0+
        targetSdk 34  // Android 14
        versionCode 1
        versionName "1.0.0"
    }
}
```

**6.3. Cores e temas (android/app/src/main/res/values/)**

`styles.xml`:
```xml
<resources>
    <style name="AppTheme" parent="Theme.AppCompat.DayNight.DarkActionBar">
        <item name="colorPrimary">#0f172a</item> <!-- slate-900 -->
        <item name="colorPrimaryDark">#020617</item> <!-- slate-950 -->
        <item name="colorAccent">#22c55e</item> <!-- green-500 -->
    </style>
</resources>
```

**Tempo:** ~1 hora

---

### 🔐 Etapa 7: Preparar para Produção

**7.1. Gerar Keystore (chave de assinatura)**

```bash
# Windows (usar Git Bash ou PowerShell)
keytool -genkeypair -v -storetype PKCS12 -keystore upload-keystore.keystore -alias upload -keyalg RSA -keysize 2048 -validity 10000

# Vai pedir:
# - Senha do keystore (GUARDAR EM LOCAL SEGURO!)
# - Seu nome
# - Organização
# - Cidade, Estado, País
```

**⚠️ CRÍTICO:**
- Guardar arquivo `upload-keystore.keystore` em local seguro
- Guardar senha em gerenciador de senhas
- Se perder, não consegue mais atualizar o app!

**7.2. Configurar assinatura**

Criar `android/key.properties`:
```properties
storePassword=SUA_SENHA_AQUI
keyPassword=SUA_SENHA_AQUI
keyAlias=upload
storeFile=upload-keystore.keystore
```

**⚠️ Adicionar ao .gitignore:**
```
android/key.properties
upload-keystore.keystore
```

Editar `android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ...

    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
        }
    }
}
```

**7.3. Build de Produção (AAB)**

```bash
cd android
./gradlew bundleRelease

# Windows (PowerShell)
.\gradlew.bat bundleRelease
```

**Arquivo gerado:**
`android/app/build/outputs/bundle/release/app-release.aab`

**Tempo:** ~1-2 horas

---

### 🏪 Etapa 8: Publicar na Play Store

**8.1. Criar conta Google Play Developer**

1. Ir para: https://play.google.com/console
2. Criar conta ($25 USD - pagamento único)
3. Preencher informações da conta
4. Aguardar aprovação (pode levar 1-2 dias)

**8.2. Criar novo aplicativo**

No Play Console:
1. "Criar aplicativo"
2. Nome: "Anotações Médicas" (ou seu nome)
3. Idioma padrão: Português (Brasil)
4. Tipo: App / Jogo
5. Gratuito / Pago: Gratuito
6. Aceitar termos

**8.3. Configurar ficha da Play Store**

**Nome do app:**
- Nome completo: "Anotações Médicas - Registro de Pacientes"
- Nome curto: "Med Notes"

**Descrição curta (80 caracteres):**
```
Registre anotações diárias de pacientes com facilidade e gere relatórios PDF.
```

**Descrição completa (até 4000 caracteres):**
```
📋 Anotações Médicas - Gestão Completa de Registros de Pacientes

Aplicativo profissional para registrar e gerenciar anotações diárias de pacientes de forma simples e eficiente.

✨ PRINCIPAIS RECURSOS:

📝 Anotações Diárias Completas
• Registre humor, horário de sono e despertar
• Adicione tags personalizadas para categorização
• Detalhes extras e observações importantes
• Anotações horárias detalhadas

👥 Gestão de Pacientes
• Cadastro ilimitado de pacientes
• Histórico completo de anotações
• Busca e filtros avançados
• Dashboard com estatísticas

💊 Controle de Medicamentos
• Registre medicamentos ativos
• Histórico de alterações
• Adicione automaticamente às anotações
• Acompanhe dosagem e frequência

📊 Relatórios e Análises
• Gere PDFs profissionais
• Resumos com IA (LLaMA 3.3)
• Filtros por período e tags
• Estatísticas visuais no dashboard

🔐 Segurança e Privacidade
• Autenticação segura
• Dados criptografados
• Isolamento total entre usuários
• Backup automático na nuvem

🎨 Interface Intuitiva
• Design moderno e responsivo
• Modo escuro confortável
• Navegação simples
• Otimizado para uso diário

💡 IDEAL PARA:
• Profissionais de saúde
• Cuidadores
• Acompanhamento familiar
• Registros médicos pessoais

🌟 DIFERENCIAIS:
• Offline-first (funciona sem internet)
• Sincronização automática
• Export em PDF profissional
• Resumos inteligentes com IA
• Totalmente em português

Baixe agora e organize seus registros médicos com eficiência!

---
🔒 Privacidade: Seus dados são 100% privados e criptografados.
```

**8.4. Assets gráficos**

**Ícone:**
- 512 x 512 px, PNG
- Arquivo: seu `icon.png`

**Feature Graphic (banner):**
- 1024 x 500 px, PNG/JPEG
- Criar no Canva ou Figma
- Texto: "Anotações Médicas - Registros Profissionais"

**Screenshots (obrigatório - mínimo 2):**
- Celular: 1080 x 1920 px (ou captura real)
- Tablet (opcional): 1600 x 2560 px

Sugestão de screenshots:
1. Tela de login
2. Dashboard principal
3. Lista de pacientes
4. Formulário de anotação
5. Tela de medicamentos
6. PDF gerado

**Vídeo (opcional):**
- YouTube link
- Demonstração de 30-120 segundos

**8.5. Categorização**

- **Categoria:** Medicina
- **Tags:** saúde, médico, anotações, registro, paciente
- **Público-alvo:** Adultos (18+)

**8.6. Classificação de conteúdo**

Responder questionário:
- Tipo de app: Medicina / Saúde
- Contém violência? Não
- Contém conteúdo sexual? Não
- Contém linguagem imprópria? Não
- ...

Classificação esperada: **Livre** ou **+12**

**8.7. Política de Privacidade (OBRIGATÓRIO)**

Criar página web com política de privacidade:

**Estrutura mínima:**
```markdown
# Política de Privacidade - Anotações Médicas

Última atualização: [DATA]

## 1. Dados Coletados
- Email (para autenticação)
- Informações de pacientes (inseridas pelo usuário)
- Anotações médicas (inseridas pelo usuário)

## 2. Uso dos Dados
- Autenticação e acesso ao app
- Armazenamento seguro de registros
- Sincronização entre dispositivos

## 3. Compartilhamento
Nós NÃO compartilhamos seus dados com terceiros.

## 4. Segurança
- Dados criptografados em trânsito (HTTPS)
- Dados criptografados em repouso
- Banco de dados seguro (Supabase)

## 5. Seus Direitos
- Exportar dados (via PDF)
- Deletar conta e dados
- Acessar dados a qualquer momento

## 6. Contato
Email: seuemail@dominio.com
```

Hospedar em:
- GitHub Pages (grátis)
- Vercel (grátis)
- No próprio site do app

URL exemplo: `https://seuapp.vercel.app/privacidade`

**8.8. Segurança de Dados**

Preencher formulário:
- Coleta dados? **Sim**
- Quais dados? Email, dados de saúde (inseridos pelo usuário)
- Dados criptografados em trânsito? **Sim**
- Dados criptografados em repouso? **Sim**
- Usuário pode deletar dados? **Sim**
- Usuário pode exportar dados? **Sim**

**8.9. Upload do AAB**

1. Ir para "Produção" → "Criar nova versão"
2. Upload: `app-release.aab`
3. Nome da versão: "1.0.0"
4. Código da versão: 1
5. Notas de versão:
```
Versão inicial do app:
• Gerenciamento de pacientes
• Anotações diárias e horárias
• Controle de medicamentos
• Geração de PDF
• Resumos com IA
```

**8.10. Teste Interno (opcional mas recomendado)**

Antes de publicar:
1. Criar lista de testadores (emails)
2. Publicar em "Teste Interno"
3. Testar por 1-7 dias
4. Corrigir bugs
5. Promover para Produção

**8.11. Submeter para Revisão**

1. Revisar todas as informações
2. Clicar em "Enviar para revisão"
3. Aguardar aprovação (1-7 dias)

**Possíveis motivos de rejeição:**
- Política de privacidade faltando/inadequada
- Screenshots de baixa qualidade
- Descrição enganosa
- Funcionalidade quebrada
- Não cumpre requisitos médicos

**8.12. Aprovação e Publicação**

Após aprovação:
- App fica disponível na Play Store em ~2-4 horas
- Pode levar até 48h para aparecer em todas as regiões

**URL do app:**
`https://play.google.com/store/apps/details?id=com.seudominio.medannotations`

**Tempo total:** 3-5 dias (incluindo aprovação)

---

## ✅ Checklist de Progresso

### Fase 1: Setup (Dia 1-2)
- [ ] Instalar Capacitor CLI
- [ ] Executar `npx cap init`
- [ ] Executar `npx cap add android`
- [ ] Configurar `capacitor.config.ts`
- [ ] Atualizar `next.config.ts` com `output: 'export'`
- [ ] Adicionar scripts no `package.json`
- [ ] Testar build básico

### Fase 2: Assets (Dia 2-3)
- [ ] Criar ícone 512x512 (`public/icon.png`)
- [ ] Criar splash screen 2732x2732 (`public/splash.png`)
- [ ] Gerar ícones adaptativos para Android
- [ ] Copiar ícones para `android/app/src/main/res/`

### Fase 3: Build e Configuração (Dia 3-4)
- [ ] Criar `.env.production` com URL da API
- [ ] Atualizar todas as chamadas de API
- [ ] Executar `npm run build`
- [ ] Executar `npx cap sync`
- [ ] Abrir no Android Studio (`npx cap open android`)
- [ ] Configurar `AndroidManifest.xml`
- [ ] Configurar `build.gradle`
- [ ] Definir cores e temas

### Fase 4: Teste (Dia 5-7)
- [ ] Testar no emulador Android
- [ ] Testar em dispositivo físico
- [ ] Verificar todas as funcionalidades:
  - [ ] Login/Logout
  - [ ] CRUD de pacientes
  - [ ] Anotações diárias
  - [ ] Anotações horárias
  - [ ] Medicamentos
  - [ ] Dashboard
  - [ ] PDF export
  - [ ] IA resumo
  - [ ] Filtros e busca
- [ ] Corrigir bugs encontrados
- [ ] Testar performance e fluidez

### Fase 5: Preparação para Produção (Dia 8-9)
- [ ] Gerar keystore (`keytool -genkeypair...`)
- [ ] Guardar keystore em local seguro
- [ ] Criar `android/key.properties`
- [ ] Adicionar configuração de signing em `build.gradle`
- [ ] Adicionar `key.properties` e `.keystore` ao `.gitignore`
- [ ] Build de release: `./gradlew bundleRelease`
- [ ] Verificar AAB gerado

### Fase 6: Play Store (Dia 10-14)
- [ ] Criar conta Google Play Developer ($25)
- [ ] Aguardar aprovação da conta
- [ ] Criar novo aplicativo no Play Console
- [ ] Preencher nome e descrição
- [ ] Criar feature graphic 1024x500
- [ ] Tirar screenshots (mínimo 2, ideal 4-6)
- [ ] Criar/hospedar política de privacidade
- [ ] Preencher formulário de classificação
- [ ] Preencher formulário de segurança de dados
- [ ] Upload do AAB
- [ ] Preencher notas de versão
- [ ] (Opcional) Teste interno
- [ ] Submeter para revisão
- [ ] Aguardar aprovação (1-7 dias)
- [ ] 🎉 App publicado!

---

## 📝 Informações Importantes

### Custos Totais
- **Conta Google Play Developer:** $25 USD (único pagamento)
- **Desenvolvimento:** Grátis (Capacitor é open-source)
- **Hospedagem backend:** Grátis (Vercel free tier)
- **Banco de dados:** Grátis (Supabase free tier)
- **Total:** ~$25 USD

### Tempo Estimado
- **Setup e desenvolvimento:** 5-7 dias
- **Testes e ajustes:** 2-3 dias
- **Preparação Play Store:** 2-3 dias
- **Revisão Google:** 1-7 dias
- **Total:** ~2-3 semanas

### Arquitetura Final

```
┌─────────────────┐
│   App Android   │  ← Capacitor WebView
│  (Dispositivo)  │
└────────┬────────┘
         │ HTTPS
         ▼
┌─────────────────┐
│  Backend API    │  ← Next.js API Routes
│    (Vercel)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │  ← Supabase
│   + Auth        │
└─────────────────┘
```

### Limitações do Capacitor

**Funciona:**
- ✅ Todo o frontend (React, Tailwind, etc)
- ✅ Chamadas de API
- ✅ Autenticação
- ✅ React Query
- ✅ Formulários
- ✅ PDF generation (client-side)
- ✅ Markdown rendering
- ✅ Date pickers

**Não funciona (precisa ajustar):**
- ❌ API Routes no app mobile (mover para servidor)
- ❌ Server Components dinâmicos
- ❌ ISR, revalidation
- ❌ Image optimization do Next.js

### Manutenção e Atualizações

**Atualizar o app:**
1. Fazer alterações no código
2. Incrementar `versionCode` e `versionName` em `build.gradle`
3. Build: `npm run build && npx cap sync`
4. Gerar novo AAB: `./gradlew bundleRelease`
5. Upload no Play Console
6. Submeter nova versão

**Frequência recomendada:**
- Bug fixes: Quando necessário
- Features: A cada 2-4 semanas
- Security updates: Imediatamente

---

## 🆘 Problemas Comuns

### 1. "Capacitor não encontrado"
```bash
npm install @capacitor/core @capacitor/cli --save
```

### 2. "Gradle build failed"
- Limpar cache: `cd android && ./gradlew clean`
- Invalidar cache do Android Studio: File → Invalidate Caches
- Verificar Java JDK instalado (versão 17+)

### 3. "API calls returning 404"
- Verificar URL em `.env.production`
- Verificar CORS no backend
- Verificar se backend está online

### 4. "App não abre no emulador"
- Verificar AVD está rodando
- Verificar `adb devices` detecta emulador
- Rebuild: Build → Rebuild Project

### 5. "Keystore password incorreto"
- Verificar arquivo `key.properties`
- Senha correta (case-sensitive)
- Keystore no caminho correto

### 6. "Play Console rejeita AAB"
- Verificar assinatura do arquivo
- Verificar `versionCode` é incremental
- Verificar targeting API 33+

---

## 🔗 Links Úteis

**Documentação:**
- Capacitor: https://capacitorjs.com/docs
- Android Studio: https://developer.android.com/studio
- Play Console: https://play.google.com/console

**Ferramentas:**
- Icon Kitchen (gerar ícones): https://icon.kitchen/
- Canva (feature graphic): https://canva.com/
- Privacy Policy Generator: https://www.freeprivacypolicy.com/

**Suporte:**
- Capacitor Discord: https://discord.gg/UPYYRhtyzp
- Stack Overflow: Tag `capacitor`

---

## 📞 Próximos Passos

**Depois de ler este guia:**

1. **Me avise o que você já fez** seguindo o checklist acima
2. **Eu te oriento no próximo passo** com comandos específicos
3. **Vamos juntos até a publicação!**

**Formato da resposta ideal:**
```
Concluí:
- [x] Instalação do Capacitor
- [x] Configuração inicial
- [ ] Assets (fazendo agora)

Dúvida: Como gero os ícones adaptativos?
```

🚀 **Vamos começar! Me diga: você já instalou o Capacitor ou quer começar do zero?**
