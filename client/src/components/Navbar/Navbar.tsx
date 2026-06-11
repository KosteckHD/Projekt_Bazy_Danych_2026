import React from "react";
import type { HealthStatus } from "../../types/api";

interface NavbarProps {
  health: HealthStatus | null;
  loading: boolean;
  onRefresh: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
}

type NavLink = {
  path: string;
  label: string;
};

const publicLinks: NavLink[] = [
  { path: "/", label: "Strona główna" },
  { path: "/cars", label: "Flota" },
  { path: "/login", label: "Logowanie" },
  { path: "/register", label: "Rejestracja" },
];

const customerLinks: NavLink[] = [
  { path: "/customer-dashboard", label: "Panel klienta" },
  { path: "/rent", label: "Auta z bazy" },
  { path: "/cars", label: "Flota" },
  { path: "/reservation", label: "Rezerwacja" },
  { path: "/my-rentals", label: "Moje wynajmy" },
];

const workerLinks: NavLink[] = [
  { path: "/worker", label: "Panel oddziału" },
  { path: "/dashboard", label: "Dane z bazy" },
  { path: "/create-rental", label: "Nowy wynajem" },
  { path: "/fleet-status", label: "Status floty" },
];

const workerPaths = new Set([
  "/dashboard",
  "/worker",
  "/worker-dashboard",
  "/create-rental",
  "/fleet",
  "/fleet-status",
  "/manage-fleet-status",
]);

function getStoredUserRole(): string | undefined {
  try {
    const rawUser = localStorage.getItem("taurus_user");
    if (!rawUser) {
      return undefined;
    }

    return JSON.parse(rawUser).role;
  } catch {
    return undefined;
  }
}

function isWorkerRole(role?: string): boolean {
  return role === "Worker" || role === "Manager" || role === "Admin";
}

export const Navbar: React.FC<NavbarProps> = ({
  health,
  loading,
  onRefresh,
  currentPath,
  onNavigate,
}) => {
  const isOnline = health?.status === "OK";
  const isAuthenticated = Boolean(localStorage.getItem("taurus_token"));
  const userRole = getStoredUserRole();
  const showWorkerNav =
    isAuthenticated && (workerPaths.has(currentPath) || isWorkerRole(userRole));
  const visibleLinks = !isAuthenticated
    ? publicLinks
    : showWorkerNav
      ? workerLinks
      : customerLinks;
  const homePath = showWorkerNav
    ? "/worker"
    : isAuthenticated
      ? "/customer-dashboard"
      : "/";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-header shadow-sm h-20 flex items-center border-b border-outline-variant/30">
      <div className="flex justify-between items-center w-full px-margin-desktop max-w-container-max mx-auto gap-6">
        <button
          className="flex items-center gap-3 select-none active:scale-98 transition-all"
          onClick={() => onNavigate(homePath)}
          type="button"
        >
          <span className="material-symbols-outlined text-primary text-3xl">
            directions_car
          </span>
          <span className="font-headline-sm text-headline-sm font-bold text-primary">
            Harvest Motion
          </span>
        </button>

        <div className="hidden md:flex gap-5 items-center overflow-x-auto">
          {visibleLinks.map((link) => (
            <button
              className={`font-body-md text-sm whitespace-nowrap transition-all pb-1 ${
                currentPath === link.path
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-on-surface-variant hover:text-primary"
              }`}
              key={link.path}
              onClick={() => onNavigate(link.path)}
              type="button"
            >
              {link.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container-low border border-outline-variant/40 text-xs">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isOnline ? "bg-secondary animate-pulse" : "bg-error"
              } ${loading ? "opacity-50" : ""}`}
            />
            <span className="text-on-surface-variant font-medium">
              {isOnline ? "Baza połączona" : "Brak połączenia z bazą"}
            </span>
          </div>

          {isAuthenticated && (
            <button
              className="hidden sm:block font-label-md text-primary px-4 py-2 hover:bg-primary-fixed transition-all rounded-xl border border-primary"
              onClick={() =>
                onNavigate(showWorkerNav ? "/worker" : "/customer-dashboard")
              }
              type="button"
            >
              {showWorkerNav ? "Panel oddziału" : "Panel klienta"}
            </button>
          )}

          <button
            className={`flex items-center gap-1.5 bg-primary text-on-primary font-label-md text-sm px-5 py-2.5 rounded-xl shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-70 ${
              loading ? "cursor-wait" : ""
            }`}
            disabled={loading}
            id="btn-refresh"
            onClick={onRefresh}
            type="button"
          >
            <svg
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
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
