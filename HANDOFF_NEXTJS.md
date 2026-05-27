# Chain Academy — Handoff para refactor do Next.js

Documento de transferência de contexto para uma nova sessão de LLM continuar o trabalho de **refactor do Next.js** integrando com o backend ServiceNow já construído.

**Antes de começar, ler obrigatoriamente:**
1. `APRESENTACAO.md` — visão geral de tudo que existe no ServiceNow.
2. `SERVICENOW_PROGRESS.md` — referência técnica completa (cada artefato, cada bug, cada decisão arquitetural, URLs úteis, regras de uso).
3. Memória do Claude em `~/.claude/projects/-Users-galvao-Desktop-ProjetoChainAcademy/memory/MEMORY.md`.

---

## REGRAS NÃO-NEGOCIÁVEIS

(Repetidas do `SERVICENOW_PROGRESS.md` — críticas.)

1. **Consultar a doc Zurich local** antes de afirmar comportamento ServiceNow. Path: `/Users/galvao/Desktop/ProjetoChainAcademy/docs/ServiceNowDocs/markdown/` (branch `zurich`).
2. **NÃO acessar `.env`** do projeto Next.js (contém credenciais sensíveis).
3. **Sem emojis** em código ou docs.
4. **Sem comentários óbvios** no código. Sem mocks/abstrações desnecessárias.
5. **Sempre mandar URL completa** quando referenciar tela do ServiceNow (`https://dev270250.service-now.com/...`).
6. **Trabalhar sem pedir clarificação** quando possível — escolher a opção razoável e seguir, usuário redireciona se necessário.

---

## Arquitetura do MVP Next.js (definida pelo usuário)

```
┌──────────────────────────────────────────────────────────────┐
│  Tela 1 — Login                                              │
│  - Usuário digita email único de buyer (Jorge Higa)          │
│  - Next.js valida e seta sessão (localStorage ou cookie)    │
│  - Sem password real — auth simplificada                     │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│  Tela 2 — Dashboard                                          │
│  - Lista 10 carros (grid de cards com foto + nome + chassi)  │
│  - Dados vêm de uma nova tabela `car_catalog` no ServiceNow  │
│  - Fotos hospedadas no ServiceNow via db_image (ou URL ext.) │
└──────────────────────────────────────────────────────────────┘
                          │
                          ▼ clica num carro
┌──────────────────────────────────────────────────────────────┐
│  Tela 3 — Detalhes do carro + Form de proposta               │
│  - Top: dados completos do carro (chama API chaintechsales)  │
│  - Bottom: form com Purchase Offer + Submit                  │
│  - Submit faz POST pra Table API do ServiceNow               │
│  - Proposta cria → email automático pro owner → ciclo        │
└──────────────────────────────────────────────────────────────┘
```

**Decisão importante do usuário:** Esse é o MVP. Sem ACLs, sem múltiplos buyers, sem páginas de "minhas propostas" do buyer. Polimento vem depois.

---

## O que está PRONTO no ServiceNow

Resumo do estado (detalhe completo em `SERVICENOW_PROGRESS.md`):

| Componente | Status | Identificadores |
|---|---|---|
| Tabela `x_1880990_chain_proposal` | ✅ | 16 campos custom + 7 state choices |
| Tabela `x_1880990_chain_uf_region_manager` | ✅ | 27 registros populados |
| 3 Roles | ✅ | `buyer`, `seller`, `regional_manager` (prefixadas com `x_1880990_chain.`) |
| 14 usuários demo (5 managers + 9 owners) | ✅ | Emails distribuídos em `luizgalvao.dev@gmail.com` (owners) e `luizmedeiros324@gmail.com` (managers) |
| 1 buyer (Jorge Higa) | ✅ | Email pessoal dele |
| 4 Business Rules na tabela proposal | ✅ | `populate_buyer_default`, `enrich_proposal_from_external` (async), `validate_state_transition`, `default_state_to_awaiting_owner` (DESATIVADA) |
| REST Message + Basic Auth pra chaintechsales | ✅ | `Chain External Car Service` |
| Email Account Gmail SMTP | ✅ | `Gmail SMTP ChainAcademy` |
| 5 Email Notifications | ✅ | proposal_awaiting_owner / _manager / _approved / _rejected / _counter_received |
| Magic Link completo | ✅ | Script Include + 2 System Properties + Scripted REST API com 6 resources + 3 Email Scripts |

