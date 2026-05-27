# Chain Academy — Estado atual do projeto

Documento de referência completo para retomar o projeto em uma nova sessão de LLM. Lê este arquivo **antes** de qualquer ação, **junto com**:
- `NEXT_STEPS.md` (plano de ação do que falta)
- `INSTANCE_RECOVERY.md` (como recriar a instância do zero)
- `~/.claude/projects/-Users-galvao-Desktop-ProjetoChainAcademy/memory/MEMORY.md` (memória persistente do usuário)

---

## REGRAS NÃO-NEGOCIÁVEIS (LER ANTES DE QUALQUER COISA)

### 1. Consultar a doc local Zurich antes de afirmar qualquer comportamento

A documentação oficial completa do ServiceNow versão **Zurich** está em:

```
/Users/galvao/Desktop/ProjetoChainAcademy/docs/ServiceNowDocs/markdown/
```

É um repo Git separado, branch `zurich` ativa (verificar com `git branch --show-current`).

**Antes de afirmar como uma feature funciona, sempre consultar essa documentação local.** Use grep/find ou o agente Explore com queries específicas. Não chutar com base em "conhecimento geral" de ServiceNow — comportamento muda entre releases.

Diretórios mais úteis:

| Diretório | Para que serve |
|---|---|
| `application-development/app-engine-studio/` | Source Control, criação de apps, AES |
| `application-development/` | Scoped apps, tables, business rules, fix scripts |
| `api-reference/server-api-reference/` | GlideRecord, GlideDigest, GlideStringUtil, etc. |
| `api-reference/rest-apis/` | Attachment API, Table API |
| `api-reference/rest-api-explorer/` | Scripted REST API |
| `build-workflows/` | Flow Designer, approvals |
| `platform-administration/` | System Properties, Notifications, Email |
| `platform-security/` | ACLs, OAuth, roles, Connections & Credentials |
| `integrate-applications/` | Integration Hub, Connection Aliases |

### 2. Credenciais (não pedir, já estão registradas)

| Sistema | Credencial |
|---|---|
| API externa chaintechsales | Basic Auth — `detran.integration` / `Desafio@2024` |
| ServiceNow PDI | admin (senha registrada na conta `developer.servicenow.com` do usuário) |
| Gmail SMTP | `luizmedeiros327@gmail.com` + App Password (vive em Email Account na instância) |
| GitHub | usuário `gallvones` + PAT (vive em Credential `GitHub Source Control`) |

**Convenção de aliases Gmail:** todos os 14 usuários demo têm aliases únicos `luizmedeiros327+<userid>@gmail.com` (ex: `+abeltuter`, `+taylorvreeland`). Caem na mesma inbox mas o ServiceNow trata como destinatários distintos (evita proteção anti-loop SMTP). O admin usa `+admin`.

### 3. Workflow — não escrever artefatos como arquivos no `project/`

O `project/` é APENAS o frontend Next.js. Toda Business Rule, Script Include, REST Message, Flow, Notification etc. é criada **dentro da plataforma ServiceNow** via UI. O usuário aprende usando as ferramentas nativas.

**Modo:** guiar passo a passo na plataforma ("vá em System Definition > Business Rules > New, preencha Name = X, When = before insert, cola este script no campo Script..."). Não copiar/colar arquivos prontos no repo.

Schema/dados replicáveis vão para **Fix Scripts versionados no Git** (criados via UI no `sys_script_fix`, depois committed via Source Control).

### 4. Outras regras

- **Não acessar `.env`** do projeto (contém PAT do GitHub e credenciais).
- **Sem emojis** em código ou docs.
- **Sem comentários óbvios** no código.
- **Sem mocks/abstrações desnecessárias.**
- **Trabalhar sem perguntas de clarificação** quando possível — fazer a escolha razoável e seguir; o usuário redireciona se necessário.
- **Sempre mandar URL** quando referenciar uma tela do ServiceNow (formato `https://dev270250.service-now.com/...`).

---

## Contexto rápido — o que é o desafio

Marketplace de propostas de compra de veículos do Detran SP. Migração de stack:

| Antes | Depois |
|---|---|
| Next.js 16 + MongoDB | Next.js 16 (apenas frontend) + ServiceNow (backend completo) |

3 personas:
- **Buyer** (comprador) — usa Next.js, conhece apenas nome + chassi do carro
- **Owner** (vendedor) — recebe email, decide via magic link
- **Regional Manager** — recebe email após owner aprovar, decide via magic link

