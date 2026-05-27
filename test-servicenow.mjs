import 'dotenv/config';

const URL = process.env.INSTANCE_URL;
const USER = process.env.INSTANCE_USER;
const PASS = process.env.INSTANCE_PASSWORD;

console.log('Diagnostico de conexao ServiceNow\n');
console.log('INSTANCE_URL      :', URL ?? '(ausente)');
console.log('INSTANCE_USER     :', USER ?? '(ausente)');
console.log('INSTANCE_PASSWORD :', PASS ? `definido (${PASS.length} chars)` : '(ausente)');
console.log('URL com barra final?', URL?.endsWith('/') ? 'SIM (pode causar // no path)' : 'nao');

if (!URL || !USER || !PASS) {
  console.error('\nFaltam variaveis no .env. Preencha e tente de novo.');
  process.exit(1);
}

const auth = 'Basic ' + Buffer.from(`${USER}:${PASS}`).toString('base64');
const endpoint = `${URL.replace(/\/$/, '')}/api/now/table/sys_user?sysparm_limit=1&sysparm_fields=sys_id,user_name`;

console.log('\nTestando GET', endpoint, '...\n');

try {
  const res = await fetch(endpoint, {
    headers: { Authorization: auth, Accept: 'application/json' },
  });
  console.log('HTTP status:', res.status, res.statusText);
  const text = await res.text();
  console.log('Body:', text.slice(0, 400));
  if (res.ok) {
    console.log('\nAUTH OK — credenciais validas.');
  } else if (res.status === 401) {
    console.log('\n401 — usuario/senha incorretos ou senha rotacionada na instancia.');
  }
  process.exit(res.ok ? 0 : 1);
} catch (err) {
  console.error('Erro de rede:', err.message);
  console.error('Instancia pode estar hibernando — acesse', URL, 'no navegador para acordar.');
  process.exit(1);
}
