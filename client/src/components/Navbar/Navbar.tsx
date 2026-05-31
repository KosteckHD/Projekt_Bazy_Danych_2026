import React from "react";
import "./Navbar.css";
import type { HealthStatus } from "../../types/api";

interface NavbarProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  currentPath,
  onNavigate,
}) => {
  const isOnline = health?.status === "OK";

  return (
    <nav className="navbar glass-panel">
      <div className="nav-brand-container">
        <div
          className="nav-brand"
          onClick={() => onNavigate("/")}
          style={{ cursor: "pointer" }}
        >
          <span className="brand-accent">Apex</span>Drive
        </div>

        <div className="nav-menu">
          <button
            className={`nav-link-btn ${currentPath === "/" ? "active" : ""}`}
            onClick={() => onNavigate("/")}
          >
            Strona Główna
          </button>
          <button
            className={`nav-link-btn ${currentPath === "/rent" ? "active" : ""}`}
            onClick={() => onNavigate("/rent")}
          >
            Wynajmij Auto
          </button>
          <button
            className={`nav-link-btn ${currentPath === "/dashboard" ? "active" : ""}`}
            onClick={() => onNavigate("/dashboard")}
          >
            Panel Aut
          </button>
        </div>
      </div>

      <div className="nav-actions">
        <div className="connection-status">
          <span
            className={`status-dot ${isOnline ? "online" : "offline"} ${loading ? "syncing" : ""}`}
          ></span>
          <span className="status-text">
            {isOnline ? "Baza danych połączona" : "Brak połączenia z bazą"}
          </span>
        </div>

        <button
          className={`refresh-btn ${loading ? "loading" : ""}`}
          onClick={onRefresh}
          disabled={loading}
          aria-label="Odśwież dane"
          id="btn-refresh"
        >
          <svg
            className="refresh-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path
              //draw loading
              d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          {loading ? "Synchronizacja..." : "Odśwież"}
        </button>
      </div>
    </nav>
  );
};
