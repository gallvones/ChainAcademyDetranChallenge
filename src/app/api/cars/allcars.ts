import { serviceNow, type TableResponse } from "@/lib";
import type { CatalogCar } from "@/types/car";

interface CatalogRow {
  sys_id: string;
  car_name: string;
  car_chassi: string;
  image_url: string;
}

export async function getAllCars(): Promise<CatalogCar[]> {
  const data = await serviceNow.get<TableResponse<CatalogRow[]>>(
    "/api/now/table/x_1880990_chain_car_catalog" +
      "?sysparm_query=active=true^ORDERBYcar_name" +
      "&sysparm_limit=10" +
      "&sysparm_fields=sys_id,car_name,car_chassi,image_url"
  );

  return data.result.map((c) => ({
    id: c.sys_id,
    name: c.car_name,
    chassi: c.car_chassi,
    img: c.image_url,
  }));
}