---

## O que FALTA no ServiceNow pra suportar o MVP

### Faltante 1 — Tabela `x_1880990_chain_car_catalog`

Necessária pra o dashboard listar os 10 carros pré-selecionados (não dá pra listar do chaintechsales porque a API externa não tem endpoint de "listar todos", e mesmo se tivesse não queremos depender dele pra o dashboard funcionar).

**Estrutura proposta:**

| Campo | Tipo | Mandatory | Função |
|---|---|---|---|
| `car_name` | String 40 | sim | Nome do carro (ex: `Beta 1`) — usado no form do buyer |
| `car_chassi` | String 17 | sim | Chassi (ex: `DLGY1RD5B5QMCOIZF`) — usado no form do buyer |
| `image` | (decisão: db_image OU attachment) | sim | Foto do carro |
| `display_order` | Integer | não | Ordem de exibição no grid (opcional) |
| `active` | True/False | não | Default true. Pra esconder do dashboard sem deletar. |

**Caminho de criação:** `https://dev270250.service-now.com/sys_db_object.do?sys_id=-1` (scope Chain Academy).

### Faltante 2 — 10 fotos hospedadas

**Opção A — Hospedar no ServiceNow via `db_image`** (recomendado pela narrativa "tudo no ServiceNow").
- Upload via `https://dev270250.service-now.com/db_image_list.do > New`.
- URL pública resultante: `https://dev270250.service-now.com/<sys_id>.iix`.
- **Atenção:** `db_image` NÃO é versionado no Git da app. Cada bootstrap precisa re-uploadar. Adicionar nota no `INSTANCE_RECOVERY.md`.

**Opção B — URL externa** (mais simples, sobrevive a recreate).
- Hospedar no GitHub (raw URL), Imgur, Cloudinary, etc.
- Campo `image_url` (String) na tabela em vez de `image` (binary).
- Trade: dependência externa.

**Opção C — Imagens estáticas no Next.js** (mais rápido).
- Salva 10 PNGs em `project/public/cars/<chassi>.png`.
- Campo `image_url` na tabela aponta pra `/cars/DLGY1RD5B5QMCOIZF.png`.
- Trade: acoplamento Next.js↔ServiceNow.

**Recomendação para discussão com usuário:** começar com Opção C (mais simples), migrar pra A se houver tempo.

### Faltante 3 — Fix Script pra popular `car_catalog`

Após escolher 10 carros do chaintechsales (rodar curl pra listar e escolher chassis), criar Fix Script que insere os 10 registros. Versionado no Git pra replicabilidade.

**Como descobrir os 10 carros:** curl da API externa.
```bash
curl -s -u "detran.integration:Desafio@2024" \
  "https://chaintechsales.service-now.com/api/now/table/u_car?sysparm_fields=u_car_name,u_chassi,u_marca,u_modelo,u_uf,u_proprietario&sysparm_limit=10" \
  | python3 -m json.tool
```

(O sys_id do `u_proprietario` deve bater com algum dos 9 owners já cadastrados — escolha 10 carros distribuídos entre owners pra ter variedade.)

### Faltante 4 (OPCIONAL) — Scripted REST `getCarDetails`

Hoje o Next.js teria que chamar `chaintechsales` diretamente (com credencial Basic Auth da API externa) pra buscar detalhes. **Problemas:**
- Credencial da API externa vaza pro frontend.
- CORS pode bloquear request cross-origin.

**Solução:** criar 1 resource adicional na Scripted REST API existente (`Chain Magic Link` — ou criar uma nova `Chain Public API`) que faz proxy:

- Path: `/api/x_1880990_chain/chain_public/car_details`
- Method: GET
- Query params: `name`, `chassi`
- Lógica: chama o REST Message `Chain External Car Service` method `getCarByNameAndChassi`, retorna o JSON.
- **Auth:** Basic Auth do admin (Next.js já está autenticado dessa forma).

