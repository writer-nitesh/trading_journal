import Image from "next/image";
import { useState } from "react";
import { useEffect } from "react";
import { trackEvent, initMixpanel } from "@/lib/mixpanelClient";

const Hero = () => {
  const [showVideoPopup, setShowVideoPopup] = useState(false);

  useEffect(() => {
    initMixpanel();
    trackEvent("viewed_landing");
  }, []);
  return (
    <>
      <section className="pt-10 pb-20 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-neutral-900 dark:to-neutral-800">
        <div className="max-w-7xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-extrabold text-neutral-900 dark:text-white leading-tight mb-5">
                Most Advanced
                <br />
                <span className="text-emerald-600">AI Analytics</span> Platform
                For Traders
              </h1>
              <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
                Analyze your trades in stocks, F&O, crypto, and forex with
                AI-powered insights. Identify patterns, manage risk, and trade
                more profitably - all in one powerful platform
              </p>

              <div className="flex flex-wrap gap-5 justify-center md:justify-start mb-10">
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Past Trade Insights & Analysis
                </div>
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Auto broker sync
                </div>
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Advanced analytics
                </div>
                <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300 font-medium">
                  <span className="text-emerald-500 font-bold">✓</span>
                  Mobile optimized
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <a
                  href="/signup"
                  className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  Start Free 7-Day Trial
                </a>
                <button
                  onClick={() => {
                    trackEvent("clicked_watch_demo", {
                      location: "hero_section",
                      video_id: "tUbXOtMAwJM",
                    });
                    setShowVideoPopup(true);
                  }}
                  className="border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-600 hover:text-white hover:-translate-y-1 transition-all"
                >
                  Watch Demo
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-2xl p-5">
                <div className="flex gap-2 mb-4">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                </div>
                <div className="bg-slate-50 dark:bg-neutral-700 rounded-lg">
                  <Image
                    src="/featuredImages/dashboard.png"
                    alt="Hero Image"
                    layout="responsive"
                    className="rounded-md"
                    width={700}
                    height={475}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {showVideoPopup && (
        <div
          className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowVideoPopup(false)}
        >
          <div className="bg-white rounded-lg p-4 max-w-4xl w-full mx-4">
            <iframe
              width="100%"
              height="480"
              src="https://www.youtube.com/embed/tUbXOtMAwJM"
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </>
  );
};
export default Hero;
