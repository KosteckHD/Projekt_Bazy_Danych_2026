import React, { useState } from "react";
import "./Dashboard.css";
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
      <div className="dashboard-offline glass-panel animate-fade-in">
        <svg
          className="offline-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            // warning icon
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>Brak połączenia z API</h3>
        <p>
          Uruchom serwer backendowy w Dockerze (`docker-compose up -d`) i
          upewnij się, że działa na porcie 3000.
        </p>
      </div>
    );
  }

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === "cars" ? "active" : ""}`}
          onClick={() => setActiveTab("cars")}
          id="tab-cars"
        >
          🚗 Flota Samochodów ({cars.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "brands" ? "active" : ""}`}
          onClick={() => setActiveTab("brands")}
          id="tab-brands"
        >
          🏷️ Marki ({brands.length})
        </button>
        <button
          className={`tab-btn ${activeTab === "stats" ? "active" : ""}`}
          onClick={() => setActiveTab("stats")}
          id="tab-stats"
        >
          📈 Popularność (Widok SQL)
        </button>
        <button
          className={`tab-btn ${activeTab === "add-car" ? "active" : ""}`}
          onClick={() => setActiveTab("add-car")}
          id="tab-add-car"
        >
          ➕ Dodaj Pojazd
        </button>
        <button
          className={`tab-btn ${activeTab === "raw" ? "active" : ""}`}
          onClick={() => setActiveTab("raw")}
          id="tab-raw"
        >
          Raw JSON z Backend
        </button>
      </div>

      <div className="tab-content">
        {/* CARS TAB */}
        {activeTab === "cars" && (
          <div className="cars-grid">
            {cars.length === 0 ? (
              <div className="empty-state">
                <p>
                  Brak samochodów w bazie danych. Użyj zakładki "Dodaj Pojazd"
                  lub dodaj dane testowe.
                </p>
              </div>
            ) : (
              cars.map((car) => (
                <div key={car.carid} className="car-card glass-panel">
                  <div className="car-header">
                    <span className="car-brand">{car.brandname}</span>
                    <span className={`status-tag ${car.status.toLowerCase()}`}>
                      {car.status === "Available"
                        ? "Dostępny"
                        : car.status === "Rented"
                          ? "Wypożyczony"
                          : car.status === "Maintenance"
                            ? "Serwis"
                            : "Uszkodzony"}
                    </span>
                  </div>
                  <h3 className="car-model">{car.modelname}</h3>

                  <div className="car-specs">
                    <div className="spec-item">
                      <span className="spec-icon">⚡</span>
                      <span>{car.horsepower} KM</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🔧</span>
                      <span>
                        {Number(car.carengine) > 0
                          ? `${car.carengine}L`
                          : "Elektryczny"}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">🎨</span>
                      <span>{car.color}</span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-icon">📦</span>
                      <span>{car.bodytype}</span>
                    </div>
                  </div>

                  <div className="car-footer">
                    <div className="car-cost">
                      <span className="cost-num">{car.hourlycost} PLN</span>
                      <span className="cost-unit">/ godz.</span>
                    </div>
                    <div className="car-vin" title={`VIN: ${car.vin}`}>
                      VIN:{" "}
                      <code>
                        {car.vin.substring(0, 5)}...{car.vin.substring(12)}
                      </code>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* BRANDS TAB */}
        {activeTab === "brands" && (
          <div className="brands-list glass-panel">
            <h2>Zarejestrowane Marki i Kraje Pochodzenia</h2>
            {brands.length === 0 ? (
              <div className="empty-state">
                <p>Brak marek w bazie danych.</p>
              </div>
            ) : (
              <div className="brands-grid">
                {brands.map((brand) => (
                  <div key={brand.brandid} className="brand-item glass-panel">
                    <div className="brand-logo-placeholder">
                      {brand.brandname.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="brand-info">
                      <div className="brand-name">{brand.brandname}</div>
                      <div className="brand-country">{brand.country}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {activeTab === "stats" && (
          <div className="stats-analytics glass-panel">
            <h2>
              Analiza Popularności Wypożyczeń (Widok SQL:
              `vw_most_popular_cars`)
            </h2>
            <p className="stats-desc">
              Dane pochodzą bezpośrednio z widoku agregującego liczbę
              zakończonych i trwających wypożyczeń dla poszczególnych modeli.
            </p>
            {stats.length === 0 ? (
              <div className="empty-state">
                <p>
                  Brak danych o wypożyczeniach w bazie. Wykonaj przykładowe
                  wypożyczenia z instrukcji testowania.
                </p>
              </div>
            ) : (
              <div className="stats-chart">
                {stats.map((stat, idx) => {
                  const count = Number(stat.rental_count);
                  const maxCount = Math.max(
                    ...stats.map((s) => Number(s.rental_count)),
                    1,
                  );
                  const percent = (count / maxCount) * 100;
                  return (
                    <div key={idx} className="chart-row">
                      <div className="chart-label">
                        <span className="chart-brand">{stat.brandname}</span>
                        <span className="chart-model">{stat.modelname}</span>
                      </div>
                      <div className="chart-bar-container">
                        <div
                          className="chart-bar"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <div className="chart-value">{count} wypożyczeń</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ADD VEHICLE FORM */}
        {activeTab === "add-car" && (
          <div className="add-car-panel glass-panel">
            <h2>➕ Dodaj Nowy Pojazd do Floty</h2>
            <p className="stats-desc">
              Formularz automatycznie sprawdza czy marka oraz model już istnieją
              w bazie danych przed dodaniem nowego auta. W razie ich braku,
              zostaną one utworzone.
            </p>

            {formSuccess && (
              <div className="form-alert success">{formSuccess}</div>
            )}
            {formError && <div className="form-alert error">{formError}</div>}

            <form onSubmit={handleFormSubmit} className="add-car-form">
              <div className="form-section">
                <h3>🏷️ Dane Marki & Modelu</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="brandName">Nazwa Marki</label>
                    <input
                      type="text"
                      id="brandName"
                      name="brandName"
                      required
                      placeholder="np. Tesla, BMW"
                      value={formData.brandName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="country">Kraj Pochodzenia Marki</label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                    >
                      {countries.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="modelName">Nazwa Modelu</label>
                    <input
                      type="text"
                      id="modelName"
                      name="modelName"
                      required
                      placeholder="np. Model S, M5"
                      value={formData.modelName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="hourlyCost">Koszt za godzinę (PLN)</label>
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
                    />
                  </div>
                  <div className="form-group full-width">
                    <label htmlFor="modelDescription">Opis Modelu</label>
                    <textarea
                      id="modelDescription"
                      name="modelDescription"
                      rows={2}
                      placeholder="Krótki opis charakterystyki pojazdu..."
                      value={formData.modelDescription}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Dane techniczne</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="VIN">Numer VIN (17 znaków)</label>
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
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="color">Kolor</label>
                    <select
                      id="color"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    >
                      {carColors.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="bodyType">Typ Nadwozia</label>
                    <select
                      id="bodyType"
                      name="bodyType"
                      value={formData.bodyType}
                      onChange={handleInputChange}
                    >
                      {bodyTypes.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="doorAmount">Liczba Drzwi</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      id="doorAmount"
                      name="doorAmount"
                      required
                      value={formData.doorAmount}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="carEngine">
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
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="horsePower">Moc (KM)</label>
                    <input
                      type="number"
                      min="10"
                      max="2000"
                      id="horsePower"
                      name="horsePower"
                      required
                      value={formData.horsePower}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="productionDate">Data Produkcji</label>
                    <input
                      type="date"
                      id="productionDate"
                      name="productionDate"
                      required
                      value={formData.productionDate}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
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

              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-form-btn"
                  disabled={submitting}
                >
                  {submitting ? "Dodawanie pojazdu..." : "Dodaj Pojazd"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* RAW JSON TAB */}
        {activeTab === "raw" && (
          <div className="raw-json-panel glass-panel">
            <div className="raw-header">
              <h2>Raw JSON z Backend API</h2>
              <p>
                Struktura surowych danych zwracanych bezpośrednio przez
                zapytania SQL w serwerze Express.
              </p>
            </div>
            <div className="json-container">
              <div className="json-block">
                <h3>GET /api/cars</h3>
                <pre>
                  <code>{JSON.stringify(cars, null, 2)}</code>
                </pre>
              </div>
              <div className="json-block">
                <h3>GET /api/brands</h3>
                <pre>
                  <code>{JSON.stringify(brands, null, 2)}</code>
                </pre>
              </div>
              <div className="json-block">
                <h3>GET /api/stats/popular</h3>
                <pre>
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
