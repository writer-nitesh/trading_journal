'use client'
import React, { useState, useEffect } from 'react';

export default function ComingSoonPage() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });

    useEffect(() => {
        // Set target date to 30 days from now
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 30);

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance > 0) {
                setTimeLeft({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
                    minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
                    seconds: Math.floor((distance % (1000 * 60)) / 1000)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900 flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-2xl mx-auto text-white">
                {/* Main heading */}
                <div className="space-y-4">
                    <h1 className="text-5xl md:text-7xl font-light text-white tracking-wider">
                        COMING
                    </h1>
                    <h2 className="text-5xl md:text-7xl font-light text-white tracking-wider">
                        SOON
                    </h2>
                    <div className="w-24 h-px bg-emerald-400 mx-auto opacity-70"></div>
                </div>

                {/* Subtitle */}
                <p className=" text-lg md:text-xl font-light max-w-md mx-auto leading-relaxed">
                    Something amazing is on the way. Get ready for a new experience.
                </p>

                {/* Countdown Timer */}
                <div className="grid grid-cols-4 gap-4 max-w-md mx-auto">
                    <div className="text-center">
                        <div className="bg-green-500 bg-opacity-15 backdrop-blur-sm rounded-lg p-4 border border-green-400 border-opacity-30">
                            <div className="text-2xl md:text-3xl font-light text-white">
                                {String(timeLeft.days).padStart(2, '0')}
                            </div>
                            <div className="text-xs  uppercase tracking-wide mt-1">
                                Days
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-500 bg-opacity-15 backdrop-blur-sm rounded-lg p-4 border border-green-400 border-opacity-30">
                            <div className="text-2xl md:text-3xl font-light text-white">
                                {String(timeLeft.hours).padStart(2, '0')}
                            </div>
                            <div className="text-xs uppercase tracking-wide mt-1">
                                Hours
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-500 bg-opacity-15 backdrop-blur-sm rounded-lg p-4 border border-green-400 border-opacity-30">
                            <div className="text-2xl md:text-3xl font-light text-white">
                                {String(timeLeft.minutes).padStart(2, '0')}
                            </div>
                            <div className="text-xs uppercase tracking-wide mt-1">
                                Minutes
                            </div>
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="bg-green-500 bg-opacity-15 backdrop-blur-sm rounded-lg p-4 border border-green-400 border-opacity-30">
                            <div className="text-2xl md:text-3xl font-light text-white">
                                {String(timeLeft.seconds).padStart(2, '0')}
                            </div>
                            <div className="text-xs  uppercase tracking-wide mt-1">
                                Seconds
                            </div>
                        </div>
                    </div>
                </div>

                {/* Email signup */}
                {/* <div className="space-y-4 max-w-md mx-auto">
          <p className="text-green-200 text-sm">Get notified when we launch</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 bg-green-500 bg-opacity-10 backdrop-blur-sm border border-green-400 border-opacity-30 rounded-lg text-white placeholder-green-300 focus:outline-none focus:border-green-400 focus:border-opacity-50 transition-all"
            />
            <button className="px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-500/25">
              Notify Me
            </button>
          </div>
        </div> */}
            </div>

            {/* Decorative elements */}
            <div className="absolute top-10 left-10 w-2 h-2 bg-emerald-400 opacity-40 rounded-full animate-pulse"></div>
            <div className="absolute top-1/4 right-16 w-1 h-1 bg-green-300 opacity-30 rounded-full animate-pulse delay-1000"></div>
            <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-emerald-300 opacity-35 rounded-full animate-pulse delay-500"></div>
            <div className="absolute bottom-16 right-1/3 w-1 h-1 bg-green-400 opacity-40 rounded-full animate-pulse delay-700"></div>
        </div>
    );
}