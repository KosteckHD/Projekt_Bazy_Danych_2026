import React from "react";
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
    <nav className="fixed top-0 left-0 right-0 z-50 glass-header shadow-sm h-20 flex items-center border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto">
        {/* Brand / Logo */}
        <div
          className="flex items-center gap-3 cursor-pointer select-none active:scale-98 transition-all"
          onClick={() => onNavigate("/")}
        >
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            Harvest Motion
          </span>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex gap-8 items-center">
          <button
            className={`font-body-md transition-all pb-1 ${
              currentPath === "/"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => onNavigate("/")}
          >
            Strona główna
          </button>
          <button
            className={`font-body-md transition-all pb-1 ${
              currentPath === "/rent"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => onNavigate("/rent")}
          >
            Wynajmij Auto
          </button>
          <button
            className={`font-body-md transition-all pb-1 ${
              currentPath === "/dashboard"
                ? "text-primary border-b-2 border-primary font-semibold"
                : "text-on-surface-variant hover:text-primary"
            }`}
            onClick={() => onNavigate("/dashboard")}
          >
            Panel Aut
          </button>
        </div>

        {/* Actions (Connection status & Sync/Refresh) */}
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-secondary animate-pulse" : "bg-error"
              } ${loading ? "opacity-50" : ""}`}
            />
            <span className="text-on-surface-variant font-medium">
              {isOnline ? "Baza połączona" : "Brak połączenia z bazą"}
            </span>
          </div>

          <button
            className={`flex items-center gap-1.5 bg-primary text-on-primary font-label-md text-sm px-5 py-2.5 rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-70 ${
              loading ? "cursor-wait" : ""
            }`}
            onClick={onRefresh}
            disabled={loading}
            id="btn-refresh"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path
                d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="hidden sm:inline">
              {loading ? "Synchronizacja..." : "Odśwież"}
            </span>
          </button>
        </div>
      </div>
    </nav>
  );
};
