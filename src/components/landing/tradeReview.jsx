import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, BarChart3, Target, AlertTriangle, Lightbulb, TrendingUp, Clock } from 'lucide-react';

function FeaturesSection() {
    const features = [
        {
            icon: BarChart3,
            title: 'Performance Analysis',
            description: 'Track win rate, P&L, risk-reward ratios, and trends across stocks, forex, and crypto',
            gradient: 'from-emerald-400 via-emerald-500 to-emerald-600',
            glowColor: 'shadow-emerald-500/25',
            accentColor: 'emerald-500'
        },
        {
            icon: Target,
            title: 'Pattern Recognition',
            description: 'AI detects repeating patterns in winning and losing trades for smarter strategies',
            gradient: 'from-rose-400 via-rose-500 to-rose-600',
            glowColor: 'shadow-rose-500/25',
            accentColor: 'rose-500'
        },
        {
            icon: AlertTriangle,
            title: 'Risk Assessment',
            description: 'Get position sizing tips, risk management insights, and volatility analysis',
            gradient: 'from-amber-400 via-amber-500 to-amber-600',
            glowColor: 'shadow-amber-500/25',
            accentColor: 'amber-500'
        },
        {
            icon: Lightbulb,
            title: 'Improvement Tips',
            description: 'AI-driven suggestions to improve strategies and boost long-term returns',
            gradient: 'from-blue-400 via-blue-500 to-blue-600',
            glowColor: 'shadow-blue-500/25',
            accentColor: 'blue-500'
        },
        {
            icon: TrendingUp,
            title: 'Advanced Graphs',
            description: 'Visualize your performance with interactive charts and uncover hidden statistics for smarter decisions',
            gradient: 'from-purple-400 via-purple-500 to-purple-600',
            glowColor: 'shadow-purple-500/25',
            accentColor: 'purple-500'
        },
        {
            icon: Clock,
            title: 'Time Analysis',
            description: 'Find your best trading days, times, and market conditions with AI insights',
            gradient: 'from-indigo-400 via-indigo-500 to-indigo-600',
            glowColor: 'shadow-indigo-500/25',
            accentColor: 'indigo-500'
        }
    ];

    return (
        <div className="min-h-screen pt-10 pb-16 px-6 relative overflow-hidden ">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-30">
                <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2px, transparent 0)`,
                    backgroundSize: '50px 50px'
                }}></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-block">
                        <h2 className="text-5xl sm:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 relative">
                            What you'll get
                            {/* Underline animation */}
                            <div className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-blue-500 to-purple-500 rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700"></div>
                        </h2>
                    </div>
                    <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                        Unlock powerful insights with our comprehensive AI-driven analysis
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid lg:grid-cols-3 md:grid-cols-2 gri  gap-6">
                    {features.map((feature, index) => (
                        <div key={index} className="group relative">
                            {/* Glow effect background */}

                            {/* Main Card */}
                            <div className="relative bg-white/95 dark:bg-neutral-800/95 backdrop-blur-xl rounded-2xl p-6 shadow-xl duration-500  border border-white/20 dark:border-neutral-700/20 h-full flex flex-col overflow-hidden">

                                {/* Floating orbs background */}
                                <div className="absolute top-3 right-3 w-16 h-16 bg-gradient-to-r from-white/10 to-white/5 dark:from-neutral-700/10 dark:to-neutral-700/5 rounded-full blur-xl"></div>
                                <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-r from-white/5 to-transparent dark:from-neutral-700/5 dark:to-transparent rounded-full blur-2xl"></div>



                                {/* Icon Section */}
                                <div className="relative mb-6">
                                    <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg ${feature.glowColor} `}>
                                        <feature.icon className="w-5 h-5 text-white drop-shadow-sm" strokeWidth={2.5} />
                                    </div>

                                    {/* Icon glow effect */}
                                    <div className={`absolute inset-0 w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} opacity-0 blur-xl transition-opacity duration-500`}></div>
                                </div>

                                {/* Content Section */}
                                <div className=" flex flex-col relative z-10 h-fit">
                                    <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mb-3 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors duration-300 leading-tight">
                                        {feature.title}
                                    </h3>
                                    <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed text-sm flex-grow">
                                        {feature.description}
                                    </p>
                                </div>


                            </div>
                        </div>
                    ))}
                </div>

                {/* Bottom Section */}

                <div className="w-2 h-2 bg-white dark:bg-neutral-800 rounded-full"></div>

            </div>

            {/* Enhanced background elements */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-gradient-to-r from-emerald-300/30 to-teal-300/30 dark:from-emerald-500/20 dark:to-teal-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 -right-32 w-[500px] h-[500px] bg-gradient-to-r from-blue-300/20 to-indigo-300/20 dark:from-blue-500/15 dark:to-indigo-500/15 rounded-full blur-3xl"></div>
                <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 w-80 h-80 bg-gradient-to-r from-purple-300/25 to-pink-300/25 dark:from-purple-500/15 dark:to-pink-500/15 rounded-full blur-3xl"></div>
            </div>
        </div>
    );
}