Fluxo:
```
Buyer cria proposta → Email pro Owner → Owner aprova/rejeita/contra-propõe
                                      ↓ (aprovou)
                          Email pro Regional Manager
                                      ↓ (aprovou)
                       Email final pro Buyer + Owner (Approved)
```

State machine (campo `state` da proposta):
- `10` Draft
- `20` Awaiting Owner Approval
- `30` Counter Proposal Requested
- `40` Rejected by Owner (terminal)
- `50` Awaiting Regional Manager Approval
- `60` Approved (terminal)
- `70` Rejected by Regional Manager (terminal)

Transições válidas:
```
10 → 20
20 → 30 | 40 | 50
30 → 10 | 20
50 → 60 | 70
```

---

## Ambiente atual

| Recurso | Valor |
|---|---|
| Instância ativa | `https://dev270250.service-now.com` |
| Versão | **Zurich** |
| Scope da app | `x_1880990_chain` (nome: `Chain Academy`) |
| sys_id da app | `08f5cb1c47cd435097ef6042d16d43e7` |
| Repositório Git | `https://github.com/gallvones/chainacademy-servicenow` (branch `main`) |
| Clone local do repo | `/Users/galvao/Desktop/ProjetoChainAcademy/instances tracks/chainacademy-servicenow/` |
| Frontend Next.js | `/Users/galvao/Desktop/ProjetoChainAcademy/project/` (Next 16, React 19, TS, Tailwind v4) |
| Docs ServiceNow | `/Users/galvao/Desktop/ProjetoChainAcademy/docs/ServiceNowDocs/markdown/` (branch zurich) |
| API externa de carros | `https://chaintechsales.service-now.com/api/now/table/u_car` |

Histórico de instâncias (todas anteriores estão mortas): `dev389297` Australia → `dev270081` Zurich → `dev270250` Zurich (atual).

---

## O QUE JÁ ESTÁ FEITO

### Infraestrutura básica

| Artefato | Detalhes |
|---|---|
| Scoped App `Chain Academy` | Scope `x_1880990_chain`, vinculada ao GitHub via Source Control |
| 3 Roles | `x_1880990_chain.buyer`, `x_1880990_chain.seller`, `x_1880990_chain.regional_manager` |
| Extensão `sys_user` | Campo custom `x_1880990_chain_u_chain_external_sys_id` (String 32) — mapeia sys_id externo do chaintechsales |

### Tabelas

**`x_1880990_chain_proposal`** (herda de `task`, auto-number prefix `PROP` mas na prática aparece `TASK0020XXX` por causa do prefix do task — não-bloqueante):

| Campo | Tipo | Mandatory | Origem |
|---|---|---|---|
| `car_name` | String 40 | sim | Input buyer |
| `car_chassi` | String 17 | sim | Input buyer |
| `car_info_snapshot` | String 4000 | não (read-only) | API externa |
| `car_brand` | String 40 | não | API (`u_marca`) |
| `car_model` | String 40 | não | API (`u_modelo`) |
| `car_color` | String 20 | não | API (`u_cor`) |
| `car_year_model` | Integer | não | API |
| `car_year_manufacture` | Integer | não | API |
| `car_uf` | Choice (27 estados) | não | API |
| `car_fipe_value` | Decimal | não | API |
| `purchase_offer` | Currency | sim | Input buyer |
| `buyer` | Reference → sys_user | sim | `gs.getUserID()` |
| `owner` | Reference → sys_user | não | Lookup local por external_sys_id |
| `state_manager` | Reference → sys_user | não | Lookup em uf_region_manager |
| `external_api_error` | String 4000 | não | Mensagem de erro da API |
| `state` herdado de task | Choice | sim | 7 choices customizadas (10–70) |

**`x_1880990_chain_uf_region_manager`** (lookup):

| Campo | Tipo | Mandatory |
|---|---|---|
| `uf` | Choice (27 estados) | sim |
| `state_name` | String 40 | sim |
| `region` | Choice (5 regiões) | sim |
| `manager` | Reference → sys_user | sim |

**`x_1880990_chain_car_catalog`** (vitrine do dashboard do Next.js):

| Campo | Tipo | Mandatory |
|---|---|---|
| `car_name` | String 40 | sim |
| `car_chassi` | String 17 | sim |
| `image_url` | URL 200 | não |
| `active` | True/False (default true) | não |

