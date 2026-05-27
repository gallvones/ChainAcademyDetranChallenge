# Chain Academy — Recuperação da instância do zero

Procedimento completo para reconstruir a instância ServiceNow do desafio caso a atual hiberne, dê problema, ou precise ser recriada. Última validação: 2026-05-25 ao migrar de `dev270081` (perdida) para `dev270250`.

**Tempo total estimado:** ~60 min (sem contar provisionamento da PDI). Inclui passos NÃO-óbvios que descobrimos na prática — sem essa lista, leva o dobro.

**Antes de começar:** ler `SERVICENOW_PROGRESS.md` pra contexto completo + regras (consultar doc Zurich local sempre, etc.).

---

## Inventário do que precisa ser recuperado

| Item | Origem | Como volta |
|---|---|---|
| Schema da app (tabelas, choices, dictionary, roles) | Git (`gallvones/chainacademy-servicenow`) | Import via Source Control |
| Business Rules, Script Includes, Scripted REST APIs, Email Notifications, Email Scripts | Git | Import via Source Control |
| Tabela `x_1880990_chain_car_catalog` (estrutura) | Git | Import via Source Control |
| Dados (5 managers + 27 UFRM + 9 owners) | Git (Fix Script `Populate initial data`) | Run Fix Script |
| 10 carros do `car_catalog` (registros) | Git (Fix Script `Populate car catalog`) | Run Fix Script (depois das imagens) |
| Emails dos 14 usuários (aliases gmail) + Notification Devices + flag `notification=Enable` | Git (Fix Script `Setup unique gmail aliases` + `Enable notifications`) | Run Fix Scripts |
| Distribuição final dos emails demo (owners → luizgalvao.dev, managers → luizmedeiros324) | Git (Fix Script `Update demo emails for owner Abel and manager Taylor`) | Run Fix Script |
| **10 imagens dos carros em `db_image`** | Manual (db_image NÃO é versionado em Git — binários ficam fora dos XMLs) | Re-upload via `System UI > Image Zip Upload` |
| Connection & Credential Alias + Connection + Credential externa | Manual (não versionado — credenciais sensíveis) | Recriar via UI |
| **Password do Basic Auth Profile** (REST Message) | Manual — Source Control versiona o registro mas a password é encriptada com chave da instância antiga | Redigitar a senha após import |
| Email Account Gmail SMTP + App Password | Manual | Recriar via UI |
| System Property `glide.email.smtp.active = true` | Manual (PDI nasce com `false`) | Editar via UI |
| System Property `x_1880990_chain.magic_link_secret` | Manual (cada instância tem seu secret HMAC) | Recriar com `openssl rand -hex 32` |
| System Property `x_1880990_chain.magic_link_ttl_seconds` | Manual | Recriar |
| Buyer Jorge Higa (sys_user + role buyer + email pessoal) | Manual | Recriar via UI |
| OAuth Application Registry | Manual | Recriar via UI quando integrar Next.js |
| Default ACL placeholder na Scripted REST API | Manual | Selecionar `/api/now/agent_intelligence` (qualquer existente) |

**Repositório da app ServiceNow:** `https://github.com/gallvones/chainacademy-servicenow` (branch `main`).
**Clone local de referência:** `/Users/galvao/Desktop/ProjetoChainAcademy/instances tracks/chainacademy-servicenow/` (inspecionar XMLs versionados sem subir na instância).

---

## Passo 1 — Provisionar nova PDI

1. Acessar `https://developer.servicenow.com`.
2. Profile (canto superior direito) → **Manage > Instance**.
3. Se houver instância antiga hibernada/quebrada: **Release Instance** (libera o slot).
4. **Request Instance** → escolher versão **Zurich** (ou a release alvo do desafio).
5. Aguardar provisionamento (~5–10 min). Anotar:
   - URL: `https://devXXXXXX.service-now.com`
   - Usuário admin: `admin`
   - Senha (mostrada uma única vez — copiar)

6. **Atualizar a URL da instância em todos os lugares:**
   - **Auto-memory do Claude:** `/Users/galvao/.claude/projects/-Users-galvao-Desktop-ProjetoChainAcademy/memory/project_chainacademy.md` (campo "Instância ativa")
   - `SERVICENOW_PROGRESS.md` (tabela "Ambiente atual")
   - `NEXT_STEPS.md` (URLs nos passos)
   - `.env` do Next.js (quando integrado)
   - Bookmarks pessoais

