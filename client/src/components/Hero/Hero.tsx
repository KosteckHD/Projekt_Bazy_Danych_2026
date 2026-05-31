import React from "react";
import "./Hero.css";

interface HeroProps {
  carCount: number;
  brandCount: number;
  isOnline: boolean;
  onNavigate: (path: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  carCount,
  brandCount,
  isOnline,
  onNavigate,
}) => {
  return (
    <header className="hero-section animate-fade-in">
      <div className="hero-badge">Aplikacja Wypożyczalni Pojazdów</div>
      <h1 className="hero-title">
        <span className="text-gradient">Zarządzanie autami na wynajem</span>
      </h1>
      <p className="hero-subtitle">
        Prosty panel demonstracyjny połączony z bazą danych PostgreSQL w
        kontenerze Docker. Odczytuje aktualny stan floty, statystyki
        popularności modeli z widoków bazodanowych oraz listę marek w czasie
        rzeczywistym.
      </p>

      <div className="hero-cta">
        <button className="cta-btn" onClick={() => onNavigate("/dashboard")}>
          Przejdź do Panelu Aut ➔
        </button>
      </div>

      <div className="hero-stats">
        <div
          className="stat-card glass-panel"
          onClick={() => onNavigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-value">{isOnline ? carCount : "—"}</div>
          <div className="stat-label">Samochodów w bazie</div>
        </div>
        <div
          className="stat-card glass-panel"
          onClick={() => onNavigate("/dashboard")}
          style={{ cursor: "pointer" }}
        >
          <div className="stat-value">{isOnline ? brandCount : "—"}</div>
          <div className="stat-label">Zarejestrowanych marek</div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-value">
            <span className={`status-pill ${isOnline ? "online" : "offline"}`}>
              {isOnline ? "AKTYWNY" : "OFFLINE"}
            </span>
          </div>
          <div className="stat-label">Status Serwera API</div>
        </div>
      </div>
    </header>
  );
};
