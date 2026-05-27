import { serviceNow, getCarByNameAndChassi, type TableResponse } from "@/lib";
import type { CarDetail } from "@/types/car";

interface CatalogRow {
  sys_id: string;
  car_name: string;
  car_chassi: string;
  image_url: string;
}

export async function getCarById(id: string): Promise<CarDetail | null> {
  const data = await serviceNow.get<TableResponse<CatalogRow>>(
    `/api/now/table/x_1880990_chain_car_catalog/${id}` +
      "?sysparm_fields=sys_id,car_name,car_chassi,image_url"
  );

  const row = data.result;
  if (!row || !row.sys_id) {
    return null;
  }

  const detail: CarDetail = {
    id: row.sys_id,
    name: row.car_name,
    chassi: row.car_chassi,
    img: row.image_url,
  };

  try {
    const ext = await getCarByNameAndChassi(row.car_name, row.car_chassi);
    if (ext) {
      detail.brand = ext.u_marca;
      detail.model = ext.u_modelo;
      detail.color = ext.u_cor;
      detail.uf = ext.u_uf;
      detail.plate = ext.u_placa || undefined;
      detail.yearModel = ext.u_ano_modelo || undefined;
      detail.yearManufacture = ext.u_ano_fabricacao || undefined;
      const fipe = Number(ext.u_valor_tabela_fipe);
      detail.fipeValue = Number.isFinite(fipe) && fipe > 0 ? fipe : undefined;
    }
  } catch (error) {
    console.error("Falha ao buscar detalhes na API externa:", error);
  }

  return detail;
}
