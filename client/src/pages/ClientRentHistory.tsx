import React from "react";

const rentals = [
  {
    id: "RENT-4308",
    car: "Volvo XC90",
    dates: "12 cze 2024 - 15 cze 2024",
    branch: "Kraków Lotnisko → Kraków Lotnisko",
    cost: "1 450 PLN",
    status: "Zakończony",
    payment: "Opłacone",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUEd1s8xbmXto_r6zRpGjFzqOpC_mtLE2mJFfuFzJXfU3mFW8cIIfduU2YjsHeIRPvPam-QtfZgwm73cgX8mogSrjPsq_EOY4HsMugRoJkZj_ORwGRXQ9xsQOeUVbB0eF5Ulp39S0PfyX8NgMLbSbhkem43kBJZe51US7zOR1dApk8Gia2grnhoq3Z75WPxFGASBGHB51UMsnO10ZrlQexfQWnvOtDUUPVXKix5fYUuCYj7jVmke1cfjoTL2hkSxKAipEWNdA9kh5y",
  },
  {
    id: "RES-8923",
    car: "Volvo XC60 Recharge",
    dates: "24 cze 2024 - 26 cze 2024",
    branch: "Warszawa Centrum → Gdańsk Główny",
    cost: "2 215 PLN",
    status: "Oczekuje",
    payment: "Do zapłaty",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx",
  },
  {
    id: "RENT-4271",
    car: "BMW Seria 3",
    dates: "4 maj 2024 - 5 maj 2024",
    branch: "Warszawa Centrum → Warszawa Centrum",
    cost: "580 PLN",
    status: "Anulowany",
    payment: "Opłata no-show",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlU3PKzTT1am7QM_RAP0NPoVCZsSIptZbbQaKJ4dv4_s_8n0oUovlmxk0SX3lRFkaNyJeCFD_Gi5N3Ry9Xy761b0_yvOsNT99AjxT-cY7NYLGxFX8nuEefh12xJDZ9SLE7o1SV8Fo8AOGN2dqoyvtjQl2mVoM4o_CYvYBeFWFg5p1vDAUt1p3QY84uEZVQVRKuR6EddYjbay1_95LGQm1QCVe8nN1gLeUuKqSu2qHMSBQ2vXhILM6MwCLM06AkN_RnO9",
  },
];

const statusClass: Record<string, string> = {
  Zakończony: "bg-secondary-container text-on-secondary-container",
  Oczekuje: "bg-primary-fixed text-on-primary-fixed",
  Anulowany: "bg-error-container text-on-error-container",
};

const ClientRentHistory: React.FC = () => {
  return (
    <div className="bg-background min-h-screen flex flex-col font-body-md text-body-md text-on-background">
      <main className="flex-grow pb-stack-lg px-margin-desktop max-w-container-max mx-auto w-full py-stack-lg">
        <div className="mb-stack-lg flex flex-col lg:flex-row lg:items-end justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Konto klienta</p>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-stack-sm">
              Twoja historia podróży
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Przeglądaj przeszłe, aktywne i nadchodzące rezerwacje.
            </p>
          </div>
          <div className="flex flex-wrap gap-stack-sm">
            {["Wszystkie", "Oczekuje", "W trakcie", "Zakończony", "Anulowany"].map(
              (filter, index) => (
                <button
                  className={`rounded-full px-4 py-2 text-sm font-label-md ${
                    index === 0
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low border border-outline-variant text-on-surface"
                  }`}
                  key={filter}
                >
                  {filter}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-stack-md">
          {rentals.map((rent) => (
            <article
              className="bg-surface-container-lowest rounded-xl border border-tertiary-fixed p-6 shadow-sm hover:shadow-md transition-all"
              key={rent.id}
            >
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <div className="w-full md:w-48 h-32 rounded-lg bg-surface-container overflow-hidden">
                  <img
                    alt={rent.car}
                    className="w-full h-full object-cover"
                    src={rent.image}
                  />
                </div>
                <div className="flex-grow flex flex-col gap-2">
                  <div className="flex flex-wrap gap-stack-sm items-center">
                    <h3 className="font-headline-sm text-on-background">{rent.car}</h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-label-md ${
                        statusClass[rent.status]
                      }`}
                    >
                      {rent.status}
                    </span>
                  </div>
                  <p className="font-label-md text-on-background">{rent.dates}</p>
                  <p className="font-body-sm text-on-surface-variant">{rent.branch}</p>
                  <p className="font-body-sm text-on-surface-variant">
                    Numer: {rent.id} • Płatność: {rent.payment}
                  </p>
                </div>
                <div className="md:text-right">
                  <p className="font-body-sm text-on-surface-variant">Całkowity koszt</p>
                  <p className="font-headline-md text-primary">{rent.cost}</p>
                  <button className="mt-stack-sm rounded-lg border border-primary px-4 py-2 text-sm font-label-md text-primary">
                    Szczegóły
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ClientRentHistory;
