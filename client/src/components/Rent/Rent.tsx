import React, { useState, useMemo } from "react";
import "./Rent.css";
import type { Car } from "../../types/api";

interface RentProps {
  cars: Car[];
  isOnline: boolean;
}

export const Rent: React.FC<RentProps> = ({ cars, isOnline }) => {
  // Filters State
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [engineType, setEngineType] = useState<
    "all" | "combustion" | "electric"
  >("all");
  const [bodyType, setBodyType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const availableCars = useMemo(() => {
    return cars.filter((car) => car.status === "Available");
  }, [cars]);

  // Determine dynamic max cost for slider range limit
  const absoluteMaxPrice = useMemo(() => {
    if (availableCars.length === 0) return 300;
    return Math.max(...availableCars.map((c) => Number(c.hourlycost)), 100);
  }, [availableCars]);

  const currentMaxPrice = maxPrice !== null ? maxPrice : absoluteMaxPrice;

  // Get unique body types for filtering dropdown
  const uniqueBodyTypes = useMemo(() => {
    const types = new Set(availableCars.map((c) => c.bodytype));
    return Array.from(types);
  }, [availableCars]);

  // Apply filters
  const filteredCars = useMemo(() => {
    return availableCars.filter((car) => {
      const cost = Number(car.hourlycost);
      const engine = Number(car.carengine);
      const matchesSearch =
        car.brandname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.modelname.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesPrice = cost <= currentMaxPrice;

      const matchesEngine =
        engineType === "all" ||
        (engineType === "electric" && engine === 0) ||
        (engineType === "combustion" && engine > 0);

      const matchesBody = bodyType === "all" || car.bodytype === bodyType;

      return matchesSearch && matchesPrice && matchesEngine && matchesBody;
    });
  }, [availableCars, searchQuery, currentMaxPrice, engineType, bodyType]);

  const handleRentClick = (car: Car) => {
    alert(
      `Wybrano pojazd: ${car.brandname} ${car.modelname} do wynajęcia. Logika rezerwacji zostanie dołączona wkrótce!`,
    );
  };

  if (!isOnline) {
    return (
      <div className="rent-offline glass-panel animate-fade-in">
        <svg
          className="offline-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            //warning icon
            d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h3>Brak połączenia z API</h3>
        <p>Upewnij się, że baza danych i serwer backendu działają poprawnie.</p>
      </div>
    );
  }

  return (
    <div className="rent-container animate-fade-in">
      <div className="rent-header">
        <span className="rent-badge">Szybka Rezerwacja</span>
        <h2>Wybierz Pojazd i Ruszaj w Drogę</h2>
        <p className="rent-subtitle">
          Filtruj naszą aktywną flotę pojazdów, dobierz parametry do swoich
          potrzeb i wynajmij samochód w kilka sekund.
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="filter-bar glass-panel">
        <div className="filter-group search">
          <label htmlFor="search">Wyszukaj Model</label>
          <input
            type="text"
            id="search"
            placeholder="Wpisz markę lub model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group price-slider">
          <div className="slider-label">
            <label htmlFor="price">Cena do: </label>
            <span className="price-val">{currentMaxPrice} PLN/h</span>
          </div>
          <input
            type="range"
            id="price"
            min="10"
            max={absoluteMaxPrice}
            value={currentMaxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
          <div className="slider-minmax">
            <span>10 PLN</span>
            <span>{absoluteMaxPrice} PLN</span>
          </div>
        </div>

        <div className="filter-group">
          <label htmlFor="engine">Napęd</label>
          <select
            id="engine"
            value={engineType}
            onChange={(e) =>
              setEngineType(e.target.value as "all" | "combustion" | "electric")
            }
          >
            <option value="all">Wszystkie rodzaje</option>
            <option value="combustion">Spalinowy</option>
            <option value="electric">Elektryczny</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="body">Nadwozie</label>
          <select
            id="body"
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
          >
            <option value="all">Wszystkie typy</option>
            {uniqueBodyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rent-grid">
        {filteredCars.length === 0 ? (
          <div className="empty-state-rent glass-panel">
            <p>
              Nie znaleziono samochodów spełniających wybrane kryteria filtrów.
            </p>
          </div>
        ) : (
          filteredCars.map((car) => (
            <div key={car.carid} className="rent-card glass-panel">
              <div className="rent-card-header">
                <span className="rent-card-brand">{car.brandname}</span>
                <span className="rent-card-country">{car.country}</span>
              </div>
              <h3 className="rent-card-model">{car.modelname}</h3>

              <div className="rent-card-specs">
                <div className="spec-rent-item">
                  <span className="spec-rent-icon">⚡</span>
                  <span>{car.horsepower} KM</span>
                </div>
                <div className="spec-rent-item">
                  <span className="spec-rent-icon">🔧</span>
                  <span>
                    {Number(car.carengine) > 0
                      ? `${car.carengine}L`
                      : "Elektryczny"}
                  </span>
                </div>
                <div className="spec-rent-item">
                  <span className="spec-rent-icon">🎨</span>
                  <span>{car.color}</span>
                </div>
                <div className="spec-rent-item">
                  <span className="spec-rent-icon">📦</span>
                  <span>{car.bodytype}</span>
                </div>
              </div>

              <div className="rent-card-footer">
                <div className="rent-card-price">
                  <span className="rent-price-num">{car.hourlycost} PLN</span>
                  <span className="rent-price-unit">/ godzina</span>
                </div>
                <button
                  className="rent-now-btn"
                  onClick={() => handleRentClick(car)}
                >
                  Wynajmij Auto
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
