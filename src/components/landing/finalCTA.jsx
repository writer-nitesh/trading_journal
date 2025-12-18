import React, { useState, useEffect } from "react";
import { trackEvent, initMixpanel } from "@/lib/mixpanelClient";

const FinalCTA = () => {
  const [showVideoPopup, setShowVideoPopup] = useState(false);
  useEffect(() => {
    initMixpanel();
  }, []);
  return (
    <>
      <section className="py-24 bg-gradient-to-br from-slate-50 to-slate-200 dark:from-neutral-900 dark:to-neutral-800 text-center">
        <div className="max-w-4xl mx-auto px-5">
          <h2 className="text-4xl font-extrabold text-neutral-900 dark:text-white mb-6">
            Ready to Transform Your Trading?
          </h2>
          <p className="text-xl text-neutral-600 dark:text-neutral-300 mb-10 leading-relaxed">
            Join thousands of Indian traders who are already using TradioHub to
            improve their performance and build consistent profits in the stock
            market.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-emerald-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-emerald-700 hover:-translate-y-1 hover:shadow-xl transition-all"
            >
              Start Free 7-Day Trial
            </a>
            <button
              onClick={() => {
                trackEvent("clicked_watch_demo", {
                  location: "final_cta_section",
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
export default FinalCTA;
