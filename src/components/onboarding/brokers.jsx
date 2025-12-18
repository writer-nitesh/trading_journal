"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, Link } from "lucide-react";

import useGlobalState from "@/hooks/globalState";
import { brokers } from "@/lib/brokers/brokers";
import { generateZerodhaSession } from "@/lib/brokers/zerodhaKite";
import BrokerModal from "./configBroker";
import { listenToUserCredentials } from "@/lib/firebase/database/usersBrokerCredentials";

const Brokers = ({
  selectedOption,
  showBrokerModal,
  setShowBrokerModal,
  currentBroker,
}) => {
  const searchParams = useSearchParams();
  const requestToken = searchParams.get("request_token");

  const {
    credentials,
    setCredentials,
    requestTokens,
    setRequestTokens,
    selectedBroker,
    setSelectedBroker,
  } = useGlobalState();

  const [isBrokerConnected, setIsBrokerConnected] = useState(requestTokens);
  const [openConfig, setOpenConfig] = useState(false);
  const [configBroker, setConfigBroker] = useState(null);

  const hasConnected = useRef(false);

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

  useEffect(() => {
    if (
      !requestToken ||
      !selectedBroker ||
      !credentials?.length ||
      hasConnected.current
    )
      return;

    hasConnected.current = true;
    const broker = selectedBroker.toLowerCase();

    const findCredential = (broker) => {
      const credsList = Array.isArray(credentials[0]?.credential)
        ? credentials[0]?.credential
        : credentials;
      return credsList?.find(
        (cred) => cred.broker.toLowerCase() === broker.toLowerCase()
      );
    };

    (async () => {
      try {
        const brokerCredential = findCredential(broker);
        if (!brokerCredential) {
          toast.error(`No credentials found for broker: ${broker}`);
          return;
        }

        if (broker === "zerodha") {
          const response = await generateZerodhaSession(
            brokerCredential.api_key,
            brokerCredential.api_secret,
            requestToken
          );
          if (response.status !== "success") {
            toast.error(response.error || "Failed to generate session");
            return;
          }
          setConnectedBroker(broker, response.accessToken);
          const connectedObj = { token: response.accessToken, broker };
          setRequestTokens(connectedObj);
          setIsBrokerConnected(connectedObj);
        }

        toast.success("Connected successfully");
      } catch (error) {
        console.error("API Error:", error);
        toast.error(error?.message || "Something went wrong");
        setSelectedBroker(null);
        setRequestTokens(null);
      }
    })();
  }, [requestToken, selectedBroker, credentials]);

  useEffect(() => {
    setIsBrokerConnected(requestTokens);
  }, [requestTokens]);

  const handleOpenConfig = (broker) => {
    const brokerCredential = credentials[0]?.credential?.find(
      (c) => c.broker === broker.name.toLowerCase()
    );
    setConfigBroker({ broker, credential: brokerCredential });
    setOpenConfig(true);
  };

  return (
    <div
      className={`bg-white dark:bg-neutral-900 relative rounded-xl h-[550px] shadow-lg border-2 transition-all ${
        selectedOption === "broker"
          ? "border-blue-500 shadow-blue-100 dark:shadow-blue-900"
          : "border-neutral-200 dark:border-neutral-700"
      }`}
    >
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-4">
            <Link className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
              Connect Broker
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Real-time data synchronization
            </p>
          </div>
        </div>

        {/* Brokers Grid */}
        <div className="grid grid-cols-2 gap-2 my-4 py-4 max-h-64 overflow-y-auto">
          {brokers.map((broker) => {
            const isConnected =
              isBrokerConnected?.broker === broker.name.toLowerCase();

            return (
              <button
                key={broker.id || broker.name}
                onClick={() => handleOpenConfig(broker)}
                className={`flex items-center justify-between p-2.5 rounded-lg border-2 transition-all text-left ${
                  isConnected
                    ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900"
                    : "border-neutral-200 hover:border-blue-300 hover:bg-blue-50 dark:border-neutral-700 dark:hover:border-blue-700 dark:hover:bg-blue-900"
                }`}
              >
                <div className="flex items-center min-w-0">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100 text-xs truncate">
                    {broker.name}
                  </span>
                </div>
                {isConnected && (
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-0 left-0 p-6 w-full">
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
              Benefits:
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
              <li>• Automatic trade synchronization</li>
              <li>• Real-time portfolio updates</li>
              <li>• Live P&amp;L tracking</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Config Popup */}
      <BrokerModal
        showBrokerModal={openConfig}
        setShowBrokerModal={setOpenConfig}
        selectedBroker={configBroker?.broker}
        brokerCredential={configBroker?.credential}
      />
    </div>
  );
};

export default Brokers;
