import React, { useEffect, useState } from "react";
import { fetchMyRents } from "../services/api";
import type { RentResponse } from "../types/api";

interface ClientRentHistoryProps {
  onNavigate?: (path: string) => void;
}

const statusClass: Record<string, string> = {
  Zakończony: "bg-secondary-container text-on-secondary-container",
  Oczekuje: "bg-primary-fixed text-on-primary-fixed",
  "W trakcie": "bg-success/20 text-success border border-success/30",
  Anulowany: "bg-error-container text-on-error-container",
};

const ClientRentHistory: React.FC<ClientRentHistoryProps> = ({ onNavigate }) => {
  const [rentals, setRentals] = useState<RentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("Wszystkie");

  useEffect(() => {
    fetchMyRents()
      .then((data) => {
        setRentals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load rent history:", err);
        setError(err.message || "Nie udało się wczytać historii wynajmów.");
        setLoading(false);
      });
  }, []);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Oczekuje";
      case "Started":
        return "W trakcie";
      case "Ended":
        return "Zakończony";
      case "Cancelled":
        return "Anulowany";
      default:
        return status;
    }
  };

  const formatDateRange = (startStr: string, endStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" };
    const start = new Date(startStr).toLocaleDateString("pl-PL", options);
    const end = new Date(endStr).toLocaleDateString("pl-PL", options);
    return `${start} — ${end}`;
  };

  const filteredRentals = rentals.filter((rent) => {
    if (filter === "Wszystkie") return true;
    return getStatusLabel(rent.status) === filter;
  });

  return (
    <div className="bg-[#f9f5eb] min-h-screen flex flex-col font-body-md text-body-md text-on-background">
      <main className="flex-grow pb-stack-lg px-margin-desktop max-w-container-max mx-auto w-full py-stack-lg">
        <div className="mb-stack-lg flex flex-col lg:flex-row lg:items-end justify-between gap-stack-md">
          <div>
            <button 
              onClick={() => onNavigate?.("/customer-dashboard")}
              className="text-primary font-label-md hover:underline inline-flex items-center gap-1 mb-2"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span> Powrót do panelu
            </button>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-stack-sm">
              Twoja historia podróży
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Przeglądaj przeszłe, aktywne i nadchodzące rezerwacje.
            </p>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {["Wszystkie", "Oczekuje", "W trakcie", "Zakończony", "Anulowany"].map((item) => (
              <button
                className={`rounded-full px-4 py-2 text-sm font-label-md transition-all ${
                  filter === item
                    ? "bg-primary text-on-primary shadow-sm"
                    : "bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container"
                }`}
                key={item}
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : filteredRentals.length > 0 ? (
          <div className="grid grid-cols-1 gap-stack-md">
            {filteredRentals.map((rent) => {
              const statusText = getStatusLabel(rent.status);
              return (
                <article
                  className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-6 shadow-sm hover:shadow-md transition-all"
                  key={rent.rentId}
                >
                  <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    {rent.imageUrl && (
                      <div className="w-full md:w-48 h-32 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                        <img
                          alt={`${rent.brandName} ${rent.modelName}`}
                          className="w-full h-full object-cover"
                          src={rent.imageUrl}
                        />
                      </div>
                    )}
                    <div className="flex-grow flex flex-col gap-2 overflow-hidden">
                      <div className="flex flex-wrap gap-3 items-center">
                        <h3 className="font-headline-sm text-on-background font-bold">{rent.brandName} {rent.modelName}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-label-md ${
                            statusClass[statusText] || "bg-outline text-on-surface"
                          }`}
                        >
                          {statusText}
                        </span>
                      </div>
                      <p className="font-label-md text-on-background">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_today</span>
                        {formatDateRange(rent.startDate, rent.expectedEndDate)}
                      </p>
                      <p className="font-body-sm text-on-surface-variant truncate">
                        VIN: {rent.VIN} • Tablice: {rent.registrationNumber || 'Brak'}
                      </p>
                      <p className="font-body-sm text-on-surface-variant">
                        Numer rezerwacji: RES-{rent.rentId}
                      </p>
                    </div>
                    <div className="md:text-right w-full md:w-auto flex-shrink-0">
                      <p className="font-body-sm text-on-surface-variant">Całkowity koszt</p>
                      <p className="font-headline-md text-primary font-bold text-xl">{rent.totalCost || '—'} PLN</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E1D5] p-12 text-center shadow-lg">
            <span className="material-symbols-outlined text-5xl text-on-surface-variant/50 mb-3">history</span>
            <p className="font-body-md text-on-surface-variant">Brak wynajmów spełniających wybrane kryteria.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientRentHistory;
