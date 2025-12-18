import { setConnectedBroker } from "../utils";
import { getAngleOneLink } from "./angleOne";
import { getFyersLink } from "./fyers";
import { connectKotakNeo } from "./kotakneo";
import { getUpstoxLink } from "./upstox";
import { getZerodhaLink } from "./zerodhaKite";

export const BROKER = {
    ZERODHA: "zerodha",
    DHAN: "dhan",
    FYERS: "fyers",
    UPSTOX: "upstox",
    ANGLEONE: "angle one",
    KOTAKNEO: "kotak neo",
    GROWW: "groww",
    DELTAEXCHANGE: "delta exchange",
    SHOONYA: "shoonya",
    "5PAISA": "5paisa",
    MOTILALOSWAL: "motilaloswal",
    SHAREKHAN: "sharekhan",
    ALICEBLUE: "aliceblue",
    INDIABULLSSECURITIES: "indiabullssecurities",
    JAINAMSECURITIES: "jainamsecurities",

}
export async function connectDhan(broker, access_token) {
    setConnectedBroker(broker, access_token, 30);
}

export async function connectGroww(broker, access_token, ttl = 1) {
    setConnectedBroker(broker, access_token, ttl);
}

export async function ConnectDeltaX(broker, ttl = 1) {
    setConnectedBroker(broker, ttl);
}

