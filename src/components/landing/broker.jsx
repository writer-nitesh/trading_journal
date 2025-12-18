export const brokers = [
    {
        name: 'Dhan',
        logo: '/brokers/dhan_logo.svg',
        autoSync: false,
        status: '✓ Connected'
    },
    {
        name: 'Zerodha',
        logo: '/brokers/zerodha_logo.svg',
        autoSync: true,
        status: '✓ Connected'
    },
    {
        name: 'Angel One',
        logo: '/brokers/angelone.svg',
        autoSync: true,
        status: '✓ Available'
    },

    {
        name: 'Upstox',
        logo: '/brokers/upstox.svg',
        autoSync: true,
        status: '✓ Available'
    },

];

const Brokers = () => {
    const brokers = [
        { name: 'Dhan', logo: '/brokers/dhan_logo.svg', autoSync: true, status: '✓ Available' },
        { name: 'Zerodha', logo: '/brokers/zerodha_logo.svg', autoSync: true, status: '✓ Available' },
        { name: 'Angel One', logo: '/brokers/angelone.svg', autoSync: true, status: '✓ Available' },
        { name: '5Paisa', logo: '/brokers/5paisa_icon.jpeg', autoSync: false, status: 'Coming Soon' },
        { name: 'Upstox', logo: '/brokers/upstox_icon.jpeg', autoSync: true, status: '✓ Available' },
        { name: 'Kotak Securities', logo: '/brokers/kotaklogo.jpeg', autoSync: false, status: 'Coming Soon' },
        { name: 'Fyers', logo: '/brokers/fyers.png', autoSync: true, status: '✓ Available' },
        { name: 'Alice Blue', logo: '/brokers/aliceblue_icon.jpeg', autoSync: false, status: 'Coming Soon' },

    ];

    return (
        <section id="brokers" className="py-20 bg-white dark:bg-neutral-900 overflow-hidden">
            <div className="max-w-7xl mx-auto px-5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">
                        One-Click Trade Sync from Brokers
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
                        Seamlessly Sync Trades from Top Brokers and Crypto Exchanges
                    </p>
                </div>

                <div className="relative overflow-hidden py-5">
                    <div className="flex animate-infinite-scroll gap-8">
                        {/* First set of brokers */}
                        {brokers.map((broker, index) => (
                            <div
                                key={`first-${index}`}
                                className="flex-shrink-0 bg-slate-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-8 text-center min-w-48 hover:-translate-y-2 hover:shadow-xl hover:border-emerald-600 transition-all relative group"
                            >
                                {broker.autoSync && (
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        Auto Sync
                                    </div>
                                )}
                                <div className="w-16 h-16 bg-white dark:bg-neutral-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md font-bold text-emerald-600 text-sm overflow-hidden">
                                    {broker.logo ? (
                                        <img src={broker.logo} alt={broker.name} className="w-full h-full object-contain" />
                                    ) : (
                                        broker.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="font-bold text-neutral-900 dark:text-white mb-1">{broker.name}</div>
                                <div className="text-sm text-emerald-600 font-semibold">{broker.status}</div>
                            </div>
                        ))}

                        {/* Duplicate set of brokers for seamless loop */}
                        {brokers.map((broker, index) => (
                            <div
                                key={`second-${index}`}
                                className="flex-shrink-0 bg-slate-50 dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-8 text-center min-w-48 hover:-translate-y-2 hover:shadow-xl hover:border-emerald-600 transition-all relative group"
                            >
                                {broker.autoSync && (
                                    <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                                        Auto Sync
                                    </div>
                                )}
                                <div className="w-16 h-16 bg-white dark:bg-neutral-700 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-md font-bold text-emerald-600 text-sm overflow-hidden">
                                    {broker.logo ? (
                                        <img src={broker.logo} alt={broker.name} className="w-full h-full object-contain" />
                                    ) : (
                                        broker.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                                <div className="font-bold text-neutral-900 dark:text-white mb-1">{broker.name}</div>
                                <div className="text-sm text-emerald-600 font-semibold">{broker.status}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <style jsx>{`
        @keyframes infinite-scroll {
            0% { 
                transform: translateX(0); 
            }
            100% { 
                transform: translateX(-50%); 
            }
        }
        
        .animate-infinite-scroll {
            animation: infinite-scroll 30s linear infinite;
            width: fit-content;
        }
        
        .animate-infinite-scroll:hover {
            animation-play-state: paused;
        }
        
        /* Responsive speed adjustments */
        @media (max-width: 768px) {
            .animate-infinite-scroll {
                animation-duration: 20s;
            }
        }
        
        @media (min-width: 1024px) {
            .animate-infinite-scroll {
                animation-duration: 40s;
            }
        }
    `}</style>
        </section>
    );
};

export default Brokers;
