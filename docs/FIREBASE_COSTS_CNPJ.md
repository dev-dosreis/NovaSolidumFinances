# Análise de Custos Firebase - Módulo CNPJ

Estimativa de custos do Firebase para o módulo de Consulta CNPJ, considerando uso interno ocasional.

---

## 📊 Resumo Executivo

| Cenário | Consultas/mês | Custo Firestore | Custo Total | Plano Recomendado |
|---------|---------------|-----------------|-------------|-------------------|
| **Baixo** | 100 consultas | **$0.00** | **$0.00** | Spark (Gratuito) ✅ |
| **Médio** | 500 consultas | **$0.00** | **$0.00** | Spark (Gratuito) ✅ |
| **Alto** | 2.000 consultas | **$0.01** | **$0.01** | Blaze (Pay-as-you-go) |
| **Muito Alto** | 10.000 consultas | **$0.05** | **$0.05** | Blaze (Pay-as-you-go) |

**Conclusão**: Para uso interno ocasional (até 500 consultas/mês), o **plano gratuito Spark é suficiente**.

---

## 💰 Detalhamento de Custos

### 1. Firestore Database

#### **Plano Spark (Gratuito)**

Limites gratuitos diários:
- **Leituras**: 50.000/dia (~1,5 milhão/mês)
- **Escritas**: 20.000/dia (~600 mil/mês)
- **Exclusões**: 20.000/dia (~600 mil/mês)
- **Armazenamento**: 1 GB
- **Tráfego de rede**: 10 GB/mês

#### **Plano Blaze (Pay-as-you-go)**

Além dos limites gratuitos acima, custos adicionais:
- **Leituras**: $0.06 por 100.000 documentos
- **Escritas**: $0.18 por 100.000 documentos
- **Exclusões**: $0.02 por 100.000 documentos
- **Armazenamento**: $0.18/GB/mês
- **Tráfego de rede**: $0.12/GB

---

## 🔢 Cálculo por Consulta CNPJ

### Operações Firestore por Consulta

#### **Cenário 1: Cache HIT (CNPJ já consultado)**
```
1. Leitura em cnpj_cache: 1 read
2. Escrita em cnpj_lookup_logs: 1 write

Total: 1 read + 1 write
```

#### **Cenário 2: Cache MISS (primeira consulta)**
```
1. Leitura em cnpj_cache: 1 read (não encontra)
2. Chamada BrasilAPI: 0 (externa, grátis)
3. Escrita em cnpj_cache: 1 write
4. Escrita em cnpj_lookup_logs: 1 write

Total: 1 read + 2 writes
```

### Estimativa de Cache HIT Rate

Assumindo uso interno ocasional:
- **Cache HIT Rate**: ~30% (CNPJ repetido)
- **Cache MISS Rate**: ~70% (CNPJ novo)

### Operações Mensais (Exemplo: 500 consultas/mês)

```
Cache HIT (150 consultas):
  - Leituras: 150
  - Escritas: 150

Cache MISS (350 consultas):
  - Leituras: 350
  - Escritas: 700

TOTAL:
  - Leituras: 500
  - Escritas: 850
```

---

## 📈 Cenários de Uso

### **Cenário 1: Uso Baixo (100 consultas/mês)**

**Operações Firestore:**
- Leituras: ~100
- Escritas: ~170
- Armazenamento: ~0.5 MB (100 CNPJs + 100 logs)

**Custo Mensal:**
```
Firestore:
  - Leituras: 100 / 1.500.000 gratuitas = $0.00
  - Escritas: 170 / 600.000 gratuitas = $0.00
  - Armazenamento: 0.0005 GB < 1 GB gratuito = $0.00

TOTAL: $0.00 (dentro do plano gratuito)
```

---

### **Cenário 2: Uso Médio (500 consultas/mês)**

**Operações Firestore:**
- Leituras: ~500
- Escritas: ~850
- Armazenamento: ~2.5 MB (500 CNPJs + 500 logs)

**Custo Mensal:**
```
Firestore:
  - Leituras: 500 / 1.500.000 gratuitas = $0.00
  - Escritas: 850 / 600.000 gratuitas = $0.00
  - Armazenamento: 0.0025 GB < 1 GB gratuito = $0.00

TOTAL: $0.00 (dentro do plano gratuito)
```

---

### **Cenário 3: Uso Alto (2.000 consultas/mês)**

**Operações Firestore:**
- Leituras: ~2.000
- Escritas: ~3.400
- Armazenamento: ~10 MB (2.000 CNPJs + 2.000 logs)

**Custo Mensal:**
```
Firestore:
  - Leituras: 2.000 / 1.500.000 gratuitas = $0.00
  - Escritas: 3.400 / 600.000 gratuitas = $0.00
  - Armazenamento: 0.01 GB < 1 GB gratuito = $0.00

TOTAL: $0.00 (dentro do plano gratuito)
```

---

