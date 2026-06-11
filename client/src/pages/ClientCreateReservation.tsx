import React, { useEffect, useMemo, useState } from "react";
import {
  checkRentAvailability,
  createReservation,
  fetchCars,
} from "../services/api";
import type { AvailabilityResponse, Car, RentResponse } from "../types/api";

const carId = (car: Car) => car.carId ?? car.carid;
const carBrand = (car: Car) => car.brandName ?? car.brandname;
const carModel = (car: Car) => car.modelName ?? car.modelname;
const carHourlyCost = (car: Car) => Number(car.hourlyCost ?? car.hourlycost ?? 0);
const carBranchId = (car: Car) => car.branchId ?? car.branchid ?? null;
const carBranchName = (car: Car) => car.branchName ?? car.branchname ?? "Oddział główny";
const carVin = (car: Car) => car.VIN ?? car.vin;
const carBodyType = (car: Car) => car.bodyType ?? car.bodytype;
const carHorsePower = (car: Car) => car.horsePower ?? car.horsepower;

const toApiDate = (value: string): string => new Date(value).toISOString();

const diffHours = (startDate: string, endDate: string): number => {
  if (!startDate || !endDate) return 0;
  const diff = new Date(endDate).getTime() - new Date(startDate).getTime();
  return diff > 0 ? Math.max(1, Math.ceil(diff / 3_600_000)) : 0;
};

const defaultStartDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  date.setHours(date.getHours() + 2, 0, 0, 0);
  return date.toISOString().slice(0, 16);
};

const defaultEndDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 9);
  date.setHours(date.getHours() + 2, 0, 0, 0);
  return date.toISOString().slice(0, 16);
};

