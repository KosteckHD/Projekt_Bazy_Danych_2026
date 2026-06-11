import React from 'react';

interface LandingPageProps {
    onNavigate?: (path: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
    const handleGoToCars = () => {
        if (onNavigate) {
            onNavigate("/cars");
        } else {
            window.location.href = "/cars";
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
                    <div className="md:col-span-8 group cursor-pointer" onClick={handleGoToCars}>
                        <div className="bg-white rounded-[1.5rem] overflow-hidden tonal-shadow border border-outline-variant transition-all hover:-translate-y-1">
                            <div className="relative h-80 overflow-hidden">
                                <img className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt="Volvo" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBa7pg-FPGk-ZWHrza-IWpCZGMV3nB97yPy8xz927W_g2DiACxhaNI4S0hNBkONN4AebFU_GeDtNupNXtOotggossDdEXJKORNZaF9JaAv7amy8ceTM-AdHBHqhoFJmG4Jy0GJjje-VC3x3qIBo974lWZjooJKR3ZQuqjRAAkMaNG1By7kfxJ3nAGiBehMWa5uJW5qsh_06TDJNs7KhGpa3YeXN1chZgG0q09ejjgTAe2qsZ9udcIoYtCfW-OmzPHqOBI4oZZXhIZSx" />
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className="bg-secondary/10 text-secondary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-secondary/20">All-Wheel Drive</span>
                                    <span className="bg-primary/10 text-primary backdrop-blur-md px-3 py-1 rounded-full font-label-sm border border-primary/20">Premium Audio</span>
                                </div>
                            </div>
                            <div className="p-stack-md flex justify-between items-center">
                                <div>
                                    <h3 className="font-headline-sm text-headline-sm">Volvo XC90 - Edycja Leśna</h3>
                                    <p className="font-body-md text-on-surface-variant">Idealny na rodzinne wyprawy w góry.</p>
                                </div>
                                <div className="text-right">
                                    <span className="block font-label-sm text-on-surface-variant">od</span>
                                    <span className="text-primary font-headline-sm">450 zł / dzień</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Side Card 1 (Family) */}
                    <div className="md:col-span-4 group cursor-pointer">
                        <div className="bg-white rounded-[1.5rem] h-full overflow-hidden shadow-lg border border-outline-variant transition-all hover:-translate-y-1">
                            <div className="relative h-48" onClick={handleGoToCars}>
                                <img className="w-full h-full object-cover" alt="Toyota Sienna Comfort" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJi20c0is2aWJkHVPjFgO3PjQ0L9OFcHm-emUMTjh_BVyZ-thiVsn-EfKhVTGRRyNaSxS6oLnOV4PZ7YgiLZkyPn8WYeSWo0px2MfCcwdNl3dvg6n9fU-4WssfNiGrjKOGT24KrFOZa5_v4iYn0nPPgZTEKsjG4NuSOiEfv2nm4j-mt_TEnsxJH3O5WczcMWxXoPNERXBhqzbt0Yv64BcvKLIQ8N_bihMnG5An5Z-kBSm7fN45-yCllzPl-LIoMEnM__-b0pba1os6" />
                            </div>
                            <div className="p-stack-md">
                                <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm mb-2 inline-block">7-osobowy</span>
                                <h3 className="font-headline-sm text-headline-sm text-lg">Toyota Sienna Comfort</h3>
                                <p className="font-body-sm text-on-surface-variant mb-4">Wygoda dla całej Twojej ekipy.</p>
                                <button 
                                    onClick={handleGoToCars}
                                    className="w-full py-2 border-2 border-secondary text-secondary rounded-xl font-label-md hover:bg-secondary hover:text-white transition-colors"
                                >
                                    Wybierz
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    {/* Bottom Row (Small Cars/Electric) */}
                    <div className="md:col-span-4 group cursor-pointer" onClick={handleGoToCars}>
                        <div className="bg-white rounded-[1.5rem] overflow-hidden shadow-lg border border-outline-variant transition-all hover:-translate-y-1">
                            <div className="p-stack-md">
                                <div className="h-40 bg-surface-container-high rounded-xl mb-4 overflow-hidden">
                                    <img className="w-full h-full object-cover" alt="Tesla Model 3" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD6b4M-wF7ztMktbzum2FTP_nqSLO04VeA6gQnFl8EMhJpsZ_6Gdb7X_HdBRS1LqrcJ-3dKxhtNRO4g69as5nrPCQfMZX7IsmZF7hngYN2lkQU_54U9BuqxxxMxx2rcHOtYguQsC9s-2aSMLiXE0SPn018g3ziXZ1ZIXIyiFvnutqGjyYmt3wL7OweBexkCZQPWrXP8rkJ8MwjdnPPZhFF0EoWfAXMIpx0LOJZLsf85QtZvDkE1BnFrTlSxDZb_XdaeJcSsY_4vpsMF" />
                                </div>
                                <h3 className="font-headline-sm text-lg">Tesla Model 3</h3>
                                <p className="font-body-sm text-on-surface-variant">Nowoczesna cisza na trasie.</p>
                            </div>
                        </div>
                    </div>

                    <div className="md:col-span-8 bg-primary-container/5 rounded-[1.5rem] border-2 border-dashed border-primary/20 flex items-center justify-center p-stack-lg text-center">
                        <div>
                            <h3 className="font-headline-sm text-primary mb-2">Potrzebujesz czegoś innego?</h3>
                            <p className="font-body-md text-on-surface-variant mb-4">Mamy wiele modeli dostępnych od ręki sprawdź poniżej.</p>
                            <button 
                                onClick={handleGoToCars}
                                className="bg-secondary text-on-secondary px-8 py-3 rounded-xl font-label-md shadow-lg"
                            >
                                Przeglądaj pełną ofertę
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="bg-surface-container-low py-20 mt-20">
                <div className="max-w-container-max mx-auto px-margin-desktop text-center">
                    <h2 className="font-headline-md text-headline-md text-on-surface mb-8">Opinie naszych klientów</h2>
                    <p className="font-body-lg text-on-surface-variant">Wkrótce udostępnimy doświadczenia naszych kierowców!</p>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
