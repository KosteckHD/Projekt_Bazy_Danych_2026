import React from 'react';

const ClientDashboard: React.FC = () => {
    return (
        <div className="font-body-md text-on-background selection:bg-primary-fixed selection:text-on-primary-fixed bg-[#f9f5eb] min-h-screen">
            <aside className="h-full w-64 fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex flex-col py-stack-lg px-4 transition-all duration-200">
                <div className="mb-10 px-4">
                    <h1 className="font-headline-sm text-headline-sm text-primary font-bold">Harvest Motion</h1>
                </div>
                <div className="mb-8 px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                            <span className="material-symbols-outlined">person</span>
                        </div>
                        <div>
                            <p className="font-label-md text-on-surface">Witaj z powrotem</p>
                            <p className="font-body-sm text-on-surface-variant">Stały Gość</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <a className="flex items-center gap-stack-sm bg-secondary-container text-on-secondary-container rounded-xl px-4 py-3 transition-all duration-200" href="#">
                        <span className="material-symbols-outlined active-icon" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                        <span className="font-label-md">Panel</span>
                    </a>
                    <a className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#">
                        <span className="material-symbols-outlined">car_rental</span>
                        <span className="font-label-md">Moje Wynajmy</span>
                    </a>
                    <a className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#">
                        <span className="material-symbols-outlined">favorite</span>
                        <span className="font-label-md">Ulubione</span>
                    </a>
                    <a className="flex items-center gap-stack-sm text-on-surface-variant px-4 py-3 hover:bg-surface-container-high rounded-xl transition-all duration-200" href="#">
                        <span className="material-symbols-outlined">payments</span>
                        <span className="font-label-md">Płatności</span>
                    </a>
                </nav>
            </aside>

            <main className="ml-64 p-margin-desktop max-w-container-max mx-auto">
                <header className="mb-stack-lg flex justify-between items-end">
                    <div>
                        <h2 className="font-headline-md text-headline-md text-on-surface">Witaj w Harvest Motion</h2>
                        <p className="font-body-md text-on-surface-variant">Twoje centrum podróży.</p>
                    </div>
                    <div className="flex gap-4">
                        <button className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full transition-colors">
                            <span className="material-symbols-outlined">notifications</span>
                        </button>
                    </div>
                </header>

                <section className="grid grid-cols-12 gap-gutter">
                    <div className="col-span-12 lg:col-span-8 space-y-gutter">
                        <div className="bg-surface-container-lowest rounded-[1.5rem] border border-[#E5E1D5] overflow-hidden shadow-lg relative p-8 flex flex-col md:flex-row gap-8">
                            <div className="flex-1">
                                <span className="inline-block px-3 py-1 rounded-full bg-secondary-container/30 text-secondary font-label-sm mb-4">AKTUALNIE WYNAJĘTY</span>
                                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">Volvo XC60 Recharge</h3>
                                <p className="font-body-md text-on-surface-variant mb-6">Hybryda Plug-in | 2024</p>
                                <div className="flex gap-3">
                                    <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md">Zarządzaj rezerwacją</button>
                                    <button className="border-2 border-secondary text-secondary px-6 py-3 rounded-xl font-label-md">Przedłuż najem</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ClientDashboard;
