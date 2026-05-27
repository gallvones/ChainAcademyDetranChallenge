const BASE_URL = process.env.EXTERNAL_CAR_API_URL ?? "https://chaintechsales.service-now.com";
const USER = process.env.EXTERNAL_CAR_API_USER;
const PASS = process.env.EXTERNAL_CAR_API_PASS;

export interface ExternalCar {
  u_car_name?: string;
  u_chassi?: string;
  u_marca?: string;
  u_modelo?: string;
  u_cor?: string;
  u_uf?: string;
  u_placa?: string;
  u_ano_modelo?: string;
  u_ano_fabricacao?: string;
  u_valor_tabela_fipe?: string;
}

export async function getCarByNameAndChassi(
  name: string,
  chassi: string
): Promise<ExternalCar | null> {
  if (!USER || !PASS) {
    throw new Error("Credenciais da API externa ausentes (EXTERNAL_CAR_API_USER / EXTERNAL_CAR_API_PASS)");
  }

  const query = `u_car_name=${name}^u_chassi=${chassi}`;
  const url =
    `${BASE_URL}/api/now/table/u_car?sysparm_query=${encodeURIComponent(query)}&sysparm_limit=1`;

  const res = await fetch(url, {
    headers: {
      Authorization: "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64"),
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`API externa de carros falhou: ${res.status}`);
  }

  const data = (await res.json()) as { result: ExternalCar[] };
  return data.result?.[0] ?? null;
}
