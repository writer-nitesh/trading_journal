import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { GoogleAnalytics } from "nextjs-google-analytics";
import Script from "next/script";

import AuthProvider from "@/hooks/authProvider";
import DataListener from "@/hooks/dataListerner";
import mixpanel from 'mixpanel-browser';


export const metadata = {
  title: "Tradio - Simplest Trading Journal App",
  description:
    "Tradio is the simplest trading journal app in India with auto trade tracking and broker integration. Improve trading psychology and performance.",
  keywords:
    "trading journal app, trading tracker, auto trade tracking, broker integration, trading psychology, trading strategy, Zerodha, Groww, Dhan, Indian traders",
  openGraph: {
    title: "Tradio - Simplest Trading Journal App",
    description:
      "Track your trades automatically with broker integrations like Zerodha, Groww, and Dhan. Improve trading psychology and performance with Tradio.",
    url: "https://tradiohub.com",
    siteName: "Tradio",
    images: [
      {
        url: "https://tradiohub.com/featuredImages/dashboard.png",
        width: 1897,
        height: 837,
        alt: "Tradio - Simplest Trading Journal App",
      },
    ],
    locale: "en-IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tradio - Simplest Trading Journal App",
    description:
      "India's easiest trading journal app with auto-tracking and broker integrations. Understand your strategy and improve your edge.",
    images: ["https://tradiohub.com/featuredImages/dashboard.png"],
    site: "@tradiohub",
  },
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

  const initMixpanel = () => {
    if (!MIXPANEL_TOKEN) {
      console.warn('Mixpanel token is missing! Check your .env file.');
      return;
    }
    mixpanel.init(MIXPANEL_TOKEN, { autocapture: true });
  };

  const trackEvent = (eventName, properties = {}) => {
    mixpanel.track(eventName, properties);
  };




  return (
    <html lang={locale} dir="ltr" suppressHydrationWarning>
      <head>

        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-KR2BT5JYL2" />

        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-KR2BT5JYL2');
          `}
        </Script>

        <Script
          id="ms-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "s97fo8jn7d");
          `,
          }}
        />
      </head>




      <body className="antialiased">
        <NextIntlClientProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <AuthProvider />
            <DataListener />

            <Toaster />
            {children}
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
