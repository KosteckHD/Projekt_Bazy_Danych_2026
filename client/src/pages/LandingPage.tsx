import React, { useEffect, useState } from 'react';
import { fetchPopularCars } from '../services/api';
import type { Car } from '../types/api';

const carId = (car: Car) => car.carid ?? car.carId;

interface LandingPageProps {
    onNavigate?: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    const [popularCars, setPopularCars] = useState<Car[]>([]);

    useEffect(() => {
        async function loadPopular() {
            try {
                const data = await fetchPopularCars();
                setPopularCars(data);
            } catch (err) {
                console.error("Failed to load popular cars", err);
            }
        }
        loadPopular();
    }, []);

    const handleGoToCars = () => {
        if (onNavigate) {
            onNavigate("/cars");
        } else {
            window.location.href = "/cars";
        }
    };

    const handleRentCar = (car: Car) => {
        const id = carId(car);
        if (onNavigate) {
            onNavigate(`/create-reservation?carId=${id}`);
        } else {
            window.location.href = `/create-reservation?carId=${id}`;
        }
    };

    return (
        <div className="bg-background text-on-surface font-body-md overflow-x-hidden pb-12">
            {/* Hero Section */}
            <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10"></div>
                    <img className="w-full h-full object-cover" alt="Hero" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRvdHSmPvjJuNt_xs1gXNHTFzMOlEapGZ4IINbLaqnLTCLlPSt6DQgyrja5pKgCGAISSmX5B3l0NL_omG0XWwxVfAgZh-JkEKjQ14ysxUuhQMDwSithYA7zcPO1lWvk8u9wTODqaECO0xft9IQ_rQhjIoP_lz3uu9rezOD41D3--m49-rav2MCaZGPC08PrsAakqsIqmKGifgt-sm028oYLkH-bWkMuILhN058tdT8CCcRk9qrcuUtxzHCF_VhRR-s15GalYy56zng" />
                </div>
                <div className="relative z-20 max-w-container-max mx-auto px-margin-desktop">
                    <div className="max-w-2xl">
                        <h1 className="font-display-lg text-display-lg text-on-surface leading-tight mb-stack-md">
                            Twoja podróż <br /><span className="text-primary">zaczyna się tutaj</span>
                        </h1>
                        <p className="font-body-lg text-body-lg text-on-surface-variant mb-stack-lg">
                            Harvest Motion to nie tylko wynajem. To zaproszenie do odkrywania świata we własnym tempie, z komfortem, który przypomina domowe zacisze.
                        </p>
                        <div className="bg-surface-container-lowest rounded-[1.5rem] tonal-shadow border border-outline-variant p-2 max-w-md">
                            <div className="flex justify-center w-full">
                                <button 
                                    onClick={handleGoToCars}
                                    className="w-full md:w-auto text-on-primary font-label-md py-3 shadow-md hover:brightness-110 transition-all flex items-center justify-center gap-2 rounded-full bg-primary px-8"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                    Szukaj Auta
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Fleet */}
            <section className="py-stack-lg max-w-container-max mx-auto px-margin-desktop">
                <div className="flex flex-col md:flex-row justify-between items-end mb-stack-lg">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Nasza Wyjątkowa Flota</h2>
                        <p className="font-body-md text-on-surface-variant">Samochody dopasowane do Twojego stylu podróży.</p>
                    </div>
                    <button 
                        onClick={handleGoToCars}
                        className="text-secondary font-label-md flex items-center gap-2 hover:underline"
                    >
                        Zobacz wszystkie modele <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
                    
                    {/* Slot 1: Big Card (col-span-8) */}
                    {popularCars[0] ? (
                        <div className="md:col-span-8 group cursor-pointer" onClick={() => handleRentCar(popularCars[0])}>
                            <div className="bg-white rounded-[1.5rem] overflow-hidden tonal-shadow border border-outline-variant transition-all hover:-translate-y-1">
                                <div className="relative h-80 overflow-hidden">
                                    <img 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                        alt={`${popularCars[0].brandName ?? popularCars[0].brandname} ${popularCars[0].modelName ?? popularCars[0].modelname}`} 
                                        src={popularCars[0].imageUrl || popularCars[0].imageurl || "https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx"} 
                                    />
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <span className="bg-secondary/10 text-secondary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-secondary/20">
                                            {popularCars[0].bodyType ?? popularCars[0].bodytype ?? "Premium"}
                                        </span>
                                        <span className="bg-primary/10 text-primary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-primary/20">
                                            {popularCars[0].color}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-stack-md flex justify-between items-center">
                                    <div>
                                        <h3 className="font-headline-sm text-headline-sm">
                                            {popularCars[0].brandName ?? popularCars[0].brandname} {popularCars[0].modelName ?? popularCars[0].modelname}
                                        </h3>
                                        <p className="font-body-md text-on-surface-variant">Najpopularniejszy wybór kierowców.</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-label-sm text-on-surface-variant">Stawka</span>
                                        <span className="text-primary font-headline-sm">{popularCars[0].hourlyCost ?? popularCars[0].hourlycost} PLN / godz.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-8">
                            <div className="bg-surface-container-low rounded-[1.5rem] border border-outline-variant h-[420px] flex flex-col items-center justify-center p-6 text-center shadow-inner">
                                <span className="material-symbols-outlined text-error text-6xl mb-4 font-bold">close</span>
                                <h3 className="font-headline-sm text-on-surface font-bold">Brak pojazdu w bazie</h3>
                                <p className="font-body-sm text-on-surface-variant mt-1">X</p>
                            </div>
                        </div>
                    )}

