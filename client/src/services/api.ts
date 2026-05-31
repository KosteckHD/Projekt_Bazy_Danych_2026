import type { Brand, Car, PopularCarStat, HealthStatus, NewCarData, AddCarResponse } from "../types/api";

const API_BASE_URL = "http://localhost:3000";

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE_URL}/api/brands`);
  if (!res.ok) {
    throw new Error(`Failed to fetch brands: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`${API_BASE_URL}/api/cars`);
  if (!res.ok) {
    throw new Error(`Failed to fetch cars: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPopularStats(): Promise<PopularCarStat[]> {
  const res = await fetch(`${API_BASE_URL}/api/reports/popular-cars`);
  if (!res.ok) {
    throw new Error(`Failed to fetch popular stats: ${res.statusText}`);
  }
  return res.json();
}

export async function addCar(carData: NewCarData): Promise<AddCarResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(carData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Failed to add car: ${res.statusText}`);
  }
  return data;
}
