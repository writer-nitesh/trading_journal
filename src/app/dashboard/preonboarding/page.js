'use client';

import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import { Building2, Upload, Route } from 'lucide-react';
import { useEffect } from "react"
import { trackEvent } from "@/lib/mixpanelClient";
import useGlobalState from '@/hooks/globalState';
import Link from 'node_modules/next/link';

const styles = `
  body {
    margin: 0 !important;
    padding: 0 !important;
    background-color: #f8fdf9 !important;
  }
`;

export default function TradioOnboarding() {
  const [selectedMethod, setSelectedMethod] = useState(null);
  // ADD THIS useEffect
  useEffect(() => {
    trackEvent("viewed_preonboarding");
  }, []);

  const selectBrokerAPI = () => {
    // ADD THIS TRACKING
    trackEvent("clicked_on_broker_API");
    setSelectedMethod('api');
    router.push("/dashboard/brokerconnection");
  };
  const router = useRouter();

  // Update the selectCSVUpload function to:
  const selectCSVUpload = () => {

    // ADD THIS TRACKING  
    trackEvent("clicked_on_Upload_CSV");
    setSelectedMethod('csv');
    router.push("/dashboard/csvupload");
  };

  const showBrokerList = () => {
    alert('Supported Brokers:\n\n• Zerodha\n• Upstox\n• Angel One\n• ICICI Direct\n• HDFC Securities\n• Kotak Securities\n• And more...');
  };

  const showCSVGuide = () => {
    alert('CSV Format Guide:\n\n• Date, Symbol, Quantity, Price, Type\n• Supports multiple file formats\n• Historical trade data\n• Portfolio statements');
  };

  return (

    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-6 sm:py-10 bg-[#f9fafb] dark:bg-neutral-900">
      <div className='h-full flex flex-col lg:gap-10 gap-4'>
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 max-w-4xl">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 px-4 text-[#484748ff] dark:text-neutral-100">
            Connect Your Trading Data
          </h1>
          <p className="text-base sm:text-lg text-slate-500 dark:text-neutral-400 px-4">
            Choose how you'd like to connect your trading data for powerful analytics
          </p>
        </div>

        {/* Connection Options */}
        <div className="flex flex-col lg:flex-row justify-center items-center gap-6 lg:gap-8 mb-8 sm:mb-12 w-full max-w-6xl">
          {/* Broker API Card */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:w-80 bg-white dark:bg-neutral-800 rounded-2xl border-2 p-4 sm:p-6 text-center shadow-md dark:shadow-neutral-700/30 cursor-pointer transition hover:scale-105 ${selectedMethod === 'api' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 dark:border-emerald-400' : 'border-slate-200 dark:border-neutral-600'
              }`}
            onClick={selectBrokerAPI}
          >
            <div className="bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center rounded-lg p-3 w-fit mx-auto">
              <Route
                className="h-6 w-6 text-orange-600 dark:text-orange-400"
                strokeWidth={2.5}
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-2">Broker API</h3>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mb-4 px-2">
              Connect directly to your broker for real-time sync and automated analytics.
            </p>
            <div
              className="text-sm text-slate-400 dark:text-neutral-500 underline cursor-pointer hover:text-slate-600 dark:hover:text-neutral-300"
              onClick={(e) => {
                e.stopPropagation();
                showBrokerList();
              }}
            >
            </div>
          </div>

          {/* CSV Upload Card */}
          <div
            className={`w-full max-w-sm sm:max-w-md lg:w-80 bg-white dark:bg-neutral-800 rounded-2xl border-2 p-4 sm:p-6 text-center shadow-md dark:shadow-neutral-700/30 cursor-pointer transition hover:scale-105 ${selectedMethod === 'csv' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400' : 'border-slate-200 dark:border-neutral-600'
              }`}
            onClick={selectCSVUpload}
          >
            <div className="bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center rounded-lg p-3 w-fit mx-auto">
              <Upload
                className="h-6 w-6 text-blue-600 dark:text-blue-400"
                strokeWidth={2.5}
              />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-neutral-200 mb-2">Upload CSV</h3>
            <p className="text-slate-500 dark:text-neutral-400 text-sm mb-4 px-2">
              Upload CSV files from your broker for quick analysis and historical data review.
            </p>
            <div
              className="text-sm text-slate-400 dark:text-neutral-500 underline cursor-pointer hover:text-slate-600 dark:hover:text-neutral-300"
              onClick={(e) => {
                e.stopPropagation();
                showCSVGuide();
              }}
            >
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div>
          <div className="text-center max-w-4xl px-4">
            <h2 className="text-slate-600 dark:text-neutral-300 font-semibold mb-4">🔒 Secure & Compliant</h2>
            <div className="flex flex-wrap justify-center gap-4 text-slate-500 dark:text-neutral-400 text-xs sm:text-sm">
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span>🛡️</span>
                <span className="hidden sm:inline">AES-256 Encryption</span>
                <span className="sm:hidden">AES-256</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span>🔐</span>
                <span className="hidden sm:inline">OAuth 2.0 Auth</span>
                <span className="sm:hidden">OAuth 2.0</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span>🏦</span>
                <span className="hidden sm:inline">SOC 2 Compliant</span>
                <span className="sm:hidden">SOC 2</span>
              </div>
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <span>👁️</span>
                <span className="hidden sm:inline">Regular Audits</span>
                <span className="sm:hidden">Audits</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="text-center text-slate-400 dark:text-neutral-500 text-xs sm:text-sm p-4">
            <Link href="https://orufybookings.com/tradio/feedback-session">
              Need help? Contact our support team
            </Link>
          </div>
        </div>
      </div>
    </div>

  );
}