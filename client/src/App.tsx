import { useState, useEffect, useCallback } from "react";
import { Navbar } from "./components/Navbar/Navbar";
import { Hero } from "./components/Hero/Hero";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Rent } from "./components/Rent/Rent";
import {
  fetchHealth,
  fetchBrands,
  fetchCars,
  fetchPopularStats,
} from "./services/api";
import type { Brand, Car, PopularCarStat, HealthStatus } from "./types/api";

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
    setCurrentPath(path);
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
