import React from "react";

const pendingReservations = [
  {
    id: "RES-8923",
    customer: "Anna Kowalska",
    car: "Volvo XC60",
    pickup: "Dzisiaj, 14:00",
    status: "Oczekuje",
  },
  {
    id: "RES-8924",
    customer: "Piotr Nowak",
    car: "BMW Seria 3",
    pickup: "Dzisiaj, 16:30",
    status: "Opłacona",
  },
  {
    id: "RES-8925",
    customer: "Maria Zielińska",
    car: "Toyota Corolla",
    pickup: "Jutro, 09:00",
    status: "Oczekuje",
  },
];

const activeRentals = [
  {
    id: "RENT-4311",
    customer: "Michał Wiśniewski",
    car: "Audi A4",
    expectedReturn: "Dzisiaj, 18:00",
    payment: "Karta",
  },
  {
    id: "RENT-4308",
    customer: "Katarzyna Wójcik",
    car: "Skoda Superb",
    expectedReturn: "Wczoraj, 20:00",
    payment: "Gotówka",
  },
];

const WorkerDashboard: React.FC = () => {
  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex flex-col">
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-stack-lg flex flex-col gap-stack-lg">
        <header className="flex flex-col lg:flex-row justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Warszawa Centrum</p>
            <h1 className="font-headline-md text-headline-md text-on-background mb-stack-sm">
              Panel Operacyjny
            </h1>
            <p className="font-body-md text-on-surface-variant">
              Zarządzaj rezerwacjami, wydaniami i zwrotami samochodów w oddziale.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-stack-sm">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant px-5 py-4">
              <p className="font-label-sm text-on-surface-variant">Oczekujące</p>
              <p className="font-headline-sm text-primary">12</p>
            </div>
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant px-5 py-4">
              <p className="font-label-sm text-on-surface-variant">Aktywne</p>
              <p className="font-headline-sm text-secondary">8</p>
            </div>
            <div className="bg-error-container/30 rounded-xl border border-error/20 px-5 py-4">
              <p className="font-label-sm text-on-error-container">Spóźnione</p>
              <p className="font-headline-sm text-error">2</p>
            </div>
          </div>
        </header>

        <section className="rounded-[1.5rem] border border-error/20 bg-error-container/30 p-5 flex flex-col md:flex-row md:items-center justify-between gap-stack-md">
          <div className="flex gap-stack-sm">
            <span className="material-symbols-outlined text-error">warning</span>
            <div>
              <h2 className="font-headline-sm text-on-error-container">
                Wymagana reakcja na spóźnione zwroty
              </h2>
              <p className="font-body-sm text-on-surface-variant">
                RENT-4308 przekroczył planowaną godzinę zwrotu. Nalicz opłatę
                lub oznacz samochód jako uszkodzony po inspekcji.
              </p>
            </div>
          </div>
          <button className="bg-error text-on-error rounded-lg px-5 py-3 font-label-md">
            Otwórz zwrot
          </button>
        </section>

        <section className="flex flex-col gap-stack-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-on-background">
              Oczekujące rezerwacje
            </h2>
            <button className="text-primary font-label-md">Zobacz wszystkie</button>
          </div>
          <div className="bg-surface-container-lowest rounded-[1.5rem] border border-surface-variant shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-surface-variant font-label-sm text-on-surface-variant uppercase">
                  <th className="p-4 pl-6">Rezerwacja</th>
                  <th className="p-4">Klient</th>
                  <th className="p-4">Pojazd</th>
                  <th className="p-4">Odbiór</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right pr-6">Akcje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant font-body-sm">
                {pendingReservations.map((reservation) => (
                  <tr className="hover:bg-surface-container-low/50" key={reservation.id}>
                    <td className="p-4 pl-6 font-label-md">#{reservation.id}</td>
                    <td className="p-4">{reservation.customer}</td>
                    <td className="p-4">{reservation.car}</td>
                    <td className="p-4 text-primary">{reservation.pickup}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-label-md text-on-primary-fixed">
                        {reservation.status}
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-end gap-2">
                        <button className="rounded-lg bg-primary px-3 py-2 text-xs font-label-md text-on-primary">
                          Rozpocznij
                        </button>
                        <button className="rounded-lg border border-outline px-3 py-2 text-xs font-label-md text-on-surface">
                          No-show
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="flex flex-col gap-stack-sm">
          <h2 className="font-headline-sm text-on-background">Aktywne wynajmy</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
            {activeRentals.map((rent) => (
              <article
                className="bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant p-6 shadow-sm"
                key={rent.id}
              >
                <div className="flex justify-between gap-stack-md">
                  <div>
                    <p className="font-label-sm text-on-surface-variant">#{rent.id}</p>
                    <h3 className="font-headline-sm text-on-background">{rent.car}</h3>
                    <p className="font-body-sm text-on-surface-variant">
                      {rent.customer}
                    </p>
                  </div>
                  <span className="h-fit rounded-full bg-secondary-container px-3 py-1 text-xs font-label-md text-on-secondary-container">
                    W trakcie
                  </span>
                </div>
                <div className="mt-stack-md grid grid-cols-2 gap-stack-sm text-sm">
                  <div>
                    <p className="text-on-surface-variant">Planowany zwrot</p>
                    <p className="font-label-md">{rent.expectedReturn}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant">Płatność</p>
                    <p className="font-label-md">{rent.payment}</p>
                  </div>
                </div>
                <button className="mt-stack-md w-full rounded-lg bg-secondary px-4 py-3 font-label-md text-on-secondary">
                  Zakończ wynajem
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default WorkerDashboard;
