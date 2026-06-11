import React, { useEffect, useState, useMemo } from "react";
import { fetchUsers, createReservation } from "../services/api";
import type { Car, User } from "../types/api";

const carId = (car: Car) => car.carid ?? car.carId;
const carBrand = (car: Car) => car.brandName ?? car.brandname ?? "";
const carModel = (car: Car) => car.modelName ?? car.modelname ?? "";
const carHourlyCost = (car: Car) => Number(car.hourlyCost ?? car.hourlycost ?? 0);
const carBranchName = (car: Car) => car.branchName ?? car.branchname ?? "Warszawa Centrum";

interface WorkerCreateRentProps {
  cars: Car[];
  onRentalCreated?: () => void;
}

const WorkerCreateRent: React.FC<WorkerCreateRentProps> = ({ cars, onRentalCreated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Set default dates: start now, end 24 hours later
  const getNowString = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [startDate, setStartDate] = useState(getNowString(now));
  const [expectedEndDate, setExpectedEndDate] = useState(getNowString(tomorrow));
  const [paymentMethod, setPaymentMethod] = useState("Karta");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoadingUsers(true);
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users", err);
      } finally {
        setLoadingUsers(false);
      }
    }
    loadUsers();
  }, []);

  // Filter cars to show only those with status "Available"
  const availableCars = useMemo(() => {
    return cars.filter((car) => car.status === "Available");
  }, [cars]);

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return users.filter((user) => {
      const first = (user.firstName ?? user.firstname ?? "").toLowerCase();
      const last = (user.lastName ?? user.lastname ?? "").toLowerCase();
      const email = (user.email ?? "").toLowerCase();
      const phone = (user.phone ?? "").toLowerCase();
      return (
        first.includes(q) ||
        last.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      );
    });
  }, [users, searchQuery]);

  // Calculate rental hours and cost
  const durationStats = useMemo(() => {
    if (!startDate || !expectedEndDate) return { hours: 0, cost: 0 };
    const start = new Date(startDate).getTime();
    const end = new Date(expectedEndDate).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return { hours: 0, cost: 0 };

    const diffMs = end - start;
    const hours = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
    const rate = selectedCar ? carHourlyCost(selectedCar) : 0;
    return {
      hours,
      cost: hours * rate,
    };
  }, [startDate, expectedEndDate, selectedCar]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) {
      setError("Wybierz klienta z bazy.");
      return;
    }
    if (!selectedCar) {
      setError("Wybierz pojazd z bazy.");
      return;
    }

    const start = new Date(startDate);
    const end = new Date(expectedEndDate);
    const nowTime = new Date();

    if (start.getTime() < nowTime.getTime() - 10 * 60 * 1000) {
      setError("Niepoprawna data: data rozpoczęcia wynajmu nie może być w przeszłości.");
      return;
    }

    if (end.getTime() - start.getTime() < 60 * 60 * 1000) {
      setError("Niepoprawny okres: minimalny okres wynajmu to 1 godzina.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        carId: Number(carId(selectedCar)),
        userId: Number(selectedUser.userId ?? selectedUser.userid),
        startDate: new Date(startDate).toISOString(),
        expectedEndDate: new Date(expectedEndDate).toISOString(),
        pickupBranchId: selectedCar.branchId ?? selectedCar.branchid ?? null,
        returnBranchId: selectedCar.branchId ?? selectedCar.branchid ?? null,
        status: "Started" as const, // Start rental immediately
      };

      await createReservation(payload);
      setSuccess(true);
      
      setTimeout(() => {
        if (onRentalCreated) {
          onRentalCreated();
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas tworzenia wynajmu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="antialiased min-h-screen flex flex-col bg-background">
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-desktop py-stack-lg">
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Panel Obsługi Klienta</p>
            <h1 className="font-headline-md text-headline-md text-on-background">
              Utwórz wynajem (Baza danych)
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Wydaj samochód bezpośrednio wybranemu klientowi z bazy.
            </p>
          </div>
        </header>

        {error && (
          <div className="mb-6 bg-error-container/20 border border-error-container text-on-error-container p-4 rounded-xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined text-error">warning</span>
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-success/10 border border-success/30 text-success p-4 rounded-xl text-sm flex items-center gap-3">
            <span className="material-symbols-outlined">check_circle</span>
            <span>Wynajem został pomyślnie utworzony! Przekierowywanie...</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            
            {/* 1. Client Selection */}
            <section className="bg-white rounded-[1.5rem] border border-outline-variant/60 p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
                1. Wybór Klienta
              </h2>
              
              {!selectedUser ? (
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                      placeholder="Wpisz email, imię, nazwisko lub telefon klienta..."
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {loadingUsers && (
                      <span className="absolute right-3 top-3.5 text-xs text-on-surface-variant">Ładowanie...</span>
                    )}
                  </div>
                  
                  {filteredUsers.length > 0 && (
                    <div className="max-h-60 overflow-y-auto border border-outline-variant/40 rounded-xl bg-surface-container-lowest divide-y divide-outline-variant/30">
                      {filteredUsers.map((user) => (
                        <div
                          key={user.userId ?? user.userid}
                          className="p-3.5 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                        >
                          <div>
                            <p className="font-label-md text-on-surface font-semibold">
                              {user.firstName ?? user.firstname} {user.lastName ?? user.lastname}
                            </p>
                            <p className="font-body-sm text-on-surface-variant text-xs">
                              {user.email} • {user.phone ?? "Brak telefonu"}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedUser(user);
                              setSearchQuery("");
                            }}
                            className="bg-primary-fixed text-on-primary-fixed-variant hover:bg-primary/20 text-xs px-3.5 py-1.5 rounded-full font-semibold transition-all"
                          >
                            Wybierz
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchQuery.trim() && filteredUsers.length === 0 && !loadingUsers && (
                    <p className="text-xs text-on-surface-variant italic">Brak pasujących klientów w bazie.</p>
                  )}
                </div>
              ) : (
                <div className="rounded-xl border border-primary/30 bg-primary-fixed/30 p-4 flex justify-between items-start">
                  <div>
                    <p className="font-label-md text-on-surface font-bold text-base">
                      {selectedUser.firstName ?? selectedUser.firstname} {selectedUser.lastName ?? selectedUser.lastname}
                    </p>
                    <p className="font-body-sm text-on-surface-variant text-sm mt-1">
                      Email: <span className="font-semibold text-on-surface">{selectedUser.email}</span> • Tel: <span className="font-semibold text-on-surface">{selectedUser.phone ?? "Brak"}</span>
                    </p>
                    {(selectedUser.driverLicenseNumber || selectedUser.driverlicensenumber) && (
                      <p className="font-body-sm text-on-surface-variant text-xs mt-2 italic">
                        Prawo jazdy nr: {selectedUser.driverLicenseNumber ?? selectedUser.driverlicensenumber}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Zmień klienta
                  </button>
                </div>
              )}
            </section>

            {/* 2. Vehicle Selection */}
            <section className="bg-white rounded-[1.5rem] border border-outline-variant/60 p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
                2. Wybór Pojazdu
              </h2>
              
              {availableCars.length === 0 ? (
                <p className="text-sm text-on-surface-variant italic">Brak dostępnych pojazdów w bazie danych.</p>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                  {availableCars.map((car) => {
                    const isSelected = selectedCar && carId(selectedCar) === carId(car);
                    return (
                      <button
                        type="button"
                        onClick={() => setSelectedCar(car)}
                        className={`min-w-[280px] text-left rounded-2xl p-5 transition-all shadow-sm ${
                          isSelected
                            ? "bg-primary-fixed border-2 border-primary"
                            : "bg-surface-container-low border border-outline-variant/50 hover:border-primary/50"
                        }`}
                        key={carId(car)}
                      >
                        <h3 className="font-label-md text-on-surface font-bold text-base">
                          {carBrand(car)} {carModel(car)}
                        </h3>
                        <p className="font-body-sm text-on-surface-variant text-xs mt-1">
                          {car.bodytype || car.bodyType || "Osobowy"} • {car.color} • {car.horsepower || car.horsePower} KM
                        </p>
                        <div className="font-label-md text-primary font-bold mt-4 text-base">
                          {carHourlyCost(car)} PLN / godz.
                        </div>
                        <p className="mt-2 text-xs text-on-surface-variant font-mono">
                          VIN: {car.vin || car.VIN}
                        </p>
                        <p className="mt-1 text-xs text-on-secondary-container">
                          Oddział: {carBranchName(car)}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            {/* 3. Details */}
            <section className="bg-white rounded-[1.5rem] border border-outline-variant/60 p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
                3. Szczegóły Wynajmu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="flex flex-col gap-2 font-label-sm text-on-surface-variant text-xs font-semibold">
                  Oddział odbioru
                  <input
                    className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-on-surface text-sm outline-none"
                    disabled
                    value={selectedCar ? carBranchName(selectedCar) : "Wybierz pojazd"}
                  />
                </label>
                
                <label className="flex flex-col gap-2 font-label-sm text-on-surface-variant text-xs font-semibold">
                  Oddział zwrotu
                  <input
                    className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-on-surface text-sm outline-none"
                    disabled
                    value={selectedCar ? carBranchName(selectedCar) : "Wybierz pojazd"}
                  />
                </label>
                
                <label className="flex flex-col gap-2 font-label-sm text-on-surface-variant text-xs font-semibold">
                  Data rozpoczęcia
                  <input
                    className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-on-surface text-sm outline-none"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </label>
                
                <label className="flex flex-col gap-2 font-label-sm text-on-surface-variant text-xs font-semibold">
                  Planowana data zwrotu
                  <input
                    className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-on-surface text-sm outline-none"
                    type="datetime-local"
                    value={expectedEndDate}
                    onChange={(e) => setExpectedEndDate(e.target.value)}
                  />
                </label>
                
                <label className="flex flex-col gap-2 font-label-sm text-on-surface-variant text-xs font-semibold">
                  Metoda płatności
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="rounded-xl border border-outline-variant/50 bg-surface-container-low px-4 py-3 text-on-surface text-sm outline-none cursor-pointer"
                  >
                    <option>Karta</option>
                    <option>Gotówka</option>
                    <option>Przelew</option>
                  </select>
                </label>
              </div>
            </section>
          </div>

          {/* Sidebar / Summary */}
          <aside className="lg:col-span-4 relative">
            <div className="sticky top-[104px] flex flex-col gap-stack-md">
              <section className="bg-white rounded-[1.5rem] shadow-md p-6 border border-outline-variant/60">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">
                  Podsumowanie
                </h2>
                
                <div className="space-y-4 text-sm divide-y divide-outline-variant/30">
                  <div className="flex justify-between pt-2">
                    <span className="text-on-surface-variant">Klient</span>
                    <span className="font-semibold text-on-surface text-right">
                      {selectedUser ? `${selectedUser.firstName ?? selectedUser.firstname} ${selectedUser.lastName ?? selectedUser.lastname}` : "Brak"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3">
                    <span className="text-on-surface-variant">Pojazd</span>
                    <span className="font-semibold text-on-surface text-right">
                      {selectedCar ? `${carBrand(selectedCar)} ${carModel(selectedCar)}` : "Brak"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3">
                    <span className="text-on-surface-variant">Czas wynajmu</span>
                    <span className="font-semibold text-on-surface">
                      {durationStats.hours > 0 ? `${durationStats.hours} godz.` : "0 godz."}
                    </span>
                  </div>
                  
                  <div className="flex justify-between pt-3">
                    <span className="text-on-surface-variant">Stawka</span>
                    <span className="font-semibold text-on-surface">
                      {selectedCar ? `${carHourlyCost(selectedCar)} PLN / godz.` : "0 PLN"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-end border-t border-outline-variant/50 pt-4">
                  <span className="font-label-md text-on-surface-variant font-semibold">
                    Szacowany koszt
                  </span>
                  <span className="font-display-lg text-primary font-bold text-2xl">
                    {durationStats.cost} PLN
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !selectedCar || !selectedUser}
                  className="mt-6 w-full bg-primary hover:brightness-105 text-white py-3.5 rounded-full font-semibold transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Tworzenie..." : "Utwórz wynajem"}
                </button>
              </section>
            </div>
          </aside>
        </form>
      </main>
    </div>
  );
};

export default WorkerCreateRent;
