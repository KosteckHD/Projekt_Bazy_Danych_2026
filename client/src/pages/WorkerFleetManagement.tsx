import React, { useEffect, useState, useMemo } from "react";
import { fetchCars, updateCarStatus } from "../services/api";
import type { Car } from "../types/api";

const carId = (car: Car) => car.carid ?? car.carId;
const carBrand = (car: Car) => car.brandName ?? car.brandname ?? "";
const carModel = (car: Car) => car.modelName ?? car.modelname ?? "";
const carBranchName = (car: Car) => car.branchName ?? car.branchname ?? "Warszawa Centrum";

const statusLabels: Record<string, string> = {
  Available: "Dostępny",
  Rented: "Wynajęty",
  Maintenance: "Serwis",
  Damaged: "Uszkodzony",
};

const statusClass: Record<string, string> = {
  Available: "bg-secondary-container text-on-secondary-container",
  Rented: "bg-primary-fixed text-on-primary-fixed",
  Maintenance: "bg-tertiary-fixed text-on-tertiary-fixed",
  Damaged: "bg-error-container text-on-error-container",
};

const WorkerFleetManagement: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await fetchCars();
      setCars(data);
    } catch (err) {
      console.error("Failed to load fleet cars", err);
      setError("Nie udało się załadować floty pojazdów.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      setError(null);
      await updateCarStatus(id, status);
      await loadCars();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Błąd podczas zmiany statusu pojazdu.");
    }
  };

  const displayedCars = useMemo(() => {
    if (!selectedStatusFilter) return cars;
    return cars.filter((car) => statusLabels[car.status] === selectedStatusFilter);
  }, [cars, selectedStatusFilter]);

  const placeholdersCount = useMemo(() => {
    return Math.max(0, 3 - displayedCars.length);
  }, [displayedCars]);

  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md bg-background text-on-background">
      <main className="flex-grow max-w-container-max mx-auto px-margin-desktop py-stack-lg w-full">
        <header className="mb-stack-lg flex flex-col md:flex-row justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Flota oddziału</p>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-unit">
              Zarządzanie flotą
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Przeglądaj i zmieniaj status samochodów w oddziale.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-error">warning</span>
            <span>{error}</span>
          </div>
        )}

        <div className="mb-stack-lg flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedStatusFilter(null)}
            className={`rounded-xl px-4 py-2 text-sm font-label-md transition-all ${
              selectedStatusFilter === null
                ? "bg-primary text-on-primary font-bold shadow-sm"
                : "border border-outline-variant bg-surface-container-lowest text-on-surface"
            }`}
          >
            Wszystkie
          </button>
          {["Dostępny", "Wynajęty", "Serwis", "Uszkodzony"].map((status) => {
            const isActive = selectedStatusFilter === status;
            return (
              <button
                onClick={() => setSelectedStatusFilter(status)}
                className={`rounded-xl px-4 py-2 text-sm font-label-md transition-all ${
                  isActive
                    ? "bg-primary text-on-primary font-bold shadow-sm"
                    : "border border-outline-variant bg-surface-container-lowest text-on-surface"
                }`}
                key={status}
              >
                {status}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="text-center py-20 text-on-surface-variant font-semibold">Ładowanie pojazdów z bazy danych...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
            {displayedCars.map((item) => {
              const id = carId(item);
              const label = statusLabels[item.status] || item.status;
              const fallbackImage = "https://lh3.googleusercontent.com/aida-public/AB6AXuAwDPRY3MIEXiC0cSbicEh06zlOeL0m4_9wouF-qrJuEZ6F98PTqg27yrm5sCu2TZrpcrgkeaeGjQZNzfm_h0WPUmjh9GeOm2HV2jXQ6-de8wB35AgNECHaK1Q_-v5FY6GUmXeAKpAFV8oTFicrWS84zUY2r3WSh4VxZ9S3oMuoC3BIcpGDERsb9qcnNQsgVDj40Wr370_FGQOCbwNHs474_ejlm8IU3TRj29ZTHlLthfgtFkfMC7ym9rsAWH_bR4xgNNh2osplNVlI";
              
              return (
                <article
                  className="bg-surface-container-lowest rounded-xl border border-surface-variant/60 shadow-sm flex flex-col overflow-hidden"
                  key={id}
                >
                  <div className="relative h-48 bg-surface-variant">
                    <img
                      alt={`${carBrand(item)} ${carModel(item)}`}
                      className="w-full h-full object-cover"
                      src={item.imageUrl || item.imageurl || fallbackImage}
                    />
                    <span
                      className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-label-md ${
                        statusClass[item.status] || "bg-outline text-on-surface"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  <div className="p-stack-md flex flex-col flex-grow">
                    <h3 className="font-headline-sm text-on-background font-bold">{carBrand(item)} {carModel(item)}</h3>
                    <p className="font-label-md text-on-surface-variant font-mono text-xs mt-1">
                      VIN: {item.vin || item.VIN}
                    </p>
                    <p className="font-body-sm text-on-surface-variant text-sm mt-1 mb-4">
                      Oddział: {carBranchName(item)}
                    </p>
                    <div className="mt-auto grid grid-cols-1 gap-2">
                      {item.status !== "Maintenance" && (
                        <button 
                          onClick={() => id && handleUpdateStatus(id, "Maintenance")}
                          className="py-2 px-3 border border-secondary text-secondary rounded-lg font-label-md text-center text-xs font-bold hover:bg-secondary/10 transition-all"
                        >
                          Zmień na serwis
                        </button>
                      )}
                      {item.status !== "Damaged" && (
                        <button 
                          onClick={() => id && handleUpdateStatus(id, "Damaged")}
                          className="py-2 px-3 border border-error text-error rounded-lg font-label-md text-center text-xs font-bold hover:bg-error/10 transition-all"
                        >
                          Oznacz uszkodzony
                        </button>
                      )}
                      {(item.status === "Maintenance" || item.status === "Damaged") && (
                        <button 
                          onClick={() => id && handleUpdateStatus(id, "Available")}
                          className="py-2 px-3 bg-primary text-on-primary rounded-lg font-label-md text-center text-xs font-bold hover:brightness-105 transition-all shadow-sm"
                        >
                          Przywróć dostępność
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}

            {/* X Placeholders for missing slots */}
            {Array.from({ length: placeholdersCount }).map((_, idx) => (
              <div 
                key={`placeholder-${idx}`}
                className="bg-surface-container-low rounded-xl border border-outline-variant/60 h-full flex flex-col items-center justify-center p-6 text-center shadow-inner min-h-[340px]"
              >
                <span className="material-symbols-outlined text-error text-6xl mb-4 font-bold">close</span>
                <h3 className="font-headline-sm text-on-surface font-bold text-lg">Brak pojazdu w bazie</h3>
                <p className="font-body-sm text-on-surface-variant mt-1">X</p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkerFleetManagement;
