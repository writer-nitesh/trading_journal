"use client"

import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import useGlobalState from '@/hooks/globalState';
import { trackEvent } from '../lib/mixpanelClient';

/**
 * Broker Connect Popup Component
 * 
 * A modal dialog designed for financial trading applications that allows users 
 * to connect their trading accounts from various brokers to automatically import 
 * trade details, eliminating manual data entry.
 * 
 * Features:
 * - Modern curved design with rounded-3xl corners
 * - Responsive design that adapts to mobile screens
 * - Interactive broker logos with hover effects
 * - Security reassurance messaging
 * - Clean typography and proper spacing
 * - Smooth transitions and animations
 * 
 * Usage:
 * <BrokerConnectPopup 
 *   trigger={<Button>Connect Broker</Button>}
 *   onConnect={(broker) => console.log('Connect to:', broker)}
 * />
 */
const BrokerConnectPopup = ({
    trigger,
    onConnect,
    isOpen: controlledOpen,
    onOpenChange
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const router = useRouter();

    // Use controlled or internal state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;

    // Broker configuration with actual logo paths from your public directory
    const brokerLogos = [
        {
            name: 'Zerodha',
            logo: '/brokers/zerodha_small.svg',
            color: '#387ED1',
            bgColor: '#fff'
        },
        {
            name: 'Angel One',
            logo: '/brokers/angelone_small.svg',
            color: '#FF6B35',
            bgColor: '#fff'
        },
        {
            name: 'Dhan',
            logo: '/brokers/dhan_small.svg',
            color: '#7B68EE',
            bgColor: '#fff'
        },
        {
            name: 'Groww',
            logo: '/brokers/groww.svg',
            color: '#00D09C',
            bgColor: '#fff'
        }
    ];

    const BrokerLogo = ({ broker, index }) => {
        if (!broker) return null;
        return (
            <div
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-white font-bold text-base sm:text-lg shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white/20 hover:border-white/40"
                style={{ backgroundColor: broker.bgColor }}
                onClick={() => onConnect?.(broker)}
                title={`Connect to ${broker.name}`}
            >
                {broker.logo ? (
                    <Image
                        src={broker.logo}
                        alt={broker.name}
                        width={56}
                        height={56}
                        className="object-contain w-full h-full p-2"
                    />
                ) : (
                    broker.name.charAt(0)
                )}
            </div>
        );
    };

    const MoreBrokerIcon = () => (
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full border-2 border-dashed border-neutral-300 dark:border-neutral-600 flex items-center justify-center text-neutral-400 dark:text-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-400 hover:scale-105 transition-all duration-200 cursor-pointer bg-neutral-50 dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700">
            <Plus size={20} className="sm:hidden" />
            <Plus size={24} className="hidden sm:block" />
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}

            <DialogContent
                className="max-w-md w-[calc(100vw-16px)] sm:w-full mx-auto p-0 rounded-2xl sm:rounded-3xl border-0 shadow-2xl overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]"
                showCloseButton={false}
            >
                <DialogTitle className="sr-only">Broker Connect Popup</DialogTitle>
                <div className="bg-white dark:bg-neutral-900">
                    {/* Header with Close Button */}
                    <div className="relative px-4 sm:px-8 pt-6 sm:pt-8 pb-4 sm:pb-6">
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-1.5 sm:p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors z-10"
                            aria-label="Close dialog"
                        >
                            <X size={18} className="text-neutral-500 dark:text-neutral-400 sm:hidden" />
                            <X size={20} className="text-neutral-500 dark:text-neutral-400 hidden sm:block" />
                        </button>

                        <div className="pr-8 sm:pr-10">
                            <h2 className="text-lg sm:text-xl font-semibold text-neutral-800 dark:text-neutral-100 text-center leading-tight">
                                Auto import all trade details everyday without typing it manually
                            </h2>
                        </div>
                    </div>

                    {/* Broker Logos Section */}
                    <div className="px-4 sm:px-8 py-4 sm:py-6">
                        {/* First Row - 4 main brokers + more indicator */}
                        <div className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            {brokerLogos.map((broker, index) => (
                                <BrokerLogo key={broker.name} broker={broker} index={index} />
                            ))}
                            <MoreBrokerIcon />
                        </div>

                        {/* Second Row - Additional broker + text */}
                        <div className="flex justify-center items-center gap-2 sm:gap-3">
                            <BrokerLogo broker={brokerLogos[4]} index={4} />
                            <span className="text-neutral-500 dark:text-neutral-400 font-medium text-sm sm:text-base">
                                + more
                            </span>
                        </div>
                    </div>

                    {/* Connect Button */}
                    <div className="px-4 sm:px-8 pb-4 sm:pb-6">
                        <Button
                            className="w-full bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-800 dark:text-neutral-100 font-semibold py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-colors shadow-md border-0 h-auto text-sm sm:text-base"
                            onClick={() => {
                                trackEvent('clicked_popup_connectbroker');
                                router.push('/dashboard/connect');
                            }}
                        >
                            Connect Broker
                        </Button>
                    </div>

                    {/* Footer */}
                    <div className="px-4 sm:px-8 pb-4 sm:pb-6 text-center">
                        <p className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed">
                            🔒 100% secure. Takes less than 5 minutes
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default BrokerConnectPopup;