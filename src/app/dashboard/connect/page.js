"use client"

import { Search, Zap } from 'lucide-react';
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { generateZerodhaSession } from "@/lib/brokers/zerodhaKite";
import { setConnectedBroker } from "@/lib/utils";
import { toast } from "sonner";
import useGlobalState from "@/hooks/globalState";
import ConfigureButton from "@/components/configBrokerButton";
import { BROKER, brokers } from "@/lib/brokers/brokers";
import { generateFyersSession } from "@/lib/brokers/fyers";
import { getUpstoxSession } from "@/lib/brokers/upstox";
import { generateAngleOneSession } from "@/lib/brokers/angleOne";
import { listenToUserCredentials } from '@/lib/firebase/database/usersBrokerCredentials';

const FloatingElements = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-1/4 left-1/10 w-20 h-20 bg-emerald-100/30 dark:bg-emerald-900/30 rounded-full animate-bounce duration-6000"></div>
    <div className="absolute top-3/5 right-1/6 w-16 h-16 bg-emerald-100/30 dark:bg-emerald-900/30 rounded-full animate-bounce duration-6000 delay-2000"></div>
    <div className="absolute bottom-1/4 left-1/5 w-24 h-24 bg-emerald-100/30 dark:bg-emerald-900/30 rounded-full animate-bounce duration-6000 delay-4000"></div>
  </div>
);

const ConnectedStatus = () => (
  <div className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 rounded-full text-blue-700 dark:text-blue-300 font-semibold text-sm min-w-28 relative overflow-hidden backdrop-blur-sm">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-white/10 to-transparent -translate-x-full animate-pulse duration-2000"></div>
    <div className="relative">
      <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full animate-pulse shadow-sm shadow-blue-400 dark:shadow-blue-500"></div>
      <div className="absolute inset-0 w-2 h-2 bg-blue-400 dark:bg-blue-300 rounded-full animate-ping opacity-75"></div>
    </div>
    <span className="relative">Connected</span>
  </div>
);

