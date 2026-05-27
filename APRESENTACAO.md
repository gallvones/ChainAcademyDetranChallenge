# Chain Academy — Guia de apresentação

Resumo executivo de tudo que foi construído no ServiceNow para o desafio do Sr. Adilson (Detran SP).

---

## O desafio em uma frase

Marketplace de propostas de compra de veículos onde **buyer** envia oferta conhecendo só nome e chassi, **owner** decide via email (aceita / rejeita / contrapõe), e **regional manager** dá aprovação final automatizada por UF — tudo implementado no ServiceNow como backend, com Next.js como frontend.

## Personas e fluxo

```
Jorge Higa (buyer)              Abel Tuter (owner)              Taylor Vreeland (manager SP)
    │                                  │                                    │
    └─ envia oferta no Next.js ─────► email com 3 botões                    │
                                    [Aprovar][Rejeitar][Contraproposta]     │
                                       │                                    │
                                       ├─ Aprovar ──────────────────► email com 2 botões
                                       │                              [Aprovar][Rejeitar]
                                       │                                    │
                                       │                                    └─ Aprovar
                                       │                                            │
                                       │                                            ▼
                                       │                                  Email final pro Jorge + Abel
                                       │                                  "Proposta aprovada"
                                       │
                                       ├─ Rejeitar ──► state=40, email pro Jorge "rejeitada"
                                       │
                                       └─ Contraproposta ──► form HTML ──► Jorge recebe nova proposta
                                                                            com 2 botões
                                                                            [Aceitar][Recusar]
```

---

## Ferramentas do ServiceNow utilizadas

### 1. Scoped Application
**O que é:** container isolado pra app custom, com namespace próprio (`x_1880990_chain`).
**Por que escolhi:** isolamento de tabelas, scripts, roles e ACLs. Boa prática profissional vs criar coisas em scope Global.
**O que fiz:** criei a app `Chain Academy` (scope `x_1880990_chain`, sys_id `08f5cb1c47cd435097ef6042d16d43e7`).

### 2. Source Control (Git/GitHub)
**O que é:** integração nativa do ServiceNow com Git.
**Por que escolhi:** versionamento + replicabilidade (se a PDI hibernar, recrio a app em outra instância via import).
**O que fiz:** vinculei a app ao repo `gallvones/chainacademy-servicenow`. Toda mudança estrutural (tabelas, BRs, scripts, etc.) é versionada com `Source control > Commit changes` no App Engine Studio.

### 3. Tables (`sys_db_object`)
**O que é:** o banco de dados nativo do ServiceNow — tudo é tabela.
**O que fiz:** criei 2 tabelas custom:

| Tabela | Função |
|---|---|
| `x_1880990_chain_proposal` | herda de `task` (ganha number, state, comments, work_notes nativos). 16 campos custom (car_name, car_chassi, car_brand, car_model, car_uf, car_fipe_value, purchase_offer, buyer, owner, state_manager, counter_offer, etc.) + 7 choices customizadas para o campo `state` (10=Draft, 20=Awaiting Owner, 30=Counter, 40=Rejected by Owner, 50=Awaiting Manager, 60=Approved, 70=Rejected by Manager) |
| `x_1880990_chain_uf_region_manager` | tabela de lookup mapeando 27 UFs → 5 regiões → 5 managers (Abraham=Norte, Charles=Nordeste, George=Centro-Oeste, Taylor=Sudeste, Megan=Sul) |
| `x_1880990_chain_car_catalog` | catálogo de 10 carros pré-selecionados que aparecem no dashboard do Next.js (car_name, car_chassi, image_url, active). Tabela separada da chaintechsales porque a API externa não tem endpoint de "lista paginada com fotos" e não armazena imagens. |

**Bônus:** estendi `sys_user` (tabela global de usuários) com 1 campo custom `x_1880990_chain_u_chain_external_sys_id` para mapear sys_ids da instância externa (chaintechsales) aos sys_users locais.

### 4. Roles (`sys_user_role`)
**O que é:** sistema de autorização N:N (um user pode ter múltiplas roles).
**Por que escolhi:** ao invés de campo Choice (que permite só 1 valor), roles permitem que a mesma pessoa seja `buyer` (de carro X) e `seller` (de carro Y) simultaneamente.
**O que fiz:** 3 roles customizadas — `x_1880990_chain.buyer`, `x_1880990_chain.seller`, `x_1880990_chain.regional_manager`. ACLs nativas reconhecem via `gs.hasRole('x_1880990_chain.buyer')`.