---

## Passo 2 — Configurar credencial GitHub (PAT) na instância

Source Control HTTPS exige Basic Auth com Personal Access Token do GitHub.

### 2.1 — Gerar PAT (se não tiver um vivo)

1. GitHub → **Settings > Developer settings > Personal access tokens > Tokens (classic) > Generate new token (classic)**.
2. Note: `ServiceNow PDI Source Control`.
3. Expiration: 90 dias.
4. Scopes mínimos: `repo`.
5. **Generate token** → copiar (mostrado uma única vez).

### 2.2 — Criar Basic Auth Credential no ServiceNow

**Caminho:** `All > Connections & Credentials > Credentials > New > Basic Auth Credentials`

| Campo | Valor |
|---|---|
| Name | `GitHub Source Control` |
| Application | **Global** (credencial de plataforma, não da app) |
| User name | `gallvones` |
| Password | o PAT gerado em 2.1 |
| Active | ✓ |

**Submit.**

---

## Passo 3 — Importar a app via Source Control

Doc Zurich: `docs/ServiceNowDocs/markdown/application-development/app-engine-studio/source-control-import.md`.

1. **Caminho:** `All > App Engine > App Engine Studio`.
2. Clicar **Import app**.
3. Preencher:

| Campo | Valor |
|---|---|
| Network protocol | `Https` |
| URL | `https://github.com/gallvones/chainacademy-servicenow.git` |
| Branch | `main` |
| MID Server Name | (vazio) |
| Default email | seu email real |
| Credential | `GitHub Source Control` |

4. **Import app**.
5. **Select Application** → confirma o switch para **Chain Academy**.

**O que vem nesse import:** tabelas, roles, choices, extensão `sys_user`, Business Rules, Script Includes, Scripted REST APIs, Email Notifications, Fix Scripts (versionados, NÃO executados automaticamente).

---

## Passo 4 — Trocar pro scope Chain Academy

Antes de qualquer ação, garante que está no scope `x_1880990_chain`:

- Clica no **kebab menu (3 pontinhos verticais)** ao lado de "Admin" no header.
- Procura **Application scope** (NÃO confundir com Workspaces).
- Seleciona **Chain Academy**.
- Indicador visual: aparece anel/destaque vermelho indicando scope não-Global.

**Alternativa:** abrir AES e clicar na app Chain Academy — o scope troca automaticamente enquanto navega lá.

---

## Passo 5 — Pré-checks antes de rodar Fix Scripts

### 5.1 — API externa responde

```bash
curl -s -o /dev/null -w "%{http_code}\n" -u "detran.integration:Desafio@2024" \
  "https://chaintechsales.service-now.com/api/now/table/sys_user/62826bf03710200044e0bfc8bcbe5df1?sysparm_fields=user_name"
```

Esperado: `200`. Se não, abortar.

### 5.2 — Roles existem

```
https://devXXXXXX.service-now.com/sys_user_role_list.do?sysparm_query=nameSTARTSWITHx_1880990_chain
```

Esperado: `buyer`, `seller`, `regional_manager`, `user`. Se faltar, o import falhou — verificar logs.

---

## Passo 6 — Rodar os Fix Scripts de seed (ORDEM IMPORTA)

Os Fix Scripts são versionados na app e já vieram no passo 3. Precisam ser **executados manualmente** — Fix Scripts não rodam sozinhos no import (doc `application-development/t_RunFixScripts.md`).

**Caminho:** `All > System Definition > Fix Scripts`. Filtrar Name `LIKE Chain Academy`.

### 6.1 — Fix Script #1: `Chain Academy - Populate initial data`

(Atenção: tem 1 espaço no início do nome!)

**Função:** Cria 5 managers + 27 UFRM + 9 owners locais (busca user_name via REST na API externa). **Idempotente** — faz skip se user já existe.

Run Fix Script → conferir logs em `https://devXXXXXX.service-now.com/syslog_list.do?sysparm_query=messageLIKE%5BChainData%5D`.

Esperado terminar com `=== populate completo ===`.

### 6.2 — Fix Script #2: `Chain Academy - Update users (email + external mapping)`

**Por quê necessário:** Fix Script #1 faz **skip** quando o user_name já existe na demo data da PDI (abel.tuter, abraham.lincoln, etc.). Sem o #2, os owners não recebem o `x_1880990_chain_u_chain_external_sys_id` setado, e os emails ficam apontando pro `@example.com` original.