const ClientCreateReservation: React.FC = () => {
  const requestedCarId = Number(new URLSearchParams(window.location.search).get("carId"));
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<number | null>(null);
  const [returnBranchId, setReturnBranchId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [expectedEndDate, setExpectedEndDate] = useState(defaultEndDate);
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [createdRent, setCreatedRent] = useState<RentResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = localStorage.getItem("taurus_token");
  const selectedCar = cars.find((car) => carId(car) === selectedCarId) ?? null;

  const branches = useMemo(() => {
    const branchMap = new Map<number, string>();
    cars.forEach((car) => {
      const branchId = carBranchId(car);
      if (branchId) branchMap.set(branchId, carBranchName(car));
    });
    return Array.from(branchMap, ([id, name]) => ({ id, name }));
  }, [cars]);

  const hours = diffHours(startDate, expectedEndDate);
  const hourlyCost = selectedCar ? carHourlyCost(selectedCar) : 0;
  const branchFee =
    returnBranchId && selectedCar && returnBranchId !== carBranchId(selectedCar) ? 55 : 0;
  const totalCost = Number((hours * hourlyCost + branchFee).toFixed(2));

  useEffect(() => {
    let ignore = false;

    async function loadCars() {
      setLoading(true);
      setError(null);
      try {
        const carsData = await fetchCars();
        const availableCars = carsData.filter(
          (car) => car.status === "Available" && carBranchId(car),
        );
        if (ignore) return;

        setCars(availableCars);
        const requestedCar = availableCars.find((car) => carId(car) === requestedCarId);
        const initialCar = requestedCar ?? availableCars[0] ?? null;
        if (initialCar) {
          setSelectedCarId(carId(initialCar));
          setReturnBranchId(carBranchId(initialCar));
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Nie udało się pobrać aut.");
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadCars();
    return () => {
      ignore = true;
    };
  }, [requestedCarId]);

  useEffect(() => {
    if (!selectedCar || !startDate || !expectedEndDate || hours <= 0) {
      setAvailability(null);
      return;
    }

    const car = selectedCar;
    let ignore = false;

    async function validateAvailability() {
      setChecking(true);
      setError(null);
      try {
        const result = await checkRentAvailability({
          carId: carId(car),
          startDate: toApiDate(startDate),
          expectedEndDate: toApiDate(expectedEndDate),
        });
        if (!ignore) setAvailability(result);
      } catch (err) {
        if (!ignore) {
          setAvailability({ available: false, reason: "Nie można sprawdzić dostępności." });
          setError(err instanceof Error ? err.message : "Nie można sprawdzić dostępności.");
        }
      } finally {
        if (!ignore) setChecking(false);
      }
    }

    validateAvailability();
    return () => {
      ignore = true;
    };
  }, [selectedCar, startDate, expectedEndDate, hours]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setCreatedRent(null);

    if (!token) {
      setError("Musisz się zalogować, aby utworzyć rezerwację.");
      return;
    }
    if (!selectedCar) {
      setError("Nie wybrano samochodu. Wróć do floty i kliknij Wynajmij.");
      return;
    }
    if (hours <= 0) {
      setError("Planowany zwrot musi być później niż odbiór.");
      return;
    }
    if (availability?.available === false) {
      setError(availability.reason ?? "Samochód nie jest dostępny w tym terminie.");
      return;
    }

    setSubmitting(true);
    try {
      const rent = await createReservation({
        carId: carId(selectedCar),
        pickupBranchId: carBranchId(selectedCar),
        returnBranchId,
        startDate: toApiDate(startDate),
        expectedEndDate: toApiDate(expectedEndDate),
        additionalCost: branchFee,
        status: "Pending",
      });
      setCreatedRent(rent);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nie udało się utworzyć rezerwacji.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <form
        className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg grid grid-cols-1 lg:grid-cols-12 gap-gutter"
        onSubmit={handleSubmit}
      >
        <header className="col-span-1 lg:col-span-12 mb-stack-sm">
          <p className="font-label-md text-primary mb-unit">Rezerwacja online</p>
          <h1 className="font-headline-md text-headline-md text-on-background">
            Formularz rezerwacji
          </h1>
          <p className="font-body-lg text-on-surface-variant mt-2">
            Uzupełnij termin i oddział zwrotu dla samochodu wybranego w sekcji floty.
          </p>
        </header>

        <div className="col-span-1 lg:col-span-7 flex flex-col gap-stack-lg">
          <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-[#E5E1D5] shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-stack-md mb-stack-md">
              <h2 className="font-headline-sm text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">directions_car</span>
                Wybrane auto
              </h2>
              <a className="font-label-md text-primary hover:underline" href="/cars">
                Zmień auto we flocie
              </a>
            </div>

            {loading ? (
              <p className="text-on-surface-variant">Ładowanie danych auta...</p>
            ) : !selectedCar ? (
              <div className="rounded-xl border border-error/20 bg-error-container/20 p-4">
                <p className="font-label-md text-on-error-container">
                  Nie wybrano samochodu do rezerwacji.
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Wróć do floty i kliknij przycisk „Wynajmij” przy wybranym aucie.
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-primary/30 bg-primary-fixed/30 p-5">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-stack-md">
                  <div>
                    <h3 className="font-headline-sm text-on-background">
                      {carBrand(selectedCar)} {carModel(selectedCar)}
                    </h3>
                    <p className="font-body-sm text-on-surface-variant">
                      {carBodyType(selectedCar)} • {carHorsePower(selectedCar)} KM •{" "}
                      {selectedCar.color}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-secondary-container px-3 py-1 text-xs font-label-md text-on-secondary-container">
                    Dostępny
                  </span>
                </div>
                <div className="mt-stack-md grid grid-cols-1 md:grid-cols-3 gap-stack-sm text-sm">
                  <p>
                    <span className="block text-on-surface-variant">Oddział</span>
                    {carBranchName(selectedCar)}
                  </p>
                  <p>
                    <span className="block text-on-surface-variant">Stawka</span>
                    {carHourlyCost(selectedCar)} PLN / godz.
                  </p>
                  <p>
                    <span className="block text-on-surface-variant">VIN</span>
                    {carVin(selectedCar)}
                  </p>
                </div>
              </div>
            )}
          </section>

          <section className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-[#E5E1D5] shadow-sm">
            <h2 className="font-headline-sm text-on-background mb-stack-md flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">event</span>
              Dane rezerwacji
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-md">
              <label className="flex flex-col gap-stack-sm">
                <span className="font-label-sm text-on-surface-variant">Oddział odbioru</span>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-3 px-4"
                  disabled
                  value={selectedCar ? carBranchName(selectedCar) : ""}
                />
              </label>
              <label className="flex flex-col gap-stack-sm">
                <span className="font-label-sm text-on-surface-variant">Oddział zwrotu</span>
                <select
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4"
                  onChange={(event) => setReturnBranchId(Number(event.target.value))}
                  value={returnBranchId ?? ""}
                >
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-stack-sm">
                <span className="font-label-sm text-on-surface-variant">Data odbioru</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4"
                  onChange={(event) => setStartDate(event.target.value)}
                  required
                  type="datetime-local"
                  value={startDate}
                />
              </label>
              <label className="flex flex-col gap-stack-sm">
                <span className="font-label-sm text-on-surface-variant">Planowany zwrot</span>
                <input
                  className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg py-3 px-4"
                  onChange={(event) => setExpectedEndDate(event.target.value)}
                  required
                  type="datetime-local"
                  value={expectedEndDate}
                />
              </label>
            </div>
          </section>

          {error && (
            <section className="rounded-[1.5rem] border border-error/20 bg-error-container/20 p-5">
              <div className="flex gap-stack-sm">
                <span className="material-symbols-outlined text-error">warning</span>
                <p className="font-body-sm text-on-error-container">{error}</p>
              </div>
            </section>
          )}

          {createdRent && (
            <section className="rounded-[1.5rem] border border-secondary/20 bg-secondary-container/30 p-5">
              <div className="flex gap-stack-sm">
                <span className="material-symbols-outlined text-secondary">check_circle</span>
                <div>
                  <p className="font-label-md text-on-secondary-container">
                    Rezerwacja została utworzona
                  </p>
                  <p className="font-body-sm text-on-surface-variant">
                    Numer rezerwacji: #{createdRent.rentId}. Status: {createdRent.status}.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="col-span-1 lg:col-span-5 relative">
          <div className="sticky top-6 flex flex-col gap-stack-md">
            <div className="bg-surface-container-lowest rounded-[1.5rem] p-6 border border-[#E5E1D5] shadow-sm">
              <h3 className="font-headline-sm text-on-background mb-4">
                Podsumowanie kosztów
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Samochód</span>
                  <span className="font-label-md text-right">
                    {selectedCar ? `${carBrand(selectedCar)} ${carModel(selectedCar)}` : "-"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Stawka godzinowa</span>
                  <span className="font-label-md">{hourlyCost} PLN</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Czas</span>
                  <span className="font-label-md">{hours} godz.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Opłata oddziałowa</span>
                  <span className="font-label-md">{branchFee} PLN</span>
                </div>
              </div>
              <div className="flex justify-between items-center mt-stack-lg pt-stack-md border-t border-outline-variant">
                <span className="font-headline-sm text-on-background">Razem</span>
                <span className="font-headline-md text-primary">{totalCost} PLN</span>
              </div>

              <div
                className={`mt-stack-md rounded-lg p-3 text-sm ${
                  availability?.available === false
                    ? "bg-error-container/30 text-on-error-container"
                    : "bg-secondary-container/40 text-on-secondary-container"
                }`}
              >
                {checking
                  ? "Sprawdzanie dostępności..."
                  : availability?.available === false
                    ? availability.reason
                    : "Samochód jest dostępny w wybranym terminie."}
              </div>

              {!token && (
                <p className="mt-stack-md rounded-lg bg-primary-fixed/40 p-3 text-sm text-on-primary-fixed">
                  Zaloguj się jako klient, aby zapisać rezerwację w bazie.
                </p>
              )}

              <button
                className="mt-stack-md w-full bg-primary text-on-primary font-label-md py-4 rounded-lg text-center disabled:opacity-60"
                disabled={
                  submitting ||
                  checking ||
                  !selectedCar ||
                  hours <= 0 ||
                  availability?.available === false ||
                  !token
                }
                type="submit"
              >
                {submitting ? "Zapisywanie..." : "Potwierdź rezerwację"}
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
};

export default ClientCreateReservation;