Contém 10 registros pré-selecionados de carros do chaintechsales (Beta 1, Iota 54, Epsilon 2, Alpha 33, Beta 45, Theta 84, Gamma 48, Epsilon 96, Beta 95, Alpha 42) — populados via Fix Script. Cada `image_url` aponta para uma foto hospedada em `db_image` no formato `https://<instance>.service-now.com/<chassi>.png`. A tabela é a fonte do dashboard do Next.js (10 cards com foto + nome + chassi).

### Dados populados (via Fix Scripts versionados no Git)

| Dado | Quantidade | Como |
|---|---|---|
| Regional Managers (sys_user) | 5 | Fix Script `Chain Academy - Populate initial data` |
| UF → Region → Manager | 27 | Mesmo Fix Script |
| Owners externos (sys_user com external_sys_id) | 9 | Mesmo Fix Script (busca user_name via REST na API externa) |
| Emails dos 14 usuários demo | aliases gmail iniciais (`+abeltuter` etc.) | Fix Script `Chain Academy - Setup unique gmail aliases` |
| Distribuição final dos emails | Todos os 9 owners → `luizgalvao.dev@gmail.com`; todos os 5 managers → `luizmedeiros324@gmail.com` | Fix Script `Chain Academy - Update demo emails for owner Abel and manager Taylor` (versão final genérica) |
| Notification Devices dos 14 | atualizados (cmn_notif_device tem que ser sincronizado separadamente do sys_user.email) | Mesmo Fix Script de distribuição |
| `notification` setting dos 14 | `Enable` (value=2) | Fix Script `Chain Academy - Enable notifications for managers and owners` |
| 1 buyer Jorge Higa | criado manualmente via UI, email pessoal dele | Atribuída role `x_1880990_chain.buyer` |
| 10 carros do car_catalog | car_name + car_chassi + image_url + active=true | Fix Script `Chain Academy - Populate car catalog` (usa `gs.getProperty('glide.servlet.uri')` para montar URL dinamicamente — sobrevive a recreate de instância) |
| 10 imagens de carros em `db_image` | uploaded via zip em `System UI > Image Zip Upload`, nomes = `<chassi>.png` | Manual (NÃO versionado em Git — vai precisar re-upload no recovery) |

**Mapeamento UF → Região → Manager** (do desafio original):

| Região | UFs | Manager |
|---|---|---|
| Norte | AC, AP, AM, PA, RO, RR, TO | Abraham Lincoln |
| Nordeste | AL, BA, CE, MA, PB, PE, PI, RN, SE | Charles Beckley |
| Centro-Oeste | DF, GO, MT, MS | George Washington |
| Sudeste | ES, MG, RJ, SP | Taylor Vreeland |
| Sul | PR, RS, SC | Megan Burke |

### Integração externa

| Artefato | Detalhes |
|---|---|
| Credential `Chain External Car Credential` | Basic Auth — `detran.integration` / `Desafio@2024` (scope Chain Academy) |
| Connection & Credential Alias `ChainExternalCar` | Type HTTP, scope Chain Academy |
| HTTP Connection `Chain External Car Connection` | URL `https://chaintechsales.service-now.com`, vincula Alias + Credential |
| REST Message `Chain External Car Service` | Endpoint base `/api/now/table`, Basic auth profile `Chain External Car Basic Auth` |
| Basic Auth Profile `Chain External Car Basic Auth` | Username `detran.integration`, password `Desafio@2024` |
| HTTP Method `getCarByNameAndChassi` | GET, endpoint com `?sysparm_query=u_car_name=${name}%5Eu_chassi=${chassi}&sysparm_limit=1`, vars com URL encoding |

**Importante:** método `getOwnerBySysId` **NÃO foi criado** — owners já estão mapeados localmente via `x_1880990_chain_u_chain_external_sys_id`, não precisa de chamada REST adicional.

### Business Rules (todas na tabela `x_1880990_chain_proposal`)

| Nome | When | Order | Active | Função |
|---|---|---|---|---|
| `populate_buyer_default` | before insert | 100 | ✅ | Seta `buyer = gs.getUserID()` se vazio |
| `enrich_proposal_from_external` | **async insert** | 200 | ✅ | Chama REST → popula campos do carro → lookup owner → lookup state_manager → seta state (20 ok / 10 erro) → `current.update()` |
| `default_state_to_awaiting_owner` | before insert | 300 | ❌ DESATIVADA | Lógica migrou pra dentro da async BR |
| `validate_state_transition` | before update | 100 | ✅ | Valida transições conforme state machine; aceita `from` vazio/0/1 como inicial |

