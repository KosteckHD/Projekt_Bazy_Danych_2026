import React from "react";

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
    <div className="animate-fade-in space-y-16 pb-20">
      {/* Hero Header Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden rounded-[2rem] mx-4 md:mx-10 mt-6 shadow-xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
          <img
            className="w-full h-full object-cover"
            alt="Winding road in autumn golden hour"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRvdHSmPvjJuNt_xs1gXNHTFzMOlEapGZ4IINbLaqnLTCLlPSt6DQgyrja5pKgCGAISSmX5B3l0NL_omG0XWwxVfAgZh-JkEKjQ14ysxUuhQMDwSithYA7zcPO1lWvk8u9wTODqaECO0xft9IQ_rQhjIoP_lz3uu9rezOD41D3--m49-rav2MCaZGPC08PrsAakqsIqmKGifgt-sm028oYLkH-bWkMuILhN058tdT8CCcRk9qrcuUtxzHCF_VhRR-s15GalYy56zng"
          />
        </div>
        <div className="relative z-20 max-w-container-max mx-auto px-margin-desktop">
          <div className="max-w-2xl">
            <div className="inline-block bg-primary/10 text-primary font-label-sm text-xs px-3 py-1.5 rounded-full border border-primary/20 mb-6 uppercase tracking-wider">
              Aplikacja Wypożyczalni Pojazdów
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface leading-tight mb-stack-md">
              Poczuj ciepło <br />
              <span className="text-primary font-serif italic">
                jesiennej przygody
              </span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg leading-relaxed">
              Harvest Motion to nie tylko wynajem. To zaproszenie do odkrywania
              świata we własnym tempie, z komfortem, który przypomina domowe
              zacisze.
            </p>
            {/* CTA Button to Rental */}
            <div className="bg-surface-container-lowest rounded-full p-2 max-w-sm border border-outline-variant shadow-md flex items-center justify-between">
              <span className="text-on-surface-variant text-sm font-medium pl-4">
                Znajdź idealny samochód
              </span>
              <button
                onClick={() => onNavigate("/rent")}
                className="text-on-primary font-label-md py-3 px-6 shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-full bg-primary"
              >
                <span className="material-symbols-outlined text-sm">
                  search
                </span>
                Szukaj Auta
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bento Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div
            onClick={() => onNavigate("/dashboard")}
            className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[1.5rem] tonal-shadow flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">
                  directions_car
                </span>
              </div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                Nasza Flota
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Przeglądaj wszystkie zarejestrowane i gotowe do drogi pojazdy.
              </p>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-serif font-bold text-primary">
                {isOnline ? carCount : "—"}
              </span>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">
                samochodów
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate("/dashboard")}
            className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[1.5rem] tonal-shadow flex flex-col justify-between hover:-translate-y-1 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary mb-6 group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined">loyalty</span>
              </div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                Marki w Bazie
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Pojazdy od wiodących światowych producentów z gwarancją jakości.
              </p>
            </div>
            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-4xl font-serif font-bold text-secondary">
                {isOnline ? brandCount : "—"}
              </span>
              <span className="text-xs text-on-surface-variant uppercase font-semibold">
                marek
              </span>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant p-8 rounded-[1.5rem] tonal-shadow flex flex-col justify-between group">
            <div>
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center text-on-surface-variant mb-6">
                <span className="material-symbols-outlined">database</span>
              </div>
              <h3 className="font-headline-sm text-on-surface text-xl">
                Status Systemu
              </h3>
              <p className="text-sm text-on-surface-variant mt-2 leading-relaxed">
                Połączenie z bazą danych PostgreSQL w kontenerze Docker.
              </p>
            </div>
            <div className="mt-8">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  isOnline
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-error-container text-on-error-container"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? "bg-secondary" : "bg-error"
                  }`}
                />
                {isOnline ? "Serwer Online" : "Serwer Offline"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Bento Section */}
      <section className="max-w-container-max mx-auto px-margin-desktop">
        <div className="flex flex-col md:flex-row justify-between items-end mb-stack-lg">
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">
              Nasza Wyjątkowa Flota
            </h2>
            <p className="font-body-md text-on-surface-variant">
              Samochody dopasowane do Twojego stylu podróży.
            </p>
          </div>
          <button
            onClick={() => onNavigate("/rent")}
            className="text-secondary font-label-md flex items-center gap-2 hover:underline transition-all active:scale-98"
          >
            Zobacz wszystkie modele{" "}
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Main Featured (SUV) */}
          <div
            onClick={() => onNavigate("/rent")}
            className="md:col-span-8 group cursor-pointer"
          >
            <div className="bg-white rounded-[1.5rem] overflow-hidden tonal-shadow border border-outline-variant transition-all hover:-translate-y-1">
              <div className="relative h-80 overflow-hidden">
                <img
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  alt="Modern luxury SUV parked in rural settings"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-secondary/15 text-secondary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-secondary/20 text-xs">
                    All-Wheel Drive
                  </span>
                  <span className="bg-primary/15 text-primary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-primary/20 text-xs">
                    Premium Audio
                  </span>
                </div>
              </div>
              <div className="p-stack-md flex justify-between items-center">
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-lg">
                    Volvo XC90 - Edycja Leśna
                  </h3>
                  <p className="font-body-md text-on-surface-variant text-sm">
                    Idealny na rodzinne wyprawy w góry.
                  </p>
                </div>
                <div className="text-right">
                  <span className="block font-label-sm text-on-surface-variant text-xs">
                    od
                  </span>
                  <span className="text-primary font-headline-sm text-lg">
                    50 zł / godzina
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Side Card 1 (Family) */}
          <div
            onClick={() => onNavigate("/rent")}
            className="md:col-span-4 group cursor-pointer"
          >
            <div className="bg-white rounded-[1.5rem] h-full overflow-hidden tonal-shadow border border-outline-variant transition-all hover:-translate-y-1 flex flex-col justify-between">
              <div className="relative h-48">
                <img
                  className="w-full h-full object-cover"
                  alt="Spacious family minivan"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJi20c0is2aWJkHVPjFgO3PjQ0L9OFcHm-emUMTjh_BVyZ-thiVsn-EfKhVTGRRyNaSxS6oLnOV4PZ7YgiLZkyPn8WYeSWo0px2MfCcwdNl3dvg6n9fU-4WssfNiGrjKOGT24KrFOZa5_v4iYn0nPPgZTEKsjG4NuSOiEfv2nm4j-mt_TEnsxJH3O5WczcMWxXoPNERXBhqzbt0Yv64BcvKLIQ8N_bihMnG5An5Z-kBSm7fN45-yCllzPl-LIoMEnM__-b0pba1os6"
                />
              </div>
              <div className="p-stack-md flex-grow flex flex-col justify-between">
                <div>
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-xs mb-2 inline-block">
                    7-osobowy
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-lg">
                    Toyota Sienna Comfort
                  </h3>
                  <p className="font-body-sm text-on-surface-variant mb-4">
                    Wygoda dla całej Twojej ekipy.
                  </p>
                </div>
                <button className="w-full py-2 border-2 border-secondary text-secondary rounded-xl font-label-md hover:bg-secondary hover:text-white transition-colors">
                  Wybierz
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Row (Small Cars/Electric) */}
          <div
            onClick={() => onNavigate("/rent")}
            className="md:col-span-4 group cursor-pointer"
          >
            <div className="bg-white rounded-[1.5rem] overflow-hidden tonal-shadow border border-outline-variant transition-all hover:-translate-y-1">
              <div className="p-stack-md">
                <div className="h-40 bg-surface-container-high rounded-xl mb-4 overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt="Sleek electric vehicle"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6b4M-wF7ztMktbzum2FTP_nqSLO04VeA6gQnFl8EMhJpsZ_6Gdb7X_HdBRS1LqrcJ-3dKxhtNRO4g69as5nrPCQfMZX7IsmZF7hngYN2lkQU_54U9BuqxxxMxx2rcHOtYguQsC9s-2aSMLiXE0SPn018g3ziXZ1ZIXIyiFvnutqGjyYmt3wL7OweBexkCZQPWrXP8rkJ8MwjdnPPZhFF0EoWfAXMIpx0LOJZLsf85QtZvDkE1BnFrTlSxDZb_XdaeJcSsY_4vpsMF"
                  />
                </div>
                <h3 className="font-headline-sm text-lg">Tesla Model 3</h3>
                <p className="font-body-sm text-on-surface-variant">
                  Nowoczesna cisza na trasie.
                </p>
              </div>
            </div>
          </div>

          <div className="md:col-span-8 bg-primary-container/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center p-stack-lg text-center">
            <div>
              <h3 className="font-headline-sm text-primary text-xl mb-2">
                Potrzebujesz czegoś innego?
              </h3>
              <p className="font-body-md text-on-surface-variant text-sm mb-6">
                Mamy wiele modeli dostępnych od ręki w panelu rezerwacji.
              </p>
              <button
                onClick={() => onNavigate("/rent")}
                className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-label-md tonal-shadow hover:brightness-105 active:scale-95 transition-all"
              >
                Przeglądaj pełną ofertę
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
