
"use client";
import { useEffect, useState } from 'react';
import { Upload, Link, TrendingUp, Shield, BarChart3, Settings, CheckCircle, Zap, ArrowRight, ArrowLeft, User, Bell } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { getCurrentUserId } from '@/lib/firebase/database/index';
import { useRouter } from "next/navigation";
import { trackEvent } from "@/lib/mixpanelClient";

// Enhanced CSV_FORMATS with separate equity and F&O formats
const CSV_FORMATS = {
    dhan: {
        equity: {
            name: 'Dhan (Equity)',
            requiredHeaders: ['Date', 'Time', 'Name', 'Buy/Sell', 'Order', 'Exchange', 'Segment', 'Quantity/Lot', 'Trade Price', 'Trade Value', 'Status'],
            description: 'Dhan equity tradebook export format'
        },
        fno: {
            name: 'Dhan (F&O)',
            requiredHeaders: ['Date', 'Time', 'Name', 'Buy/Sell', 'Order', 'Exchange', 'Segment', 'Quantity/Lot', 'Trade Price', 'Trade Value', 'Status'],
            description: 'Dhan F&O tradebook export format'
        }
    },
    fyers: {
        equity: {
            name: 'Fyers (Equity)',
            requiredHeaders: ['date', 'time', 'segment', 'symbol', 'type', 'qty', 'trade_price', 'trade_val', 'order_id'],
            description: 'Fyers equity tradebook export format'
        },
        fno: {
            name: 'Fyers (F&O)',
            requiredHeaders: ['date', 'time', 'segment', 'symbol', 'type', 'qty', 'trade_price', 'trade_val', 'order_id'],
            description: 'Fyers F&O tradebook export format'
        }
    },
    zerodha: {
        equity: {
            name: 'Zerodha (Equity)',
            requiredHeaders: ['symbol', 'isin', 'trade_date', 'exchange', 'segment', 'series', 'trade_type', 'auction', 'quantity', 'price', 'trade_id', 'order_id', 'order_execution_time'],
            description: 'Zerodha equity trades export format'
        },
        fno: {
            name: 'Zerodha (F&O)',
            requiredHeaders: ['symbol', 'isin', 'trade_date', 'exchange', 'segment', 'series', 'trade_type', 'auction', 'quantity', 'price', 'trade_id', 'order_id', 'order_execution_time', 'expiry_date'],
            description: 'Zerodha F&O trades export format'
        }
    },
    upstox: {
        equity: {
            name: 'Upstox (Equity)',
            requiredHeaders: ['date', 'time', 'symbol', 'side', 'quantity', 'price', 'value', 'order_id'],
            description: 'Upstox equity transaction history format'
        },
        fno: {
            name: 'Upstox (F&O)',
            requiredHeaders: ['date', 'time', 'symbol', 'side', 'quantity', 'price', 'value', 'order_id'],
            description: 'Upstox F&O transaction history format'
        }
    },
    angelone: {
        equity: {
            name: 'Angel One (Equity)',
            requiredHeaders: ['trade_date', 'symbol', 'buy_sell', 'quantity', 'price', 'trade_value', 'order_no'],
            description: 'Angel One equity trade statement format'
        },
        fno: {
            name: 'Angel One (F&O)',
            requiredHeaders: ['trade_date', 'symbol', 'buy_sell', 'quantity', 'price', 'trade_value', 'order_no'],
            description: 'Angel One F&O trade statement format'
        }
    },
    icici: {
        equity: {
            name: 'ICICI Direct (Equity)',
            requiredHeaders: ['Trade Date', 'Symbol', 'Buy/Sell', 'Quantity', 'Rate', 'Amount', 'Order No'],
            description: 'ICICI Direct equity trade report format'
        },
        fno: {
            name: 'ICICI Direct (F&O)',
            requiredHeaders: ['Trade Date', 'Symbol', 'Buy/Sell', 'Quantity', 'Rate', 'Amount', 'Order No'],
            description: 'ICICI Direct F&O trade report format'
        }
    },
    groww: {
        equity: {
            name: 'Groww (Equity)',
            requiredHeaders: ['date', 'symbol', 'action', 'quantity', 'price', 'amount', 'exchange'],
            description: 'Groww equity trade history format'
        },
        fno: {
            name: 'Groww (F&O)',
            requiredHeaders: ['date', 'symbol', 'action', 'quantity', 'price', 'amount', 'exchange'],
            description: 'Groww F&O trade history format'
        }
    },
    '5paisa': {
        equity: {
            name: '5paisa (Equity)',
            requiredHeaders: ['TradeDate', 'Symbol', 'BuySell', 'Qty', 'Rate', 'Amount', 'OrderId'],
            description: '5paisa equity trade book format'
        },
        fno: {
            name: '5paisa (F&O)',
            requiredHeaders: ['TradeDate', 'Symbol', 'BuySell', 'Qty', 'Rate', 'Amount', 'OrderId'],
            description: '5paisa F&O trade book format'
        }
    },
    kotak: {
        equity: {
            name: 'Kotak Securities (Equity)',
            requiredHeaders: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Value', 'Order_ID'],
            description: 'Kotak Securities equity trade report format'
        },
        fno: {
            name: 'Kotak Securities (F&O)',
            requiredHeaders: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Value', 'Order_ID'],
            description: 'Kotak Securities F&O trade report format'
        }
    },
    hdfc: {
        equity: {
            name: 'HDFC Securities (Equity)',
            requiredHeaders: ['Trade_Date', 'Symbol', 'Buy_Sell', 'Quantity', 'Price', 'Trade_Value', 'Order_Number'],
            description: 'HDFC Securities equity trade summary format'
        },
        fno: {
            name: 'HDFC Securities (F&O)',
            requiredHeaders: ['Trade_Date', 'Symbol', 'Buy_Sell', 'Quantity', 'Price', 'Trade_Value', 'Order_Number'],
            description: 'HDFC Securities F&O trade summary format'
        }
    }
};
// 1. First, add this BROKER_VIDEOS object after your CSV_FORMATS object (around line 110)