### 5. Fix Scripts (`sys_script_fix`)
**O que é:** scripts JavaScript versionáveis executados manualmente uma vez (ideal para seed data e migrações).
**Por que escolhi:** dados fixos do desafio (5 managers + 27 UFRM + 9 owners) precisam ser replicáveis em qualquer instância nova. Fix Script versionado no Git evita recriar à mão.
**O que fiz:** 5 Fix Scripts:

| Fix Script | Função |
|---|---|
| `Chain Academy - Populate initial data` | Cria 5 managers + 27 UFRM + 9 owners (puxa nome/email dos owners via REST da API externa) |
| `Chain Academy - Update users (email + external mapping)` | Atualiza email + mapeamento externo dos 14 demo users (necessário porque o Populate faz skip de users que já existem na demo data da PDI) |
| `Chain Academy - Setup unique gmail aliases` | Distribui emails únicos via aliases `+sufixo` no Gmail (evita auto-loop do SMTP) |
| `Chain Academy - Enable notifications for managers and owners` | Garante `sys_user.notification = Enable` (alguns demo users vêm com Disable) |
| `Chain Academy - Update demo emails for owner Abel and manager Taylor` | Distribui inboxes reais distintas pros 3 papéis da demo (9 owners → `luizgalvao.dev@gmail.com`, 5 managers → `luizmedeiros324@gmail.com`) |
| `Chain Academy - Populate car catalog` | Popula 10 carros pré-selecionados no `car_catalog` com `image_url` apontando para fotos hospedadas em `db_image` (URL montada dinamicamente via `gs.getProperty('glide.servlet.uri')` — sobrevive a recreate) |

### 6. Business Rules (`sys_script`)
**O que é:** código server-side disparado automaticamente em eventos da tabela (Insert/Update/Delete). Equivalente a "triggers" de SGBD ou "middleware" do Mongoose.
**Por que escolhi:** orquestrar lógica de negócio próximo dos dados garante que QUALQUER canal (UI, API REST, Mobile, Inbound Email) entre pela mesma porta com as mesmas validações.
**O que fiz:** 4 Business Rules na tabela `proposal`:

| Nome | When | Order | Função |
|---|---|---|---|
| `populate_buyer_default` | before insert | 100 | Se buyer veio vazio, seta = current_user. Defesa em profundidade. |
| `enrich_proposal_from_external` | **async insert** | 200 | Chama REST Message → popula campos do carro → lookup local do owner pelo external_sys_id → lookup do manager pela UF → seta state (20 OK ou 10 erro) → `current.update()` |
| `validate_state_transition` | before update | 100 | Valida transições conforme state machine documentada. Aborta save se transição inválida. |
| `default_state_to_awaiting_owner` | before insert | 300 | DESATIVADA — lógica foi migrada pra dentro da async |

**Decisão técnica importante:** a `enrich_proposal_from_external` é **async** (não before) porque ServiceNow proíbe HTTP outbound em before/after BRs de scoped apps (`SecurityException: Illegal access to outbound HTTP. Use an async business rule`). Implicação: o INSERT acontece com campos vazios e a async preenche tudo ~3s depois.

### 7. Connection & Credential Alias + Basic Auth Credentials
**O que é:** padrão profissional pra desacoplar credenciais externas de código.
**Por que escolhi:** boa prática — trocar senha futura é editar 1 registro, sem mexer em scripts. Ao invés de hardcodar `Desafio@2024` no script da BR.
**O que fiz:**
- 1 **Basic Auth Credential** (`Chain External Car Credential`) com user/senha da API externa.
- 1 **Connection & Credential Alias** (`ChainExternalCar`).
- 1 **HTTP Connection** (`Chain External Car Connection`) apontando para `https://chaintechsales.service-now.com`.

### 8. REST Message (`sys_rest_message`)
**O que é:** wrapper declarativo pra chamadas HTTP externas. Versionável, testável.
**Por que escolhi:** centralizar a integração com chaintechsales em um artefato único. O script da BR fica enxuto (3 linhas) chamando o método nominalmente, em vez de 20 linhas montando o request HTTP manualmente.
**O que fiz:**
- REST Message `Chain External Car Service` com autenticação Basic via Basic Auth Profile.
- 1 HTTP Method: `getCarByNameAndChassi` (GET, parametrizado com `${name}` e `${chassi}`, URL encoding aplicado manualmente via `encodeURIComponent + setStringParameterNoEscape`).

