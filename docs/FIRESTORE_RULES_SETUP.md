# Configuração de Firestore Security Rules

Guia completo para configurar as regras de segurança do Firestore no Firebase Console.

---

## 📋 Passo a Passo

### 1. Acesse o Firebase Console

1. Vá para: https://console.firebase.google.com
2. Selecione o projeto: **novasolidumsql-c7ad0**
3. No menu lateral, clique em **Firestore Database**
4. Clique na aba **Rules** (Regras)

### 2. Substitua as Rules

1. **Delete** todas as regras existentes
2. **Copie** o conteúdo do arquivo [firestore.rules](../firestore.rules)
3. **Cole** no editor do Firebase Console
4. Clique em **Publish** (Publicar)

### 3. Adicione Novos Admins

Se precisar adicionar mais emails de admin:

1. Edite o arquivo `firestore.rules`
2. Adicione o email na função `isAdmin()`:

```javascript
function isAdmin() {
  return isAuthenticated() &&
         request.auth.token.email in [
           'admin@novasolidum.com.br',
           'novo-admin@example.com',  // ← Adicione aqui
           'outro-admin@company.com',  // ← E aqui
         ];
}
```

3. **IMPORTANTE**: Também adicione no `.env.local`:

```bash
VITE_ADMIN_EMAILS=admin@novasolidum.com.br,novo-admin@example.com,outro-admin@company.com
```

4. Publique as rules no Firebase Console

---

## 🔒 O que as Rules Protegem

### ✅ Collection: `registrations`

**Permissões:**
- **Criar** (create): ✅ Qualquer um (formulário público)
- **Ler** (read): 🔒 Apenas admins
- **Atualizar** (update): 🔒 Apenas admins
- **Deletar** (delete): 🔒 Apenas admins

**Subcollection: `registrations/{docId}/files`**
- **Criar** (create): ✅ Qualquer um (upload de documentos)
- **Ler** (read): 🔒 Apenas admins
- **Deletar** (delete): 🔒 Apenas admins

---

### ✅ Collection: `cnpj_cache`

**Permissões:**
- **Ler/Escrever**: 🔒 Apenas admins

**Uso:**
- Armazena resultados de consultas CNPJ
- TTL de 30 dias (verificado no código)
- Document ID = CNPJ normalizado (14 dígitos)

---

### ✅ Collection: `cnpj_lookup_logs`

**Permissões:**
- **Criar** (create): 🔒 Apenas admins
- **Ler** (read): 🔒 Apenas admins
- **Atualizar** (update): ❌ BLOQUEADO (logs são imutáveis)
- **Deletar** (delete): ❌ BLOQUEADO (logs são permanentes)

**Uso:**
- Auditoria de consultas CNPJ
- Logs são **imutáveis** para compliance
- Deletar manualmente apenas via Firebase Console (se necessário)

---

### ❌ Outras Collections

Qualquer collection não especificada é **totalmente bloqueada** por padrão.

---

## 🧪 Testando as Rules

### No Firebase Console (Simulador)

1. Na aba **Rules**, clique em **Playground**
2. Configure o teste:

**Teste 1: Admin pode ler cache**
```
Location: /cnpj_cache/11222333000181
Type: get
Auth: { "uid": "test-uid", "email": "admin@novasolidum.com.br" }
```
✅ Resultado esperado: **Allow**

**Teste 2: Usuário não-admin NÃO pode ler cache**
```
Location: /cnpj_cache/11222333000181
Type: get
Auth: { "uid": "test-uid", "email": "user@gmail.com" }
```
❌ Resultado esperado: **Deny**

**Teste 3: Qualquer um pode criar registration**
```
Location: /registrations/test-doc
Type: create
Auth: null (não autenticado)
Data: { "accountType": "PF", "name": "Test" }
```
✅ Resultado esperado: **Allow**

**Teste 4: Apenas admin pode ler registration**
```
Location: /registrations/test-doc
Type: get
Auth: { "uid": "test-uid", "email": "admin@novasolidum.com.br" }
```
✅ Resultado esperado: **Allow**

---

## 🚨 Erros Comuns

### Erro: "Missing or insufficient permissions"

**Causa**: Usuário não tem permissão para acessar a collection

**Solução**:
1. Verifique se o email está na lista de admins nas rules
2. Verifique se o email também está em `VITE_ADMIN_EMAILS`
3. Faça logout e login novamente (token precisa ser renovado)

### Erro: "auth/email-not-verified"

**Causa**: Firebase Auth pode requerer verificação de email

**Solução**:
- Desabilite verificação obrigatória no Firebase Console
- Ou adicione verificação de email no fluxo de login

### Rules não aplicam imediatamente

**Causa**: Cache de rules no Firebase

**Solução**:
- Aguarde até 1 minuto após publicar
- Faça hard refresh no browser (Cmd+Shift+R ou Ctrl+Shift+R)
- Limpe cookies e cache do browser

---

## 🔐 Segurança Adicional

### Recomendações

1. **Não hardcode tokens**: Nunca exponha API keys públicas em regras
2. **Rate Limiting**: Configure no Firebase Console → App Check
3. **Monitoramento**: Ative alertas para tentativas de acesso negado
4. **Backup**: Faça backup das rules antes de modificar

### App Check (Opcional, mas recomendado)

Protege contra bots e scrapers:

1. Firebase Console → App Check
2. Ative reCAPTCHA v3 para web
3. Configure enforcement para Firestore

---

## 📊 Índices Firestore

Para melhor performance, crie índices compostos:

### Índice 1: Logs de CNPJ por usuário

1. Firebase Console → Firestore → Indexes
2. Clique em **Add Index**
3. Configure:
   - **Collection ID**: `cnpj_lookup_logs`
   - **Fields indexed**:
     - `userId` (Ascending)
     - `searchedAt` (Descending)
   - **Query scopes**: Collection

### Índice 2: Registrations por data

1. **Collection ID**: `registrations`
2. **Fields indexed**:
   - `status` (Ascending)
   - `createdAt` (Descending)
3. **Query scopes**: Collection

---

## 🔄 Atualizando as Rules

### Opção 1: Firebase Console (Manual)

1. Acesse Firebase Console → Firestore → Rules
2. Edite diretamente no editor
3. Clique em **Publish**

### Opção 2: Firebase CLI (Recomendado para CI/CD)

```bash
# Instale Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Inicialize projeto (apenas primeira vez)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

Edite `firestore.rules` localmente e faça deploy.

---

## 📝 Exemplo Completo: firebase.json

Se usar Firebase CLI, crie `firebase.json`:

```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 🆘 Suporte

Se precisar de ajuda:

1. **Documentação oficial**: https://firebase.google.com/docs/firestore/security/get-started
2. **Playground**: Teste rules diretamente no console
3. **Logs**: Firebase Console → Firestore → Usage → Monitor

---

**Atualizado**: Janeiro 2026
**Versão das Rules**: 2.0
**Projeto**: Nova Solidum Finances
