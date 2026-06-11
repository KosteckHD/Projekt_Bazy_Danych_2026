import React, { useState, useMemo } from "react";
import type { Car } from "../../types/api";

interface RentProps {
  cars: Car[];
  isOnline: boolean;
}

const getCarImage = (bodytype: string, engine: number, brand: string) => {
  const bt = bodytype.toLowerCase();
  const brandName = brand.toLowerCase();

  if (bt.includes("suv") || bt.includes("crossover")) {
    if (brandName.includes("volvo")) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx";
    }
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuABlqU0wH0s5dl7urU4XCoDMwj3Fw7Foj_wn4vZ9lgC93QuYqKDLBXhmphP7PipS5WoVuOUrCbQtwqK0CWvWV57iRZoybz7oXab0hlgV1EuJnfphCq1yCqnZhwL7Js6uy4Tf2Y3x_Qv7NPQbWFbLciVnunjYjvYpYZu8WF-aamWTLiUT8w4w11GbulbL3hrS_Gf5BleURKmCdCurRPsmRBEUyOURkxrgTLDPh1ni9PXatLtwQSt2k39jnjlHCs1nEFoULwp-tCbPzur";
  }
  if (
    bt.includes("terenowy") ||
    brandName.includes("land rover") ||
    brandName.includes("defender")
  ) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuDk8sTxgyi4w_MXojDXtKo83O3YoHxM6lyiuLUBTztK4xITV0ZF8xO1R5dkcRNQ6Dt0BBNTYp6W_Jh1EhEvSVVo3EIMIKxCsQUhMW81l45oIg9ihckVCLIZN3dt9aNNOBwsGc-Zn3fmUpmuX8cOQuyG6tyd_Z1RRmB4PagbXR3cZ7SFAb-ftJzsCrkHPf49mHuykMqsSVT0tYbRH33tQJYvIvZipYKamKvJnfNJ8_GUANs5mcV_V-1xPL2l8BDlYBpkwDxQODUzqiCU";
  }
  if (bt.includes("kombi") || bt.includes("estate")) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuA5RW8slZpT1JNEte-0Xnprb4EkyB0v0Oz9wR6hoj4PjChPKy826xpmE3qdLERlFQpMsUwPCWX5PORRjPDLIdPmE2nU313xPsBy1VTaSNfe6nAMN-3ZPMWGukUGK0TJNq1JYKNTYCVVGB5bmXLdmoKCeeFAnuMMIUHJy2SOV1PCPKAlfxZ_aGBvWzEOJY7Ugn5hteQXIDIofe9DXByL1l7Jdrh1yeDxw_mRHAx8aJhrjQq6gG_6lhc0so0S_YkE9ULrM-YRVxKYczqo";
  }
  if (
    bt.includes("hatchback") ||
    bt.includes("kompaktowy") ||
    brandName.includes("mini") ||
    brandName.includes("cooper")
  ) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuAKDbuI6OS1ZIr9EYzX5kzAKM-IyoAb6-qzWkITFbnEX2xxkT-bPAwk1FCZMnW2WMTlx5XTLn_t4XEua-aFJNmMCpypC491Yqc_BhRTNAFf0vRC6FFcgfH3220rHB9QU8X6XpyNWL9aAk_ouC6DOF3Img-y43bZ0ZIWC-OuZx7soRIU1_nEHJJsHIOcVzvunmGtyQ4DmipH6MQ7FgUO6ICA5paLCCMhDNbj7EbuvqlKLLYPFP7-xnryPa_su1qGV_MTXJYxvf53lyJm";
  }
  if (
    engine === 0 ||
    bt.includes("elektryczny") ||
    brandName.includes("tesla") ||
    brandName.includes("audi")
  ) {
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCvbXaBtnIHxt7mp6wclRYyUat190xiCfkxgIJbHu2eqgxSAzmwt3uiva2PbER9VV1kqVYxVvx5vLLcOdzRYc_cRUSKcvfvVFXYtasDeTUah2HC76bfHSQo6jW9ntKGWf13Ki_98rNZDf_nA7sBl0fzoMoHZxJuW-h489do2qO7Mv91TpId5i47yG2Rj7vugXGxv73RlxQAQktB0_RhXYiZLLQj3_DbzYM8yEE9sOSB_owtB63uusiy3SjgA7m-bbffS-JjOyYF_ul5";
  }
  return "https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx";
};