**Justificativa pra `enrich_proposal_from_external` ser async:** ServiceNow proíbe HTTP outbound em before/after BR de scoped apps (`SecurityException: Illegal access to outbound HTTP in Chain Academy. Use an async business rule`). Por isso o INSERT acontece com campos vazios e a async preenche logo depois (~3s).

### Email

| Artefato | Detalhes |
|---|---|
| Email Account `Gmail SMTP ChainAcademy` | Type SMTP, Basic Auth, smtp.gmail.com:587 STARTTLS, App Password do Gmail |
| System Property `glide.email.smtp.active` | `true` (ativado manualmente; PDI Zurich nasce com false) |

### Email Notifications (todas na tabela `x_1880990_chain_proposal`)

| Nome | Trigger | Recipients (Users/Groups in fields) | Função |
|---|---|---|---|
| `proposal_awaiting_owner` | state changes to 20 | Owner | Notifica owner pra aprovar |
| `proposal_awaiting_manager` | state changes to 50 | State manager | Notifica manager regional |
| `proposal_approved` | state changes to 60 | Buyer + Owner | Confirmação final |
| `proposal_rejected` | state changes to 40 OR 70 | Buyer | Aviso de rejeição |

Todas com Subject parametrizado (`${number}`, `${car_name}`, etc.) e Message HTML com tabela de dados da proposta. Categoria `Approval`.

### Magic Link (parcial)

| Artefato | Status | Detalhes |
|---|---|---|
| System Property `x_1880990_chain.magic_link_secret` | ✅ | Tipo `password2`, valor de 64 chars hex (gerado por `openssl rand -hex 32`), Private ✓ |
| System Property `x_1880990_chain.magic_link_ttl_seconds` | ✅ | Tipo integer, valor `259200` (72h) |
| Script Include `MagicLinkToken` | ✅ | Métodos `generate(proposal, owner, action)` e `verify(token)`. Usa `SHA256(secret + ':' + payloadB64)` em vez de HMAC strict (HMAC não disponível em scoped app na Zurich). URL-safe base64. |
| Scripted REST API `Chain Magic Link` (parent) | ✅ | Base path `/api/x_1880990_chain/chain_magic_link`. Default ACL: placeholder (`/api/now/agent_intelligence` — não é usado porque resources são públicos) |
| Resource `approve` (GET `/approve`) | ✅ Testado | Valida token, transiciona state (20→50 ou 50→60), checa identidade (owner/state_manager bate com payload), retorna HTML verde/vermelho. Requires authentication: **false** |
| Resource `reject` | ❌ Falta criar |  |
| Resource `counter` (form HTML) | ❌ Falta criar | Decisão pendente: Opção A (sinaliza só) vs Opção B (form HTML) — usuário inclinado pra B |
| Resource `counter_submit` (POST) | ❌ Falta criar | Só se for Opção B |
| Templates de email com 3 botões clicáveis | ❌ Falta atualizar | Templates atuais têm texto-instrução, falta colocar `<a href="${url_approve}">[Aprovar]</a>` etc. |

---

## QUIRKS / BUGS DESCOBERTOS (essenciais — economizam horas)

### Sobre scoped apps (`x_1880990_chain`)

| Bug | Solução |
|---|---|
| `gs.print()` proibido em scoped — `Function print is not allowed in scope x_1880990_chain` | Usar `gs.info()` ou `gs.debug()` |
| `Packages.*` (acesso direto a Java) proibido em scoped | Usar APIs Glide scoped (`GlideDigest`, `GlideRecord`, etc.) |
| HMAC strict não disponível em `GlideDigest` scoped (só SHA1/SHA256/MD5 puros) | Implementar `SHA256(secret + ':' + payload)` — seguro com secret de 256-bit |
| Outbound HTTP proibido em `before`/`after` Business Rule de scoped app | Usar `async` Business Rule. Erro: `Use an async business rule to perform outbound HTTP requests` |
| `current.setWorkflow(false)` suprime Business Rules em cascata **E** Email Notifications | NÃO usar. Em vez disso: ajustar `validate_state_transition` pra aceitar transições do estado inicial |

### Sobre criação de records

