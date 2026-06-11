import React from "react";

const availableCars = [
  { name: "Volvo XC60", meta: "SUV • automat • AWD", price: "350 PLN / doba" },
  { name: "BMW Seria 3", meta: "Sedan • automat • benzyna", price: "290 PLN / doba" },
  { name: "Toyota Corolla", meta: "Kompakt • hybryda • automat", price: "210 PLN / doba" },
];

const WorkerCreateRent: React.FC = () => {
  return (
    <div className="antialiased min-h-screen flex flex-col bg-background">
      <main className="flex-grow max-w-container-max mx-auto w-full px-margin-desktop py-stack-lg">
        <header className="mb-stack-lg flex flex-col md:flex-row md:items-end justify-between gap-stack-md">
          <div>
            <p className="font-label-md text-primary mb-unit">Warszawa Centrum</p>
            <h1 className="font-headline-md text-headline-md text-on-background">
              Utwórz wynajem
            </h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Wydaj samochód klientowi bez wcześniejszej rezerwacji.
            </p>
          </div>
          <span className="rounded-full bg-secondary-container px-4 py-2 text-sm font-label-md text-on-secondary-container">
            Pracownik: Jan Malinowski
          </span>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          <div className="lg:col-span-8 flex flex-col gap-stack-lg">
            <section className="bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant p-6 shadow-sm">
              <div className="flex items-center justify-between gap-stack-md mb-stack-md">
                <h2 className="font-headline-sm text-headline-sm text-on-surface">
                  1. Klient
                </h2>
                <button className="text-primary font-label-md">Dodaj klienta</button>
              </div>
              <input
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3"
                placeholder="Szukaj klienta po emailu, telefonie lub nazwisku"
                type="text"
              />
              <div className="mt-stack-md rounded-xl border border-primary/30 bg-primary-fixed/40 p-4">
                <p className="font-label-md text-on-surface">Anna Kowalska</p>
                <p className="font-body-sm text-on-surface-variant">
                  anna.kowalska@example.com • +48 501 234 567 • prawo jazdy ważne
                  do 2028-04-12
                </p>
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">
                2. Pojazd
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-2">
                {availableCars.map((car, index) => (
                  <button
                    className={`min-w-[280px] text-left rounded-2xl p-4 transition-all ${
                      index === 0
                        ? "bg-primary-fixed border-2 border-primary"
                        : "bg-surface border border-outline-variant"
                    }`}
                    key={car.name}
                    type="button"
                  >
                    <h3 className="font-label-md text-on-surface">{car.name}</h3>
                    <p className="font-body-sm text-on-surface-variant mb-3">
                      {car.meta}
                    </p>
                    <div className="font-label-md text-primary">{car.price}</div>
                    <p className="mt-2 text-xs text-on-surface-variant">
                      VIN: WBAXXX...921 • dostępny
                    </p>
                  </button>
                ))}
              </div>
            </section>

            <section className="bg-surface-container-lowest rounded-[1.5rem] border border-outline-variant p-6 shadow-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">
                3. Szczegóły wynajmu
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Oddział odbioru
                  <input
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface"
                    disabled
                    value="Warszawa Centrum"
                  />
                </label>
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Oddział zwrotu
                  <select className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface">
                    <option>Warszawa Centrum</option>
                    <option>Kraków Lotnisko</option>
                    <option>Gdańsk Główny</option>
                  </select>
                </label>
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Start
                  <input
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface"
                    type="datetime-local"
                  />
                </label>
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Planowany zwrot
                  <input
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface"
                    type="datetime-local"
                  />
                </label>
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Metoda płatności
                  <select className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface">
                    <option>Karta</option>
                    <option>Gotówka</option>
                    <option>Przelew</option>
                  </select>
                </label>
                <label className="flex flex-col gap-stack-sm font-label-sm text-on-surface-variant">
                  Kaucja
                  <input
                    className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface"
                    defaultValue="1000 PLN"
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 relative">
            <div className="sticky top-[104px] flex flex-col gap-stack-md">
              <section className="bg-surface-container-lowest rounded-[1.5rem] shadow-md p-6 border border-outline-variant">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-stack-md">
                  Podsumowanie
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Samochód</span>
                    <span className="font-label-md">Volvo XC60</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Okres</span>
                    <span className="font-label-md">3 dni</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Stawka</span>
                    <span className="font-label-md">350 PLN / doba</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Kaucja</span>
                    <span className="font-label-md">1 000 PLN</span>
                  </div>
                </div>
                <div className="mt-stack-lg flex justify-between items-end border-t border-outline-variant pt-stack-md">
                  <span className="font-label-md text-on-surface-variant">
                    Suma brutto
                  </span>
                  <span className="font-display-lg-mobile text-primary">
                    2 050 PLN
                  </span>
                </div>
                <div className="mt-stack-md rounded-lg bg-secondary-container/40 p-3 text-sm text-on-secondary-container">
                  Samochód jest dostępny w wybranym terminie.
                </div>
                <button className="mt-stack-md w-full bg-primary text-on-primary py-3 rounded-full font-label-md">
                  Utwórz wynajem
                </button>
              </section>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default WorkerCreateRent;