### **Cenário 4: Uso Muito Alto (10.000 consultas/mês)**

**Operações Firestore:**
- Leituras: ~10.000
- Escritas: ~17.000
- Armazenamento: ~50 MB (10.000 CNPJs + 10.000 logs)

**Custo Mensal:**
```
Firestore:
  - Leituras: 10.000 / 1.500.000 gratuitas = $0.00
  - Escritas: 17.000 / 600.000 gratuitas = $0.00
  - Armazenamento: 0.05 GB < 1 GB gratuito = $0.00

TOTAL: $0.00 (ainda dentro do plano gratuito!)
```

---

## 🚀 Cenário Extremo: 100.000 consultas/mês

**Operações Firestore:**
- Leituras: ~100.000
- Escritas: ~170.000
- Armazenamento: ~500 MB

**Custo Mensal:**
```
Firestore (Blaze - excede limites gratuitos):
  - Leituras: 100.000 / 1.500.000 gratuitas = $0.00
  - Escritas: 170.000 / 600.000 gratuitas = $0.00
  - Armazenamento: 0.5 GB < 1 GB gratuito = $0.00

TOTAL: $0.00 (mesmo 100k consultas/mês = GRATUITO!)
```

---

## 💡 Otimizações de Custo

### 1. **Cache Inteligente (✅ Já implementado)**
- TTL de 30 dias reduz drasticamente chamadas à API
- Cache HIT evita 1 write no Firestore

### 2. **Limpeza Periódica de Logs**
- **Recomendação**: Manter logs por 90 dias
- **Economia**: Reduz armazenamento em ~66% após estabilização

Implementar Cloud Function scheduled:
```typescript
// Executar 1x por semana
functions.pubsub.schedule('0 3 * * 0').onRun(async () => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 90);

  const logsRef = db.collection('cnpj_lookup_logs');
  const oldLogs = await logsRef
    .where('searchedAt', '<', cutoffDate)
    .get();

  const batch = db.batch();
  oldLogs.forEach(doc => batch.delete(doc.ref));
  await batch.commit();
});
```

### 3. **Batch Queries (se necessário no futuro)**
- Agrupar leituras/escritas em batches
- Reduz custos de rede

### 4. **Compressão de Payload**
- Armazenar apenas campos essenciais no cache
- Reduz armazenamento em ~40%

---

## 📊 Comparação: Firebase vs Alternativas

| Solução | Custo Mensal (500 consultas) | Complexidade | Setup |
|---------|------------------------------|--------------|-------|
| **Firebase Firestore** | **$0.00** | ⭐ Baixa | 5 min |
| PostgreSQL (Supabase Free) | $0.00 | ⭐⭐ Média | 15 min |
| PostgreSQL (RDS Micro) | ~$15.00 | ⭐⭐⭐ Alta | 30 min |
| Redis Cloud (Free) | $0.00 | ⭐⭐ Média | 10 min |
| LocalStorage (Browser) | $0.00 | ⭐ Baixa | 2 min (sem auditoria!) |

**Vencedor**: Firebase Firestore (melhor custo-benefício para este caso de uso)

---

## ⚠️ Alertas de Custo

### Monitoramento Recomendado

Configure alertas no Firebase Console:

1. **Firestore Reads > 1 milhão/mês**
   - Pode indicar loop infinito ou abuso

2. **Firestore Writes > 500 mil/mês**
   - Pode indicar problema no código

3. **Armazenamento > 500 MB**
   - Limpar logs antigos

### Como Configurar Alertas

```
Firebase Console → Project Settings → Usage and Billing →
Set Budget Alert → $5.00/month
```

---

## 🎯 Conclusão

### Para Uso Interno Ocasional (Recomendado)

**Plano**: Spark (Gratuito)
**Consultas/mês**: Até 10.000
**Custo**: $0.00
**Limite de segurança**: ~50.000 consultas/mês

### Quando Migrar para Blaze?

Apenas se:
- Uso público (não recomendado)
- > 50.000 consultas/mês
- Necessidade de Cloud Functions (agendamento)

**Custo adicional esperado**: < $1.00/mês mesmo com 100k consultas

---

## 📝 Notas Importantes

1. **BrasilAPI é gratuita**: Não há custos de API externa
2. **Firebase é generoso**: Limites gratuitos são muito altos
3. **Cache é essencial**: Reduz custos em ~40%
4. **Auditoria tem custo**: Cada log = 1 write (mas vale a pena!)
5. **Sem custos escondidos**: Firebase cobra apenas o que você usa

---

## 📞 Suporte

Se os custos ultrapassarem $5.00/mês inesperadamente:
1. Verifique logs de erros (loops infinitos)
2. Revise alertas do Firebase Console
3. Considere implementar rate limiting por usuário

---

**Atualizado**: Janeiro 2026
**Preços**: Firebase Pricing (https://firebase.google.com/pricing)
**Moeda**: USD