export const brokers = [
    {
        name: "Zerodha",
        description: "India's largest discount broker offering the lowest, most transparent prices in the industry",
        logo: "/brokers/zerodha_logo.svg",
        action: getZerodhaLink,
        getAPIURL: "https://zerodha.com/products/api/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: 'https://www.youtube.com/embed/fqh3bVfkm5A?si=9A-0yGQ6y_fr99Fw',
        ttl: 1 // In Days
    },
    {
        name: "Dhan",
        description: "Advanced trading platform with cutting-edge technology and comprehensive market access",
        logo: "/brokers/dhan_logo.svg",
        action: connectDhan,
        tokenParam: "dhan_token",
        getAPIURL: "https://login.dhan.co/?location=DH_WEB",
        tokenParam: "dhan_token",
        requiredFields: [
            {
                label: "Access Token",
                name: "access_token",
                type: "text",
                placeholder: "Enter your Access Token",
                required: true
            }
        ],
        needRedirect: false,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: "https://www.youtube.com/embed/w_8btgrECig?si=5vTYI1-6cW_YAep_",
        ttl: 30
    },
    {
        name: "Fyers",
        description: "The Experts' Opinion · It's the most feature-rich and bug-free trading platform.",
        logo: "/brokers/fyers.png",
        action: getFyersLink,
        getAPIURL: "https://myapi.fyers.in/dashboard",
        requiredFields: [
            {
                label: "App Id",
                name: "app_id",
                type: "text",
                placeholder: "Enter your App Id",
                required: true
            },
            {
                label: "Secret Key",
                name: "secret_key",
                type: "text",
                placeholder: "Enter your Secret Key",
                required: true
            }
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: "https://www.youtube.com/embed/Gi3V3h7ESSE?si=-zKZI3IAOPnBsmBu",
        ttl: 30
    },
    {
        name: "Angle One",
        description: "Your One-Stop Investment Platform a trusted partner with 25 years of experience",
        logo: "/brokers/Angelone_icon.jpeg",
        action: getAngleOneLink,
        getAPIURL: "https://smartapi.angelbroking.com/signup",
        requiredFields: [
            {
                label: "API KEY",
                name: "api_key",
                type: "text",
                placeholder: "Enter your Clients Code",
                required: true
            },
            {
                label: "SECRET",
                name: "secret_key",
                type: "text",
                placeholder: "Enter your Password",
                required: true
            }
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: "https://www.youtube.com/embed/CAhOFoYXB7U?si=tzDXp6KJ3e81ljPx",
        ttl: 30
    },
    {
        name: "Upstox",
        description: "India's largest discount broker offering the lowest, most transparent prices in the industry",
        logo: "/brokers/upstox_icon.jpeg",
        action: getUpstoxLink,
        getAPIURL: "https://account.upstox.com/developer/apps",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: 'https://www.youtube.com/embed/bBD2cZsfCEE?si=DGlcBRX7Yn_ihLrI',
        ttl: 1 // In Days
    },
    {
        name: "Kotak Neo",
        description: "Kotak Neo is a digital platform by Kotak Securities, offering seamless trading and investment services.",
        logo: "/brokers/kotaklogo.jpeg",
        action: connectKotakNeo,
        getAPIURL: "https://www.kotaksecurities.com/platform/kotak-neo-trade-api/",
        requiredFields: [
            {
                label: "Consumer Key",
                name: "consumer_key",
                type: "text",
                placeholder: "Enter your Authorization",
                required: true
            }, {
                label: "Consumer Secret",
                name: "consumer_secret",
                type: "text",
                placeholder: "Enter your Authorization",
                required: true
            },
            {
                label: "Mobile Number",
                name: "mobileNumber",
                type: "text",
                placeholder: "Enter your Mobile Number ",
                required: true
            },
            {
                label: "User Client Code",
                name: "ucc",
                type: "text",
                placeholder: "Enter your User Client Code",
                required: true
            },
            {
                label: "TOTP Secret",
                name: "secret",
                type: "text",
                placeholder: "Enter your TOTP Secret",
                required: false
            }, {
                label: "MPIN",
                name: "mpin",
                type: "text",
                placeholder: "Enter your MPIN",
                required: false
            },
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
    },
    {
        name: "Groww",
        description: "Groww is an Indian investment platform that allows users to invest in stocks, mutual funds, and other financial products.",
        logo: "/brokers/groww_logo.webp",
        action: connectGroww,
        getAPIURL: "https://groww.in/user/profile/trading-apis",
        requiredFields: [
            {
                label: "Access Token",
                name: "access_token",
                type: "text",
                placeholder: "Enter your Access Token",
                required: true
            },
        ],
        needRedirect: false,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: "",
        ttl: 1
    },
    {
        name: "Delta Exchange",
        description: "Delta Exchange is a cryptocurrency derivatives exchange offering futures and options trading.",
        logo: "/brokers/delta_exchange_logo.jpg",
        action: ConnectDeltaX,
        getAPIURL: "https://www.delta.exchange/app/login",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: true,
        isAvailable: true,
        tutorialIframeUrl: "",
        ttl: 1
    },
    {
        name: "Shoonya",
        description: "Shoonya is a commission-free trading platform for stocks, commodities, and currencies.",
        logo: "/brokers/shoonya_small.svg",
        action: ConnectDeltaX,
        getAPIURL: "https://www.shoonya.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 1
    },
    {
        name: "5Paisa",
        description: "5Paisa is a discount brokerage firm in India offering a range of financial services.",
        logo: "/brokers/5paisa_icon.jpeg",
        action: connectDhan,
        getAPIURL: "https://www.5paisa.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },
    {
        name: "Motilal Oswal",
        description: "Motilal Oswal is a leading financial services company in India offering a wide range of investment solutions.",
        logo: "/brokers/Motilaloswal_icon.jpeg",
        action: connectDhan,
        getAPIURL: "https://www.motilaloswal.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },
    {
        name: "Sharekhan",
        description: "Sharekhan is a leading stock brokerage firm in India offering a wide range of investment services.",
        logo: "/brokers/sharekhan_icon.jpeg",
        action: connectDhan,
        getAPIURL: "https://www.sharekhan.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },
    {
        name: "Alice Blue",
        description: "Alice Blue is a discount brokerage firm in India offering a range of financial services.",
        logo: "/brokers/aliceblue_icon.jpeg",
        action: connectDhan,
        getAPIURL: "https://www.aliceblueonline.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },
    {
        name: "Indiabulls Securities",
        description: "Indiabulls Securities is a leading stock brokerage firm in India offering a wide range of investment services.",
        logo: "/brokers/indiabulls_logo.svg",
        action: connectDhan,
        getAPIURL: "https://www.indiabulls.com/",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },
    {
        name: "Jainam Securities",
        description: "Jainam Securities is a leading stock brokerage firm in India offering a wide range of investment services.",
        logo: "/brokers/Jainam_logo.svg",
        action: connectDhan,
        getAPIURL: "GET	{{BASE_URL}}omt/api-order-rest/v1/orders/trades",
        requiredFields: [
            {
                label: "API Key",
                name: "api_key",
                type: "text",
                placeholder: "Enter your API Key",
                required: true
            },
            {
                label: "API Secret",
                name: "api_secret",
                type: "text",
                placeholder: "Enter your API Secret",
                required: true
            }
        ],
        needRedirect: true,
        isActive: false,
        isAvailable: false,
        tutorialIframeUrl: "",
        ttl: 30
    },

]
