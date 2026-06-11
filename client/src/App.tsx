import { useState, useEffect, useCallback } from "react";
import "./App.css";
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
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieznany błąd podczas pobierania danych.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadAllData();
  }, [loadAllData]);

  const isOnline = health?.status === "OK";

  return (
    <div className="app-container animate-fade-in  relative min-h-screen flex flex-col  overflow-hidden">
      {/* Background neon glows */}
      <div className="bg-glow-container" aria-hidden="true">
        <div className="glow-primary"></div>
        <div className="glow-secondary"></div>
      </div>

      <Navbar
        health={health}
        loading={loading}
        onRefresh={loadAllData}
        currentPath={currentPath}
        onNavigate={navigate}
      />

      <main className="main-content ">
        {error && (
          <div
            className="glass-panel animate-fade-in"
            style={{
              padding: "1.5rem",
              borderColor: "var(--danger)",
              background: "rgba(239, 68, 68, 0.05)",
              borderRadius: "12px",
              color: "#f87171",
              textAlign: "left",
            }}
          >
            <h4
              style={{
                margin: "0 0 0.5rem 0",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ⚠️ Błąd synchronizacji
            </h4>
            <p style={{ margin: 0, fontSize: "0.9rem" }}>{error}</p>
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
    </div>
  );
}

export default App;
