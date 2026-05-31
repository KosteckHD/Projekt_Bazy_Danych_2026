export interface Brand {
  brandid: number;
  brandname: string;
  country: string;
}

export interface Car {
  carid: number;
  status: "Available" | "Rented" | "Maintenance" | "Damaged";
  color: string;
  dooramount: number;
  productiondate: string;
  vin: string;
  carengine: number;
  horsepower: number;
  bodytype: string;
  modelname: string;
  hourlycost: string | number;
  modeldescription: string;
  brandname: string;
  country: string;
}

export interface PopularCarStat {
  brandname: string;
  modelname: string;
  rental_count: string | number;
}

export interface HealthStatus {
  status: string;
  time?: string;
  message?: string;
}

export interface NewCarData {
  brandName: string;
  country: string;
  modelName: string;
  hourlyCost: string | number;
  modelDescription?: string;
  status: string;
  color: string;
  doorAmount: string | number;
  productionDate: string;
  VIN: string;
  carEngine: string | number;
  horsePower: string | number;
  bodyType: string;
}

export interface AddCarResponse {
  success: boolean;
  message: string;
  carId: number;
  brandId: number;
  modelId: number;
}
