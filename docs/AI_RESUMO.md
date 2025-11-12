# Resumo com IA - Documentação

## Visão Geral

O sistema agora inclui funcionalidade de geração de resumos clínicos usando Inteligência Artificial. Esta funcionalidade utiliza a API do Groq, que é **completamente gratuita** e oferece modelos de linguagem avançados.

## Características

- ✨ **Geração de resumos clínicos inteligentes** baseados nas anotações do paciente
- 🎯 **Análise contextual** de padrões de sono, humor e eventos médicos
- 📄 **Exportação em PDF** com resumo integrado
- 💰 **Totalmente gratuito** com limite generoso de 14,400 requisições/dia
- ⚡ **Rápido** - resumos gerados em segundos

## Configuração

### 1. Obter Chave da API Groq

1. Acesse [console.groq.com](https://console.groq.com)
2. Crie uma conta gratuita
3. Navegue até a seção "API Keys"
4. Clique em "Create API Key"
5. Copie a chave gerada

### 2. Configurar Variável de Ambiente

1. Copie o arquivo `.env.example` para `.env`:
   ```bash
   cp .env.example .env
   ```

2. Abra o arquivo `.env` e adicione sua chave:
   ```env
   GROQ_API_KEY=sua_chave_aqui
   ```

3. Reinicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Como Usar

### Opção 1: Gerar Resumo Independente

1. Acesse a página de detalhes de um paciente
2. Clique no botão **"Resumo com IA"** (roxo, com ícone de estrela)
3. Opcionalmente, selecione um período específico de datas
4. Clique em **"Gerar Resumo"**
5. Aguarde alguns segundos enquanto a IA analisa as anotações
6. O resumo será exibido na tela
7. Você pode:
   - Copiar o resumo para a área de transferência
   - Baixar como arquivo Markdown (.md)

### Opção 2: Incluir Resumo no PDF

1. Acesse a página de detalhes de um paciente
2. Clique no botão **"Exportar PDF"** (verde)
3. Configure o período (opcional)
4. Na seção **"Resumo com IA"**, clique em **"Gerar resumo e incluir no PDF"**
5. Aguarde a geração do resumo
6. Clique em **"Exportar PDF"**
7. O PDF gerado incluirá o resumo no início do documento

## Estrutura do Resumo

O resumo gerado pela IA inclui:

1. **Resumo Geral**: Visão panorâmica do estado do paciente no período
2. **Padrões de Sono**: Análise dos horários de dormir e acordar
3. **Estado Emocional**: Avaliação baseada nos registros de humor
4. **Eventos Importantes**: Lista de consultas, exames, internações, etc.
5. **Observações Relevantes**: Destaques das anotações horárias
6. **Recomendações**: Sugestões para acompanhamento (quando aplicável)

## Exemplos de Uso

### Caso 1: Acompanhamento Mensal
- Selecione período de 30 dias
- Gere resumo para identificar padrões
- Use para preparar consultas médicas

### Caso 2: Relatório Completo
- Não selecione período (usa todas as anotações)
- Gere resumo e exporte em PDF
- Compartilhe com equipe médica

### Caso 3: Análise de Período Específico
- Selecione período de interesse (ex: durante internação)
- Gere resumo focado
- Identifique mudanças e tendências

## Solução de Problemas

### Erro: "Chave da API não configurada"
**Solução**: Verifique se adicionou `GROQ_API_KEY` no arquivo `.env` e reiniciou o servidor.

### Erro: "Nenhuma anotação encontrada"
**Solução**: Certifique-se de que existem anotações para o período selecionado.

### Resumo demora muito
**Solução**: A primeira geração pode demorar mais. Gerações subsequentes são mais rápidas devido ao cache.

### Limite de requisições atingido
**Solução**: O plano gratuito permite 14,400 requisições/dia. Aguarde 24h para renovação.

## Privacidade e Segurança

- ✅ As anotações são enviadas para a API do Groq apenas durante a geração
- ✅ Não há armazenamento permanente das anotações nos servidores do Groq
- ✅ A comunicação é criptografada (HTTPS)
- ✅ Você mantém controle total dos seus dados

## Modelos Utilizados

**Modelo padrão**: `llama-3.3-70b-versatile`
- 70 bilhões de parâmetros
- Otimizado para tarefas diversas
- Excelente para análise de texto clínico
- Gratuito na plataforma Groq

## Limitações

- Resumos têm limite de ~2000 tokens (~1500 palavras)
- A IA não substitui avaliação médica profissional
- Recomendações são sugestões gerais, não diagnósticos
- Qualidade do resumo depende da qualidade das anotações

## Tecnologias

- **Groq API**: Plataforma de inferência de IA
- **Llama 3.3**: Modelo de linguagem da Meta
- **Next.js API Routes**: Backend da aplicação
- **jsPDF**: Geração de PDFs

## Recursos Adicionais

- [Documentação Groq](https://console.groq.com/docs)
- [Llama 3.3 Model Card](https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct)

## Feedback

Se você tiver sugestões de melhoria para o resumo de IA, por favor abra uma issue no repositório.
