"use client";
import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from "next/navigation";
import { Upload, Link, TrendingUp, Shield, BarChart3, Settings, CheckCircle, Zap, ArrowRight, ArrowLeft, User, Bell } from 'lucide-react';
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Import the working components
import BrokerModal from '@/components/onboarding/configBroker';

import { brokers, BROKER } from '@/lib/brokers/brokers';
import { generateZerodhaSession } from '@/lib/brokers/zerodhaKite';
import { generateFyersSession } from '@/lib/brokers/fyers';
import { getUpstoxSession } from '@/lib/brokers/upstox';
import { generateAngleOneSession } from '@/lib/brokers/angleOne';
import { removeCookie, setConnectedBroker } from '@/lib/utils';
import { trackEvent } from '@/lib/mixpanelClient';
import useGlobalState from "@/hooks/globalState";
import { listenToUserCredentials } from '@/lib/firebase/database/usersBrokerCredentials';



export default function BrokerConnectionPage() {
    const searchParams = useSearchParams();

    // Get all possible auth codes from URL params like Connect.js
    const zerodhaCode = searchParams.get('request_token');
    const fyersCode = searchParams.get('auth_code');
    const upstoxCode = searchParams.get('code');
    const angleOneCode = {
        auth_token: searchParams.get('auth_token'),
        refresh_token: searchParams.get('refresh_token')
    };

    // Use global state like Brokers.jsx
    const {
        credentials,
        setCredentials,
        requestTokens,
        setRequestTokens,
        selectedBroker,
        setSelectedBroker
    } = useGlobalState();

    const [showBrokerModal, setShowBrokerModal] = useState(false);
    const [configBroker, setConfigBroker] = useState(null);
    const [isBrokerConnected, setIsBrokerConnected] = useState(requestTokens);
    useEffect(() => {
        trackEvent("viewed_broker_connection_page");
    }, []);

    const router = useRouter();
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


    // Auto-set selectedBroker based on auth code received (like Connect.js)
    useEffect(() => {
        console.log("useEffect triggered - zerodhaCode:", zerodhaCode, "fyersCode:", fyersCode, "upstoxCode:", upstoxCode, "selectedBroker:", selectedBroker, "hasConnected:", hasConnected.current);

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

        if (angleOneCode.auth_token && !selectedBroker) {
            console.log("Auto-setting selectedBroker to ANGLEONE");
            setSelectedBroker(BROKER.ANGLEONE);
            return; // Let the next useEffect run handle the connection
        }

        // Early return if no auth codes or already connected
        if ((!zerodhaCode && !fyersCode && !upstoxCode && !angleOneCode.auth_token) || !selectedBroker || !credentials?.length || hasConnected.current) {
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
                    toast.error(`No credentials found for broker: ${broker}`);
                    return;
                }

                if (broker === BROKER.ZERODHA) {
                    const token = zerodhaCode;
                    const response = await generateZerodhaSession(brokerCredential.api_key, brokerCredential.api_secret, token);
                    if (response.status !== "success") {
                        // ADD THIS LINE 👇
                        trackEvent("broker_connection_failed", { broker_name: "zerodha", error: response.error });
                        toast.error(response.error || "Failed to generate session");
                        return;
                    }
                    setConnectedBroker(broker, response.accessToken);
                    const connectedObj = { token: response.accessToken, broker };
                    setRequestTokens(connectedObj);
                    setIsBrokerConnected(connectedObj);
                    // ADD THIS LINE 👇
                    trackEvent("broker_connected_successfully", { broker_name: "zerodha" });
                }

                if (broker === BROKER.FYERS) {
                    const token = fyersCode;
                    console.log("Fyers - Token:", token);
                    console.log("Fyers - Broker Credential:", brokerCredential);

                    const response = await generateFyersSession(brokerCredential.app_id, brokerCredential.secret_key, token);
                    console.log("Fyers - API Response:", response);

                    if (response.status !== "success") {
                        // ADD THIS LINE 👇
                        trackEvent("broker_connection_failed", { broker_name: "fyers", error: response.error });
                        console.error("Fyers - Connection failed:", response);
                        toast.error(response.error || "Failed to generate session");
                        return;
                    }
                    setConnectedBroker(broker, response.accessToken);
                    const connectedObj = { token: response.accessToken, broker };
                    setRequestTokens(connectedObj);
                    setIsBrokerConnected(connectedObj);
                    trackEvent("broker_connected_successfully", { broker_name: "fyers" });
                }

                if (broker === BROKER.UPSTOX) {
                    const token = upstoxCode;
                    const redirectURL = process.env.NODE_ENV === "development"
                        ? "http://localhost:3000/dashboard/connect"
                        : "https://www.tradiohub.com/dashboard/connect";
                    const response = await getUpstoxSession(brokerCredential.api_key, token, brokerCredential.api_secret, redirectURL);

                    if (response.status !== "success") {
                        trackEvent("broker_connection_failed", { broker_name: "upstox", error: response.error });
                        console.error("Upstox - Connection failed:", response);
                        toast.error(response.error || "Failed to generate session");
                        return;
                    }
                    setConnectedBroker(broker, response.accessToken);
                    const connectedObj = { token: response.accessToken, broker };
                    setRequestTokens(connectedObj);
                    setIsBrokerConnected(connectedObj);
                    trackEvent("broker_connected_successfully", { broker_name: "upstox" });
                }

                if (broker === BROKER.ANGLEONE) {
                    const token = angleOneCode;
                    const response = await generateAngleOneSession(token.auth_token, token.refresh_token, brokerCredential.api_key);

                    if (response.status !== true) {
                        trackEvent("broker_connection_failed", { broker_name: "angleone", error: response.error });
                        console.error("Angle One - Connection failed:", response);
                        toast.error(response.error || "Failed to generate session");
                        return;
                    }
                    setConnectedBroker(broker, response.jwtToken);
                    const connectedObj = { token: response.jwtToken, broker };
                    setRequestTokens(connectedObj);
                    setIsBrokerConnected(connectedObj);
                    trackEvent("broker_connected_successfully", { broker_name: "angleone" });
                }

                toast.success("Connected successfully");
            } catch (error) {
                console.error("API Error:", error);
                toast.error(error?.message || "Something went wrong");
                setSelectedBroker(null);
                setRequestTokens(null);
            }
        };

        connect();
    }, [zerodhaCode, fyersCode, upstoxCode, angleOneCode.auth_token, selectedBroker, credentials, setRequestTokens, setSelectedBroker]);

    // Update connection status when requestTokens change
    useEffect(() => {
        setIsBrokerConnected(requestTokens);
    }, [requestTokens]);

    // Handle opening broker configuration modal
    const handleOpenConfig = (broker) => {

        // ADD THIS LINE HERE 👇
        trackEvent("clicked_broker", {
            broker_name: broker.name.toLowerCase()
        });
        const brokerCredential = credentials[0]?.credential?.find(
            (c) => c.broker === broker.name.toLowerCase()
        );
        setConfigBroker({ broker, credential: brokerCredential });
        setShowBrokerModal(true);
    };

    const handleProceed = () => {
        router.push("/dashboard");
    };

    const isDataConnected = isBrokerConnected?.broker || false;

    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 flex flex-col min-h-screen">
            {/* Main Content */}
            <div className="flex flex-col lg:flex-row flex-1 h-full overflow-hidden">
                {/* Left Main Content */}
                <div className="flex-1 p-4 lg:p-6 relative flex flex-col overflow-y-auto h-full">
                    {/* Back Button - Top Left */}
                    <div className="flex justify-between items-center">

                        <button
                            onClick={() => router.push("/dashboard/preonboarding")}
                            className="w-fit group flex items-center px-3 py-2 lg:px-4 lg:py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 shadow-sm hover:shadow-md mb-4 lg:mb-6"
                        >
                            <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                            <span className="font-medium text-sm lg:text-base">Back</span>
                        </button>

                        <button
                            onClick={() => {
                                trackEvent("clicked_skip_broker_connection");
                                router.push("/dashboard/csvupload")
                            }}
                            className="w-fit group flex items-center px-3 py-2 lg:px-4 lg:py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 shadow-sm hover:shadow-md mb-4 lg:mb-6"
                        >
                            <span className="font-medium text-sm lg:text-base">Skip</span>
                            <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2 group-hover:-translate-x-1 transition-transform duration-200" />
                        </button>


                    </div>


                    {/* Centered Content */}
                    <div className="flex-1 flex flex-col justify-center items-center mt-2 lg:mt-4 min-h-[200px] p-4  lg:min-h-96">
                        {/* Brokers Selection Card */}
                        <div className="bg-white dark:bg-neutral-800 relative rounded-xl shadow-lg border-2 border-blue-500 dark:border-blue-400 shadow-blue-100 dark:shadow-blue-900/20 transition-all w-full max-w-lg lg:w-[600px] lg:max-w-none min-h-[450px] lg:h-[550px]">
                            <div className="p-4 lg:p-6 h-full flex flex-col">
                                <div className="flex items-center mb-4 lg:mb-6">
                                    <div className="w-10 h-10 lg:w-12 lg:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mr-3 lg:mr-4">
                                        <Link className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg lg:text-xl font-bold text-neutral-900 dark:text-neutral-100">Connect Broker</h3>
                                        <p className="text-sm lg:text-base text-neutral-600 dark:text-neutral-400">Real-time data synchronization</p>
                                    </div>
                                </div>

                                {/* Brokers Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 lg:gap-2 mb-4 flex-1 h-full max-h-96  overflow-y-auto">
                                    {brokers.map((broker) => {
                                        const isConnected = isBrokerConnected?.broker === broker.name.toLowerCase();

                                        return (
                                            <button
                                                key={broker.id || broker.name}
                                                onClick={() => handleOpenConfig(broker)}
                                                className={`flex items-center justify-between p-3 lg:p-2.5 rounded-lg border-2 transition-all text-left min-h-[48px] ${isConnected
                                                    ? "border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20"
                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                    }`}
                                            >
                                                <div className="flex items-center min-w-0">
                                                    <span className="font-medium text-neutral-900 dark:text-neutral-100 text-sm lg:text-xs truncate">{broker.name}</span>
                                                </div>
                                                {isConnected && <CheckCircle className="w-4 h-4 lg:w-3.5 lg:h-3.5 text-green-600 dark:text-green-400 flex-shrink-0 ml-2 lg:ml-1" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Benefits Section */}
                                <div className="mt-auto">
                                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                        <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2 text-sm lg:text-base">Benefits:</h4>
                                        <ul className="text-xs lg:text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                            <li>• Automatic trade synchronization</li>
                                            <li>• Real-time portfolio updates</li>
                                            <li>• Live P&L tracking</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Button */}
                        {isDataConnected && (
                            <div className="text-center mt-6 w-full">
                                <button
                                    onClick={handleProceed}
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 lg:px-8 py-3 rounded-xl text-base lg:text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg w-full lg:w-auto"
                                >
                                    Launch Dashboard
                                </button>
                                <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                                    Connected to {isBrokerConnected.broker}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Hidden on mobile, visible on lg+ screens */}
                <div className="hidden lg:block w-80 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 p-6 overflow-y-auto h-full flex-shrink-0">
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center mr-2">
                                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Getting Started</h3>
                            <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">Broker Setup</span>
                        </div>

                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Connection Progress</span>
                                    <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                                        {isDataConnected ? '100%' : '0%'}
                                    </span>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: isDataConnected ? '100%' : '0%' }}
                                    ></div>
                                </div>

                                {/* Steps */}
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm">
                                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${isDataConnected
                                            ? 'bg-green-500 text-white'
                                            : 'bg-blue-500 text-white'
                                            }`}>
                                            {isDataConnected ? (
                                                <CheckCircle className="w-3 h-3" />
                                            ) : (
                                                <span className="text-xs font-bold">1</span>
                                            )}
                                        </div>
                                        <span className={`${isDataConnected
                                            ? 'text-green-700 dark:text-green-400 font-medium'
                                            : 'text-blue-600 dark:text-blue-400 font-medium'
                                            }`}>
                                            Connect Broker
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                                    {isDataConnected ?
                                        'Excellent! Your broker is connected. Ready to access real-time trading data and analytics.' :
                                        'Select your broker and provide API credentials to establish a secure connection.'
                                    }
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">Connection Tips</span>
                                    <span className="ml-auto text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full">Tips</span>
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                    <div>• Get API credentials from your broker's platform</div>
                                    <div>• Ensure API has read permissions for trades</div>
                                    <div>• Keep your credentials secure and private</div>
                                    <div>• Test connection before proceeding</div>
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Security</span>
                                    <span className="ml-auto text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full">Secure</span>
                                </div>
                                <div className="text-sm text-orange-800 dark:text-orange-400">
                                    Your API credentials are encrypted and stored securely. We use read-only access and never execute trades on your behalf.
                                </div>
                            </div>

                            {/* Benefits */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-green-900 dark:text-green-300">Benefits</span>
                                    <span className="ml-auto text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200 px-2 py-1 rounded-full">Pro</span>
                                </div>
                                <div className="text-sm text-green-800 dark:text-green-400 space-y-1">
                                    <div>• Automatic trade synchronization</div>
                                    <div>• Real-time portfolio updates</div>
                                    <div>• Live P&L tracking</div>
                                    <div>• Instant alerts and notifications</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                        <div className="text-center">
                            <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">Trusted by 10,000+ traders</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400">
                                <Shield className="w-3 h-3" />
                                <span>Bank-level security</span>
                                <span>•</span>
                                <span>24/7 support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Info Panel - Only visible on mobile */}
            <div className="lg:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
                <div className="max-w-sm mx-auto">
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Connection Progress</span>
                        <span className="text-xs bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                            {isDataConnected ? '100%' : '0%'}
                        </span>
                    </div>

                    <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: isDataConnected ? '100%' : '0%' }}
                        ></div>
                    </div>

                    {/* Status */}
                    <div className="text-center">
                        <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                            <Shield className="w-3 h-3" />
                            <span>Secure Connection</span>
                            <span>•</span>
                            <span>10,000+ Users</span>
                        </div>
                        <p className="text-xs text-neutral-600 dark:text-neutral-400">
                            {isDataConnected
                                ? '✅ Broker connected successfully'
                                : 'Select and configure your broker to continue'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Broker Modal */}
            <BrokerModal
                showBrokerModal={showBrokerModal}
                setShowBrokerModal={setShowBrokerModal}
                selectedBroker={configBroker?.broker}
                brokerCredential={configBroker?.credential}
            />
        </div>
    );
}