Run Fix Script → conferir `[ChainUpdate]` logs.

### 6.3 — Fix Script #3: `Chain Academy - Setup unique gmail aliases`

**Função:** Troca o email de cada um dos 14 usuários (managers + owners) pra `luizmedeiros327+<userid>@gmail.com` (alias único). Também atualiza/cria os Notification Devices (tabela `cmn_notif_device`) — essencial porque email do `sys_user` ≠ email do `cmn_notif_device`.

**Por quê crítico:** sem aliases únicos, o Gmail SMTP detecta self-email (From == Recipient) e bloqueia silenciosamente com `SMTPSender: no recipients, email send ignored`.

Run Fix Script → conferir `[ChainAliases]` logs. Esperado: 14 user updated + 14 device updated.

### 6.4 — Fix Script #4: `Chain Academy - Enable notifications for managers and owners`

**Função:** Seta `sys_user.notification = 2` (Enable) nos 14 usuários. Alguns demo users vêm com `Disable` (value=1) por default — Preview Notification mostra eles em strikethrough vermelho com tooltip "user's Notification setting is disabled".

Run Fix Script → conferir `[ChainNotif]` logs.

### 6.5 — Fix Script #5: `Chain Academy - Update demo emails for owner Abel and manager Taylor`

**Função:** distribuição final pra demo — todos os 9 owners → `luizgalvao.dev@gmail.com`, todos os 5 managers → `luizmedeiros324@gmail.com`. Substitui os aliases do passo 6.3 pelos endpoints reais distintos por papel.

**Por quê:** apresentação visual da demo mostra 3 inboxes separadas (buyer/owner/manager) em vez de tudo no mesmo Gmail principal.

Run Fix Script → conferir `[ChainDemo]` logs.

### 6.6 — Editar manualmente o email do `admin`

O Fix Script #3 atualiza só os 14 do desafio. Mas o admin (current user que vai criar propostas no teste) tem por default `admin@example.com`. Pra evitar self-email com qualquer dos 14 owners, trocar pra alias diferente:

```
https://devXXXXXX.service-now.com/sys_user.do?sysparm_query=user_name=admin
```

- Campo Email: `luizmedeiros327+admin@gmail.com`
- Update.

**E também o Notification Device:**

```
https://devXXXXXX.service-now.com/cmn_notif_device_list.do?sysparm_query=user.user_name=admin
```

- Email address: `luizmedeiros327+admin@gmail.com`
- Update.

### 6.7 — Validar populate

| Verificação | URL na nova instância | Esperado |
|---|---|---|
| 14 sys_users com email gmail | `/sys_user_list.do?sysparm_query=emailLIKEluizmedeiros327` | 14 (ou 15 com admin) |
| 27 UF-Region-Manager | `/x_1880990_chain_uf_region_manager_list.do` | 27 |
| 9 owners com external_sys_id | `/sys_user_list.do?sysparm_query=x_1880990_chain_u_chain_external_sys_idISNOTEMPTY` | 9 |

---

## Passo 6.8 — Criar buyer Jorge Higa (manual)

Tabela `sys_user`:
```
https://devXXXXXX.service-now.com/sys_user.do?sys_id=-1
```

| Campo | Valor |
|---|---|
| User ID | `jorge.higa` |
| First name | `Jorge` |
| Last name | `Higa` |
| Email | (email pessoal do buyer da demo) |
| Active | ✓ |

Submit. Depois adicionar role no Related List **Roles** → **Edit**: selecionar `x_1880990_chain.buyer` → Save.

**Anotar sys_id do Jorge** (visível na URL) — vai pro `.env` do Next.js como `JORGE_SYS_ID`.

---

## Passo 6.9 — Hospedar 10 imagens de carros em `db_image`

`db_image` não é versionado em Source Control — precisa re-upload toda recovery.

**Caminho:** `All > System UI > Image Zip Upload` (ou URL `https://devXXXXXX.service-now.com/image_zip_upload.do`).

1. Junte as 10 imagens em 1 arquivo `cars.zip`. Nomes dos arquivos = chassis (ex: `DLGY1RD5B5QMCOIZF.png`).
2. Lista dos 10 chassis usados no `car_catalog`:
   ```
   DLGY1RD5B5QMCOIZF (Beta 1)
   5O2ERWRV3ZQD24KEL (Iota 54)
   L6DO2VKIW0NJOXJVH (Epsilon 2)
   UCHNVSWRWJ8OS41P6 (Alpha 33)
   W1V34345XYR73TGNJ (Beta 45)
   80VUA5W5TL1XFYY63 (Theta 84)
   JTM663XEXY8YSGCPO (Gamma 48)
   HI6RZBK6DD4LACVGU (Epsilon 96)
   TFLXKG89HPKXPVIIV (Beta 95)
   93HVCAPEVQIGEB3OX (Alpha 42)
   ```