Vantagem: credencial da chaintechsales só vive no ServiceNow.

---

## Arquitetura do Next.js — refactor planejado

### Stack atual
- Next.js 16, React 19, TypeScript 5
- MongoDB Atlas + Mongoose (a remover)
- Tailwind v4, Atomic Design (atoms, molecules, organisms, templates)
- localStorage `userDetran` pra sessão atual

### Arquivos atuais
```
src/
├── app/
│   └── api/
│       ├── auth/login/route.ts          (← refatorar)
│       ├── cars/
│       │   ├── [id]/route.ts            (← refatorar — vira proxy)
│       │   ├── allcars.ts
│       │   ├── getCarById.ts
│       │   └── index.ts
│       ├── users/
│       │   ├── getuserbyemail.ts
│       │   └── index.ts
│       └── proposals/
│           ├── create/route.ts          (← refatorar)
│           ├── getbymanager/route.ts    (← refatorar OU remover)
│           ├── getbyowner/route.ts      (← refatorar OU remover)
│           ├── getbyuserid/route.ts     (← refatorar OU remover)
│           └── updatestatus/route.ts    (← refatorar OU remover)
├── components/
├── hooks/
├── lib/
│   ├── index.ts                         (← editar exports)
│   └── mongodb.ts                       (← DELETAR)
├── models/
│   ├── Car.ts                           (← DELETAR)
│   ├── Proposal.ts                      (← DELETAR)
│   └── User.ts                          (← DELETAR)
└── utils/
```

### Arquivos a CRIAR
```
src/
├── lib/
│   ├── servicenow.ts                    (HTTP client + Basic Auth)
│   └── carCatalog.ts                    (lista hardcoded ou chamada à Table API)
└── types/
    ├── car.ts                           (types do car_catalog + JSON da chaintechsales)
    └── proposal.ts                      (types da proposal ServiceNow)
```

### Endpoints Table API ServiceNow que o Next.js vai consumir

| Operação | Endpoint | Headers |
|---|---|---|
| Listar carros do catálogo | `GET /api/now/table/x_1880990_chain_car_catalog?sysparm_query=active=true^ORDERBYdisplay_order&sysparm_limit=10` | `Authorization: Basic base64(admin:<senha>)` |
| Buscar detalhes do carro na API externa | (via proxy do ServiceNow) `GET /api/x_1880990_chain/chain_public/car_details?name=X&chassi=Y` | `Authorization: Basic ...` |
| Criar proposta | `POST /api/now/table/x_1880990_chain_proposal` body: `{ car_name, car_chassi, purchase_offer, buyer }` | `Authorization: Basic ...` |

**Campo `buyer` no body:** `process.env.JORGE_SYS_ID` (sys_id do Jorge Higa hardcoded no `.env`).

### Variáveis de ambiente necessárias (`.env`)

```env
# Backend ServiceNow
SERVICENOW_URL=https://dev270250.service-now.com
SERVICENOW_USER=admin
SERVICENOW_PASS=<senha_do_admin_da_instancia>

# Buyer fixo do MVP
JORGE_SYS_ID=<sys_id_do_jorge_higa>

# Opcionais (URLs base, etc.)
NEXT_PUBLIC_APP_NAME=Chain Academy
```

**Importante:** `.env` está no `.gitignore`. NÃO commitar.

---

## Plano de refactor passo a passo

### Etapa 0 — Validar pré-requisitos

- [ ] Confirmar URL da instância: `https://dev270250.service-now.com`
- [ ] Confirmar `JORGE_SYS_ID` no `.env`
- [ ] Confirmar senha do admin no `.env`
- [ ] Validar com curl que `POST /api/now/table/x_1880990_chain_proposal` funciona com admin:
```bash
curl -u "admin:<senha>" -X POST "https://dev270250.service-now.com/api/now/table/x_1880990_chain_proposal" \
  -H "Content-Type: application/json" \
  -d '{"car_name":"Beta 1","car_chassi":"DLGY1RD5B5QMCOIZF","purchase_offer":50000,"buyer":"<JORGE_SYS_ID>"}'
```
Esperado: HTTP 201, body com sys_id da proposta. Em ~3s a BR async preenche os campos.