### 9. Email Account SMTP
**O que é:** configuração de servidor SMTP outbound da instância.
**Por que escolhi:** PDIs Zurich nascem **sem email account configurada** — sem ela, emails não saem.
**O que fiz:**
- Criei Email Account `Gmail SMTP ChainAcademy` (smtp.gmail.com:587 STARTTLS, Basic Auth com App Password do Gmail).
- Ativei a property `glide.email.smtp.active = true` (também vem `false` por default).

### 10. Email Notifications (`sysevent_email_action`)
**O que é:** sistema declarativo de templates de email + triggers.
**Por que escolhi:** ao invés de chamar `gs.eventQueue` ou enviar email programaticamente em BR, separar a configuração do conteúdo. Editar o body do email = editar 1 registro, sem deploy de código.
**O que fiz:** 5 notifications na tabela `proposal`:

| Notification | Trigger | Recipient | Conteúdo |
|---|---|---|---|
| `proposal_awaiting_owner` | state changes to 20 | Owner | Dados da proposta + 3 botões clicáveis (Aprovar / Rejeitar / Contraproposta) |
| `proposal_awaiting_manager` | state changes to 50 | State manager | Dados + 2 botões (Aprovar / Rejeitar) |
| `proposal_counter_received` | state changes to 30 | Buyer | Dados + contraproposta do owner + 2 botões (Aceitar / Recusar) |
| `proposal_approved` | state changes to 60 | Buyer + Owner | Confirmação final |
| `proposal_rejected` | state changes to 40 OR 70 | Buyer | Notificação de rejeição |

Todas com HTML rico, variáveis dinâmicas (`${number}`, `${car_name}`, `${owner.first_name}`, etc.) e estilo inline pra compatibilidade com clientes de email.

### 11. Email Scripts (`sys_script_email`)
**O que é:** funções JavaScript que rodam em tempo de renderização do email — geram conteúdo dinâmico que não cabe em variáveis estáticas.
**Por que escolhi:** os botões Magic Link precisam de **URLs únicas com tokens HMAC válidos por proposta + owner + ação**. Variável estática não dá conta.
**O que fiz:** 3 Email Scripts referenciados nos templates via `${mail_script:nome}`:

| Email Script | Gera |
|---|---|
| `magic_link_owner_buttons` | 3 botões com tokens pro Owner (approve / reject / counter) |
| `magic_link_manager_buttons` | 2 botões com tokens pro Manager (approve / reject) |
| `magic_link_buyer_counter_buttons` | 2 botões com tokens pro Buyer (counter_accept / counter_reject) |

Cada um chama `MagicLinkToken.generate(proposalSysId, userSysId, action)` e renderiza HTML.

### 12. Script Include (`sys_script_include`)
**O que é:** módulo de código reutilizável (equivale a um arquivo `.js` importável).
**Por que escolhi:** centralizar a lógica de geração e validação de tokens HMAC. Usado pelos 3 Email Scripts (gerar) e pelos 6 Scripted REST API resources (validar).
**O que fiz:** Script Include `MagicLinkToken` com:
- `generate(proposalSysId, ownerSysId, action)` → retorna `base64(payload).hexSignature`
- `verify(token)` → retorna `{valid, payload}` ou `{valid: false, reason}`
- Assinatura usa `SHA256(secret + ':' + payloadB64)` via `GlideDigest` (em scoped app, HMAC strict não está disponível; SHA-256 com secret de 256-bit é seguro contra forja).
- URL-safe base64 (troca `+/=` por `-_` sem padding) pra cabar bem em query string.
- Expiração via campo `e` no payload (default 72h via System Property).

### 13. System Properties (`sys_properties`)
**O que é:** key/value store global da instância. Configurações editáveis sem mexer em código.
**O que fiz:**
- `x_1880990_chain.magic_link_secret` (type `password2`, 64 chars hex gerados com `openssl rand -hex 32`).
- `x_1880990_chain.magic_link_ttl_seconds` (type integer, valor 259200 = 72h).
- Habilitei `glide.email.smtp.active = true` (existia mas vinha desativada).

### 14. Scripted REST API (`sys_ws_definition` + `sys_ws_operation`)
**O que é:** endpoints HTTP customizados com lógica JavaScript própria.
**Por que escolhi:** Magic Link precisa de URLs **públicas** (sem login) que o owner/manager possam clicar do email. O ServiceNow tem Scripted REST API com flag "public web service" — perfeito pra esse caso.
**O que fiz:** Scripted REST API `Chain Magic Link` (path base `/api/x_1880990_chain/chain_magic_link`) com 6 resources:

