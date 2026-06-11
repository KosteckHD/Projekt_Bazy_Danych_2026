export interface Brand {
  brandid: number;
  brandname: string;
  country: string;
}

export interface Car {
  carid: number;
  carId?: number;
  branchId?: number | null;
  branchid?: number | null;
  branchName?: string | null;
  branchname?: string | null;
  status: "Available" | "Rented" | "Maintenance" | "Damaged";
  color: string;
  dooramount: number;
  doorAmount?: number;
  productiondate: string;
  productionDate?: string;
  vin: string;
  VIN?: string;
  registrationNumber?: string | null;
  carengine: number;
  carEngine?: number;
  horsepower: number;
  horsePower?: number;
  bodytype: string;
  bodyType?: string;
  modelname: string;
  modelName?: string;
  hourlycost?: string | number;
  hourlyCost?: string | number;
  modeldescription: string;
  modelDescription?: string;
  brandname: string;
  brandName?: string;
  country: string;
  imageurl?: string | null;
  imageUrl?: string | null;
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
  imageUrl?: string;
}

export interface AddCarResponse {
  success: boolean;
  message: string;
  carId: number;
  brandId: number;
  modelId: number;
}

export interface AuthUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  branchId: number | null;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  firstName: string;
  lastName: string;
  phone: string;
  driverLicenseNumber?: string | null;
  driverLicenseExpiresAt?: string | null;
  birthDate?: string | null;
  address?: string | null;
}

export interface AvailabilityResponse {
  available: boolean;
  reason?: string;
}

export interface RentCreateData {
  carId: number;
  userId?: number;
  pickupBranchId?: number | null;
  returnBranchId?: number | null;
  startDate: string;
  expectedEndDate: string;
  additionalCost?: number;
  status?: "Pending" | "Started";
}

export interface RentResponse {
  rentId: number;
  userId: number;
  carId: number;
  workerId: number | null;
  pickupBranchId: number | null;
  returnBranchId: number | null;
  startDate: string;
  expectedEndDate: string;
  additionalCost: number;
  totalCost: number;
  status: "Pending" | "Started" | "Ended" | "Cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface User {
  userid?: number;
  userId?: number;
  email: string;
  firstName?: string;
  firstname?: string;
  lastName?: string;
  lastname?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  isactive?: boolean;
  driverLicenseNumber?: string | null;
  driverlicensenumber?: string | null;
  driverLicenseExpiresAt?: string | null;
  driverlicenseexpiresat?: string | null;
}
