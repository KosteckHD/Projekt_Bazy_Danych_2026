import React, { useEffect, useState } from 'react';
import { fetchMyRents } from '../services/api';
import type { RentResponse, AuthUser } from '../types/api';

interface ClientDashboardProps {
  onNavigate?: (path: string) => void;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ onNavigate }) => {
  const [rentals, setRentals] = useState<RentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userStr = localStorage.getItem("taurus_user");
  const user: AuthUser | null = userStr ? JSON.parse(userStr) : null;

  useEffect(() => {
    fetchMyRents()
      .then((data) => {
        setRentals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch customer rents:", err);
        setError(err.message || "Wystąpił błąd podczas pobierania Twoich wynajmów.");
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("taurus_token");
    localStorage.removeItem("taurus_user");
    if (onNavigate) {
      onNavigate("/");
    } else {
      window.location.href = "/";
    }
  };

  const activeRent = rentals.find((r) => r.status === "Started");
  const pendingRents = rentals.filter((r) => r.status === "Pending");
  const pastRents = rentals.filter((r) => r.status === "Ended" || r.status === "Cancelled");

  const formatDateRange = (startStr: string, endStr: string) => {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    const start = new Date(startStr).toLocaleDateString('pl-PL', options);
    const end = new Date(endStr).toLocaleDateString('pl-PL', options);
    return `${start} — ${end}`;
  };

  return (
    <div className="font-body-md text-on-background bg-[#f9f5eb] min-h-screen">
      {/* Sidebar */}
      <aside className="hidden">
        <div className="mb-8 px-4 flex items-center justify-between">
          <h1 className="font-headline-sm text-headline-sm text-primary font-bold">Harvest Motion</h1>
        </div>
        
        {user && (
          <div className="mb-6 px-4 py-3 bg-surface-container-lowest rounded-xl border border-outline-variant/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined">person</span>
              </div>
              <div className="overflow-hidden">
                <p className="font-label-md text-on-surface truncate">{user.firstName} {user.lastName}</p>
                <p className="font-body-xs text-on-surface-variant truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-grow space-y-1">
          <button 
            onClick={() => onNavigate?.("/customer-dashboard")}
            className="w-full flex items-center gap-3 bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 text-left transition-all duration-200"
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
            <span className="font-label-md">Panel główny</span>
          </button>
          <button 
            onClick={() => onNavigate?.("/my-rentals")}
            className="w-full flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl text-left transition-all duration-200"
          >
            <span className="material-symbols-outlined">car_rental</span>
            <span className="font-label-md">Moje Wynajmy</span>
          </button>
          <button 
            onClick={() => onNavigate?.("/cars")}
            className="w-full flex items-center gap-3 text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl text-left transition-all duration-200"
          >
            <span className="material-symbols-outlined">directions_car</span>
            <span className="font-label-md">Przeglądaj flotę</span>
          </button>
        </nav>

        <div className="pt-4 border-t border-outline-variant">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-error px-4 py-3 hover:bg-error-container/10 rounded-xl text-left transition-all duration-200"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="font-label-md">Wyloguj się</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="w-full max-w-5xl mx-auto p-8">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h2 className="font-headline-md text-3xl font-bold text-on-surface">Witaj z powrotem{user ? `, ${user.firstName}` : ''}!</h2>
            <p className="font-body-md text-on-surface-variant mt-1">Zarządzaj swoimi wynajmami i rezerwacjami w jednym miejscu.</p>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-xl text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Rental Card */}
            <div>
              <h3 className="font-title-lg text-lg font-semibold text-on-surface-variant mb-4">Aktywny wynajem</h3>
              {activeRent ? (
                <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden shadow-sm flex flex-col md:flex-row gap-6 p-6">
                  {activeRent.imageUrl && (
                    <div className="w-full md:w-64 h-40 rounded-xl bg-surface-container overflow-hidden flex-shrink-0">
                      <img 
                        src={activeRent.imageUrl} 
                        alt={`${activeRent.brandName} ${activeRent.modelName}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-grow flex flex-col justify-between">
                    <div>
                      <span className="inline-block px-3 py-1 rounded-full bg-success/15 text-success font-label-sm mb-3">W TRAKCIE</span>
                      <h4 className="font-headline-sm text-2xl font-bold text-on-surface">{activeRent.brandName} {activeRent.modelName}</h4>
                      <p className="font-body-md text-on-surface-variant mt-1">VIN: {activeRent.VIN} • Tablice: {activeRent.registrationNumber || 'Brak'}</p>
                      <p className="font-label-md text-primary mt-3">
                        <span className="material-symbols-outlined text-sm align-middle mr-1">calendar_today</span>
                        {formatDateRange(activeRent.startDate, activeRent.expectedEndDate)}
                      </p>
                    </div>
                    <div className="flex gap-3 mt-6">
                      <button 
                        onClick={() => onNavigate?.("/my-rentals")}
                        className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md hover:bg-primary/95 transition-all"
                      >
                        Szczegóły wynajmu
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E1D5] p-8 text-center shadow-lg">
                  <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">no_accounts</span>
                  <p className="font-body-md text-on-surface-variant">Nie masz w tej chwili żadnego aktywnego wynajmu.</p>
                </div>
              )}
            </div>

            {/* Upcoming Reservations */}
            <div>
              <h3 className="font-title-lg text-lg font-semibold text-on-surface-variant mb-4">Nadchodzące rezerwacje ({pendingRents.length})</h3>
              {pendingRents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingRents.map((rent) => (
                    <div key={rent.rentId} className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-sm hover:shadow transition-all flex gap-4">
                      {rent.imageUrl && (
                        <div className="w-24 h-20 rounded-lg bg-surface-container overflow-hidden flex-shrink-0">
                          <img 
                            src={rent.imageUrl} 
                            alt={`${rent.brandName} ${rent.modelName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="overflow-hidden flex flex-col justify-between">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary/15 text-primary font-label-xs mb-1">OCZEKUJE</span>
                          <h4 className="font-label-lg font-bold text-on-surface truncate">{rent.brandName} {rent.modelName}</h4>
                          <p className="font-body-xs text-on-surface-variant truncate mt-0.5">{formatDateRange(rent.startDate, rent.expectedEndDate)}</p>
                        </div>
                        <p className="font-label-sm text-primary mt-2">Koszt: {rent.totalCost || '—'} PLN</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl border border-[#E5E1D5] p-6 text-center shadow-lg">
                  <p className="font-body-md text-on-surface-variant">Brak nadchodzących rezerwacji.</p>
                  <button 
                    onClick={() => onNavigate?.("/cars")}
                    className="mt-3 text-primary font-label-md hover:underline inline-flex items-center gap-1"
                  >
                    Zarezerwuj samochód <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                </div>
              )}
            </div>

            {/* Past Rentals Shortcut */}
            {pastRents.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-title-lg text-lg font-semibold text-on-surface-variant">Ostatnie podróże</h3>
                  <button 
                    onClick={() => onNavigate?.("/my-rentals")}
                    className="text-primary font-label-md hover:underline"
                  >
                    Zobacz całą historię
                  </button>
                </div>
                <div className="bg-surface-container-lowest rounded-xl border border-outline-variant divide-y divide-outline-variant/60 overflow-hidden shadow-sm">
                  {pastRents.slice(0, 3).map((rent) => (
                    <div key={rent.rentId} className="p-4 flex items-center justify-between hover:bg-surface-container-lowest/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <span className={`material-symbols-outlined p-2 rounded-lg ${
                          rent.status === 'Ended' ? 'bg-secondary-container text-on-secondary-container' : 'bg-error-container/20 text-error'
                        }`}>
                          {rent.status === 'Ended' ? 'task_alt' : 'cancel'}
                        </span>
                        <div>
                          <h4 className="font-label-lg font-bold text-on-surface">{rent.brandName} {rent.modelName}</h4>
                          <p className="font-body-xs text-on-surface-variant mt-0.5">
                            {new Date(rent.startDate).toLocaleDateString('pl-PL')} — {new Date(rent.expectedEndDate).toLocaleDateString('pl-PL')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-md text-on-surface">{rent.totalCost || '—'} PLN</p>
                        <span className={`text-[10px] font-label-xs uppercase px-1.5 py-0.5 rounded ${
                          rent.status === 'Ended' ? 'bg-secondary-container/50 text-on-secondary-container' : 'bg-error-container/30 text-error'
                        }`}>
                          {rent.status === 'Ended' ? 'Zakończony' : 'Anulowany'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default ClientDashboard;
