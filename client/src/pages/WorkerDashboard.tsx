import React, { useEffect, useState, useMemo } from "react";
import { fetchRents, startRent, finishRent, cancelNoShowRent } from "../services/api";
import type { RentResponse } from "../types/api";

const WorkerDashboard: React.FC = () => {
  const [rents, setRents] = useState<RentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  // Selected filter status: 'Pending' | 'Started' | 'Ended' | 'Cancelled'
  const [statusFilter, setStatusFilter] = useState<'Started' | 'Pending' | 'Ended' | 'Cancelled'>('Started');

  async function loadData() {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchRents();
      setRents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się załadować wynajmów.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleStart = async (rentId: number) => {
    if (!confirm("Czy na pewno chcesz rozpocząć ten wynajem?")) return;
    try {
      setActionLoading(rentId);
      await startRent(rentId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd przy rozpoczynaniu wynajmu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleFinish = async (rentId: number) => {
    if (!confirm("Czy na pewno chcesz zakończyć ten wynajem?")) return;
    try {
      setActionLoading(rentId);
      await finishRent(rentId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd przy kończeniu wynajmu.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelNoShow = async (rentId: number) => {
    if (!confirm("Czy na pewno chcesz anulować rezerwację (No-show)?")) return;
    try {
      setActionLoading(rentId);
      await cancelNoShowRent(rentId);
      await loadData();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Błąd przy anulowaniu rezerwacji.");
    } finally {
      setActionLoading(null);
    }
  };

  // Stats calculation
  const stats = useMemo(() => {
    let pending = 0;
    let active = 0;
    let ended = 0;
    let cancelled = 0;

    rents.forEach((r) => {
      if (r.status === "Pending") pending++;
      else if (r.status === "Started") active++;
      else if (r.status === "Ended") ended++;
      else if (r.status === "Cancelled") cancelled++;
    });

    return { pending, active, ended, cancelled };
  }, [rents]);

  // Filtered list
  const filteredRents = useMemo(() => {
    return rents.filter((r) => r.status === statusFilter);
  }, [rents, statusFilter]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("pl-PL", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDisplayCost = (r: RentResponse) => {
    if (r.status === "Pending") {
      const hourly = Number(r.hourlyCost ?? r.hourlycost ?? 0);
      const ms = new Date(r.expectedEndDate).getTime() - new Date(r.startDate).getTime();
      const hours = Math.max(1, Math.ceil(ms / 3_600_000));
      const additional = Number(r.additionalCost ?? 0);
      return `${(hours * hourly + additional).toFixed(2)} PLN`;
    }
    const costVal = r.totalCost ?? r.totalcost;
    return costVal !== undefined && costVal !== null ? `${Number(costVal).toFixed(2)} PLN` : "-";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "Pending":
        return "Zaplanowane";
      case "Started":
        return "Obecnie wynajęte";
      case "Ended":
        return "Zakończone";
      case "Cancelled":
        return "Anulowane";
      default:
        return status;
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        
        {/* Header with general stats info */}
        <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-stack-md border-b border-outline-variant/30 pb-6">
          <div>
            <p className="font-label-md text-primary mb-unit">Panel Obsługi</p>
            <h1 className="font-headline-md text-headline-md text-on-background mb-1">
              Panel Operacyjny
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Zarządzaj rezerwacjami, wydaniami i zwrotami pojazdów w systemie.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full lg:w-auto min-w-[320px] lg:min-w-[500px]">
            <div className="bg-white rounded-2xl border border-outline-variant/60 px-5 py-3.5 shadow-sm text-center">
              <p className="font-label-sm text-on-surface-variant text-xs font-semibold">Zaplanowane</p>
              <p className="font-headline-sm text-primary font-bold text-xl mt-1">{stats.pending}</p>
            </div>
            <div className="bg-white rounded-2xl border border-outline-variant/60 px-5 py-3.5 shadow-sm text-center">
              <p className="font-label-sm text-on-surface-variant text-xs font-semibold">Aktywne</p>
              <p className="font-headline-sm text-secondary font-bold text-xl mt-1">{stats.active}</p>
            </div>
            <div className="bg-white rounded-2xl border border-outline-variant/60 px-5 py-3.5 shadow-sm text-center">
              <p className="font-label-sm text-on-surface-variant text-xs font-semibold">Zakończone</p>
              <p className="font-headline-sm text-on-surface font-bold text-xl mt-1">{stats.ended}</p>
            </div>
            <div className="bg-white rounded-2xl border border-outline-variant/60 px-5 py-3.5 shadow-sm text-center">
              <p className="font-label-sm text-on-surface-variant text-xs font-semibold">Anulowane</p>
              <p className="font-headline-sm text-error font-bold text-xl mt-1">{stats.cancelled}</p>
            </div>
          </div>
        </header>

        {error && (
          <div className="bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-2xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-error">warning</span>
            <span>{error}</span>
          </div>
        )}

        {/* Unified Rents Section */}
        <section className="flex flex-col gap-stack-sm">
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-stack-md border-b border-outline-variant/20 pb-4">
            <h2 className="font-headline-sm text-on-background flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">receipt_long</span>
              Wynajmy
            </h2>
            
            {/* Filter buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStatusFilter("Started")}
                className={`px-4.5 py-2.5 rounded-xl font-label-md text-sm font-semibold transition-all ${
                  statusFilter === "Started"
                    ? "bg-primary text-on-primary shadow-md scale-102"
                    : "bg-white border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Obecnie wynajęte ({stats.active})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Pending")}
                className={`px-4.5 py-2.5 rounded-xl font-label-md text-sm font-semibold transition-all ${
                  statusFilter === "Pending"
                    ? "bg-primary text-on-primary shadow-md scale-102"
                    : "bg-white border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Zaplanowane ({stats.pending})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Ended")}
                className={`px-4.5 py-2.5 rounded-xl font-label-md text-sm font-semibold transition-all ${
                  statusFilter === "Ended"
                    ? "bg-primary text-on-primary shadow-md scale-102"
                    : "bg-white border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Zakończone ({stats.ended})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("Cancelled")}
                className={`px-4.5 py-2.5 rounded-xl font-label-md text-sm font-semibold transition-all ${
                  statusFilter === "Cancelled"
                    ? "bg-primary text-on-primary shadow-md scale-102"
                    : "bg-white border border-outline-variant/60 text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                Anulowane ({stats.cancelled})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-on-surface-variant">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-sm">Pobieranie wynajmów z bazy danych...</p>
            </div>
          ) : filteredRents.length === 0 ? (
            <div className="bg-white rounded-[1.5rem] border border-outline-variant/60 p-12 text-center text-on-surface-variant shadow-sm">
              <span className="material-symbols-outlined text-4xl text-outline-variant mb-2">info</span>
              <p className="font-semibold">Brak wynajmów</p>
              <p className="text-sm mt-1">Brak wynajmów o statusie "{getStatusLabel(statusFilter)}" w bazie danych.</p>
            </div>
          ) : (
            <div className="bg-white rounded-[1.5rem] border border-outline-variant/60 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/40 font-label-sm text-on-surface-variant uppercase text-xs">
                      <th className="p-4.5 pl-6">Wynajem ID</th>
                      <th className="p-4.5">Klient</th>
                      <th className="p-4.5">Pojazd</th>
                      <th className="p-4.5">Okres wypożyczenia</th>
                      <th className="p-4.5">
                        {statusFilter === "Pending" ? "Przewidywany koszt" : "Koszt całkowity"}
                      </th>
                      <th className="p-4.5 text-right pr-6">Akcje</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30 font-body-sm">
                    {filteredRents.map((rent) => {
                      const isMutating = actionLoading === rent.rentId;
                      const isOverdue =
                        rent.status === "Started" &&
                        new Date() > new Date(rent.expectedEndDate);

                      return (
                        <tr
                          className={`transition-colors ${
                            isOverdue
                              ? "bg-error-container/15 hover:bg-error-container/25"
                              : "hover:bg-surface-container-low/30"
                          }`}
                          key={rent.rentId}
                        >
                          <td className="p-4.5 pl-6 font-mono font-bold text-on-surface">
                            #{rent.rentId}
                          </td>
                          <td className="p-4.5">
                            <p className="font-semibold text-on-surface">
                              {rent.firstName ?? rent.firstname} {rent.lastName ?? rent.lastname}
                            </p>
                            <p className="text-xs text-on-surface-variant mt-0.5">
                              {rent.email}
                            </p>
                          </td>
                          <td className="p-4.5">
                            <p className="font-semibold text-on-surface">
                              {rent.brandName ?? rent.brandname} {rent.modelName ?? rent.modelname}
                            </p>
                            <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                              VIN: {rent.VIN ?? rent.vin}
                            </p>
                          </td>
                          <td className="p-4.5">
                            <div className="text-xs space-y-0.5 text-on-surface-variant">
                              <p>
                                Od:{" "}
                                <span className="text-on-surface font-medium">
                                  {formatDate(rent.startDate)}
                                </span>
                              </p>
                              {rent.status === "Ended" ? (
                                <p>
                                  Do:{" "}
                                  <span className="text-on-surface font-medium">
                                    {formatDate(rent.endDate ?? rent.enddate ?? rent.expectedEndDate)}
                                  </span>
                                </p>
                              ) : (
                                <>
                                  <p>
                                    Do:{" "}
                                    <span className="text-on-surface font-medium">
                                      {formatDate(rent.expectedEndDate)}
                                    </span>
                                  </p>
                                  {isOverdue && (
                                    <p className="text-error font-bold flex items-center gap-1 mt-1">
                                      <span className="material-symbols-outlined text-[14px]">
                                        warning
                                      </span>
                                      Przedłużone (Opóźniony zwrot)
                                    </p>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4.5 font-bold text-primary text-base">
                            {getDisplayCost(rent)}
                          </td>
                          <td className="p-4.5 pr-6 text-right">
                            {statusFilter === "Pending" && (
                              <div className="flex justify-end gap-2">
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => handleStart(rent.rentId)}
                                  className="rounded-xl bg-primary hover:brightness-105 text-on-primary px-4 py-2 text-xs font-label-md font-semibold transition-all shadow-sm disabled:opacity-50"
                                >
                                  {isMutating ? "..." : "Rozpocznij"}
                                </button>
                                <button
                                  type="button"
                                  disabled={isMutating}
                                  onClick={() => handleCancelNoShow(rent.rentId)}
                                  className="rounded-xl border border-error text-error hover:bg-error-container/20 px-3 py-2 text-xs font-label-md font-semibold transition-all disabled:opacity-50"
                                >
                                  Anuluj
                                </button>
                              </div>
                            )}

                            {statusFilter === "Started" && (
                              <button
                                type="button"
                                disabled={isMutating}
                                onClick={() => handleFinish(rent.rentId)}
                                className="rounded-xl bg-secondary hover:brightness-105 text-on-secondary px-4.5 py-2 text-xs font-label-md font-semibold transition-all shadow-sm disabled:opacity-50"
                              >
                                {isMutating ? "..." : "Zakończ wynajem"}
                              </button>
                            )}

                            {(statusFilter === "Ended" || statusFilter === "Cancelled") && (
                              <span className="text-xs text-on-surface-variant font-medium italic">
                                Brak akcji
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WorkerDashboard;
