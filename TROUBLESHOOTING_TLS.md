# 🔧 Solução: Erro de TLS no Localhost

## ❌ Erro que você está vendo:

```
Failed to load resource: Um erro de TLS fez com que a conexão segura falhasse
```

**Causa**: O browser está tentando forçar HTTPS no localhost, mas o Vite está servindo HTTP.

---

## ✅ Soluções (Tente na Ordem)

### **Solução 1: Limpar Cache do Browser (Mais Rápido)**

#### Chrome/Edge:
1. Abra as **DevTools** (F12)
2. Clique com **botão direito** no ícone de reload
3. Selecione **"Limpar cache e recarregar forçadamente"**

Ou:
1. Cmd+Shift+Delete (Mac) ou Ctrl+Shift+Delete (Windows)
2. Selecione "Últimas 24 horas"
3. Marque apenas:
   - ✅ Imagens e arquivos em cache
   - ✅ Cookies e outros dados
4. Clique em "Limpar dados"
5. **Reinicie o browser**

#### Safari:
1. Safari → Preferências → Avançado
2. Marque "Mostrar menu Desenvolvedor"
3. Desenvolvedor → Limpar Caches
4. **Reinicie o Safari**

---

### **Solução 2: Usar Modo Anônimo/Privado**

1. Abra uma janela **anônima/privada**:
   - Chrome: Cmd+Shift+N (Mac) ou Ctrl+Shift+N (Windows)
   - Safari: Cmd+Shift+N (Mac)
   - Firefox: Cmd+Shift+P (Mac) ou Ctrl+Shift+P (Windows)

2. Acesse: **http://localhost:5174/**

**Importante**: Use `http://` explicitamente, NÃO `https://`

---

### **Solução 3: Forçar HTTP no Browser**

#### Chrome/Edge:

1. Vá para: `chrome://net-internals/#hsts`
2. Na seção **"Delete domain security policies"**
3. Digite: `localhost`
4. Clique em **"Delete"**
5. Feche e reabra o Chrome
6. Acesse: `http://localhost:5174/`

#### Safari:

1. Safari → Preferências → Privacidade
2. Clique em "Gerenciar Dados de Sites..."
3. Busque por "localhost" e remova
4. Reinicie o Safari

---

### **Solução 4: Usar Outro Browser**

Se nenhuma das soluções acima funcionar, tente outro browser:
- **Firefox** (geralmente não tem esse problema)
- **Chrome** (se estava usando Safari)
- **Safari** (se estava usando Chrome)

---

### **Solução 5: Desabilitar HTTPS Redirect Temporariamente**

#### Chrome:

1. Abra DevTools (F12)
2. Vá na aba **Network**
3. Marque a opção **"Disable cache"**
4. Deixe DevTools aberto
5. Recarregue a página

---

### **Solução 6: Configurar Vite com HTTPS (Última Opção)**

Se nada funcionar, podemos configurar o Vite para usar HTTPS:

Edite `vite.config.ts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    https: {
      key: fs.readFileSync('./.cert/localhost-key.pem'),
      cert: fs.readFileSync('./.cert/localhost.pem'),
    },
  },
});
```

Mas você precisará gerar certificados locais:

```bash
# Instalar mkcert (Mac)
brew install mkcert
mkcert -install

# Criar certificados
mkdir .cert
cd .cert
mkcert localhost 127.0.0.1 ::1
```

**Recomendação**: Tente as soluções 1-4 primeiro. A solução 6 é mais complexa.

---

## 🚀 Verificação Rápida

Depois de aplicar uma solução:

1. **Feche TODOS os tabs** do localhost
2. **Reinicie o browser** (importante!)
3. Abra um **novo tab**
4. Digite **explicitamente**: `http://localhost:5174/`
   - ⚠️ NÃO digite apenas "localhost:5174"
   - ⚠️ NÃO use "https://"

---

## 🔍 Como Saber se Funcionou

Você deve ver:
- ✅ A home page do Nova Solidum Finances
- ✅ Console limpo (sem erros de TLS)
- ✅ Network tab mostrando arquivos carregando com status 200

---

## 🆘 Se Nada Funcionar

### Verificar se o servidor está rodando:

```bash
lsof -ti:5174
```

Se retornar um número = servidor está rodando ✅
Se não retornar nada = servidor NÃO está rodando ❌

### Reiniciar servidor manualmente:

```bash
# Matar processos antigos
lsof -ti:5173 | xargs kill -9
lsof -ti:5174 | xargs kill -9

# Limpar cache do npm
npm cache clean --force

# Deletar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Rodar novamente
npm run dev
```

---

## 📝 Notas Importantes

1. **Sempre use `http://`**: Localhost não precisa de HTTPS para desenvolvimento
2. **Reinicie o browser**: Cache pode persistir mesmo após limpar
3. **Service Workers**: Se ainda houver problemas, pode ser um service worker cached

Para remover service workers:
- Chrome DevTools → Application → Service Workers → Unregister
- Safari DevTools → Storage → Service Workers → Clear

---

## ✅ Solução Rápida (TL;DR)

```bash
# 1. Limpe tudo
lsof -ti:5174 | xargs kill -9

# 2. Reinicie servidor
npm run dev

# 3. No browser:
# - Modo anônimo (Cmd+Shift+N)
# - Acesse: http://localhost:5174/
# - Use HTTP explicitamente!
```

---

**Status Atual**: Servidor rodando em http://localhost:5174/
**Próximo Passo**: Tente a Solução 1 ou 2 primeiro
