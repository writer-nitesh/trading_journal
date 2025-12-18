const Testimonials = () => {
    const testimonials = [
        {
            quote: "Tradio’s AI risk analysis showed I was overleveraging in Bank Nifty options. After adjusting position sizing, my returns became consistent and profitable for three straight months",
            author: "Rajesh Kumar",
            avatar: "RK",
            details: "Options Trader • Mumbai",
            stats: "₹15L+ Portfolio • 3 years experience"
        },
        {
            quote: "As a swing trader focused on mid-cap stocks, the sector analysis feature is incredible. I can now see which sectors are driving my profits and losses. My win rate improved from 52% to 71% in 6 months.",
            author: "Priya Sharma",
            avatar: "PS",
            details: "Swing Trader • Bangalore",
            stats: "₹8L+ Portfolio • 7 months experience"
        },
        {
            quote: "The Tradio is perfect for intraday trading. I can auto-sync trades during market hours and review my performance every evening. The AI assistant feature gives me insights I never thought of before!",
            author: "Arjun Mehta",
            avatar: "AM",
            details: "Day Trader • Delhi",
            stats: "₹25L+ Portfolio • 4 years experience"
        }
    ];

    return (
        <section id="testimonials" className="py-20 bg-slate-50 dark:bg-neutral-900">
            <div className="max-w-7xl mx-auto px-5">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-4">
                        What Indian Traders Are Saying
                    </h2>
                    <p className="text-xl text-neutral-600 dark:text-neutral-300">
                        Join thousands of successful traders who trust TradioHub
                    </p>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-white dark:bg-neutral-800 rounded-xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-700 relative"
                        >
                            <div className="text-4xl text-emerald-600 absolute top-4 left-6">"</div>
                            <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed mb-6 pt-6 italic">
                                {testimonial.quote}
                            </p>
                            <div className="flex items-center gap-4 border-t border-neutral-200 dark:border-neutral-700 pt-6">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                    {testimonial.avatar}
                                </div>
                                <div>
                                    <h4 className="font-bold text-neutral-900 dark:text-white">
                                        {testimonial.author}
                                    </h4>
                                    <div className="text-neutral-600 dark:text-neutral-400 text-sm">
                                        {testimonial.details}
                                    </div>
                                    <div className="text-emerald-600 text-sm font-semibold mt-1">
                                        {testimonial.stats}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
