import React, { useState } from "react";
import type { Brand, Car, PopularCarStat } from "../../types/api";
import { addCar } from "../../services/api";

interface DashboardProps {
  cars: Car[];
  brands: Brand[];
  stats: PopularCarStat[];
  isOnline: boolean;
  onCarAdded: () => void;
}

const countries = [
  "Germany",
  "Japan",
  "USA",
  "Italy",
  "France",
  "South Korea",
  "United Kingdom",
  "Sweden",
  "China",
  "Czech Republic",
  "Spain",
  "Poland",
];

const carColors = [
  "White",
  "Black",
  "Silver",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Beige",
  "Gold",
  "Purple",
  "Burgundy",
  "Other",
];

const bodyTypes = [
  "SEDAN",
  "HATCHBACK",
  "COMBI",
  "LIFTBACK",
  "COUPE",
  "ROADSTER",
  "TARGA",
  "FASTBACK",
  "MPV",
  "SUV",
  "CROSSOVER",
  "PICKUP",
  "VAN",
  "MINIBUS",
  "LIMUZYNA",
  "CABRIOLET",
  "SHOOTING_BRAKE",
  "LANDULET",
  "UAZ",
];

const carStatuses = [
  { value: "Available", label: "Dostępny" },
  { value: "Rented", label: "Wypożyczony" },
  { value: "Maintenance", label: "Serwis" },
  { value: "Damaged", label: "Uszkodzony" },
];

