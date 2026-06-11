import React, { useEffect, useMemo, useState } from "react";
import { fetchCars } from "../services/api";
import type { Car } from "../types/api";

type CarSearchProps = {
  onNavigate?: (path: string) => void;
};

const carId = (car: Car) => car.carId ?? car.carid;
const carBrand = (car: Car) => car.brandName ?? car.brandname;
const carModel = (car: Car) => car.modelName ?? car.modelname;
const carHourlyCost = (car: Car) =>
  Number(car.hourlyCost ?? car.hourlycost ?? 0);
const carBranchName = (car: Car) =>
  car.branchName ?? car.branchname ?? "Oddział główny";
const carBodyType = (car: Car) => car.bodyType ?? car.bodytype;
const carHorsePower = (car: Car) => car.horsePower ?? car.horsepower;

const carImages = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuABlqU0wH0s5dl7urU4XCoDMwj3Fw7Foj_wn4vZ9lgC93QuYqKDLBXhmphP7PipS5WoVuOUrCbQtwqK0CWvWV57iRZoybz7oXab0hlgV1EuJnfphCq1yCqnZhwL7Js6uy4Tf2Y3x_Qv7NPQbWFbLciVnunjYjvYpYZu8WF-aamWTLiUT8w4w11GbulbL3hrS_Gf5BleURKmCdCurRPsmRBEUyOURkxrgTLDPh1ni9PXatLtwQSt2k39jnjlHCs1nEFoULwp-tCbPzur",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDlU3PKzTT1am7QM_RAP0NPoVCZsSIptZbbQaKJ4dv4_s_8n0oUovlmxk0SX3lRFkaNyJeCFD_Gi5N3Ry9Xy761b0_yvOsNT99AjxT-cY7NYLGxFX8nuEefh12xJDZ9SLE7o1SV8Fo8AOGN2dqoyvtjQl2mVoM4o_CYvYBeFWFg5p1vDAUt1p3QY84uEZVQVRKuR6EddYjbay1_95LGQm1QCVe8nN1gLeUuKqSu2qHMSBQ2vXhILM6MwCLM06AkN_RnO9",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBUEd1s8xbmXto_r6zRpGjFzqOpC_mtLE2mJFfuFzJXfU3mFW8cIIfduU2YjsHeIRPvPam-QtfZgwm73cgX8mogSrjPsq_EOY4HsMugRoJkZj_ORwGRXQ9xsQOeUVbB0eF5Ulp39S0PfyX8NgMLbSbhkem43kBJZe51US7zOR1dApk8Gia2grnhoq3Z75WPxFGASBGHB51UMsnO10ZrlQexfQWnvOtDUUPVXKix5fYUuCYj7jVmke1cfjoTL2hkSxKAipEWNdA9kh5y",
];

const formatDateTimeInput = (value: string) => {
  const digits = value.replace(/\D/g, "");
  let formatted = "";

  if (digits.length > 0) {
    formatted += digits.substring(0, 2);
    if (digits.length === 2) {
      formatted += "/";
    }
  }
  if (digits.length > 2) {
    formatted += "/" + digits.substring(2, 4);
    if (digits.length === 4) {
      formatted += "/";
    }
  }
  if (digits.length > 4) {
    formatted += "/" + digits.substring(4, 8);
    if (digits.length === 8) {
      formatted += ", ";
    }
  }
  if (digits.length > 8) {
    formatted += ", " + digits.substring(8, 10);
    if (digits.length === 10) {
      formatted += ":";
    }
  }
  if (digits.length > 10) {
    formatted += ":" + digits.substring(10, 12);
  }
  return formatted;
};

const parseCustomDateTime = (str: string): string => {
  const regex = /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2})$/;
  const match = str.trim().match(regex);
  if (!match) return "";
  const [_, day, month, year, hours, minutes] = match;
  const d = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hours),
    Number(minutes)
  );
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
};

const isDateInPast = (str: string): boolean => {
  const iso = parseCustomDateTime(str);
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  // 5-minute tolerance
  return d.getTime() < now.getTime() - 5 * 60 * 1000;
};