| Bug | Solução |
|---|---|
| Application Picker fica no **kebab menu (3 pontinhos verticais)** ao lado de "Admin", NÃO no canto direito do header | Clicar no kebab → Workspaces NÃO é o picker; tem que olhar atentamente — pode estar via Settings (engrenagem) > Developer |
| System Property em scope mostra **Suffix** em vez de Name (auto-concatena `<scope>.<suffix>`) | Preencher só Suffix |
| State default do `task` é `1` (Open), não 0/vazio | `validate_state_transition` precisa aceitar `from === '1'` como inicial |

### Sobre email

| Bug | Solução |
|---|---|
| Email do `sys_user` ≠ email do `cmn_notif_device` (Notification Device) — atualizar só sys_user não afeta envio | Atualizar **ambos** quando trocar email de um user. Notification Device fica em `cmn_notif_device_list.do?sysparm_query=user.sys_id=XXX` |
| ServiceNow bloqueia self-email (Email Account.from == Recipient) com erro `SMTPSender: no recipients, email send ignored` | Usar aliases `+sufixo` no Gmail (o admin tem `+admin`, demais users tem `+<userid>`) |
| Sys_user com `Notification = Disable` (campo do sys_user, valor numérico) é excluído dos recipients silenciosamente | Setar `notification = 2` (Enable). Valores invertidos: 1=Disable, 2=Enable |
| PDI Zurich nasce com `glide.email.smtp.active = false` E `No Email Accounts Defined` | Ativar property + criar Email Account SMTP manualmente |
| Após muitos envios em sequência, `Email Sending` pode ficar `Disabled` automaticamente (rate limit Gmail) | Ir em diagnostics, clicar `Modify Email Sending/Receiving`, reativar |
| PDI bloqueia outbound pra domínio `@example.com` (silenciosamente — email fica eterno em send-ready) | Trocar todos os emails demo pra Gmail real (aliases) |
| `Preview Notification` (botão Related Link na notification) é ferramenta de debug — mostra users em vermelho strikethrough com tooltip explicando por que foram excluídos | Usar sempre que email não chega |

### Sobre REST Message

| Bug | Solução |
|---|---|
| Caracteres especiais (`^`, espaço) no Endpoint dão `Invalid query` | URL-encodar manualmente no Endpoint (`^` → `%5E`) |
| `setStringParameter` da Variable Substitution NÃO aplica URL encoding em chamadas server-side (mesmo configurado URL Encoding na UI) | Usar `setStringParameterNoEscape(name, encodeURIComponent(value))` |
| Password no Basic Auth Profile é encriptada com chave da instância — após Source Control para outra instância, password vira `Unable to decrypt password` | Redigitar a senha manualmente após cada recovery |

### Sobre Source Control / Recovery

| Bug | Solução |
|---|---|
| Source Control NÃO versiona: passwords, attachments, sys_user, cmn_notif_device | Recriar manualmente ou via Fix Script após cada bootstrap |
| Source Control versiona Fix Scripts MAS não executa automaticamente no import | Rodar manualmente após import (`Run Fix Script`) |
| Demo data da PDI pode ter user_names iguais aos managers/owners do desafio (abraham.lincoln, abel.tuter, etc.) | Fix Script `Populate initial data` faz **skip** se user existe — daí precisamos do Fix Script `Update users` pra setar `external_sys_id` nos owners |

### Sobre Scripted REST API

| Bug | Solução |
|---|---|
| `Default ACLs` no API parent é required mas só se aplica se resource tiver `Requires authentication=true` E `Requires ACL=true` | Selecionar qualquer ACL placeholder (ex: `/api/now/agent_intelligence`). Resources públicos sobrescrevem |
| `Public web service` precisa: resource com `Requires authentication=false` E `Requires ACL=false` | Marcar AMBOS desmarcados |

---

## Comandos úteis de debug

### Curl da API externa (chaintechsales)

```bash
# Buscar Beta 1
curl -s -u "detran.integration:Desafio@2024" \
  "https://chaintechsales.service-now.com/api/now/table/u_car?sysparm_query=u_car_name=Beta%201%5Eu_chassi=DLGY1RD5B5QMCOIZF&sysparm_limit=1" \
  | python3 -m json.tool

# Buscar owner pelo sys_id
curl -s -u "detran.integration:Desafio@2024" \
  "https://chaintechsales.service-now.com/api/now/table/sys_user/62826bf03710200044e0bfc8bcbe5df1?sysparm_fields=sys_id,user_name,first_name,last_name,email"
```

### Background Script de teste do Magic Link

