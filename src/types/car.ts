export interface CatalogCar {
  id: string;
  name: string;
  chassi: string;
  img?: string;
}

export interface CarDetail extends CatalogCar {
  brand?: string;
  model?: string;
  color?: string;
  uf?: string;
  plate?: string;
  yearModel?: string;
  yearManufacture?: string;
  fipeValue?: number;
}
