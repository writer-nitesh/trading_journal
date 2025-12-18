"use client";
import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Shield } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
    saveCredentials,
} from "@/lib/firebase/database/index";
import { removeCookie } from "@/lib/utils";
import { trackEvent } from "@/lib/mixpanelClient";
import { BROKER } from "@/lib/brokers/brokers";
import useGlobalState from "@/hooks/globalState";

export default function BrokerModal({ showBrokerModal, setShowBrokerModal, selectedBroker, brokerCredential }) {
    // Add safety check for selectedBroker
    if (!selectedBroker && showBrokerModal) {
        console.error("BrokerModal: selectedBroker is undefined");
        return null;
    }
    const {
        credentials,
        setSelectedBroker,
        requestTokens,
        setRequestTokens,
    } = useGlobalState();

    const router = useRouter();
    const [isCredsMissing, setIsCredsMissing] = useState(true);
    const { register, handleSubmit, reset, watch } = useForm();

    // Use the passed brokerCredential or find from credentials
    const creds = brokerCredential || credentials?.find(
        (cred) => cred.broker === selectedBroker?.name?.toLowerCase()
    );

    const isConnected =
        requestTokens &&
        requestTokens.broker === selectedBroker?.name?.toLowerCase();

    const watchedFields = watch();

    // Prefill form when modal opens
    useEffect(() => {
        if (showBrokerModal && creds) {
            reset(creds);
            setIsCredsMissing(false);
        } else {
            setIsCredsMissing(true);
        }
    }, [showBrokerModal, creds, reset]);

    // Watch for form changes to enable/disable connect button
    useEffect(() => {
        const hasAllRequired = selectedBroker?.requiredFields?.every(
            (field) => watchedFields[field.name]?.trim() !== ""
        );
        setIsCredsMissing(!hasAllRequired);
    }, [watchedFields, selectedBroker]);

    useEffect(() => {
        if (showBrokerModal && selectedBroker) {
            trackEvent("viewed_broker_config_modal", {
                broker_name: selectedBroker.name.toLowerCase()
            });
        }
    }, [showBrokerModal, selectedBroker]);

    const onSubmit = async (formData) => {
        const payload = {
            ...formData,
            broker: selectedBroker.name.toLowerCase(),
        };

        try {
            await saveCredentials(payload);
            toast.success("Credentials saved!");
        } catch (error) {
            toast.error(error.message || "Save failed");
        }
    };

    async function handleConnect(credentials) {
        if (requestTokens) {
            toast.info(`Disconnecting ${requestTokens.broker}...`);
        }

        try {
            if (credentials.broker === BROKER.ZERODHA) {
                const link = await selectedBroker.action(credentials.api_key);
                setSelectedBroker(selectedBroker.name);
                router.push(link);
                if (selectedBroker.name.toLowerCase() === "zerodha") {
                    trackEvent("broker_connected");
                }
            }
            if (credentials.broker === BROKER.DHAN) {
                await selectedBroker.action(credentials.broker, credentials.access_token);
                router.push("/dashboard/connect");
                setRequestTokens({
                    token: credentials.access_token,
                    broker: credentials.broker,
                });
                setShowBrokerModal(false);
                toast.success("Connected successfully");
            }

            if (credentials.broker === BROKER.FYERS) {
                const link = await selectedBroker.action(credentials.app_id);
                router.push(link);
            }

            if (credentials.broker === BROKER.UPSTOX) {
                const redirectURL = process.env.NODE_ENV === "development" ? "http://localhost:3000/dashboard/connect" : "https://www.tradiohub.com/dashboard/connect";
                const link = await selectedBroker.action(credentials.api_key, redirectURL);
                router.push(link);
            }

            if (credentials.broker === BROKER.ANGLEONE) {
                console.log("Connecting to Angle One...");
                const link = await selectedBroker.action(credentials.api_key);
                router.push(link);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message || "Connection failed");
            removeCookie("connectedBroker");
            setSelectedBroker(null);
            setRequestTokens(null);
        }
    }

    function handleDisconnect() {
        removeCookie("connectedBroker");
        setRequestTokens(null);
        setSelectedBroker(null);
        toast.success(`${requestTokens.broker} disconnected successfully`);
        setShowBrokerModal(false);
    }

    if (!showBrokerModal || !selectedBroker) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-md bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-lg mx-auto max-h-[95vh] flex flex-col">

                {/* Modal Header - Fixed */}
                <div className="p-3 sm:p-4 border-b border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center min-w-0 flex-1">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100 truncate">
                                    Connect {selectedBroker.name}
                                </h2>
                                <p className="text-neutral-600 dark:text-neutral-400 text-xs sm:text-sm">
                                    Enter your API credentials to connect
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                trackEvent("closed_broker_config_modal", {
                                    broker_name: selectedBroker.name.toLowerCase()
                                });
                                setShowBrokerModal(false);
                            }}
                            className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 text-xl font-bold ml-2 flex-shrink-0"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Modal Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    {/* Tutorial Section */}
                    <div className="mb-4">
                        <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-2 sm:p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700">
                            <div className="flex items-center justify-center h-32 sm:h-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg">
                                {selectedBroker.tutorialIframeUrl ? (
                                    <iframe
                                        className="w-full h-full rounded-lg"
                                        src={selectedBroker.tutorialIframeUrl}
                                        title={`${selectedBroker.name} tutorial`}
                                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                ) : (
                                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">No tutorial available</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* API Credentials Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <h3 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100">🔑 API Credentials</h3>
                            <Link
                                href={selectedBroker.getAPIURL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-500 text-xs sm:text-sm font-medium underline"
                                onClick={() => {
                                    trackEvent("clicked_get_api_keys", {
                                        broker_name: selectedBroker.name.toLowerCase()
                                    });
                                }}
                            >
                                Get API Keys →
                            </Link>
                        </div>

                        {selectedBroker.requiredFields?.map((field, index) => (
                            <div key={index}>
                                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    {field.label}
                                </label>
                                <input
                                    type={field.type}
                                    placeholder={field.placeholder}
                                    {...register(field.name, { required: field.required })}
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs sm:text-sm text-black dark:text-white dark:bg-neutral-800"
                                />
                            </div>
                        ))}

                        {selectedBroker.needRedirect && (
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Redirect URL</label>
                                <input
                                    type="url"
                                    value={
                                        process.env.NODE_ENV === "development"
                                            ? "http://localhost:3000/dashboard/connect"
                                            : "https://www.tradiohub.com/dashboard/connect"
                                    }
                                    readOnly
                                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-neutral-50 dark:bg-neutral-800 text-xs sm:text-sm text-black dark:text-white"
                                />
                                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                    Use this URL in your broker's app settings
                                </p>
                            </div>
                        )}

                        {/* Security Notice */}
                        <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-2 sm:p-3">
                            <div className="flex items-start">
                                <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400 mr-2 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="text-blue-900 dark:text-blue-200 font-medium mb-1 text-xs sm:text-sm">
                                        Secure Connection
                                    </h4>
                                    <p className="text-blue-800 dark:text-blue-300 text-xs">
                                        Your API credentials are encrypted and stored securely.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Action Buttons - Fixed at bottom */}
                <div className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-700 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <button
                            onClick={handleSubmit(onSubmit)}
                            className="flex-1 py-2 px-4 rounded-lg font-medium text-white bg-blue-600 hover:bg-blue-700 text-xs sm:text-sm order-2 sm:order-1"
                        >
                            Save Changes
                        </button>

                        {isConnected ? (
                            <button
                                type="button"
                                onClick={handleDisconnect}
                                className="flex-1 py-2 px-4 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 text-xs sm:text-sm order-1 sm:order-2"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                type="button"
                                disabled={isCredsMissing}
                                onClick={() => handleConnect(creds)}
                                className={`flex-1 py-2 px-4 rounded-lg font-medium text-white text-xs sm:text-sm order-1 sm:order-2 ${isCredsMissing
                                    ? "bg-neutral-300 dark:bg-neutral-700 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700"
                                    }`}
                            >
                                Connect
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
}