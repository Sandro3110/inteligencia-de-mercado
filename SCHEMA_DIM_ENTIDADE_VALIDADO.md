# Schema Validado: dim_entidade

**Data:** 04/12/2025 13:50  
**Fonte:** Supabase (projeto ecnzlynmuerbmqingyfl)  
**Total de Campos:** 48

---

## Campos Obrigatórios (NOT NULL)

| Campo | Tipo | Max Length | Default |
|-------|------|------------|---------|
| `id` | integer | - | nextval('dim_entidade_id_seq') |
| `entidade_hash` | varchar | 64 | - |
| `tipo_entidade` | varchar | 20 | - |
| `nome` | varchar | 255 | - |
| `origem_tipo` | varchar | 20 | - |
| `origem_data` | timestamp | - | now() |
| `created_at` | timestamp | - | now() |
| `updated_at` | timestamp | - | now() |

---

## Campos Opcionais (NULLABLE)

### Identificação
- `nome_fantasia` varchar(255)

### Contato
- `cnpj` varchar(18)
- `email` varchar(255)
- `telefone` varchar(20)
- `site` varchar(255)

### Estrutura
- `num_filiais` integer (default: 0)
- `num_lojas` integer (default: 0)
- `num_funcionarios` integer

### Origem/Rastreabilidade
- `origem_arquivo` varchar(255)
- `origem_processo` varchar(100)
- `origem_prompt` text
- `origem_confianca` integer
- `origem_usuario_id` integer

### Auditoria
- `created_by` varchar(255)
- `updated_by` varchar(255)
- `deleted_at` timestamp
- `deleted_by` integer

### Importação
- `importacao_id` integer

### Hashes
- `cnpj_hash` varchar(64)
- `cpf_hash` varchar(64)
- `email_hash` varchar(64)
- `telefone_hash` varchar(64)

### Localização
- `cidade` varchar(100)
- `uf` varchar(2)

### Dados Comerciais
- `porte` varchar(20)
- `setor` varchar(100)
- `produto_principal` text
- `segmentacao_b2b_b2c` varchar(10)

### Qualidade
- `score_qualidade` integer
- `score_qualidade_dados` integer (default: 0)
- `validacao_cnpj` boolean (default: false)
- `validacao_email` boolean (default: false)
- `validacao_telefone` boolean (default: false)
- `campos_faltantes` text
- `ultima_validacao` timestamp
- `status_qualificacao_id` integer

### Enriquecimento
- `enriquecido_em` timestamp
- `enriquecido_por` varchar(255)
- `cache_hit` boolean (default: false)
- `cache_expires_at` timestamp

---

## Validação Completa

✅ **48 campos confirmados**  
✅ **8 campos obrigatórios**  
✅ **40 campos opcionais**  
✅ **Tipos de dados validados**  
✅ **Constraints validados**  
✅ **Defaults validados**

---

**Próximo passo:** Criar API `/api/entidades` com todos os 48 campos