export const Dashboard: React.FC<DashboardProps> = ({
  cars,
  brands,
  stats,
  isOnline,
  onCarAdded,
}) => {
  const [activeTab, setActiveTab] = useState<
    "cars" | "brands" | "stats" | "add-car" | "raw"
  >("cars");

  // Form State
  const [formData, setFormData] = useState({
    brandName: "",
    country: "Germany",
    modelName: "",
    hourlyCost: "",
    modelDescription: "",
    status: "Available",
    color: "White",
    doorAmount: "4",
    productionDate: new Date().toISOString().split("T")[0],
    VIN: "",
    carEngine: "2.0",
    horsePower: "150",
    bodyType: "SEDAN",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormSuccess(null);
    setFormError(null);

    // Basic Validation
    if (formData.VIN.trim().length !== 17) {
      setFormError("Numer VIN musi mieć dokładnie 17 znaków.");
      setSubmitting(false);
      return;
    }

    try {
      const response = await addCar(formData);
      setFormSuccess(response.message || "Samochód został pomyślnie dodany!");

      setFormData((prev) => ({
        ...prev,
        brandName: "",
        modelName: "",
        hourlyCost: "",
        modelDescription: "",
        VIN: "",
      }));

      onCarAdded();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Wystąpił błąd podczas dodawania pojazdu.";
      setFormError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface-container-low p-8 rounded-[1.5rem] border border-outline-variant text-center tonal-shadow animate-fade-in">
        <span className="material-symbols-outlined text-error text-5xl mb-4">
          cloud_off
        </span>
        <h3 className="font-headline-sm text-xl mb-2 text-on-surface">
          Brak połączenia z API
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Uruchom serwer backendowy w Dockerze (`docker compose up`) i upewnij
          się, że działa poprawnie.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-6 animate-fade-in space-y-8">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2.5 border-b border-outline-variant/60 pb-4">
        <button
          className={`px-5 py-3 rounded-xl font-label-md text-sm transition-all duration-200 ${
            activeTab === "cars"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
          onClick={() => setActiveTab("cars")}
          id="tab-cars"
        >
          Flota Samochodów ({cars.length})
        </button>
        <button
          className={`px-5 py-3 rounded-xl font-label-md text-sm transition-all duration-200 ${
            activeTab === "brands"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
          onClick={() => setActiveTab("brands")}
          id="tab-brands"
        >
          Marki ({brands.length})
        </button>
        <button
          className={`px-5 py-3 rounded-xl font-label-md text-sm transition-all duration-200 ${
            activeTab === "stats"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
          onClick={() => setActiveTab("stats")}
          id="tab-stats"
        >
          Popularność (Widok SQL)
        </button>
        <button
          className={`px-5 py-3 rounded-xl font-label-md text-sm transition-all duration-200 ${
            activeTab === "add-car"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
          onClick={() => setActiveTab("add-car")}
          id="tab-add-car"
        >
          Dodaj Pojazd
        </button>
        <button
          className={`px-5 py-3 rounded-xl font-label-md text-sm transition-all duration-200 ${
            activeTab === "raw"
              ? "bg-primary text-on-primary shadow-md font-semibold"
              : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
          }`}
          onClick={() => setActiveTab("raw")}
          id="tab-raw"
        >
          Surowy JSON
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {/* CARS TAB */}
        {activeTab === "cars" && (
          <div>
            {cars.length === 0 ? (
              <div className="bg-white p-8 rounded-[1.5rem] border border-outline-variant/60 text-center tonal-shadow">
                <p className="text-on-surface-variant">
                  Brak samochodów w bazie danych. Użyj zakładki "Dodaj Pojazd"
                  lub dodaj dane testowe.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <div
                    key={car.carid}
                    className="bg-white rounded-[1.5rem] overflow-hidden border border-outline-variant/60 car-card-shadow p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="bg-primary-fixed text-on-primary-fixed-variant px-3 py-1 rounded-full text-xs font-semibold">
                          {car.brandname}
                        </span>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider ${
                            car.status === "Available"
                              ? "bg-secondary-container text-on-secondary-container"
                              : car.status === "Rented"
                                ? "bg-primary-fixed text-on-primary-fixed-variant"
                                : "bg-surface-container-highest text-on-surface-variant"
                          }`}
                        >
                          {car.status === "Available"
                            ? "Dostępny"
                            : car.status === "Rented"
                              ? "Wypożyczony"
                              : car.status === "Maintenance"
                                ? "Serwis"
                                : "Uszkodzony"}
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-lg text-on-surface font-semibold mb-4">
                        {car.modelname}
                      </h3>

                      <div className="grid grid-cols-2 gap-3 text-xs text-on-surface-variant mb-6">
                        <div className="flex items-center gap-1.5 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            bolt
                          </span>
                          <span>{car.horsepower} KM</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            local_gas_station
                          </span>
                          <span>
                            {Number(car.carengine) > 0
                              ? `${car.carengine}L`
                              : "Elektryczny"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            palette
                          </span>
                          <span>{car.color}</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                          <span className="material-symbols-outlined text-[16px] text-primary">
                            directions_car
                          </span>
                          <span>{car.bodytype}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-outline-variant/40">
                      <div className="text-primary font-bold text-lg">
                        {car.hourlycost} PLN{" "}
                        <span className="text-on-surface-variant font-normal text-xs">
                          / godz.
                        </span>
                      </div>
                      <div
                        className="text-xs text-on-surface-variant bg-surface-container-high px-2 py-1 rounded"
                        title={`VIN: ${car.vin}`}
                      >
                        VIN:{" "}
                        <code className="font-mono">
                          {car.vin.substring(0, 5)}...{car.vin.substring(12)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BRANDS TAB */}
        {activeTab === "brands" && (
          <div className="bg-white p-8 rounded-[1.5rem] border border-outline-variant/60 tonal-shadow space-y-6">
            <div>
              <h2 className="font-headline-md text-2xl text-secondary">
                Zarejestrowane Marki i Kraje Pochodzenia
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Lista producentów aut zarejestrowanych aktualnie w bazie danych.
              </p>
            </div>
            {brands.length === 0 ? (
              <div className="text-center p-6 bg-surface-container-low rounded-xl">
                <p className="text-on-surface-variant">
                  Brak marek w bazie danych.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {brands.map((brand) => (
                  <div
                    key={brand.brandid}
                    className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant/40 flex items-center gap-4 hover:-translate-y-1 transition-all"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold flex items-center justify-center text-sm shadow-sm">
                      {brand.brandname.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="brand-info">
                      <div className="font-semibold text-on-surface">
                        {brand.brandname}
                      </div>
                      <div className="text-xs text-on-surface-variant">
                        {brand.country}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="bg-white p-8 rounded-[1.5rem] border border-outline-variant/60 tonal-shadow space-y-6">
            <div>
              <h2 className="font-headline-md text-2xl text-secondary">
                Analiza Popularności Wypożyczeń (Widok SQL:
                `vw_most_popular_cars`)
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Dane są pobierane bezpośrednio z agregującego widoku
                bazodanowego zliczającego wypożyczenia.
              </p>
            </div>

            {stats.length === 0 ? (
              <div className="text-center p-8 bg-surface-container-low rounded-xl">
                <p className="text-on-surface-variant">
                  Brak danych o wypożyczeniach w bazie. Wykonaj przykładowe
                  wypożyczenia z instrukcji testowania.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {stats.map((stat, idx) => {
                  const count = Number(stat.rental_count);
                  const maxCount = Math.max(
                    ...stats.map((s) => Number(s.rental_count)),
                    1,
                  );
                  const percent = (count / maxCount) * 100;
                  return (
                    <div
                      key={idx}
                      className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 p-4 rounded-xl hover:bg-surface-container-low transition-colors"
                    >
                      <div className="w-40 font-medium shrink-0">
                        <span className="text-primary mr-1.5">
                          {stat.brandname}
                        </span>
                        <span className="text-on-surface">
                          {stat.modelname}
                        </span>
                      </div>
                      <div className="flex-grow bg-surface-container-high rounded-full h-5 overflow-hidden">
                        <div
                          className="bg-primary h-full rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <div className="w-32 text-right text-sm text-on-surface-variant font-semibold shrink-0">
                        {count} wypożyczeń
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADD VEHICLE FORM */}
        {activeTab === "add-car" && (
          <div className="bg-white p-8 rounded-[1.5rem] border border-outline-variant/60 tonal-shadow space-y-6">
            <div>
              <h2 className="font-headline-md text-2xl text-secondary">
                Dodaj Nowy Pojazd do Floty
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Formularz automatycznie sprawdza czy marka oraz model już
                istnieją w bazie danych przed dodaniem nowego auta. W razie ich
                braku, zostaną one utworzone.
              </p>
            </div>

            {formSuccess && (
              <div className="bg-secondary-container/30 text-on-secondary-container border border-secondary-container p-4 rounded-xl text-sm mb-4">
                {formSuccess}
              </div>
            )}
            {formError && (
              <div className="bg-error-container/30 text-on-error-container border border-error-container p-4 rounded-xl text-sm mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-8">
              <div className="space-y-4">
                <h3 className="font-semibold text-secondary text-base border-b border-outline-variant/30 pb-2">
                  Dane Marki & Modelu
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="brandName"
                    >
                      Nazwa Marki
                    </label>
                    <input
                      type="text"
                      id="brandName"
                      name="brandName"
                      required
                      placeholder="np. Tesla, BMW"
                      value={formData.brandName}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="country"
                    >
                      Kraj Pochodzenia Marki
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm cursor-pointer"
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="modelName"
                    >
                      Nazwa Modelu
                    </label>
                    <input
                      type="text"
                      id="modelName"
                      name="modelName"
                      required
                      placeholder="np. Model S, M5"
                      value={formData.modelName}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="hourlyCost"
                    >
                      Koszt za godzinę (PLN)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      id="hourlyCost"
                      name="hourlyCost"
                      required
                      placeholder="np. 45.00"
                      value={formData.hourlyCost}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="modelDescription"
                    >
                      Opis Modelu
                    </label>
                    <textarea
                      id="modelDescription"
                      name="modelDescription"
                      rows={2}
                      placeholder="Krótki opis charakterystyki pojazdu..."
                      value={formData.modelDescription}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-secondary text-base border-b border-outline-variant/30 pb-2">
                  Dane Techniczne
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="VIN"
                    >
                      Numer VIN (17 znaków)
                    </label>
                    <input
                      type="text"
                      id="VIN"
                      name="VIN"
                      required
                      maxLength={17}
                      minLength={17}
                      placeholder="17-literowy kod VIN"
                      value={formData.VIN}
                      onChange={handleInputChange}
                      style={{ textTransform: "uppercase" }}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="color"
                    >
                      Kolor
                    </label>
                    <select
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm cursor-pointer"
                    >
                      {carColors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="bodyType"
                    >
                      Typ Nadwozia
                    </label>
                    <select
                      id="bodyType"
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm cursor-pointer"
                    >
                      {bodyTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="doorAmount"
                    >
                      Liczba Drzwi
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      id="doorAmount"
                      name="doorAmount"
                      required
                      value={formData.doorAmount}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="carEngine"
                    >
                      Silnik (Pojemność w L, 0.0 = Elektryczny)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.0"
                      max="15.0"
                      id="carEngine"
                      name="carEngine"
                      required
                      value={formData.carEngine}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="horsePower"
                    >
                      Moc (KM)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="2000"
                      id="horsePower"
                      name="horsePower"
                      required
                      value={formData.horsePower}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="productionDate"
                    >
                      Data Produkcji
                    </label>
                    <input
                      type="date"
                      id="productionDate"
                      name="productionDate"
                      required
                      value={formData.productionDate}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label
                      className="text-xs font-semibold text-on-surface-variant ml-1"
                      htmlFor="status"
                    >
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm cursor-pointer"
                    >
                      {carStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary hover:brightness-105 text-white font-label-md px-8 py-3.5 rounded-full transition-all shadow-md active:scale-95 text-center font-semibold disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {submitting ? "Dodawanie pojazdu..." : "Dodaj Pojazd"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RAW JSON TAB */}
        {activeTab === "raw" && (
          <div className="bg-white p-8 rounded-[1.5rem] border border-outline-variant/60 tonal-shadow space-y-6">
            <div>
              <h2 className="font-headline-md text-2xl text-secondary">
                Raw JSON z Backend API
              </h2>
              <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                Struktura surowych danych zwracanych bezpośrednio przez
                zapytania SQL w serwerze Express.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <h3 className="font-semibold text-primary text-sm font-mono">
                  GET /api/cars
                </h3>
                <pre className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 overflow-auto max-h-[300px] text-xs font-mono">
                  <code>{JSON.stringify(cars, null, 2)}</code>
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary text-sm font-mono">
                  GET /api/brands
                </h3>
                <pre className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 overflow-auto max-h-[300px] text-xs font-mono">
                  <code>{JSON.stringify(brands, null, 2)}</code>
                </pre>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-primary text-sm font-mono">
                  GET /api/stats/popular
                </h3>
                <pre className="bg-surface-container-low border border-outline-variant/30 rounded-2xl p-4 overflow-auto max-h-[300px] text-xs font-mono">
                  <code>{JSON.stringify(stats, null, 2)}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