3. Choose File → seleciona `cars.zip` → Upload.
4. Confere em `https://devXXXXXX.service-now.com/db_image_list.do?sysparm_query=ORDERBYDESCsys_updated_on` — devem aparecer 10 registros.
5. Valida 1 URL pública em aba anônima do navegador: `https://devXXXXXX.service-now.com/DLGY1RD5B5QMCOIZF.png` — deve abrir a imagem.

**Importante:** se subir como `.jpg` em vez de `.png`, depois atualizar o Fix Script do passo 6.10 pra usar a extensão correta (ou re-uploadar como `.png`).

---

## Passo 6.10 — Fix Script #6: `Chain Academy - Populate car catalog`

Depois das imagens estarem no `db_image`, rodar este Fix Script popula os 10 registros do `car_catalog` (que é a vitrine do dashboard do Next.js).

`All > System Definition > Fix Scripts > New` ou puxado via Source Control:
- Name: `Chain Academy - Populate car catalog`
- Application: Chain Academy

Run Fix Script. Logs em `[ChainCatalog]`. Esperado: 10 `created` + `=== Total criados: 10, skipped: 0 ===`.

**Sobre as URLs geradas:** o script usa `gs.getProperty('glide.servlet.uri')` pra montar `image_url` dinamicamente. Recovery em nova instância funciona sem editar o script — pega a URL nova automaticamente.

---

## Passo 7 — Recriar credenciais e integrações externas

### 7.1 — Credential `Chain External Car Credential`

**Caminho:** `All > Connections & Credentials > Credentials > New > Basic Auth Credentials`

| Campo | Valor |
|---|---|
| Name | `Chain External Car Credential` |
| Application | Chain Academy |
| User name | `detran.integration` |
| Password | `Desafio@2024` |
| Active | ✓ |

### 7.2 — Connection & Credential Alias `ChainExternalCar`

**Caminho:** `All > Connections & Credentials > Connection & Credential Aliases > New`

| Campo | Valor |
|---|---|
| Name | `ChainExternalCar` (só alfanumérico + underscore) |
| Type | `Connection and Credential` |
| Application | Chain Academy |
| Connection type | `HTTP` |

### 7.3 — HTTP Connection `Chain External Car Connection`

No Alias recém-criado → Related List **Connections** → New → **HTTP(s) Connection**.

| Campo | Valor |
|---|---|
| Name | `Chain External Car Connection` |
| Connection alias | `ChainExternalCar` |
| Credential | `Chain External Car Credential` |
| Connection URL | `https://chaintechsales.service-now.com` |

### 7.4 — REDIGITAR PASSWORD do Basic Auth Profile da REST Message

A REST Message `Chain External Car Service` veio versionada. O Basic Auth Profile vinculado a ela (`Chain External Car Basic Auth`) também veio — **MAS a password é encriptada com a chave da instância antiga**, então a nova instância não consegue decriptar. Sintoma: BR `enrich_proposal_from_external` falha com `Error executing REST request: Unable to decrypt password`.

**Caminho:** `https://devXXXXXX.service-now.com/sys_ws_definition_list.do?sysparm_query=name=Chain%20External%20Car%20Service` → abrir → aba Authentication → campo `Basic auth profile` → clicar na lupa → abrir o `Chain External Car Basic Auth` → no campo **Password**, apagar e redigitar `Desafio@2024` → Update.

### 7.5 — Validar com Test no method

Abrir o HTTP Method `getCarByNameAndChassi` → Related Links → **Test**. Esperado: 200 + JSON do Beta 1.

---

## Passo 8 — Configurar email

### 8.1 — Ativar `glide.email.smtp.active`

PDI Zurich nasce com `false`. Editar:

```
https://devXXXXXX.service-now.com/sys_properties.do?sysparm_query=name=glide.email.smtp.active
```

- Banner do topo: clicar em "here" pra entrar em modo editável Global.
- Value: `true`.
- Update.

### 8.2 — Gerar App Password no Google

(Se ainda não tem um vivo.)

