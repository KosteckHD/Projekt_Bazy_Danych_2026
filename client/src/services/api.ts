import type {
  AddCarResponse,
  AuthResponse,
  AvailabilityResponse,
  Brand,
  Car,
  HealthStatus,
  LoginData,
  NewCarData,
  PopularCarStat,
  RegisterData,
  RentCreateData,
  RentResponse,
  User,
} from "../types/api";

const API_BASE_URL = "http://localhost:3000";

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("taurus_token");

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getToken(): string | null {
  return localStorage.getItem("taurus_token");
}

async function parseApiError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return data.message || data.error || res.statusText;
  } catch {
    return res.statusText;
  }
}

export async function loginUser(credentials: LoginData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json();
}

export async function registerUser(userData: RegisterData): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json();
}

export async function fetchHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.statusText}`);
  }

  const data = await res.json();

  return {
    ...data,
    status: String(data.status).toLowerCase() === "ok" ? "OK" : data.status,
  };
}

export async function fetchBrands(): Promise<Brand[]> {
  const res = await fetch(`${API_BASE_URL}/brands`);
  if (!res.ok) {
    throw new Error(`Failed to fetch brands: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchCars(): Promise<Car[]> {
  const res = await fetch(`${API_BASE_URL}/cars`);
  if (!res.ok) {
    throw new Error(`Failed to fetch cars: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchPopularStats(): Promise<PopularCarStat[]> {
  if (!getToken()) {
    return [];
  }

  const res = await fetch(`${API_BASE_URL}/reports/popular-cars`, {
    headers: authHeaders(),
  });

  if (res.status === 401 || res.status === 403) {
    return [];
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch popular stats: ${res.statusText}`);
  }
  return res.json();
}

export async function addCar(carData: NewCarData): Promise<AddCarResponse> {
  const res = await fetch(`${API_BASE_URL}/cars`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify(carData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || `Failed to add car: ${res.statusText}`);
  }
  return data;
}

export async function checkRentAvailability(params: {
  carId: number;
  startDate: string;
  expectedEndDate: string;
}): Promise<AvailabilityResponse> {
  const query = new URLSearchParams({
    carId: String(params.carId),
    startDate: params.startDate,
    expectedEndDate: params.expectedEndDate,
  });

  const res = await fetch(`${API_BASE_URL}/rents/availability?${query}`);

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json();
}

export async function createReservation(data: RentCreateData): Promise<RentResponse> {
  const res = await fetch(`${API_BASE_URL}/rents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
    },
    body: JSON.stringify({ ...data, status: data.status ?? "Pending" }),
  });

  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }

  return res.json();
}

export async function fetchUsers(): Promise<User[]> {
  const res = await fetch(`${API_BASE_URL}/users`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    throw new Error(await parseApiError(res));
  }
  return res.json();
}