| Resource | Method | Path | Função |
|---|---|---|---|
| `approve` | GET | `/approve` | Owner ou Manager aprova. State 20→50 ou 50→60. |
| `reject` | GET | `/reject` | Owner ou Manager rejeita. State 20→40 ou 50→70. |
| `counter` | GET | `/counter` | Renderiza form HTML para owner digitar valor da contraproposta. |
| `counter_submit` | POST | `/counter_submit` | Recebe form do counter, salva `counter_offer`, state→30. Aceita `application/x-www-form-urlencoded`. |
| `counter_accept` | GET | `/counter_accept` | Buyer aceita contraproposta. `purchase_offer = counter_offer`, state→50. |
| `counter_reject_by_buyer` | GET | `/counter_reject_by_buyer` | Buyer recusa contraproposta. State→40. |

Cada resource: valida token (chamando `MagicLinkToken.verify`), checa que action bate, checa que state atual permite a transição, valida identidade (sys_id do user no token = owner/state_manager/buyer da proposta), atualiza state e retorna HTML simples (verde = sucesso, vermelho = erro).

### 15. Notification Device (`cmn_notif_device`)
**O que é:** tabela intermediária entre sys_user e o canal real de envio (email/SMS).
**O que descobri (gotcha):** editar `sys_user.email` **NÃO** atualiza o `cmn_notif_device.email_address` automaticamente. Precisa atualizar ambos. Fix Script `Setup unique gmail aliases` cuida disso.

### 16. Images / db_image
**O que é:** tabela `db_image` da plataforma que armazena imagens com URL pública (`<instance>/<nome_arquivo>`). Não precisa de autenticação pra acessar — útil pra ativos visuais em emails ou frontends.
**Por que escolhi:** vitrine do dashboard precisa de 10 fotos de carros e a API externa não fornece imagens. Hospedar no ServiceNow centraliza tudo na plataforma (narrativa "tudo no ServiceNow") e gera URLs prontas sem dependência externa.
**O que fiz:** upload em lote via `System UI > Image Zip Upload` de 10 PNGs nomeadas pelos chassis (ex: `DLGY1RD5B5QMCOIZF.png`). Cada uma fica acessível em `https://dev270250.service-now.com/<chassi>.png` — referenciada no campo `image_url` do `car_catalog`.
**Trade-off conhecido:** `db_image` NÃO é versionado no Source Control (binários ficam fora dos XMLs). Em recovery de instância, precisa re-upload — documentado no `INSTANCE_RECOVERY.md`.

---

## Decisões arquiteturais principais

| Decisão | Escolha | Por quê |
|---|---|---|
| Backend | ServiceNow inteiro (não só workflow) | Desafio explícita "implemente no ServiceNow". Máxima demonstração da plataforma. |
| Tabela Proposal | Herdar de `task` | Ganha `number` auto-gerado, `state`, `comments`, `work_notes`, integração com sysapproval_approver |
| Tabela Car local | NÃO criar | Dados vêm via REST da chaintechsales — desafio explicita |
| Roles | 3 (buyer/seller/manager) | Permite múltiplas roles por user, ACLs nativas |
| Owners externos | Mapeamento local via campo custom em sys_user | Owners não logam, recebem só email |
| Canal de aprovação | Magic Link via Scripted REST API pública (token HMAC) | UX 1-clique, sem login, sem dependência de Outlook/Slack/Twilio |
| HMAC vs Approval Activity nativa do Flow Designer | HMAC custom | State machine custom de 7 estados com contraproposta não cabe na Approval Activity nativa (binária aprovar/rejeitar) |
| BR `enrich` async (não before) | Required pelo ServiceNow | Scoped apps proíbem HTTP outbound em before/after BRs |
| Email único `luizmedeiros327@gmail.com` com aliases `+sufixo` | Demo prática | Evita loop SMTP self-email, fácil testar com 14 users |
| Schema via Fix Script (não Update Set) | Versionado no Git | Replicável em qualquer PDI nova |

---

## Stack visual de tudo que entra no fluxo

