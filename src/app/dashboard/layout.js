'use client';

import { AppSidebar } from "@/components/app-sidebar";
import Navbar from "@/components/navbar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { clientApp } from '@/lib/firebase/index';
import DataListerner from "@/hooks/dataListerner";
import { usePathname } from "next/navigation";
import PhoneVerify from "@/components/auth/PhoneVerify";
import { useEffect } from "react";
import { collection, onSnapshot, getFirestore, query, where } from 'firebase/firestore';
import useGlobalState from "@/hooks/globalState";
import Script from "next/script";
import IsSubscribed from "@/components/auth/isSubcribed";
const db = getFirestore(clientApp);

export default function RootLayout({ children }) {



    const { userData } = useGlobalState()
    const pathname = usePathname();
    const hideNavbar = ["/dashboard/onboarding", "/dashboard/preonboarding", "/dashboard/csvupload", "/dashboard/brokerconnection"].includes(pathname);

    return (
        <IsSubscribed>
            <SidebarProvider>
                {userData && (!userData.phone || !userData.phone.verified) && <PhoneVerify />}

                <Script
                    id="msg91-otp"
                    src="https://verify.msg91.com/otp-provider.js"
                    strategy="afterInteractive"
                    onLoad={() => {
                        setTimeout(() => {
                            if (window.initSendOTP) {
                                const configuration = {
                                    widgetId: "3568796f4335353836303732",
                                    tokenAuth: "466139Tqzpk3QW3Xq68ac8244P1",
                                    exposeMethods: true,
                                    success: (data) => console.log("OTP Success", data),
                                    failure: (error) => console.log("OTP Failure", error),
                                };
                                window.initSendOTP(configuration);
                            } else {
                                console.error("MSG91 script not loaded properly");
                            }
                        }, 1000);
                    }}
                    onError={(e) => {
                        console.error("Failed to load MSG91 script", e);
                    }}
                />




                <DataListerner />
                <div className="min-h-screen flex flex-col w-full text-[16px] bg-white dark:bg-neutral-900">
                    {!hideNavbar && (
                        <div className="sticky top-0 bg-clip-padding backdrop-filter backdrop-blur-sm bg-opacity-10 z-[20] ">
                            <Navbar pathname={pathname} />
                        </div>
                    )}

                    <div
                        className={`${hideNavbar ? "flex-1 min-h-screen" : "flex-1"} p-0 bg-white dark:bg-neutral-900`}
                    >
                        {children}
                    </div>
                </div>
            </SidebarProvider>
        </IsSubscribed>
    );
}
