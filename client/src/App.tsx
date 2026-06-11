import { useState, useEffect, useCallback } from "react";
import type { ReactNode } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Rent } from "./components/Rent/Rent";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import CarSearch from "./pages/CarSearch";
import ClientDashboard from "./pages/ClientDashboard";
import ClientCreateReservation from "./pages/ClientCreateReservation";
import ClientRentHistory from "./pages/ClientRentHistory";
import WorkerDashboard from "./pages/WorkerDashboard";
import WorkerCreateRent from "./pages/WorkerCreateRent";
import WorkerFleetManagement from "./pages/WorkerFleetManagement";
import {
  fetchHealth,
  fetchBrands,
  fetchCars,
  fetchPopularStats,
} from "./services/api";
import type { Brand, Car, PopularCarStat, HealthStatus } from "./types/api";

type MockupShellProps = {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: ReactNode;
};

const publicMockupLinks = [
  { path: "/", label: "Strona główna" },
  { path: "/cars", label: "Flota" },
  { path: "/about", label: "O nas" },
];

const customerMockupLinks = [
  { path: "/customer-dashboard", label: "Panel klienta" },
  { path: "/cars", label: "Flota" },
  { path: "/reservation", label: "Rezerwacja" },
  { path: "/my-rentals", label: "Moje wynajmy" },
];

const workerMockupLinks = [
  { path: "/worker", label: "Panel oddziału" },
  { path: "/create-rental", label: "Nowy wynajem" },
  { path: "/fleet-status", label: "Status floty" },
  { path: "/dashboard", label: "Dane z bazy" },
];

const workerPaths = new Set([
  "/worker",
  "/worker-dashboard",
  "/create-rental",
  "/fleet",
  "/fleet-status",
  "/manage-fleet-status",
]);

function getStoredUserRole(): string | undefined {
  try {
    const rawUser = localStorage.getItem("taurus_user");
    if (!rawUser) {
      return undefined;
    }

    return JSON.parse(rawUser).role;
  } catch {
    return undefined;
  }
}

function isWorkerRole(role?: string): boolean {
  return role === "Worker" || role === "Manager" || role === "Admin";
}