1. `https://myaccount.google.com/security` — ativar Verificação em duas etapas.
2. `https://myaccount.google.com/apppasswords` — criar App Password.
3. Nome: `ServiceNow ChainAcademy`. Copiar a senha de 16 caracteres.

### 8.3 — Criar Email Account `Gmail SMTP ChainAcademy`

**Caminho:** `https://devXXXXXX.service-now.com/sys_email_account_list.do` → New → SMTP.

| Campo | Valor |
|---|---|
| Name | `Gmail SMTP ChainAcademy` |
| Type | `SMTP` |
| Authentication | `Basic` |
| Server | `smtp.gmail.com` |
| User name | `luizmedeiros327@gmail.com` |
| Password | App Password do passo 8.2 |
| From | `luizmedeiros327@gmail.com` |
| Email user label | `Chain Academy Detran SP` |
| Connection Security | `STARTTLS` |
| Port | `587` |
| Active | ✓ |

Submit → **Test Connection** (Related Links). Esperado: "Connection successful".

### 8.4 — Validar pela Diagnostics

```
https://devXXXXXX.service-now.com/email_diagnostics.do
```

- **Email Sending: Operational** (verde).
- **Connection Status: Gmail SMTP ChainAcademy ✅** (verde).

---

## Passo 9 — Recriar System Properties do Magic Link

### 9.1 — Secret HMAC

**Caminho:** `https://devXXXXXX.service-now.com/sys_properties.do?sys_id=-1` (scope Chain Academy ativo).

| Campo | Valor |
|---|---|
| Suffix | `magic_link_secret` |
| Application | Chain Academy |
| Description | `Secret HMAC para assinar tokens de magic link` |
| Type | `password2` |
| Value | output de `openssl rand -hex 32` (string de 64 chars hex) |
| Private | ✓ |

### 9.2 — TTL

| Campo | Valor |
|---|---|
| Suffix | `magic_link_ttl_seconds` |
| Application | Chain Academy |
| Type | `integer` |
| Value | `259200` |

### 9.3 — Validar Script Include

`https://devXXXXXX.service-now.com/sys.scripts.do` (scope Chain Academy):

```js
var mlt = new x_1880990_chain.MagicLinkToken();
var token = mlt.generate('test_p', 'test_o', 'approve');
gs.info('Token: ' + token);
gs.info('Verify: ' + JSON.stringify(mlt.verify(token)));
```

Esperado: token gerado + `{"valid":true,"payload":{...}}`.

---

## Passo 10 — Re-popular Default ACL placeholder na Scripted REST API

Se a Scripted REST API `Chain Magic Link` veio sem o Default ACL preenchido (campo é required no parent):

`https://devXXXXXX.service-now.com/sys_ws_definition_list.do?sysparm_query=name=Chain%20Magic%20Link` → abrir → aba Security → **Default ACLs**: clicar no cadeado → adicionar qualquer ACL existente (ex: `/api/now/agent_intelligence`). Não é usada porque os resources são públicos, mas o form exige pelo menos 1.

---

## Passo 11 — Configurar branch default no GitHub (pendência única)

GitHub Settings → Branches → trocar default de `undefined` (ou o que estiver) pra `main`. Não bloqueia funcionamento, mas evita confusão futura em pulls.

---

## Passo 12 — Teste E2E

### 12.0 — Validar car_catalog
```
https://devXXXXXX.service-now.com/x_1880990_chain_car_catalog_list.do
```
Esperado: 10 registros com `image_url` apontando pra `https://devXXXXXX.service-now.com/<chassi>.png`. Cola uma das URLs em aba anônima — abre a imagem.

### 12.1 — Criar proposta nova
1. Criar proposta nova:
   ```
   https://devXXXXXX.service-now.com/x_1880990_chain_proposal.do?sys_id=-1
   ```
   `Car Name: Beta 1`, `Car Chassi: DLGY1RD5B5QMCOIZF`, `Purchase Offer: 50000`, `Buyer: Jorge Higa`. Submit.

2. Esperar 3-5s (async BR roda), recarregar — confirmar `State = Awaiting Owner Approval`, campos do carro preenchidos (Brand=Quantum, Model=Beta 1 2004, Color=Vermelho, UF=SP, FIPE=194795), Owner=Abel Tuter, State Manager=Taylor Vreeland.

3. Esperar mais 1-2 min — email cai no Gmail (`luizmedeiros327@gmail.com`) com sufixo `+abeltuter`.

