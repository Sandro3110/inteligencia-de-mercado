# Investigação do Erro no Mapa

## 1. ERRO ATUAL

**Frontend:** "Cannot convert undefined or null to object"

**Possíveis causas:**

1. Dados retornados da API estão em formato incorreto
2. Algum componente está tentando acessar propriedades de objetos null/undefined
3. Leaflet está recebendo dados inválidos

---

## 2. DADOS DO BANCO (Confirmado via Supabase MCP)

### Clientes com coordenadas:

```json
[
  {
    "id": 301640,
    "nome": "AGUAS PRATA LTDA",
    "latitude": "-19.30830000",
    "longitude": "-48.92780000",
    "cidade": "Águas da Prata",
    "uf": "SP",
    "pesquisaId": 1
  }
]
```

**Observações:**

- ✅ Latitude/longitude são strings (numeric no Postgres)
- ✅ Formato válido
- ✅ Dados existem no banco

---

## 3. PRÓXIMOS PASSOS

1. ✅ Testar query completa da API getMapData
2. ⏳ Verificar formato de retorno
3. ⏳ Identificar onde está o erro "Cannot convert undefined or null to object"
4. ⏳ Criar proposta de refatoração