### Etapa 1 — Criar `src/lib/servicenow.ts`

HTTP client com:
- Função `request(method, endpoint, body?)` que monta a URL completa, adiciona header `Authorization: Basic ...` e `Content-Type: application/json`.
- Cache do header de auth pra não recalcular base64 a cada chamada.
- Tratamento de erros (4xx, 5xx) com mensagem clara.
- Helpers: `serviceNow.get(endpoint)`, `serviceNow.post(endpoint, body)`, `serviceNow.patch(endpoint, sys_id, body)`.

### Etapa 2 — Criar types em `src/types/`

- `car.ts`: type `Car` (do catálogo: car_name, car_chassi, image_url) + `CarDetails` (do JSON da chaintechsales: u_marca, u_modelo, etc.).
- `proposal.ts`: type `ProposalCreate` (input: car_name, car_chassi, purchase_offer) + `ProposalResponse` (return da Table API).

### Etapa 3 — Refatorar `src/app/api/auth/login/route.ts`

Lógica: POST recebe `{email}`, valida que o email é o do Jorge (consultando `sys_user` na Table API ou comparando com env), retorna `{id, email, name, role}`. Sem password.

```ts
// Pseudocódigo
const { email } = await request.json();
const result = await serviceNow.get(`/api/now/table/sys_user?sysparm_query=email=${email}`);
if (!result.result.length) return 401;
const user = result.result[0];
return { id: user.sys_id, email: user.email, name: `${user.first_name} ${user.last_name}`, role: 'buyer' };
```

### Etapa 4 — Refatorar `src/app/api/cars/index.ts` (listar 10 do catálogo)

```ts
const result = await serviceNow.get('/api/now/table/x_1880990_chain_car_catalog?sysparm_query=active=true^ORDERBYdisplay_order&sysparm_limit=10');
return result.result.map(c => ({ id: c.sys_id, name: c.car_name, chassi: c.car_chassi, imageUrl: c.image_url }));
```

### Etapa 5 — Refatorar `src/app/api/cars/[id]/route.ts` (detalhes do carro)

Recebe sys_id (ou nome+chassi). Chama o proxy do ServiceNow (`/api/x_1880990_chain/chain_public/car_details?name=X&chassi=Y`) e retorna o JSON. Trata erros.

### Etapa 6 — Refatorar `src/app/api/proposals/create/route.ts`

Recebe `{car_name, car_chassi, purchase_offer}`. Adiciona `buyer: process.env.JORGE_SYS_ID`. Faz POST pra Table API. Retorna `{success, proposalNumber, sys_id}`.

### Etapa 7 — Limpeza

- [ ] Deletar `src/lib/mongodb.ts`.
- [ ] Deletar `src/models/`.
- [ ] Deletar `src/app/api/users/getuserbyemail.ts` (lógica vai pra dentro do login).
- [ ] Remover endpoints proposal_getby* (não usados no MVP).
- [ ] Remover dependência `mongoose` do `package.json` + `npm install`.

### Etapa 8 — Componentes React

Provavelmente componentes hoje esperam formatos antigos (com `_id`, `userId`, etc.). Validar e ajustar onde necessário pra usar os novos formatos (com `sys_id`, `buyer`, etc.). Tentar manter os mesmos formatos de resposta retornando dados traduzidos das routes pra minimizar mudanças.

### Etapa 9 — Teste E2E

1. Inicia `npm run dev`
2. Acessa `localhost:3000/login`
3. Digita email do Jorge → autentica
4. Dashboard mostra os 10 carros do catálogo
5. Clica num carro → vê detalhes
6. Preenche purchase_offer → Submit
7. Confere no ServiceNow que a proposta foi criada com Jorge como buyer
8. Confere que email cai no `luizgalvao.dev@gmail.com` (inbox do owner)
9. Clica em Aprovar no email → state vira 50
10. Email cai em `luizmedeiros324@gmail.com` (inbox do manager)
11. Clica em Aprovar → state 60 → emails finais