const CarSearch: React.FC<CarSearchProps> = ({ onNavigate }) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [query, setQuery] = useState("");
  const [branch, setBranch] = useState("Wszystkie");
  const [bodyType, setBodyType] = useState("Wszystkie");
  const [startDateRaw, setStartDateRaw] = useState("");
  const [endDateRaw, setEndDateRaw] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadCars() {
      setLoading(true);
      setError(null);
      try {
        const startISO = parseCustomDateTime(startDateRaw);
        const endISO = parseCustomDateTime(endDateRaw);
        const startInPast = startISO ? isDateInPast(startDateRaw) : false;
        const endInPast = endISO ? isDateInPast(endDateRaw) : false;

        const filters =
          startISO && endISO && !startInPast && !endInPast
            ? { startDate: startISO, expectedEndDate: endISO }
            : undefined;

        const carsData = await fetchCars(filters);
        if (!ignore) {
          setCars(
            carsData.filter(
              (car) => car.status === "Available" || car.status === "Rented"
            )
          );
        }
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Nie udało się pobrać floty."
          );
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    loadCars();
    return () => {
      ignore = true;
    };
  }, [startDateRaw, endDateRaw]);

  const branches = useMemo(
    () => ["Wszystkie", ...Array.from(new Set(cars.map(carBranchName)))],
    [cars]
  );
  const bodyTypes = useMemo(
    () => ["Wszystkie", ...Array.from(new Set(cars.map(carBodyType)))],
    [cars]
  );
  const filteredCars = cars.filter((car) => {
    const fullName = `${carBrand(car)} ${carModel(car)}`.toLowerCase();
    const matchesQuery = !query || fullName.includes(query.toLowerCase());
    const matchesBranch =
      branch === "Wszystkie" || carBranchName(car) === branch;
    const matchesBody =
      bodyType === "Wszystkie" || carBodyType(car) === bodyType;
    return matchesQuery && matchesBranch && matchesBody;
  });

  const handleDateChange = (
    val: string,
    setter: (v: string) => void,
    prevVal: string
  ) => {
    if (val.length < prevVal.length) {
      setter(val);
    } else {
      setter(formatDateTimeInput(val));
    }
  };

  const goToReservation = (id: number) => {
    const path = `/reservation?carId=${id}`;
    if (onNavigate) {
      onNavigate(path);
      return;
    }
    window.location.href = path;
  };

  const startISO = parseCustomDateTime(startDateRaw);
  const endISO = parseCustomDateTime(endDateRaw);

  const startInPast = startDateRaw ? isDateInPast(startDateRaw) : false;
  const endInPast = endDateRaw ? isDateInPast(endDateRaw) : false;

  const isStartValid = !startDateRaw || (startISO !== "" && !startInPast);
  const isEndValid = !endDateRaw || (endISO !== "" && !endInPast);

  const bothEnteredAndValid =
    startISO !== "" &&
    endISO !== "" &&
    !startInPast &&
    !endInPast;

  return (
    <div className="bg-surface font-body-md text-on-surface selection:bg-primary-fixed min-h-screen pb-12">
      <main className="max-w-container-max mx-auto px-margin-desktop py-stack-lg">
        <section className="mb-stack-lg">
          <p className="font-label-md text-primary mb-unit">
            Flota Harvest Motion
          </p>
          <h1 className="font-display-lg text-on-surface mb-2">
            Znajdź idealne auto na swoją podróż
          </h1>
          <p className="font-body-lg text-on-surface-variant mb-stack-lg">
            Wybierz samochód z bazy i przejdź do formularza rezerwacji.
          </p>

          <div className="p-stack-md rounded-[1.5rem] border border-outline-variant bg-white/80 backdrop-blur-md shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
              <label className="lg:col-span-2">
                <span className="font-label-md text-on-surface-variant block mb-1">
                  Model lub marka
                </span>
                <input
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Np. Volvo, Audi, Toyota"
                  type="text"
                  value={query}
                />
              </label>
              <label>
                <span className="font-label-md text-on-surface-variant block mb-1">
                  Oddział
                </span>
                <select
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl"
                  onChange={(event) => setBranch(event.target.value)}
                  value={branch}
                >
                  {branches.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="font-label-md text-on-surface-variant block mb-1">
                  Typ nadwozia
                </span>
                <select
                  className="w-full px-4 py-3 bg-white border border-outline-variant rounded-xl"
                  onChange={(event) => setBodyType(event.target.value)}
                  value={bodyType}
                >
                  {bodyTypes.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter items-end border-t border-outline-variant/50 pt-4">
              <label>
                <span className="font-label-md text-on-surface-variant block mb-1">
                  Dostępność od (data i godzina)
                </span>
                <input
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all ${
                    isStartValid
                      ? "border-outline-variant"
                      : "border-error focus:ring-1 focus:ring-error"
                  }`}
                  onChange={(event) =>
                    handleDateChange(
                      event.target.value,
                      setStartDateRaw,
                      startDateRaw
                    )
                  }
                  placeholder="dd/mm/yyyy, --:--"
                  maxLength={17}
                  type="text"
                  value={startDateRaw}
                />
              </label>
              <label>
                <span className="font-label-md text-on-surface-variant block mb-1">
                  Dostępność do (data i godzina)
                </span>
                <input
                  className={`w-full px-4 py-3 bg-white border rounded-xl transition-all ${
                    isEndValid
                      ? "border-outline-variant"
                      : "border-error focus:ring-1 focus:ring-error"
                  }`}
                  onChange={(event) =>
                    handleDateChange(
                      event.target.value,
                      setEndDateRaw,
                      endDateRaw
                    )
                  }
                  placeholder="dd/mm/yyyy, --:--"
                  maxLength={17}
                  type="text"
                  value={endDateRaw}
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setStartDateRaw("");
                    setEndDateRaw("");
                  }}
                  className="w-full px-4 py-3.5 bg-outline-variant/30 text-on-surface hover:bg-outline-variant/50 rounded-xl font-label-md transition-all"
                  type="button"
                >
                  Wyczyść daty
                </button>
              </div>
            </div>

            <div className="text-xs pt-1">
              {startInPast || endInPast ? (
                <p className="text-error font-medium">
                  Data nie może być w przeszłości. Podaj aktualny lub przyszły termin.
                </p>
              ) : !isStartValid || !isEndValid ? (
                <p className="text-error font-medium">
                  Niepoprawny format daty. Wpisz datę w formacie: dd/mm/yyyy, gg:mm (24h)
                </p>
              ) : bothEnteredAndValid ? (
                <p className="text-[#145a32] font-medium">
                  Filtrowanie aktywne: pokazuję wolne pojazdy w wybranym terminie.
                </p>
              ) : (
                <p className="text-on-surface-variant">
                  Wpisz daty w formacie dd/mm/yyyy, gg:mm (np. 15/06/2026, 14:00), aby przefiltrować wolne pojazdy.
                </p>
              )}
            </div>
          </div>
        </section>

        {error && (
          <div className="mb-stack-md rounded-xl border border-error/20 bg-error-container/20 p-4 text-error">
            {error}
          </div>
        )}

        {loading ? (
          <p className="text-on-surface-variant">Ładowanie floty...</p>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
            {filteredCars.map((car, index) => (
              <article
                className="bg-white rounded-[1.5rem] overflow-hidden border border-[#E5E1D5] shadow-sm hover:shadow-md transition-all"
                key={carId(car)}
              >
                <div className="h-64 overflow-hidden relative">
                  <img
                    className="w-full h-full object-cover"
                    alt={`${carBrand(car)} ${carModel(car)}`}
                    src={
                      car.imageUrl ||
                      car.imageurl ||
                      carImages[index % carImages.length]
                    }
                  />
                </div>
                <div className="p-stack-md">
                  <h3 className="font-headline-sm text-on-surface">
                    {carBrand(car)} {carModel(car)}
                  </h3>
                  <p className="font-body-sm text-on-surface-variant">
                    {carBodyType(car)} • {carHorsePower(car)} KM • {car.color}
                  </p>
                  <p className="font-body-sm text-on-surface-variant mt-2">
                    Oddział: {carBranchName(car)}
                  </p>
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-primary font-bold text-headline-sm">
                      {carHourlyCost(car)} PLN / godz.
                    </p>
                    <button
                      className="bg-primary text-on-primary px-5 py-2.5 rounded-xl"
                      onClick={() => goToReservation(carId(car))}
                      type="button"
                    >
                      Wynajmij
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
};

export default CarSearch;