const Connect = () => {
  const searchParams = useSearchParams()

  const zerodhaCode = searchParams.get('request_token');
  const fyersCode = searchParams.get('auth_code');
  const upstoxCode = searchParams.get('code');
  const angleOneCode = {
    auth_token: searchParams.get('auth_token'),
    refresh_token: searchParams.get('refresh_token')
  }
  const { credentials, setCredentials, requestTokens, setRequestTokens, selectedBroker, setSelectedBroker } = useGlobalState();


  const [isBrokerConnected, setIsBrokerConnected] = useState(requestTokens);
  const [filteredBroker, setFilteredBroker] = useState(brokers);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (search) {
      const filteredBrokers = brokers.filter(broker =>
        broker.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredBroker(filteredBrokers)
    }
    else {
      setFilteredBroker(brokers)
    }
  }, [search])

  useEffect(() => {
    let unsubscribe;

    const startListening = async () => {
      try {
        unsubscribe = await listenToUserCredentials((res) => {
          setCredentials(res);
        });
      } catch (error) {
        toast.error(error.message);
      }
    };

    startListening();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


  const hasConnected = useRef(false);

  useEffect(() => {
    console.log("useEffect triggered - zerodhaCode:", zerodhaCode, "fyersCode:", fyersCode, "upstoxCode", upstoxCode, "selectedBroker:", selectedBroker, "hasConnected:", hasConnected.current);

    // Auto-set selectedBroker based on auth code received
    if (fyersCode && !selectedBroker) {
      console.log("Auto-setting selectedBroker to Fyers");
      setSelectedBroker(BROKER.FYERS);
      return; // Let the next useEffect run handle the connection
    }

    if (zerodhaCode && !selectedBroker) {
      console.log("Auto-setting selectedBroker to Zerodha");
      setSelectedBroker(BROKER.ZERODHA);
      return; // Let the next useEffect run handle the connection
    }

    if (upstoxCode && !selectedBroker) {
      console.log("Auto-setting selectedBroker to UPSTOX");
      setSelectedBroker(BROKER.UPSTOX);
      return; // Let the next useEffect run handle the connection
    }

    if (angleOneCode.auth_token && angleOneCode.refresh_token && !selectedBroker) {
      console.log("Auto-setting selectedBroker to ANGLEONE");
      setSelectedBroker(BROKER.ANGLEONE);
      return; // Let the next useEffect run handle the connection
    }

    // Early return if no auth codes or already connected
    if ((!zerodhaCode && !fyersCode && !upstoxCode && !angleOneCode) || !selectedBroker || !credentials?.length || hasConnected.current) {
      console.log("Exiting useEffect - conditions not met");
      return;
    }

    // Prevent multiple connections for the same auth code
    console.log("Setting hasConnected to true");
    hasConnected.current = true;

    const connect = async () => {
      const broker = selectedBroker.toLowerCase();


      const findCredential = (broker) => {
        // Adjusted to match credentials shape
        const credsList = Array.isArray(credentials[0]?.credential) ? credentials[0]?.credential : credentials;
        return credsList?.find((cred) => cred.broker.toLowerCase() === broker.toLowerCase());
      };

      try {
        const brokerCredential = findCredential(broker);

        if (!brokerCredential) {
          toast.error(`No credentials found for broker: ${broker} `);
          return;
        }

        if (broker === BROKER.ZERODHA) {
          const token = zerodhaCode;
          const response = await generateZerodhaSession(brokerCredential.api_key, brokerCredential.api_secret, token);
          
          if (response.status !== "success") {
            toast.error(response.error || "Failed to generate session");
            return;
          }
          setConnectedBroker(broker, response.accessToken);
          const connectedObj = { token: response.accessToken, broker };
          setRequestTokens(connectedObj);
          setIsBrokerConnected(connectedObj); // use fresh value here
        }

        if (broker === BROKER.FYERS) {
          const token = fyersCode;
          console.log("Fyers - Token:", token);
          console.log("Fyers - Broker Credential:", brokerCredential);
          console.log("Fyers - App ID:", brokerCredential.app_id);
          console.log("Fyers - Secret Key:", brokerCredential.secret_key);

          const response = await generateFyersSession(brokerCredential.app_id, brokerCredential.secret_key, token);
          console.log("Fyers - API Response:", response);

          if (response.status !== "success") {
            console.error("Fyers - Connection failed:", response);
            toast.error(response.error || "Failed to generate session");
            return;
          }
          setConnectedBroker(broker, response.accessToken);
          const connectedObj = { token: response.accessToken, broker };
          setRequestTokens(connectedObj);
          setIsBrokerConnected(connectedObj);
        }


        if (broker === BROKER.UPSTOX) {

          const token = upstoxCode;
          const redirectURL = process.env.NODE_ENV === "development" ? "http://localhost:3000/dashboard/connect" : "https://www.tradiohub.com/dashboard/connect";
          const response = await getUpstoxSession(brokerCredential.api_key, token, brokerCredential.api_secret, redirectURL)

          if (response.status !== "success") {
            console.error("Fyers - Connection failed:", response);
            toast.error(response.error || "Failed to generate session");
            return;
          }
          setConnectedBroker(broker, response.accessToken);
          const connectedObj = { token: response.accessToken, broker };
          setRequestTokens(connectedObj);
          setIsBrokerConnected(connectedObj);
        }

        if (broker === BROKER.ANGLEONE) {

          const token = angleOneCode;

          const response = await generateAngleOneSession(token.auth_token, token.refresh_token, brokerCredential.api_key)

          if (response.status !== true) {
            console.error("Angle One - Connection failed:", response);
            toast.error(response.error || "Failed to generate session");
            return;
          }
          setConnectedBroker(broker, response.jwtToken);
          const connectedObj = { token: response.jwtToken, broker };
          setRequestTokens(connectedObj);
          setIsBrokerConnected(connectedObj);
        }



        toast.success("Connected successfully");
      } catch (error) {
        console.error("API Error: PAGE 3", error);
        toast.error(error?.message || "Something went wrong");
      }
      finally {
        setSelectedBroker(null);
      }
    };

    connect();
  }, [zerodhaCode, fyersCode, selectedBroker, credentials]);

  useEffect(() => {
    setIsBrokerConnected(requestTokens);
  }, [requestTokens]);



  return (
    <div className="min-h-screen relative bg-neutral-50 dark:bg-neutral-900" >
      <FloatingElements />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-5 py-8 sm:py-10">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-15">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: 'linear-gradient(45deg, #059669, #10b981, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
            Connect Your Broker
          </h1>
          <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto leading-relaxed px-2 sm:px-0 text-neutral-800 dark:text-neutral-300"
            style={{ color: '#6b7280' }}>
            Choose a broker to connect with your account for seamless trading and portfolio management. Advanced features and real-time data synchronization included.
          </p>
        </div>

        {/* Search Bar */}
        <div className="flex justify-center mb-8 sm:mb-10 px-2 sm:px-0">
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-4 sm:left-5 top-1/2 transform -translate-y-1/2 text-neutral-400 dark:text-neutral-500 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Search brokers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-4 sm:pr-6 py-3 sm:py-4 text-sm sm:text-base bg-white dark:bg-neutral-800 border-2 border-neutral-200 dark:border-neutral-600 rounded-full shadow-lg focus:border-emerald-500 dark:focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 dark:focus:ring-emerald-900 focus:outline-none transition-all duration-300 text-neutral-900 dark:text-neutral-100"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredBroker.length === 0 && search ? (
            <div className="col-span-full text-center py-16 text-neutral-600 dark:text-neutral-400" style={{ color: '#6b7280' }}>
              <svg style={{ width: '64px', height: '64px', margin: '0 auto 20px', opacity: '0.5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
              </svg>
              <h3 className="text-2xl font-semibold mb-2 text-neutral-800 dark:text-neutral-200" style={{ color: '#374151' }}>No brokers found</h3>
              <p>Try searching with a different term</p>
            </div>
          ) : (
            filteredBroker.map((broker) => (
              <div
                key={broker.name}
                className="bg-white dark:bg-neutral-800 rounded-3xl p-6 border border-neutral-200 dark:border-neutral-700 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 flex flex-col justify-between min-h-48 group relative overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                {/* Broker Header */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-48 h-16 flex items-start  justify-start">
                    <img
                      src={broker.logo}
                      alt={broker.name}
                      className={`max-w-full max-h-full object-contain`}

                    />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-neutral-900 dark:text-neutral-100">{broker.name}</div>
                    <div className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{broker.description}</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 mt-auto">
                  {isBrokerConnected && isBrokerConnected.broker === broker.name.toLowerCase() ? (
                    <>
                      <ConnectedStatus />
                      <ConfigureButton
                        broker={broker}
                        credential={
                          credentials[0]?.credential?.find(c => c.broker === broker.name.toLowerCase())
                        }
                      />
                    </>
                  ) : (
                    <>
                      {
                        <ConfigureButton
                          broker={broker}
                          credential={
                            credentials[0]?.credential?.find(c => c.broker === broker.name.toLowerCase())
                          }
                        />
                      }
                    </>
                  )}
                </div>
              </div>
            )))
          }
        </div>


      </div>
    </div>
  )
}

export default Connect