---

## Decisões de design simplificadoras (MVP)

1. **Sem ACLs.** Admin do ServiceNow faz tudo via Basic Auth. Em produção real, OAuth + ACLs por role.
2. **1 buyer fixo.** Jorge Higa, sys_id no `.env`. Multi-buyer fica pra V2.
3. **10 carros hardcoded.** Catálogo estático no ServiceNow. Catálogo dinâmico (sincronização periódica com chaintechsales) fica pra V2.
4. **Sem páginas do owner/manager.** Eles interagem só pelo email. UI de "minhas propostas pendentes" pra owner/manager fica pra V2.
5. **Sem refresh em tempo real.** Buyer cria proposta, vê confirmação, fim. Acompanhamento de status via email. Polling/websocket fica pra V2.

---

## Recursos úteis

| Recurso | Local |
|---|---|
| Doc Zurich oficial | `/Users/galvao/Desktop/ProjetoChainAcademy/docs/ServiceNowDocs/markdown/` (branch `zurich`) |
| Doc Table API REST | `docs/ServiceNowDocs/markdown/api-reference/rest-apis/c_TableAPI.md` |
| Doc Scripted REST API | `docs/ServiceNowDocs/markdown/api-reference/rest-api-explorer/t_CreateAScriptedRESTService.md` |
| Clone local do repo ServiceNow app | `instances tracks/chainacademy-servicenow/` |
| Memória do Claude | `~/.claude/projects/-Users-galvao-Desktop-ProjetoChainAcademy/memory/MEMORY.md` |
| Lista de propostas (debug) | `https://dev270250.service-now.com/x_1880990_chain_proposal_list.do?sysparm_orderby=sys_created_on&sysparm_direction=desc` |
| Lista de emails (debug) | `https://dev270250.service-now.com/sys_email_list.do?sysparm_query=ORDERBYDESCsys_created_on` |

---

## Antes de codar o refactor — perguntas pro usuário

A nova sessão LLM deve confirmar com o usuário antes de começar:

1. **Imagens dos 10 carros:** Opção A (db_image), B (URL externa) ou C (estáticas no Next.js `public/`)?
2. **Quais 10 carros do chaintechsales escolher?** Pode rodar o curl da API externa, listar 10-20 e o usuário escolhe.
3. **Componentes React existentes** podem ser ajustados ou prefere manter o formato de resposta antigo nas routes (tradução interna)?
4. **OAuth ou Basic Auth?** Já foi decidido Basic Auth com admin (mais simples pro MVP). Confirma?
5. **Página de "minhas propostas" pro Jorge ver as que ele já enviou?** Não consta no MVP descrito, mas vale validar.

---

## Próximos passos pós-MVP (V2 — não fazer agora)

- ACLs condicionais (buyer só vê suas, etc.)
- Multi-buyer com cadastro
- Sincronização periódica do catálogo de carros via chaintechsales
- Página de "minhas propostas" pro buyer
- OAuth 2.0 Application Registry
- Inbound Email Actions (responder email com palavra-chave)
- Reports/Dashboards
- Logo + identidade visual nos emails (assets em `Identidade visual/logoFria.png`)
- Trocar prefix TASK→PROP do auto-number
- Refatorar formatação de valores (`R$ R$` aparece em alguns templates)

---

## Resumo executivo da próxima sessão

**Faltam 3 coisas no ServiceNow:**
1. Tabela `x_1880990_chain_car_catalog` (15 min)
2. Hospedagem das 10 fotos (10 min se Opção C, 30 min se A)
3. Fix Script populando os 10 carros (15 min)
4. **OPCIONAL:** Scripted REST `getCarDetails` como proxy (20 min)

**Falta tudo no Next.js (refactor de 4-6h):**
- HTTP client + types
- 3 API routes refatoradas (login, cars, proposals/create)
- Limpeza de Mongoose
- Eventual ajuste de componentes

**Total estimado:** 5-8h para MVP funcional completo.
