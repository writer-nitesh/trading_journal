import Image from "next/image";
import { useEffect, useState } from "react";

const Features = () => {
    const [activeTab, setActiveTab] = useState('analytics');

    const featuresData = {
        analytics: {
            title: 'AI-Powered Analytics',
            description: 'Get intelligent insights from your trading data with our advanced AI analytics engine. Discover patterns, optimize strategies, and make data-driven decisions.',
            highlights: [
                'Discovers hidden trends in your trades',
                'Pattern recognition and trend analysis',
                'Performance optimization suggestions',
                'Risk assessment and recommendations',
                'Analyzes position sizing consistency',
                'Reveals timing patterns affecting performance'
            ],
            image: {
                src: '/featuredImages/ai anylatics.png',
                alt: 'AI Insights Dashboard'
            }
        },
        Dashboard: {
            title: 'Advanced Dashboard',
            description: 'Visualize your trading data with interactive pivot charts and customizable grids. Analyze performance across multiple dimensions and timeframes.',
            highlights: [
                'View all your trades, positions, and portfolio in one place',
                'Track daily PnL, win rates, and ROI calculations instantly',
                'Visualize performance trends and optimal trading windows',
                'Real-time data visualization',
                'Export charts and reports',
                'Mobile-responsive design'
            ],
            image: {
                src: '/featuredImages/dashboard.png',
                alt: 'AI Insights Dashboard'
            }
        },
        table: {
            title: 'Trades Table',
            description: 'Track, Analyze & Optimize Every Trade in Real-Time',
            highlights: [
                'Stocks, F&O, and crypto in one table',
                'Filter by symbol, strategy, or P&L instantly',
                'Live P&L as you trade',
                'Label strategies and emotions',
                'Spot streaks and manage risk'
            ],
            image: {
                src: '/featuredImages/table.png',
                alt: 'Trades Table'
            }
        },
        charting: {
            title: 'Advanced dashboard',
            description: 'Visualize your trading data with interactive pivot charts and customizable grids. Analyze performance across multiple dimensions and timeframes.',
            highlights: [
                'Compare performance across weekdays',
                'Analyze which strategies work best',
                'Find optimal trading hours',
                'View win vs loss size patterns',
                'Track holding periods impact'
            ],
            image: {
                src: '/featuredImages/advance charting.png',
                alt: 'Advanced Dashboard'
            }
        },
        calendar: {
            title: 'Trading Calendar',
            description: 'Track your daily, weekly, and monthly trading performance with our comprehensive calendar view. Plan your trades and review your progress.',
            highlights: [
                'Daily P&L calendar view',
                'Instant profit/loss on each trade',
                'Add Strategy or Mistake tags instantly',
                'Monitor feelings per trade',
                'Open cards without page changes',
                'Spot missed opportunity days'
            ],
            image: {
                src: '/featuredImages/calender.png',
                alt: 'Advanced Calendar'
            }
        },
        detailspage: {
            title: 'Trade Details Page',
            description: 'Track your daily, weekly, and monthly trading performance with our comprehensive calendar view. Plan your trades and review your progress.',
            highlights: [
                'Log full trade details',
                'Auto P/L & risk-reward',
                'Strategy & mistake tags',
                'Track trading emotions',
                'Add notes & charts',
                'Add Stoloss and check Risk:Rewards'
            ],
            image: {
                src: '/featuredImages/details page.png',
                alt: 'Advanced Details Page'
            }
        },
        tags: {
            title: 'Custom tags',
            description: 'Take full control of your trade journaling with personalized strategy and mistake tags',
            highlights: [
                ' Strategy Tags – Label trades with your go-to setups',
                'Mistake Tags – Track errors to avoid repeats',
                'Instant Create – Add tags on the fly',
                'Organized View – Separate strategies & mistakes',
                'Pattern Insights – See what works (and what doesn\'t)',
                'Boost Profits – Learn & refine your edge'
            ],
            image: {
                src: '/featuredImages/tags.png',
                alt: 'Advanced Tags'
            }
        },
        connectbroker: {
            title: 'Broker connection',
            description: ' Integrate your trading account for real-time sync, smarter insights, and effortless data import with single click.',
            highlights: [
                'Wide support: Zerodha, Dhan, Fyers & more',
                '1-click setup, connect in seconds',
                'Real-time sync for trades & portfolio',
                'Advanced tools: journaling & analytics',
                'Easily switch brokers anytime',
                'Secure encrypted integration'
            ],
            image: {
                src: '/featuredImages/connect broker.png',
                alt: 'Connect Broker'
            }
        }
    };

    const tabs = [
        { key: 'analytics', label: 'AI Analytics' },
        { key: 'Dashboard', label: 'Advanced dashboard' },
        { key: 'calendar', label: 'Trading Calendar' },
        { key: 'table', label: 'Trades Table' },
        { key: 'tags', label: 'Custom tags' },
        { key: 'connectbroker', label: 'Connect Broker' },
        { key: 'detailspage', label: 'Trade Details Page' },
        { key: 'charting', label: 'Advanced Charting' }
    ];

    const currentFeature = featuresData[activeTab] || featuresData.analytics;

    // Check if current tab should display in portrait mode
    const isPortraitMode = activeTab === 'analytics' || activeTab === 'tags';

    useEffect(() => {
        const intervalId = setInterval(() => {
            const index = tabs.findIndex((tab) => tab.key === activeTab);
            setActiveTab(tabs[(index + 1) % tabs.length].key);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [activeTab, tabs]);

    return (
        <section id="features" className="py-20 bg-slate-50 dark:bg-neutral-900 min-h-screen flex items-center">
            <div className="max-w-7xl mx-auto px-5 w-full">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-4">Powerful Features for Every Trader</h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
                        Everything you need to analyze, improve, and master your trading performance
                    </p>
                </div>

                <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <div className="bg-slate-50 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 overflow-x-auto custom-scroll">
                        <div className="flex min-w-max px-12">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`px-6 py-5 font-semibold text-sm whitespace-nowrap border-b-3 transition-all ${activeTab === tab.key
                                        ? 'text-emerald-600 bg-white dark:bg-neutral-700 border-emerald-600 shadow-sm'
                                        : 'text-neutral-500 dark:text-neutral-400 border-transparent hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-neutral-700'
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-10">
                        <div className="grid md:grid-cols-2 gap-10">
                            {/* Left section - Text content */}
                            <div className="flex flex-col lg:h-[500px] h-[600px]">
                                <div className="flex-1 overflow-y-auto">
                                    <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-neutral-100 mb-5">{currentFeature.title}</h3>
                                    <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">{currentFeature.description}</p>
                                    <ul className="space-y-3 mb-8">
                                        {currentFeature.highlights.map((highlight, index) => (
                                            <li key={index} className="flex items-start gap-3 text-neutral-700 dark:text-neutral-300 font-medium">
                                                <span className="w-5 h-5 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-bold flex-shrink-0 mt-0.5">
                                                    ✓
                                                </span>
                                                {highlight}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-auto pt-4">
                                    <a href="/signup" className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors inline-block">
                                        Explore Features
                                    </a>
                                </div>
                            </div>

                            {/* Right section - Demo */}
                            <div className={`${isPortraitMode && 'flex justify-center items-center'}`}>
                                <div className={`bg-slate-50 dark:bg-neutral-700 rounded-xl p-4 dark:border-neutral-600 h-[500px] flex flex-col ${isPortraitMode ? 'aspect-[1/2]' : 'aspect-video'
                                    }`}>
                                    {currentFeature.image && (
                                        <div className="bg-white h-full">
                                            <Image
                                                src={currentFeature.image.src}
                                                alt={currentFeature.image.alt}
                                                width={1920}
                                                height={1080}
                                                quality={100}
                                                className="w-full h-full object-contain object-top-left  border border-neutral-200 rounded-lg "
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
export default Features;