```js
var mlt = new x_1880990_chain.MagicLinkToken();
var p = new GlideRecord('x_1880990_chain_proposal');
p.addQuery('state', '20');
p.setLimit(1);
p.orderByDesc('sys_created_on');
p.query();
if (p.next()) {
    var token = mlt.generate(p.sys_id.toString(), p.owner.toString(), 'approve');
    var url = gs.getProperty('glide.servlet.uri') + 'api/x_1880990_chain/chain_magic_link/approve?token=' + token;
    gs.info('URL: ' + url);
}
```

### URLs úteis (instância atual)

| Recurso | URL |
|---|---|
| Lista de propostas | `https://dev270250.service-now.com/x_1880990_chain_proposal_list.do?sysparm_orderby=sys_created_on&sysparm_direction=desc` |
| Criar nova proposta | `https://dev270250.service-now.com/x_1880990_chain_proposal.do?sys_id=-1` |
| Lista do catálogo de carros | `https://dev270250.service-now.com/x_1880990_chain_car_catalog_list.do` |
| Lista de imagens (db_image) | `https://dev270250.service-now.com/db_image_list.do?sysparm_query=ORDERBYDESCsys_updated_on` |
| Upload em lote de imagens | `https://dev270250.service-now.com/image_zip_upload.do` |
| Lista de Business Rules da app | `https://dev270250.service-now.com/sys_script_list.do?sysparm_query=collection=x_1880990_chain_proposal` |
| Lista de notifications da app | `https://dev270250.service-now.com/sysevent_email_action_list.do?sysparm_query=table=x_1880990_chain_proposal` |
| Fila de emails (filtrada por proposta) | `https://dev270250.service-now.com/sys_email_list.do?sysparm_query=subjectLIKEproposta^ORsubjectLIKEAprovacao^ORDERBYDESCsys_created_on` |
| Email Diagnostics | `https://dev270250.service-now.com/email_diagnostics.do` |
| Scripted REST APIs | `https://dev270250.service-now.com/sys_ws_definition_list.do` |
| Background Script (debug) | `https://dev270250.service-now.com/sys.scripts.do` |
| Lista de Fix Scripts | `https://dev270250.service-now.com/sys_script_fix_list.do?sysparm_query=nameLIKEChain%20Academy` |
| System Properties da app | `https://dev270250.service-now.com/sys_properties_list.do?sysparm_query=nameSTARTSWITHx_1880990_chain` |

---

## Decisões arquiteturais tomadas (não revisitar)

| Decisão | Escolha | Por quê |
|---|---|---|
| Backend | ServiceNow completo (não só workflow) | Desafio pede "implemente no ServiceNow" — máxima demonstração da plataforma |
| Tabela Proposal | Herdar de `task` | Ganha `number`, `state`, `comments`, `work_notes`, integração com `sysapproval_approver` |
| Tabela Car local | NÃO criar | Dados vêm via REST de chaintechsales — desafio explicita |
| Roles | 3 (buyer/seller/regional_manager) ao invés de Choice field | Permite múltiplas roles por user, ACLs nativas |
| Owners externos | Cadastro local mapeando via `x_1880990_chain_u_chain_external_sys_id` | Owners não logam, recebem só email |
| Canal de aprovação | **Magic Link** (em construção) + Inbound Email Actions (bônus futuro) | Mais 1-clique. Inbound como resiliência |
| `enrich_proposal_from_external` BR | **async** (não before) | Scoped app proíbe HTTP outbound em before/after BRs |
| Contraproposta | Opção B (form HTML servido pela Scripted REST API) — usuário inclinado | Mais profissional pro reviewer ver |
| Email único `luizmedeiros327@gmail.com` com aliases `+<userid>` | Todos demo users no mesmo inbox | Evita loop SMTP, fácil testar |
| Schema via Fix Script versionado no Git | Não Update Set | Replicável, versionado, leve |
| Backup via GitHub | Não App Repo | PDI não publica em App Repo, GitHub funciona normal |

---

## Como retomar o trabalho

1. **Ler este arquivo (`SERVICENOW_PROGRESS.md`) inteiro.**
2. **Ler `NEXT_STEPS.md`** — sabe exatamente o que falta na ordem correta.
3. **Conferir `INSTANCE_RECOVERY.md`** se a instância estiver caída.
4. Conferir auto-memory do Claude (`MEMORY.md`).
5. Confirmar que a instância está viva: `https://dev270250.service-now.com`.
6. Conferir commits recentes: `https://github.com/gallvones/chainacademy-servicenow/commits/main`.
7. Pegar a próxima task pendente do `NEXT_STEPS.md`.