                    {/* Slot 2: Side Card (col-span-4) */}
                    {popularCars[1] ? (
                        <div className="md:col-span-4 group cursor-pointer" onClick={() => handleRentCar(popularCars[1])}>
                            <div className="bg-white rounded-[1.5rem] h-full overflow-hidden shadow-lg border border-outline-variant transition-all hover:-translate-y-1 flex flex-col justify-between">
                                <div className="relative h-48">
                                    <img 
                                        className="w-full h-full object-cover" 
                                        alt={`${popularCars[1].brandName ?? popularCars[1].brandname} ${popularCars[1].modelName ?? popularCars[1].modelname}`} 
                                        src={popularCars[1].imageUrl || popularCars[1].imageurl || "https://lh3.googleusercontent.com/aida-public/AB6AXuAJi20c0is2aWJkHVPjFgO3PjQ0L9OFcHm-emUMTjh_BVyZ-thiVsn-EfKhVTGRRyNaSxS6oLnOV4PZ7YgiLZkyPn8WYeSWo0px2MfCcwdNl3dvg6n9fU-4WssfNiGrjKOGT24KrFOZa5_v4iYn0nPPgZTEKsjG4NuSOiEfv2nm4j-mt_TEnsxJH3O5WczcMWxXoPNERXBhqzbt0Yv64BcvKLIQ8N_bihMnG5An5Z-kBSm7fN45-yCllzPl-LIoMEnM__-b0pba1os6"} 
                                    />
                                </div>
                                <div className="p-stack-md flex justify-between items-center">
                                    <div>
                                        <h3 className="font-headline-sm text-headline-sm text-lg">
                                            {popularCars[1].brandName ?? popularCars[1].brandname} {popularCars[1].modelName ?? popularCars[1].modelname}
                                        </h3>
                                        <p className="font-body-sm text-on-surface-variant">
                                            {popularCars[1].bodyType ?? popularCars[1].bodytype ?? "Premium"}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-label-sm text-on-surface-variant">Stawka</span>
                                        <span className="text-primary font-headline-sm text-lg">{popularCars[1].hourlyCost ?? popularCars[1].hourlycost} PLN / godz.</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-4">
                            <div className="bg-surface-container-low rounded-[1.5rem] border border-outline-variant h-full flex flex-col items-center justify-center p-6 text-center min-h-[380px] shadow-inner">
                                <span className="material-symbols-outlined text-error text-6xl mb-4 font-bold">close</span>
                                <h3 className="font-headline-sm text-on-surface font-bold text-lg">Brak pojazdu w bazie</h3>
                                <p className="font-body-sm text-on-surface-variant mt-1">X</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Slot 3: Bottom Row Left (col-span-4) */}
                    {popularCars[2] ? (
                        <div className="md:col-span-4 group cursor-pointer" onClick={() => handleRentCar(popularCars[2])}>
                            <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-lg border border-outline-variant transition-all hover:-translate-y-1">
                                <div className="p-stack-md">
                                    <div className="h-40 bg-surface-container-high rounded-xl mb-4 overflow-hidden">
                                        <img 
                                            className="w-full h-full object-cover" 
                                            alt={`${popularCars[2].brandName ?? popularCars[2].brandname} ${popularCars[2].modelName ?? popularCars[2].modelname}`} 
                                            src={popularCars[2].imageUrl || popularCars[2].imageurl || "https://lh3.googleusercontent.com/aida-public/AB6AXuD6b4M-wF7ztMktbzum2FTP_nqSLO04VeA6gQnFl8EMhJpsZ_6Gdb7X_HdBRS1LqrcJ-3dKxhtNRO4g69as5nrPCQfMZX7IsmZF7hngYN2lkQU_54U9BuqxxxMxx2rcHOtYguQsC9s-2aSMLiXE0SPn018g3ziXZ1ZIXIyiFvnutqGjyYmt3wL7OweBexkCZQPWrXP8rkJ8MwjdnPPZhFF0EoWfAXMIpx0LOJZLsf85QtZvDkE1BnFrTlSxDZb_XdaeJcSsY_4vpsMF"} 
                                        />
                                    </div>
                                    <h3 className="font-headline-sm text-lg">
                                        {popularCars[2].brandName ?? popularCars[2].brandname} {popularCars[2].modelName ?? popularCars[2].modelname}
                                    </h3>
                                    <p className="font-body-sm text-on-surface-variant">
                                        {popularCars[2].hourlyCost ?? popularCars[2].hourlycost} PLN / godz.
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="md:col-span-4">
                            <div className="bg-surface-container-low rounded-[1.5rem] border border-outline-variant flex flex-col items-center justify-center p-6 text-center h-[280px] shadow-inner">
                                <span className="material-symbols-outlined text-error text-6xl mb-4 font-bold">close</span>
                                <h3 className="font-headline-sm text-on-surface font-bold text-lg">Brak pojazdu w bazie</h3>
                                <p className="font-body-sm text-on-surface-variant mt-1">X</p>
                            </div>
                        </div>
                    )}

                    {/* Right side container */}
                    <div className="md:col-span-8 bg-primary-container/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center p-stack-lg text-center">
                        <div>
                            <h3 className="font-headline-sm text-primary mb-2">Potrzebujesz czegoś innego?</h3>
                            <p className="font-body-md text-on-surface-variant mb-4 font-semibold">Sprawdź naszą kompletną ofertę aut osobowych, sportowych i SUV-ów.</p>
                            <button onClick={handleGoToCars} className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-label-md shadow-lg hover:brightness-105 active:scale-95 transition-all">Przeglądaj pełną ofertę</button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-surface-container-low py-20 mt-20">
                <div className="max-w-container-max mx-auto px-margin-desktop text-center">
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-8 font-bold">Opinie naszych klientów</h2>
                    <p className="font-body-lg text-on-surface-variant font-semibold">Wkrótce udostępnimy doświadczenia naszych kierowców!</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
