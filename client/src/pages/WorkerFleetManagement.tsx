import React from "react";

const fleet = [
  {
    car: "Volvo XC90",
    registration: "KR 1A2B3",
    status: "Dostępny",
    branch: "Warszawa Centrum",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAwDPRY3MIEXiC0cSbicEh06zlOeL0m4_9wouF-qrJuEZ6F98PTqg27yrm5sCu2TZrpcrgkeaeGjQZNzfm_h0WPUmjh9GeOm2HV2jXQ6-de8wB35AgNECHaK1Q_-v5FY6GUmXeAKpAFV8oTFicrWS84zUY2r3WSh4VxZ9S3oMuoC3BIcpGDERsb9qcnNQsgVDj40Wr370_FGQOCbwNHs474_ejlm8IU3TRj29ZTHlLthfgtFkfMC7ym9rsAWH_bR4xgNNh2osplNVlI",
  },
  {
    car: "BMW Seria 3",
    registration: "WA 44BMX",
    status: "Wynajęty",
    branch: "Warszawa Centrum",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlU3PKzTT1am7QM_RAP0NPoVCZsSIptZbbQaKJ4dv4_s_8n0oUovlmxk0SX3lRFkaNyJeCFD_Gi5N3Ry9Xy761b0_yvOsNT99AjxT-cY7NYLGxFX8nuEefh12xJDZ9SLE7o1SV8Fo8AOGN2dqoyvtjQl2mVoM4o_CYvYBeFWFg5p1vDAUt1p3QY84uEZVQVRKuR6EddYjbay1_95LGQm1QCVe8nN1gLeUuKqSu2qHMSBQ2vXhILM6MwCLM06AkN_RnO9",
  },
  {
    car: "Toyota Corolla",
    registration: "GD 8HYB2",
    status: "Serwis",
    branch: "Gdańsk Główny",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBUEd1s8xbmXto_r6zRpGjFzqOpC_mtLE2mJFfuFzJXfU3mFW8cIIfduU2YjsHeIRPvPam-QtfZgwm73cgX8mogSrjPsq_EOY4HsMugRoJkZj_ORwGRXQ9xsQOeUVbB0eF5Ulp39S0PfyX8NgMLbSbhkem43kBJZe51US7zOR1dApk8Gia2grnhoq3Z75WPxFGASBGHB51UMsnO10ZrlQexfQWnvOtDUUPVXKix5fYUuCYj7jVmke1cfjoTL2hkSxKAipEWNdA9kh5y",
  },
  {
    car: "Skoda Superb",
    registration: "PO 5DMG1",
    status: "Uszkodzony",
    branch: "Poznań Centrum",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx",
  },
];

const statusClass: Record<string, string> = {
  Dostępny: "bg-secondary-container text-on-secondary-container",
  Wynajęty: "bg-primary-fixed text-on-primary-fixed",
  Serwis: "bg-tertiary-fixed text-on-tertiary-fixed",
  Uszkodzony: "bg-error-container text-on-error-container",
};

const WorkerFleetManagement: React.FC = () => {
  return (
    <div className="antialiased min-h-screen flex flex-col font-body-md bg-background text-on-background">
      <main className="flex-grow max-w-container-max mx-auto px-margin-desktop py-stack-lg w-full">
        <header className="mb-stack-lg flex flex-col md:flex-row justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Flota oddziału</p>
            <h1 className="font-display-lg-mobile md:font-display-lg text-on-background mb-unit">
              Zarządzanie flotą
            </h1>
            <p className="font-body-lg text-on-surface-variant">
              Przeglądaj i zmieniaj status samochodów w oddziale.
            </p>
          </div>
          <div className="flex gap-stack-sm">
            <button className="rounded-lg border border-outline px-4 py-3 font-label-md">
              Eksport
            </button>
            <button className="rounded-lg bg-primary px-4 py-3 font-label-md text-on-primary">
              Dodaj zgłoszenie
            </button>
          </div>
        </header>

        <div className="mb-stack-lg grid grid-cols-2 md:grid-cols-4 gap-stack-sm">
          {["Dostępny", "Wynajęty", "Serwis", "Uszkodzony"].map((status) => (
            <button
              className="rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-left font-label-md"
              key={status}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
          {fleet.map((item) => (
            <article
              className="bg-surface-container-lowest rounded-xl border border-surface-variant/60 shadow-sm flex flex-col overflow-hidden"
              key={item.registration}
            >
              <div className="relative h-48 bg-surface-variant">
                <img
                  alt={item.car}
                  className="w-full h-full object-cover"
                  src={item.image}
                />
                <span
                  className={`absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-label-md ${
                    statusClass[item.status]
                  }`}
                >
                  {item.status}
                </span>
              </div>
              <div className="p-stack-md flex flex-col flex-grow">
                <h3 className="font-headline-sm text-on-background">{item.car}</h3>
                <p className="font-label-md text-on-surface-variant font-mono">
                  {item.registration}
                </p>
                <p className="font-body-sm text-on-surface-variant mb-4">
                  {item.branch}
                </p>
                <div className="mt-auto grid grid-cols-1 gap-stack-sm">
                  <button className="py-2 px-3 border-2 border-secondary text-secondary rounded-lg font-label-md text-center">
                    Zmień na serwis
                  </button>
                  <button className="py-2 px-3 border-2 border-error text-error rounded-lg font-label-md text-center">
                    Oznacz uszkodzony
                  </button>
                  {(item.status === "Serwis" || item.status === "Uszkodzony") && (
                    <button className="py-2 px-3 bg-primary text-on-primary rounded-lg font-label-md text-center">
                      Przywróć dostępność
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <section className="mt-stack-lg rounded-[1.5rem] border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="font-headline-sm text-on-background mb-stack-sm">
            Modal potwierdzenia zmiany statusu
          </h2>
          <div className="rounded-xl bg-surface-container-low p-5">
            <p className="font-label-md text-on-background">
              Czy na pewno zmienić status Volvo XC90 na Serwis?
            </p>
            <p className="font-body-sm text-on-surface-variant mt-1">
              Operacja zostanie zapisana w historii pojazdu i ukryje samochód z
              listy dostępnych aut dla klientów.
            </p>
            <div className="mt-stack-md flex gap-stack-sm">
              <button className="rounded-lg bg-primary px-4 py-3 font-label-md text-on-primary">
                Potwierdź
              </button>
              <button className="rounded-lg border border-outline px-4 py-3 font-label-md">
                Anuluj
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkerFleetManagement;