4. Testar Magic Link:
   ```js
   var mlt = new x_1880990_chain.MagicLinkToken();
   var p = new GlideRecord('x_1880990_chain_proposal');
   p.addQuery('state', '20');
   p.setLimit(1);
   p.orderByDesc('sys_created_on');
   p.query();
   if (p.next()) {
       var token = mlt.generate(p.sys_id.toString(), p.owner.toString(), 'approve');
       gs.info(gs.getProperty('glide.servlet.uri') + 'api/x_1880990_chain/chain_magic_link/approve?token=' + token);
   }
   ```
   Cola a URL no navegador → página verde "Proposta aprovada".

5. Recarregar a lista de propostas → state agora deve estar `Awaiting Regional Manager Approval`.

6. Em 1-2 min, email cai no Gmail com sufixo `+taylorvreeland`.

---

## Apêndice — Por que cada coisa está onde está

- **Schema vai no Git:** replicabilidade.
- **Seed data vai como Fix Script versionado:** dados fixos do desafio, evita recriação manual.
- **Credenciais e secrets NÃO vão no Git:** PAT, password externa, magic_link_secret, App Password do Gmail.
- **Email Account NÃO vai no Git:** App Password sensível.
- **Aliases gmail com `+sufixo`:** evita self-email do Gmail SMTP.
- **Notification setting (sys_user.notification):** alguns demo users vêm `Disable` por default — precisa setar via Fix Script.

---

## Apêndice — Comandos úteis de debug

```bash
# Listar Fix Scripts da app no clone local
ls "/Users/galvao/Desktop/ProjetoChainAcademy/instances tracks/chainacademy-servicenow/08f5cb1c47cd435097ef6042d16d43e7/update/" | grep sys_script_fix

# Re-puxar mudanças do GitHub na instância via AES
# UI: All > App Engine > App Engine Studio > [abrir app] > Source control > Pull from repository

# Testar API externa
curl -s -u "detran.integration:Desafio@2024" \
  "https://chaintechsales.service-now.com/api/now/table/u_car?sysparm_query=u_car_name=Beta%201%5Eu_chassi=DLGY1RD5B5QMCOIZF&sysparm_limit=1" \
  | python3 -m json.tool
```

---

## Apêndice — Troubleshooting

| Sintoma | Causa | Solução |
|---|---|---|
| Import via Source Control: "Authentication failed" | PAT expirado ou sem scope `repo` | Regenerar PAT no GitHub, atualizar Credential `GitHub Source Control` |
| Filtro `emailLIKEluizmedeiros327` retorna 0 | Fix Scripts #3 não rodou ou rodou fora do scope | Verificar scope Chain Academy + rodar `Setup unique gmail aliases` |
| `[ChainData] App Chain Academy nao encontrada` | Fix Script rodou fora do scope | Trocar scope antes de rodar |
| 9 owners não aparecem | API externa caiu | Rodar curl do passo 5.1 |
| Pull sobrescreve dados | Delta loading desativado | Conferir system property de delta loading (vem ativo por default) |
| BR `enrich_proposal_from_external` falha com `Unable to decrypt password` | Password do Basic Auth Profile veio encriptada com chave da instância antiga | Redigitar password no Basic Auth Profile (passo 7.4) |
| Email criado mas Type=`send-ready` por +5 min | `glide.email.smtp.active = false` OU `No Email Accounts Defined` | Ativar property (passo 8.1) E criar Email Account (passo 8.3) |
| Email Type=`send-ignored` com `no recipients` | Aliases gmail iguais entre admin e recipient | Garantir admin com `+admin` (passo 6.5), recipient com `+<outroNome>` (passo 6.3) |
| Email Sending vira `Disabled` após muitos envios | Rate limit Gmail | Email Diagnostics → `Modify Email Sending/Receiving` → reativar |
| Preview Notification mostra recipient em vermelho strikethrough com tooltip "Notification setting is disabled" | `sys_user.notification = 1` (Disable) | Rodar Fix Script `Enable notifications` (passo 6.4) |
| Scripted REST API retorna 401 ou nada | Resource sem `Requires authentication = false` | Editar resource → Security → desmarcar AMBOS (auth + ACL) |
| Magic Link retorna `Token invalido (assinatura nao confere)` | Secret diferente do que foi usado pra gerar o token | Confirmar `magic_link_secret` da property bate. Tokens antigos viram inválidos após troca de secret |