export default function TradeReview() {
    const [selectedBroker, setSelectedBroker] = useState('zerodha');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const router = useRouter();

    const handleFileUpload = (e) => {
        router.push('/signup');
    };

    const handleDrop = (e) => {
        router.push('/signup');
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div id='ai-review' className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900 relative overflow-hidden">


            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-6">
                <div className="max-w-4xl mx-auto text-center">
                    {/* Header */}
                    <div className="mb-12">
                        <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 dark:text-neutral-100 mb-6 leading-tight">
                            Turn your trades into
                            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent"> Insights</span>
                        </h1>
                        <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto leading-relaxed">
                            What Will You Learn? Unlock Unlimited Possibilities with AI-Powered Trading Analysis and Insights
                        </p>
                    </div>



                    {/* Main Interface Card with Rotating Border */}
                    <div className="relative mb-8 w-full max-w-5xl mx-auto" style={{ width: '100%', maxWidth: 'none', marginLeft: '' }}>
                        {/* Rotating Green Border */}
                        <div className="absolute -inset-1 rounded-2xl overflow-hidden">
                            <div
                                className="absolute -inset-8 animate-spin rounded-full"
                                style={{
                                    background: 'linear-gradient(45deg, #34d399, #10b981, #059669, #22c55e, #16a34a, #34d399, #10b981, #059669)',
                                    animationDuration: '4s',
                                    animationTimingFunction: 'linear',
                                    animationIterationCount: 'infinite'
                                }}
                            ></div>
                            {/* Inner mask to create border effect */}
                            <div className="absolute inset-1 bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl rounded-xl"></div>
                        </div>

                        {/* Main Card Content */}
                        <div className="relative bg-white/90 dark:bg-neutral-800/90 backdrop-blur-xl rounded-xl shadow-xl p-8 z-10">
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-4">
                                    Upload your trades in CSV format, and we'll analyze it for you...
                                </h3>

                                {/* Form Grid */}
                                <div className="flex flex-col gap-4 mb-6">
                                    {/* Broker Selection */}
                                    <select
                                        value={selectedBroker}
                                        onChange={(e) => setSelectedBroker(e.target.value)}
                                        className="px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 dark:bg-neutral-700/50 text-neutral-900 dark:text-neutral-100 backdrop-blur-sm"
                                    >
                                        <option value="zerodha">Zerodha</option>
                                        <option value="upstox">Upstox</option>
                                        <option value="angel-one">Angel One</option>
                                        <option value="icici-direct">ICICI Direct</option>
                                        <option value="other">Other Platform</option>
                                    </select>

                                    {/* File Upload */}
                                    <div
                                        className={`relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer ${isDragging
                                            ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                                            : uploadedFile
                                                ? 'border-emerald-400 bg-emerald-50/50 dark:bg-emerald-900/20'
                                                : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500 bg-white/50 dark:bg-neutral-700/50'
                                            } backdrop-blur-sm`}
                                        onDrop={handleDrop}
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onClick={()=>{router.push('/signup')}}
                                    >
                                      
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className={`w-4 h-4 ${uploadedFile ? 'text-emerald-600' : 'text-neutral-400 dark:text-neutral-500'}`} strokeWidth={2.5} />
                                            <span className="text-sm text-neutral-600 dark:text-neutral-400">
                                                {uploadedFile ? uploadedFile.name : 'Attach files'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main CTA */}
                    <button onClick={() => router.push('/signup')} className="inline-flex items-center gap-3 px-12 py-4 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-lg">
                        ✨ Start analyzing with AI
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>


                </div>
            </div>

            {/* Features Section */}
            <FeaturesSection />
        </div>
    );
}