export const Rent: React.FC<RentProps> = ({ cars, isOnline }) => {
  // Selected car for detailed view
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);

  // Filters State
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [engineType, setEngineType] = useState<
    "all" | "combustion" | "electric"
  >("all");
  const [bodyType, setBodyType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Booking details state
  const [pickupDate, setPickupDate] = useState<string>("");
  const [returnDate, setReturnDate] = useState<string>("");

  const availableCars = useMemo(() => {
    return cars.filter((car) => car.status === "Available");
  }, [cars]);

  // Determine dynamic max cost for slider range limit
  const absoluteMaxPrice = useMemo(() => {
    if (availableCars.length === 0) return 1000;
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

  // Simple date calculation
  const bookingDays = useMemo(() => {
    if (!pickupDate || !returnDate) return 1;
    const start = new Date(pickupDate);
    const end = new Date(returnDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return isNaN(diffDays) || diffDays <= 0 ? 1 : diffDays;
  }, [pickupDate, returnDate]);

  const handleBooking = (car: Car) => {
    alert(
      `Rezerwacja pojazdu: ${car.brandname} ${car.modelname}\n` +
        `Okres: ${pickupDate || "Dzisiaj"} - ${returnDate || "Jutro"}\n` +
        `Łączny koszt: ${Number(car.hourlycost) * 24 * bookingDays + 90} PLN (cena zawiera opłatę serwisową).\n\n` +
        `Rezerwacja została pomyślnie przetworzona!`,
    );
    setSelectedCar(null);
  };

  if (!isOnline) {
    return (
      <div className="max-w-md mx-auto my-12 bg-surface-container-low p-8 rounded-[1.5rem] border border-outline-variant text-center tonal-shadow animate-fade-in">
        <span className="material-symbols-outlined text-error text-5xl mb-4">
          cloud_off
        </span>
        <h3 className="font-headline-sm text-xl mb-2 text-on-surface">
          Brak połączenia z API
        </h3>
        <p className="text-on-surface-variant text-sm leading-relaxed">
          Upewnij się, że baza danych i serwer backendu działają poprawnie w
          kontenerach Docker.
        </p>
      </div>
    );
  }

  // DETAILED CAR VIEW
  if (selectedCar) {
    const hourlyCost = Number(selectedCar.hourlycost);
    const dayCost = hourlyCost * 24;
    const totalCost = dayCost * bookingDays + 90; // mock total cost with service fee

    return (
      <div className="max-w-container-max mx-auto px-margin-desktop py-6 animate-fade-in">
        {/* Back Button */}
        <button
          onClick={() => setSelectedCar(null)}
          className="mb-8 flex items-center gap-2 text-secondary font-label-md hover:underline transition-all"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Powrót do listy pojazdów
        </button>

        {/* Detailed Hero Image */}
        <section className="relative h-[45vh] w-full overflow-hidden rounded-[2rem] shadow-lg mb-8">
          <img
            className="w-full h-full object-cover"
            alt={`${selectedCar.brandname} ${selectedCar.modelname}`}
            src={getCarImage(
              selectedCar.bodytype,
              Number(selectedCar.carengine),
              selectedCar.brandname,
            )}
          />
          <div className="absolute inset-0 hero-gradient"></div>
          <div className="absolute bottom-0 left-0 w-full p-8 z-20">
            <span className="bg-primary/20 text-primary backdrop-blur-md px-3 py-1 rounded-full font-label-sm text-xs border border-primary/30 uppercase tracking-wider mb-2 inline-block">
              {selectedCar.bodytype}
            </span>
            <h1 className="font-display-lg text-display-lg text-on-surface">
              {selectedCar.brandname} {selectedCar.modelname}
            </h1>
          </div>
        </section>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Main Specs & Equipment */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-surface-container-lowest p-8 rounded-[1.5rem] border border-outline-variant/60 tonal-shadow">
              <h2 className="font-headline-md text-headline-md text-secondary mb-4">
                Opis pojazdu
              </h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
                {selectedCar.modeldescription ||
                  `Ten wyjątkowy ${selectedCar.brandname} ${selectedCar.modelname} w kolorze ${selectedCar.color.toLowerCase()} to idealny wybór na każdą podróż. Zaprojektowany z myślą o maksymalnej wygodzie i bezpieczeństwie, łączy w sobie elegancję, niesamowitą dynamikę silnika o mocy ${selectedCar.horsepower} KM oraz zaawansowaną technologię, gwarantując podróż w standardzie premium.`}
              </p>
            </div>

            {/* Spec Bento Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col items-center justify-center border border-outline-variant/40 text-center">
                <span className="material-symbols-outlined text-primary mb-2 text-3xl">
                  groups
                </span>
                <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                  Miejsca
                </span>
                <span className="font-headline-sm text-on-surface mt-1">
                  5 osób
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col items-center justify-center border border-outline-variant/40 text-center">
                <span className="material-symbols-outlined text-primary mb-2 text-3xl">
                  settings
                </span>
                <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                  Skrzynia
                </span>
                <span className="font-headline-sm text-on-surface mt-1">
                  Automat
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col items-center justify-center border border-outline-variant/40 text-center">
                <span className="material-symbols-outlined text-primary mb-2 text-3xl">
                  local_gas_station
                </span>
                <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                  Silnik
                </span>
                <span className="font-headline-sm text-on-surface mt-1">
                  {Number(selectedCar.carengine) > 0
                    ? `${selectedCar.carengine}L`
                    : "Elektryczny"}
                </span>
              </div>
              <div className="bg-surface-container-low p-6 rounded-[1.5rem] flex flex-col items-center justify-center border border-outline-variant/40 text-center">
                <span className="material-symbols-outlined text-primary mb-2 text-3xl">
                  bolt
                </span>
                <span className="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
                  Moc
                </span>
                <span className="font-headline-sm text-on-surface mt-1">
                  {selectedCar.horsepower} KM
                </span>
              </div>
            </div>

            {/* Premium Highlights */}
            <div className="space-y-4">
              <h3 className="font-headline-sm text-headline-sm text-secondary px-2">
                Wyposażenie Premium
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-start gap-4 p-5 hover:bg-surface-container transition-all duration-300 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    surround_sound
                  </span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-on-surface">
                      Nagłośnienie Bowers
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Zapewnia studyjną jakość dźwięku i niezrównane wrażenia
                      akustyczne.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 hover:bg-surface-container transition-all duration-300 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    wb_sunny
                  </span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-on-surface">
                      Panoramiczny Dach
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Ogromne przeszklenie wpuszcza naturalne światło i poszerza
                      horyzont.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-5 hover:bg-surface-container transition-all duration-300 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    ac_unit
                  </span>
                  <div>
                    <h4 className="font-label-md text-sm font-semibold text-on-surface">
                      Pakiet Zimowy
                    </h4>
                    <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
                      Podgrzewana kierownica, fotele przednie i tylne dla
                      chłodnych dni.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Sidebar Panel */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24 bg-white p-8 rounded-[1.5rem] border border-outline-variant tonal-shadow space-y-6">
              <div className="flex justify-between items-baseline">
                <span className="font-display-lg text-primary text-3xl font-serif">
                  {dayCost} PLN
                </span>
                <span className="font-body-md text-on-surface-variant text-sm">
                  / dobę
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="font-label-md text-xs text-on-surface mb-2 block font-semibold">
                    Data odbioru
                  </label>
                  <input
                    type="date"
                    value={pickupDate}
                    onChange={(e) => setPickupDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                  />
                </div>
                <div>
                  <label className="font-label-md text-xs text-on-surface mb-2 block font-semibold">
                    Data zwrotu
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant/40 rounded-xl p-3 focus:ring-2 focus:ring-primary focus:border-primary outline-none text-on-surface text-sm"
                  />
                </div>
              </div>

              <div className="border-t border-outline-variant/50 pt-6 space-y-2">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Wynajem ({bookingDays} dni)</span>
                  <span>{dayCost * bookingDays} PLN</span>
                </div>
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Opłata serwisowa</span>
                  <span>90 PLN</span>
                </div>
                <div className="flex justify-between font-headline-sm text-lg text-on-surface pt-4 border-t border-dashed border-outline-variant/30">
                  <span>Razem</span>
                  <span className="font-bold text-primary">
                    {totalCost} PLN
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleBooking(selectedCar)}
                className="w-full bg-primary hover:brightness-105 text-white font-label-md py-4 rounded-full transition-all shadow-lg active:scale-95 text-center font-semibold"
              >
                Zarezerwuj teraz
              </button>
              <p className="text-center font-body-sm text-xs text-on-surface-variant italic">
                Bezpłatne odwołanie do 24h przed startem
              </p>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  // RENTAL LIST VIEW
  return (
    <div className="max-w-container-max mx-auto px-margin-desktop py-6 animate-fade-in space-y-10">
      <div className="space-y-2">
        <p className="font-body-lg text-on-surface-variant text-xl leading-relaxed">
          Odkryj naszą flotę, idealnie przygotowaną na Twoją następną przygodę.
        </p>
      </div>

      {/* FILTER BAR CARD */}
      <div className="filter-glass p-6 rounded-[1.5rem] border border-outline-variant car-card-shadow flex flex-wrap lg:flex-nowrap items-end gap-6 bg-white/70">
        {/* Search Input */}
        <div className="flex-1 min-w-[240px]">
          <label className="font-label-md text-xs font-semibold text-on-surface-variant mb-2 block ml-1">
            Wyszukaj Model
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Wpisz markę lub model..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-outline/80 text-sm"
            />
          </div>
        </div>

        {/* Price Slider */}
        <div className="flex-1 min-w-[200px]">
          <div className="flex justify-between items-center mb-2 ml-1">
            <label className="font-label-md text-xs font-semibold text-on-surface-variant">
              Cena do:{" "}
              <span className="text-primary font-bold">{currentMaxPrice}</span>{" "}
              PLN/h
            </label>
          </div>
          <input
            type="range"
            min="10"
            max={absoluteMaxPrice}
            value={currentMaxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-primary h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Engine Type */}
        <div className="w-full lg:w-48">
          <label className="font-label-md text-xs font-semibold text-on-surface-variant mb-2 block ml-1">
            Napęd
          </label>
          <select
            value={engineType}
            onChange={(e) =>
              setEngineType(e.target.value as "all" | "combustion" | "electric")
            }
            className="w-full px-4 py-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer text-on-surface text-sm"
          >
            <option value="all">Wszystkie</option>
            <option value="combustion">Spalinowy</option>
            <option value="electric">Elektryczny</option>
          </select>
        </div>

        {/* Body Style */}
        <div className="w-full lg:w-48">
          <label className="font-label-md text-xs font-semibold text-on-surface-variant mb-2 block ml-1">
            Nadwozie
          </label>
          <select
            value={bodyType}
            onChange={(e) => setBodyType(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-outline-variant/60 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none cursor-pointer text-on-surface text-sm"
          >
            <option value="all">Wszystkie</option>
            {uniqueBodyTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* SEARCH RESULTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCars.length === 0 ? (
          <div className="col-span-full bg-surface-container-lowest border border-outline-variant p-10 rounded-[1.5rem] text-center tonal-shadow">
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Nie znaleziono samochodów spełniających wybrane kryteria filtrów.
            </p>
          </div>
        ) : (
          filteredCars.map((car) => (
            <div
              key={car.carid}
              className="bg-white rounded-[1.5rem] overflow-hidden border border-outline-variant/60 car-card-shadow group transition-all duration-300 hover:-translate-y-2 flex flex-col justify-between"
            >
              {/* Card Image */}
              <div className="h-56 overflow-hidden relative bg-surface-container-high">
                <img
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  alt={`${car.brandname} ${car.modelname}`}
                  src={getCarImage(
                    car.bodytype,
                    Number(car.carengine),
                    car.brandname,
                  )}
                />
              </div>

              {/* Card Details */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-headline-sm text-lg text-on-surface font-semibold">
                        {car.brandname} {car.modelname}
                      </h3>
                      <p className="font-body-sm text-xs text-on-surface-variant mt-1">
                        {car.bodytype} • {car.color}
                      </p>
                    </div>
                  </div>

                  {/* Specification Badges */}
                  <div className="flex flex-wrap gap-3 my-4 text-xs text-on-surface-variant">
                    <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        person
                      </span>
                      <span>5 Osób</span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        bolt
                      </span>
                      <span>{car.horsepower} KM</span>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-low px-2.5 py-1.5 rounded-lg border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[16px] text-primary">
                        local_gas_station
                      </span>
                      <span>
                        {Number(car.carengine) > 0 ? `${car.carengine}L` : "EV"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/40">
                  <div>
                    <p className="text-primary font-bold text-lg">
                      {car.hourlycost} PLN{" "}
                      <span className="text-on-surface-variant font-normal text-xs">
                        / godz.
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCar(car)}
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-xl font-label-md text-sm hover:brightness-105 active:scale-95 transition-all shadow-md font-semibold"
                  >
                    Szczegóły
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