const BROKER_VIDEOS = {
    zerodha: {
        title: 'How to Download Zerodha CSV',
        videoId: 'HVe5VIw5hW0', // Extract video ID from YouTube URL
        url: 'https://www.youtube.com/watch?v=HVe5VIw5hW0'
    },
    dhan: {
        title: 'How to Download Dhan CSV',
        videoId: 'E-pgZo-nFgk', // Replace with actual Dhan video ID
        url: 'https://www.youtube.com/watch?v=E-pgZo-nFgk'
    },
    fyers: {
        title: 'How to Download Fyers CSV',
        videoId: 'NaW_-bmYfak', // Replace with actual Fyers video ID
        url: 'https://www.youtube.com/watch?v=NaW_-bmYfak'
    },
    upstox: {
        title: 'How to Download Upstox CSV',
        videoId: 'dQw4w9WgXcQ', // Replace with actual Upstox video ID
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    angelone: {
        title: 'How to Download Angel One CSV',
        videoId: 'dQw4w9WgXcQ', // Replace with actual Angel One video ID
        url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
    },
    // Add more brokers as needed
};




const brokers = [
    { id: 'zerodha', name: 'Zerodha', logo: '🇮🇳' },
    { id: 'dhan', name: 'Dhan', logo: '🏦' },
    { id: 'fyers', name: 'Fyers', logo: '🚀' },
    { id: 'upstox', name: 'Upstox', logo: '📈' },
    { id: 'angelone', name: 'Angel One', logo: '👼' },
    { id: 'icici', name: 'ICICI Direct', logo: '🏦' },
    { id: 'groww', name: 'Groww', logo: '🌱' },
    { id: '5paisa', name: '5paisa', logo: '💰' },
    { id: 'kotak', name: 'Kotak Securities', logo: '🏢' },
    { id: 'hdfc', name: 'HDFC Securities', logo: '🔷' },
    { id: 'axis', name: 'Axis Direct', logo: '🔺' },
    { id: 'sbi', name: 'SBI Securities', logo: '🏛️' },
    { id: 'motilal', name: 'Motilal Oswal', logo: '📊' },
    { id: 'sharekhan', name: 'Sharekhan', logo: '🎯' },
    { id: 'edelweiss', name: 'Edelweiss', logo: '⭐' },
    { id: 'indira', name: 'Indira Securities', logo: '💎' },
    { id: 'tradejini', name: 'Tradejini', logo: '🔥' },
    
];

const segments = [
    { id: 'equity', name: 'Equity', icon: '📊' },
    { id: 'fno', name: 'F&O', icon: '⚡' }
];

const VideoPopup = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Updated backdrop to match page background with very light blur */}
            <div
                className="absolute inset-0 bg-neutral-50/10 dark:bg-neutral-900/40 backdrop-blur-sm"
                onClick={onClose}
            ></div>

            <div className="relative bg-white dark:bg-neutral-800 rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                        {video.title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="p-4">
                    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                        <iframe
                            className="absolute top-0 left-0 w-full h-full rounded-lg"
                            src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0`}
                            title={video.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        ></iframe>
                    </div>

                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={() => window.open(video.url, '_blank')}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                        >
                            Watch on YouTube
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-neutral-200 dark:bg-neutral-700 hover:bg-neutral-300 dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function CSVUploadPage() {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadError, setUploadError] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [selectedCsvBroker, setSelectedCsvBroker] = useState('');
    const [isUploadingCSV, setisUploadingCSV] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState('');
    const [selectedSegment, setSelectedSegment] = useState('');
    const [showVideoPopup, setShowVideoPopup] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [popupTrigger, setPopupTrigger] = useState(0);
    const [selectKey, setSelectKey] = useState(0);

    // inside your component
    useEffect(() => {
        setUploadedFile(null);
        setUploadError(false);
        setValidationError('');
        setValidationSuccess(false);
        setIsSuccess(false);
    }, [selectedBroker, selectedSegment]);


    const router = useRouter();

    const validateCSVFormat = (csvContent, broker, segment) => {
        try {
            const lines = csvContent.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                return { isValid: false, error: 'CSV file appears to be empty or has no data rows' };
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const expectedFormat = CSV_FORMATS[broker]?.[segment];

            if (!expectedFormat) {
                return { isValid: false, error: 'Unsupported broker/segment format selected' };
            }

            // Check if all required headers are present
            // ✅ Strict header validation
            const normalizedHeaders = headers.map(h => h.toLowerCase().trim());
            const normalizedExpected = expectedFormat.requiredHeaders.map(h => h.toLowerCase().trim());

            // Check for exact match (length + order)
            const isExactMatch =
                normalizedHeaders.length === normalizedExpected.length &&
                normalizedHeaders.every((h, i) => h === normalizedExpected[i]);

            if (!isExactMatch) {
                return {
                    isValid: false,
                    error: `File format is mismatched`,
                    expectedHeaders: expectedFormat.requiredHeaders,
                    foundHeaders: headers
                };
            }


            // ✅ Check if we have at least one data row
            if (lines.length < 2) {
                return { isValid: false, error: 'CSV file has headers but no trade data' };
            }

            // ✅ Validate data row structure
            const sampleDataRow = lines[1].split(',');
            if (sampleDataRow.length !== headers.length) {
                return { isValid: false, error: 'Data row column count does not match headers' };
            }

            return { isValid: true, rowCount: lines.length - 1 };

        } catch (error) {
            return { isValid: false, error: 'Failed to parse CSV file. Please ensure it\'s a valid CSV format.' };
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];

        if (!file) return;

        // ADD THIS TRACKING - Upload attempt
        trackEvent("attempted_csv_upload", {
            broker: selectedBroker,
            segment: selectedSegment,
            fileName: file.name,
            fileSize: file.size,
            brokerName: brokers.find(b => b.id === selectedBroker)?.name,
            segmentName: segments.find(s => s.id === selectedSegment)?.name
        });
        // Reset states
        setUploadError(false);
        setValidationError('');
        setValidationSuccess(false);
        setIsValidating(false);


        // Check if file type is CSV
        const isCsv = file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv');
        if (!isCsv) {
            setUploadError(true);
            setUploadedFile(null);
            setValidationError('Please select a CSV file');
            return;
        }

        // Check if broker format is selected
        if (!selectedBroker || !selectedSegment) {
            setValidationError('Please select both broker and segment first');
            return;
        }

        setIsValidating(true);

        const reader = new FileReader();

        reader.onload = async (e) => {
            const csvContent = e.target.result;

            // Validate CSV format
            const validation = validateCSVFormat(csvContent, selectedBroker, selectedSegment);

            setIsValidating(false);

            if (!validation.isValid) {

                // ADD THIS TRACKING - Validation failed
                trackEvent("failed_csv_validation", {
                    broker: selectedBroker,
                    segment: selectedSegment,
                    fileName: file.name,
                    errorType: validation.error,
                    hasExpectedHeaders: !!validation.expectedHeaders,
                    hasFoundHeaders: !!validation.foundHeaders
                });
                setUploadError(true);
                setValidationError(validation.error);
                setUploadedFile(null);
                return;
            }

            // If validation passes
            setUploadError(false);
            setValidationError('');
            setValidationSuccess(true);
            setUploadedFile(file);

            // Convert to base64 for upload
            const base64Reader = new FileReader();
            base64Reader.onload = async (base64Event) => {
                const base64Data = base64Event.target.result.split(',')[1];

                try {
                    setisUploadingCSV(true);
                    const userId = await getCurrentUserId();
                    const response = await fetch('/api/upload-csv', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            buffer: base64Data,
                            originalFileName: file.name,
                            folderName: 'input_csv',
                            userId: userId,
                            broker: selectedBroker,
                            segment: selectedSegment,
                            brokerFormat: selectedCsvBroker, // keep for backward compatibility
                            validationResult: validation,
                        }),
                    });

                    const result = await response.json();

                    if (response.ok) {
                        setIsSuccess(true);
                        console.log('✅ File uploaded to:', result.url);

                        // Update onboarding status
                        //  await updateOnboardingStatus(userId, 'csv');
                        // ADD THIS TRACKING - Upload success
                        trackEvent("completed_csv_upload", {
                            broker: selectedBroker,
                            segment: selectedSegment,
                            fileName: file.name,
                            fileSize: file.size,
                            rowCount: validation.rowCount,
                            uploadUrl: result.url,
                            brokerName: brokers.find(b => b.id === selectedBroker)?.name,
                            segmentName: segments.find(s => s.id === selectedSegment)?.name
                        });

                        // Force clear file input (so re-uploads work)
                        event.target.value = null;

                        // ✅ Redirect immediately
                        router.replace('/dashboard');  // use replace instead of push to avoid back button coming back here
                        return;
                    } else {
                        // ADD THIS TRACKING - Upload failed
                        trackEvent("failed_csv_upload", {
                            broker: selectedBroker,
                            segment: selectedSegment,
                            fileName: file.name,
                            errorType: result.error,
                            responseStatus: response.status
                        });
                        console.error('❌ Upload failed:', result.error);
                    }

                } catch (err) {
                    console.error('❌ Upload error:', err);
                } finally {
                    setisUploadingCSV(false);
                }
            };
            base64Reader.readAsDataURL(file);
        };

        reader.readAsText(file);
        event.target.value = null;

    };


    const handleProceed = () => {
        router.push("/dashboard");
    };

    const resetUpload = () => {
        setUploadedFile(null);
        setUploadError(false);
        setValidationError('');
        setValidationSuccess(false);
        setSelectedBroker('');
        setSelectedSegment('');
        setSelectedCsvBroker('');
        setIsSuccess(false);
    };

    const isDataConnected = uploadedFile;

    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 flex lg:flex-row flex-col min-h-screen">
            {/* CSV Upload Content */}

            {/* Main Content */}
            <div className="flex flex-col lg:flex-row  w-full h-full ">
                {/* Left Main Content */}
                <div className="flex flex-col w-full  gap-0 overflow-auto ">
                    <div className='m-2'>
                        {/* Back and Skip Buttons */}
                        <div className="flex justify-between items-center mb-6">
                            <button
                                onClick={() => router.push("/dashboard/preonboarding")}
                                className="group flex items-center px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <ArrowLeft className="w-4 h-4 lg:w-5 lg:h-5 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-medium text-sm lg:text-base">Back</span>
                            </button>
                            <button
                                onClick={() => router.push("/dashboard")}
                                className="group flex items-center px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-neutral-100 hover:border-neutral-300 dark:hover:border-neutral-600 transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                                <span className="font-medium text-sm lg:text-base">Skip</span>
                                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 ml-2 group-hover:-translate-x-1 transition-transform duration-200" />
                            </button>

                        </div>
                    </div>

                    {/* CSV Upload Section */}
                    <div className="flex  max-w-7xl mx-auto p-2">
                        {/* CSV Upload Card */}
                        <div className="max-w-4xl mx-auto">
                            {/* relative wrapper */}
                            <div className="relative">
                                {/* Reset button inside card top-right */}
                                {uploadedFile && (
                                    <button
                                        onClick={resetUpload}
                                        className="absolute top-3 right-3 px-3 py-1 text-xs bg-neutral-200 dark:bg-neutral-700 rounded-md hover:bg-neutral-300 dark:hover:bg-neutral-600 transition"
                                    >
                                        Reset
                                    </button>
                                )}

                                {/* Upload Card */}
                                <div
                                    className={`bg-white dark:bg-neutral-800 rounded-xl shadow-lg border-2 transition-all min-h-[500px] ${uploadError || validationError
                                            ? 'border-red-500 shadow-red-100 dark:shadow-red-900/20'
                                            : validationSuccess
                                                ? 'border-green-500 shadow-green-100 dark:shadow-green-900/20'
                                                : 'border-neutral-200 dark:border-neutral-700'
                                        }`}
                                >


                                    <div className="p-4">
                                        <div className="flex gap-4 items-center">
                                            <div className={`lg:w-14 lg:h-14 w-10 h-10 rounded-xl flex items-center justify-center  ${uploadError || validationError ? 'bg-red-100 dark:bg-red-900/30' : validationSuccess ? 'bg-green-100 dark:bg-green-900/30' : 'bg-green-100 dark:bg-green-900/30'
                                                }`}>
                                                <Upload className={`lg:w-8 lg:h-8 w-4 h-4 ${uploadError || validationError ? 'text-red-600 dark:text-red-400' : validationSuccess ? 'text-green-600 dark:text-green-400' : 'text-green-600 dark:text-green-400'
                                                    }`} />
                                            </div>
                                            <div className='flex flex-col gap-1'>
                                                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Upload CSV</h2>
                                                <p className="text-neutral-600 dark:text-neutral-400">Historical data analysis for comprehensive trading insights</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            {/* Enhanced Broker and Segment Selection */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                                {/* Broker Selection */}
                                                <div>
                                                    <label className="block text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                        Select Broker
                                                    </label>
                                                    <select
                                                        key={selectKey}
                                                        value={selectedBroker}
                                                        onChange={(e) => {
                                                            const newBroker = e.target.value;
                                                            setSelectedBroker(newBroker);
                                                            setSelectedSegment('');
                                                            setSelectedCsvBroker('');
                                                            setUploadError(false);
                                                            setValidationError('');
                                                            setValidationSuccess(false);
                                                            setUploadedFile(null);

                                                            // Force re-render of select to ensure onChange fires next time
                                                            setSelectKey(prev => prev + 1);
                                                        }}
                                                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                                        disabled={isUploadingCSV}
                                                    >
                                                        <option value="">Choose broker...</option>
                                                        {brokers.filter(broker => CSV_FORMATS[broker.id]).map((broker) => (
                                                            <option key={broker.id} value={broker.id}>
                                                                {broker.logo} {broker.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                {/* Segment Selection */}
                                                <div>
                                                    <label className="block text-lg font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                                        Select Segment
                                                    </label>
                                                    <select
                                                        value={selectedSegment}
                                                        onChange={(e) => {
                                                            setSelectedSegment(e.target.value);
                                                            // Update combined format when both broker and segment are selected
                                                            if (selectedBroker && e.target.value) {
                                                                setSelectedCsvBroker(`${selectedBroker}_${e.target.value}`);
                                                            } else {
                                                                setSelectedCsvBroker('');
                                                            }
                                                            setUploadError(false);
                                                            setValidationError('');
                                                            setValidationSuccess(false);
                                                            setUploadedFile(null);
                                                        }}
                                                        className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-base bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                                                        disabled={!selectedBroker || isUploadingCSV}
                                                    >
                                                        <option value="">Choose segment...</option>
                                                        {selectedBroker && CSV_FORMATS[selectedBroker] && segments.map((segment) => (
                                                            <option key={segment.id} value={segment.id}>
                                                                {segment.icon} {segment.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>
                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                Select both broker and segment to enable CSV upload
                                            </p>

                                            {/* File Upload Area */}
                                            <label htmlFor="csv-upload" className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadError || validationError
                                                ? 'border-red-300 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                                                : validationSuccess
                                                    ? 'border-green-300 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                                                    : selectedBroker && selectedSegment
                                                        ? 'border-neutral-300 dark:border-neutral-600 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20'
                                                        : 'border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 cursor-not-allowed'
                                                }`}>
                                                <div className="flex flex-col items-center justify-center">
                                                    {isValidating ? (
                                                        <>
                                                            <div className="w-12 h-12 border-3 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                                                            <p className="text-lg text-blue-700 dark:text-blue-400 font-medium">Validating CSV format...</p>
                                                            <p className="text-sm text-blue-600 dark:text-blue-500">Please wait</p>
                                                        </>
                                                    ) : (uploadError || validationError) ? (
                                                        <>
                                                            <AlertTriangle className="w-16 h-16 text-red-500 dark:text-red-400 mb-3" />
                                                            <p className="text-lg text-red-700 dark:text-red-400 font-medium">Invalid file format</p>
                                                            <p className="text-sm text-red-600 dark:text-red-400 text-center px-4">
                                                                {validationError || 'Please select a valid CSV file'}
                                                            </p>
                                                        </>
                                                    ) : validationSuccess && uploadedFile ? (
                                                        <>
                                                            <CheckCircle className="w-16 h-16 text-green-500 dark:text-green-400 mb-3" />
                                                            <p className="text-lg text-green-700 dark:text-green-400 font-medium">{uploadedFile.name}</p>
                                                            <p className="text-sm text-green-600 dark:text-green-500">
                                                                {brokers.find(b => b.id === selectedBroker)?.name} {segments.find(s => s.id === selectedSegment)?.name} format • Validated ✓
                                                            </p>
                                                        </>
                                                    ) : selectedBroker && selectedSegment ? (
                                                        <>
                                                            <Upload className="w-16 h-12 text-neutral-400 dark:text-neutral-500 mb-3" />
                                                            <p className="text-lg text-neutral-600 dark:text-neutral-300 font-medium">Click to upload CSV</p>
                                                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                                                {brokers.find(b => b.id === selectedBroker)?.name} {segments.find(s => s.id === selectedSegment)?.name} format selected
                                                            </p>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Upload className="w-16 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
                                                            <p className="text-lg text-neutral-400 dark:text-neutral-500 font-medium">Select broker & segment first</p>
                                                            <p className="text-sm text-neutral-400 dark:text-neutral-500">Choose above to enable upload</p>
                                                        </>
                                                    )}
                                                </div>
                                                <input
                                                    id="csv-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept=".csv"
                                                    onChange={handleFileUpload}
                                                    disabled={!selectedBroker || !selectedSegment || isValidating}
                                                />
                                            </label>
                                        </div>

                                        {/* Format Info Display */}
                                        <div
                                            className={`rounded-lg p-6 mb-6 mt-4 h-[140px] overflow-hidden ${uploadError || validationError
                                                    ? 'bg-red-50 dark:bg-red-900/20'
                                                    : validationSuccess
                                                        ? 'bg-green-50 dark:bg-green-900/20'
                                                        : 'bg-blue-50 dark:bg-blue-900/20'
                                                }`}
                                        >
                                            <h4
                                                className={`font-semibold mb-3 text-lg ${uploadError || validationError
                                                        ? 'text-red-900 dark:text-red-300'
                                                        : validationSuccess
                                                            ? 'text-green-900 dark:text-green-300'
                                                            : 'text-blue-900 dark:text-blue-300'
                                                    }`}
                                            >
                                                {uploadError || validationError
                                                    ? 'Required Format:'
                                                    : validationSuccess
                                                        ? 'Format Validated:'
                                                        : 'Expected Format:'}
                                            </h4>

                                            {selectedBroker && selectedSegment && CSV_FORMATS[selectedBroker]?.[selectedSegment] ? (
                                                <div
                                                    className={`text-sm ${uploadError || validationError
                                                            ? 'text-red-800 dark:text-red-400'
                                                            : validationSuccess
                                                                ? 'text-green-800 dark:text-green-400'
                                                                : 'text-blue-800 dark:text-blue-400'
                                                        }`}
                                                >
                                                    <p className="mb-3">{CSV_FORMATS[selectedBroker][selectedSegment].description}</p>

                                                    {/* 🔴 Removed Required columns display here */}

                                                    <div className="text-xs italic">
                                                        📺 Watch YouTube video below for download/upload tutorial
                                                    </div>
                                                </div>
                                            ) : (
                                                <ul
                                                    className={`text-sm space-y-1 ${uploadError || validationError
                                                            ? 'text-red-800 dark:text-red-400'
                                                            : 'text-blue-800 dark:text-blue-400'
                                                        }`}
                                                >
                                                    <li>• Zerodha trade exports</li>
                                                    <li>• Fyers transaction history</li>
                                                    <li>• Dhan tradebook statements</li>
                                                    <li>• And many more broker formats</li>
                                                    <li className="italic text-xs mt-2">
                                                        📺 Watch YouTube video below for download/upload tutorial
                                                    </li>
                                                </ul>
                                            )}
                                        </div>



                                        <button
                                            onClick={() => {
                                                // ADD THIS TRACKING
                                                trackEvent("clicked_csv_demo_video", {
                                                    broker: selectedBroker,
                                                    segment: selectedSegment,
                                                    hasUploadedFile: !!uploadedFile
                                                });

                                                // Show specific broker video if available, otherwise show generic demo
                                                if (selectedBroker && BROKER_VIDEOS[selectedBroker]) {
                                                    setSelectedVideo(BROKER_VIDEOS[selectedBroker]);
                                                    setPopupTrigger(prev => prev + 1);
                                                    setShowVideoPopup(true);
                                                } else {
                                                    // Fallback to generic demo video
                                                    window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
                                                }
                                            }}
                                            className="w-full py-2 px-4 rounded-lg font-medium text-lg transition-colors bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600"
                                        >
                                            {selectedBroker && BROKER_VIDEOS[selectedBroker]
                                                ? `Watch ${brokers.find(b => b.id === selectedBroker)?.name} Tutorial`
                                                : 'Watch Demo Video'
                                            }
                                        </button>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>
                </div>

                {/* Right Sidebar - Hidden on mobile, visible on lg+ screens */}
                <div className="hidden lg:flex flex-col h-full w-96 bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 p-6">
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded flex items-center justify-center mr-2">
                                <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Getting Started</h3>
                            <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">CSV Upload</span>
                        </div>

                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="bg-white dark:bg-neutral-700 rounded-lg p-4 border border-neutral-200 dark:border-neutral-600">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Upload Progress</span>
                                    <span className="text-xs bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                                        {isDataConnected ? '100%' : '0%'}
                                    </span>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2 mb-3">
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
                                            Upload CSV File
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                                    {isDataConnected ?
                                        'Perfect! Your CSV data has been uploaded and validated. Ready to analyze your trading performance.' :
                                        'Select your broker format and upload your trading data CSV file to get started.'
                                    }
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-green-900 dark:text-green-300">Quick Tips</span>
                                    <span className="ml-auto text-xs bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-300 px-2 py-1 rounded-full">Tips</span>
                                </div>
                                <div className="text-sm text-green-800 dark:text-green-400">
                                    For best results, upload CSV files with at least 30 days of trading history. Ensure your CSV includes all trades, not just profits.
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-300">Security</span>
                                    <span className="ml-auto text-xs bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-300 px-2 py-1 rounded-full">Secure</span>
                                </div>
                                <div className="text-sm text-orange-800 dark:text-orange-400">
                                    Your trading data is encrypted and stored securely. We never share your information with third parties.
                                </div>
                            </div>

                            {/* File Format Help */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-blue-900 dark:text-blue-300">File Format Help</span>
                                    <span className="ml-auto text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-300 px-2 py-1 rounded-full">Help</span>
                                </div>
                                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
                                    <div>• Export from your broker's trading platform</div>
                                    <div>• Look for "Trade Book" or "Transaction History"</div>
                                    <div>• Save as CSV format</div>
                                    <div>• Include all columns in the export</div>
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



                {/* Mobile Bottom Info Panel - Only visible on mobile */}
                <div className="lg:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4" >
                    <div className="max-w-sm mx-auto">
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Upload Progress</span>
                            <span className="text-xs bg-neutral-100 dark:bg-neutral-600 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                                {isDataConnected ? '100%' : '0%'}
                            </span>
                        </div>

                        <div className="w-full bg-neutral-200 dark:bg-neutral-600 rounded-full h-2 mb-3">
                            <div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                                style={{ width: isDataConnected ? '100%' : '0%' }}
                            ></div>
                        </div>

                        {/* Status */}
                        <div className="text-center">
                            <div className="flex items-center justify-center space-x-2 text-xs text-neutral-500 dark:text-neutral-400 mb-2">
                                <Shield className="w-3 h-3" />
                                <span>Secure Upload</span>
                                <span>•</span>
                                <span>10,000+ Users</span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                {isDataConnected
                                    ? '✅ Ready to analyze your trading data'
                                    : 'Select broker format and upload CSV to continue'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div >
            {/* Video Popup */}
            <VideoPopup
                key={popupTrigger} // This forces re-render
                isOpen={showVideoPopup}
                onClose={() => {
                    setShowVideoPopup(false);
                    setSelectedVideo(null);
                }}
                video={selectedVideo}
            />
        </div>
    );
}