function MockupShell({ currentPath, onNavigate, children }: MockupShellProps) {
  const isAuthenticated = Boolean(localStorage.getItem("taurus_token"));
  const userRole = getStoredUserRole();
  const isWorkerArea = workerPaths.has(currentPath);
  const showWorkerNav = isAuthenticated && (isWorkerArea || isWorkerRole(userRole));
  const links = !isAuthenticated
    ? publicMockupLinks
    : showWorkerNav
      ? workerMockupLinks
      : customerMockupLinks;
  const homePath = showWorkerNav ? "/worker" : isAuthenticated ? "/customer-dashboard" : "/";
  const primaryActionLabel = showWorkerNav ? "Panel oddziału" : "Panel klienta";
  const primaryActionPath = showWorkerNav ? "/worker" : "/customer-dashboard";

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 glass-header shadow-sm border-b border-outline-variant/30 bg-background/90 backdrop-blur-xl">
        <div className="max-w-container-max mx-auto px-margin-desktop h-20 flex items-center justify-between gap-6">
          <button
            className="flex items-center gap-4 text-primary font-headline-sm text-headline-sm font-bold"
            onClick={() => onNavigate(homePath)}
            type="button"
          >
            <span className="material-symbols-outlined text-3xl">directions_car</span>
            Harvest Motion
          </button>
          <div className="hidden md:flex items-center gap-gutter overflow-x-auto">
            {links.map((link) => (
              <button
                className={`font-body-sm text-sm whitespace-nowrap pb-1 transition-colors ${
                  currentPath === link.path
                    ? "text-primary border-b-2 border-primary font-semibold"
                    : "text-on-surface-variant hover:text-primary"
                }`}
                key={link.path}
                onClick={() => onNavigate(link.path)}
                type="button"
              >
                {link.label}
              </button>
            ))}
          </div>
          {isAuthenticated ? (
            <div className="flex items-center gap-stack-md">
              <button
                className="hidden sm:block font-label-md text-primary px-4 py-2 hover:bg-primary-fixed transition-all rounded-xl border border-primary"
                onClick={() => onNavigate(primaryActionPath)}
                type="button"
              >
                {primaryActionLabel}
              </button>
              <button
                className="bg-primary text-on-primary font-label-md px-5 py-2.5 rounded-xl shadow-sm"
                onClick={() => {
                  localStorage.removeItem("taurus_token");
                  localStorage.removeItem("taurus_user");
                  onNavigate("/");
                }}
                type="button"
              >
                Wyloguj
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-stack-md">
              <button className="hidden sm:block font-label-md text-primary px-4 py-2 hover:bg-primary-fixed transition-all rounded-xl" type="button">
                Pomoc
              </button>
              <button
                className="hidden sm:block font-label-md text-primary px-4 py-2 hover:bg-primary-fixed transition-all rounded-xl border border-primary"
                onClick={() => onNavigate("/login")}
                type="button"
              >
                Zaloguj się
              </button>
              <button
                className="bg-primary text-on-primary font-label-md px-6 py-3 rounded-xl shadow-lg active:scale-95 transition-all"
                onClick={() => onNavigate("/register")}
                type="button"
              >
                Zarejestruj się
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="flex-grow pt-20">{children}</main>

      <footer className="bg-secondary text-on-secondary w-full mt-auto">
        <div className="max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col md:flex-row justify-between gap-gutter">
          <div className="max-w-md">
            <h2 className="font-headline-sm text-2xl font-bold">Harvest Motion</h2>
            <p className="font-body-sm text-sm text-on-secondary/80 mt-3">
              Wspólna stopka dla ekranów aplikacji wynajmu samochodów.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-sm text-on-secondary/80">
            <button onClick={() => onNavigate("/cars")} type="button">
              Flota
            </button>
            {isAuthenticated && !showWorkerNav && (
              <button onClick={() => onNavigate("/my-rentals")} type="button">
                Moje wynajmy
              </button>
            )}
            {isAuthenticated && showWorkerNav && (
              <>
                <button onClick={() => onNavigate("/worker")} type="button">
                  Obsługa oddziału
                </button>
                <button onClick={() => onNavigate("/fleet-status")} type="button">
                  Status floty
                </button>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [cars, setCars] = useState<Car[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stats, setStats] = useState<PopularCarStat[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simple state router
  const [currentPath, setCurrentPath] = useState<string>(
    window.location.pathname,
  );

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(window.location.pathname);
  };

  const handleAuthenticated = () => {
    navigate("/customer-dashboard");
  };

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const healthData = await fetchHealth().catch((err) => {
        console.error("Health check failed", err);
        return { status: "OFFLINE", message: err.message };
      });
      setHealth(healthData);

      if (healthData.status === "OK") {
        const [carsData, brandsData, statsData] = await Promise.all([
          fetchCars(),
          fetchBrands(),
          fetchPopularStats(),
        ]);
        setCars(carsData);
        setBrands(brandsData);
        setStats(statsData);
      } else {
        setCars([]);
        setBrands([]);
        setStats([]);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Wystąpił nieznany błąd podczas pobierania danych.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const isOnline = health?.status === "OK";

  const mockupRoute = (() => {
    switch (currentPath) {
      case "/":
      case "/about":
        return <LandingPage />;
      case "/login":
        return <LoginPage onAuthenticated={handleAuthenticated} />;
      case "/register":
        return <RegisterPage onAuthenticated={handleAuthenticated} />;
      case "/cars":
      case "/car-search":
        return <CarSearch onNavigate={navigate} />;
      case "/customer":
      case "/client-dashboard":
      case "/customer-dashboard":
        return <ClientDashboard />;
      case "/reservation":
      case "/create-reservation":
        return <ClientCreateReservation />;
      case "/my-rentals":
      case "/rental-history":
        return <ClientRentHistory />;
      case "/worker":
      case "/worker-dashboard":
        return <WorkerDashboard />;
      case "/create-rental":
        return <WorkerCreateRent />;
      case "/fleet":
      case "/fleet-status":
      case "/manage-fleet-status":
        return <WorkerFleetManagement />;
      default:
        return null;
    }
  })();

  if (mockupRoute) {
    if (currentPath === "/") {
      return mockupRoute;
    }

    return (
      <MockupShell currentPath={currentPath} onNavigate={navigate}>
        {mockupRoute}
      </MockupShell>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md flex flex-col justify-between pt-20">
      {/* Top Navigation */}
      <Navbar
        health={health}
        loading={loading}
        onRefresh={loadAllData}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      {/* Main Content Area */}
      <main className="flex-grow pt-6 pb-12">
        {error && (
          <div className="max-w-container-max mx-auto px-margin-desktop mb-6">
            <div className="bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-xl text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-error">
                warning
              </span>
              <div>
                <h4 className="font-semibold">Błąd synchronizacji</h4>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
          </div>
        )}

        {currentPath === "/dashboard" ? (
          <Dashboard
            cars={cars}
            brands={brands}
            stats={stats}
            isOnline={isOnline}
            onCarAdded={loadAllData}
          />
        ) : currentPath === "/rent" ? (
          <Rent cars={cars} isOnline={isOnline} />
        ) : (
          <Hero
            carCount={cars.length}
            brandCount={brands.length}
            isOnline={isOnline}
            onNavigate={navigate}
          />
        )}
      </main>

      {/* Cozy Footer */}
      <footer className="bg-secondary text-on-secondary w-full">
        <div className="w-full py-stack-lg px-margin-desktop max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-start gap-gutter">
          <div className="max-w-sm space-y-4">
            <h2 className="font-headline-sm text-2xl text-on-secondary font-bold">
              Harvest Motion
            </h2>
            <p className="font-body-sm text-sm text-on-secondary/80 leading-relaxed">
              Przekształcamy wynajem samochodów w gościnne doświadczenie. Poczuj
              ciepło domu na każdej drodze, którą wybierzesz tej jesieni.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-12">
            <div className="flex flex-col gap-3">
              <h4 className="font-headline-sm text-base text-on-secondary mb-2 font-semibold">
                Wynajem
              </h4>
              <button
                onClick={() => navigate("/rent")}
                className="font-body-sm text-left text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
              >
                Wszystkie auta
              </button>
              <a
                className="font-body-sm text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
                href="#"
              >
                Lokalizacje
              </a>
              <a
                className="font-body-sm text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
                href="#"
              >
                Oferty specjalne
              </a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="font-headline-sm text-base text-on-secondary mb-2 font-semibold">
                Informacje
              </h4>
              <a
                className="font-body-sm text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
                href="#"
              >
                Regulamin
              </a>
              <a
                className="font-body-sm text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
                href="#"
              >
                Polityka Privaćności
              </a>
              <a
                className="font-body-sm text-sm text-on-secondary/80 hover:text-on-secondary hover:underline transition-all"
                href="#"
              >
                Kontakt
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 w-full py-6 px-margin-desktop">
          <div className="max-w-container-max mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-sm text-xs text-on-secondary/60">
              © 2024 Harvest Motion Hospitality Rentals. Wszystkie prawa
              zastrzeżone.
            </p>
            <div className="flex gap-6 text-on-secondary/60">
              <span className="material-symbols-outlined cursor-pointer hover:text-on-secondary transition-colors">
                social_leaderboard
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:text-on-secondary transition-colors">
                photo_camera
              </span>
              <span className="material-symbols-outlined cursor-pointer hover:text-on-secondary transition-colors">
                mail
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