```
Buyer (Next.js)
   │ POST /api/now/table/x_1880990_chain_proposal
   ▼
┌─────────────────────────────────────────────────────────────┐
│  ServiceNow                                                  │
│                                                              │
│  Tabela proposal  ← Business Rules (Insert)                  │
│      │            ← REST Message → API externa chaintechsales│
│      │            ← Lookup local (sys_user, uf_region_manager)│
│      │                                                       │
│      ▼                                                       │
│  state=20 ────► Email Notification ──► Email pro Owner       │
│                    │                       │                 │
│                    │       (Email Script gera URLs com       │
│                    │        tokens via Script Include +      │
│                    │        System Properties)               │
│                    │                       │                 │
│                    │                       ▼                 │
│                    │            Owner clica em botão         │
│                    │                       │                 │
│                    │                       ▼                 │
│                    │       Scripted REST API (público)       │
│                    │       Valida token, atualiza state      │
│                    │                       │                 │
│  state=50 ◄────────┼───────────────────────┘                 │
│      │             │                                         │
│      ▼             │                                         │
│  Email Notification ──► Email pro Manager (mesmo padrão)     │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Bugs / quirks descobertos (vale citar na apresentação)

1. **`gs.print()` proibido em scoped** — apenas `gs.info()` ou `gs.debug()`. Demonstra atenção a scope safety.
2. **HMAC strict não disponível em scoped** — implementei SHA-256 com secret prefix.
3. **HTTP outbound proibido em before/after BR** — usei async BR.
4. **`current.setWorkflow(false)` suprime notifications também** — não dá pra usar pra evitar loops em update.
5. **Email do `sys_user` ≠ email do `cmn_notif_device`** — atualizar AMBOS.
6. **Self-email (From == Recipient) bloqueado** — uso de aliases `+sufixo` pro Gmail.
7. **State default do `task` é `1`** (não vazio) — `validate_state_transition` precisa aceitar como estado inicial.
8. **Currency field setValue** — `current.field.setValue(...)`, não `current.setValue('field', ...)`. Doc Zurich oficial.
9. **Scripted REST API + form HTML** — precisa adicionar `application/x-www-form-urlencoded` no Override supported request formats; values vão pra `request.queryParams`, não `request.body`.

---

## Pontos pra destacar na apresentação

1. **Multiplos canais convergem na mesma porta** — REST API, UI, futuro Mobile, Inbound Email — todos passam pelas mesmas Business Rules. Demonstra entendimento da virtude do backend único.

2. **Magic Link com HMAC** — segurança sem login. Token assinado carrega proposta + owner + ação + expiração. Tampering invalida automaticamente.

3. **Async BR** — decisão consciente pela restrição da plataforma + tradeoff explicado (INSERT vazio + update ~3s depois).

4. **Reuso de componentes** — 1 Script Include `MagicLinkToken` usado por 3 Email Scripts (gerar) + 6 Scripted REST resources (validar) = mudança de algoritmo de assinatura altera 1 arquivo.

5. **Flow Designer considerado mas não usado** — Approval Activity nativa é binária (aprovar/rejeitar) e não cabe na state machine custom de 7 estados com contraproposta. Decisão técnica fundamentada (cita na entrevista se perguntarem).

6. **Versionamento via Git** — toda a estrutura da app está em `gallvones/chainacademy-servicenow`. PDI nova = recovery em ~60 min via `INSTANCE_RECOVERY.md`.

7. **Próximos passos não implementados** (citar como roadmap): ACLs condicionais por role+condição, Inbound Email Actions (resposta por email como canal alternativo ao Magic Link), Dashboards/Reports com KPIs por região.

---

## Frases prontas para entrevista

> "Escolhi Business Rule async em vez de before porque scoped apps proíbem HTTP outbound em before/after — é uma restrição de segurança da plataforma. O tradeoff é que o INSERT acontece com campos vazios e a enrichment popula 2-3 segundos depois."

> "O Magic Link usa HMAC com SHA-256. Em scoped app, HMAC strict não está disponível via GlideDigest, então implementei o padrão `SHA256(secret + ':' + payload)` — funcionalmente equivalente quando o secret tem 256 bits de entropia, que é o caso (gerei com `openssl rand -hex 32`)."

> "Considerei Flow Designer com Approval Activity nativa, mas a state machine do desafio tem 7 estados com contraproposta — não cabe no padrão binário aprovar/rejeitar. Então construí o canal de aprovação via Scripted REST API pública + token assinado, que dá controle total e ainda permite expansão futura para mais ações sem refazer fluxo."

> "Toda credencial sensível está em Connection & Credential Alias ou System Property tipo password2. Nada hardcoded em script. Boa prática de plataforma."

> "Toda a estrutura da app está versionada em Git via Source Control nativo do ServiceNow. Recovery de instância testada e documentada — leva ~60 minutos do zero."

---

## Anexos úteis

- `SERVICENOW_PROGRESS.md` — referência técnica completa (cada artefato, cada bug, cada decisão).
- `NEXT_STEPS.md` — roadmap do que não entrou nessa entrega.
- `INSTANCE_RECOVERY.md` — passo a passo de recuperar a instância do zero.
- `instances tracks/chainacademy-servicenow/` — clone local do repo Git da app.
- `docs/ServiceNowDocs/markdown/` — documentação oficial Zurich (consultada constantemente).
