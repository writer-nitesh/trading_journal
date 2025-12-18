"use client";
import { useEffect, useState } from 'react';
import { Upload, Link, TrendingUp, Shield, BarChart3, Settings, CheckCircle, Zap, ArrowRight, User, Bell } from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import Brokers from '@/components/onboarding/brokers';
import { getCurrentUserId } from '@/lib/firebase/database/index';
import { useRouter } from "next/navigation";


const CSV_FORMATS = {
    dhan: {
        name: 'Dhan',
        requiredHeaders: ['Date', 'Time', 'Name', 'Buy/Sell', 'Order', 'Exchange', 'Segment', 'Quantity/Lot', 'Trade Price', 'Trade Value', 'Status'],
        description: 'Dhan tradebook export format'
    },
    fyers: {
        name: 'Fyers',
        requiredHeaders: ['date', 'time', 'segment', 'symbol', 'type', 'qty', 'trade_price', 'trade_val', 'order_id'],
        description: 'Fyers tradebook export format'
    },
    zerodha: {
        name: 'Zerodha',
        requiredHeaders: ['symbol', 'isin', 'trade_date', 'exchange', 'segment', 'series', 'trade_type', 'auction', 'quantity', 'price', 'trade_id', 'order_id', 'order_execution_time', 'expiry_date'],
        description: 'Zerodha console trade export format'
    },
    upstox: {
        name: 'Upstox',
        requiredHeaders: ['date', 'time', 'symbol', 'side', 'quantity', 'price', 'value', 'order_id'],
        description: 'Upstox transaction history format'
    },
    angelone: {
        name: 'Angel One',
        requiredHeaders: ['trade_date', 'symbol', 'buy_sell', 'quantity', 'price', 'trade_value', 'order_no'],
        description: 'Angel One trade statement format'
    },
    icici: {
        name: 'ICICI Direct',
        requiredHeaders: ['Trade Date', 'Symbol', 'Buy/Sell', 'Quantity', 'Rate', 'Amount', 'Order No'],
        description: 'ICICI Direct trade report format'
    },
    groww: {
        name: 'Groww',
        requiredHeaders: ['date', 'symbol', 'action', 'quantity', 'price', 'amount', 'exchange'],
        description: 'Groww trade history format'
    },
    '5paisa': {
        name: '5paisa',
        requiredHeaders: ['TradeDate', 'Symbol', 'BuySell', 'Qty', 'Rate', 'Amount', 'OrderId'],
        description: '5paisa trade book format'
    },
    kotak: {
        name: 'Kotak Securities',
        requiredHeaders: ['Date', 'Symbol', 'Action', 'Quantity', 'Price', 'Value', 'Order_ID'],
        description: 'Kotak Securities trade report format'
    },
    hdfc: {
        name: 'HDFC Securities',
        requiredHeaders: ['Trade_Date', 'Symbol', 'Buy_Sell', 'Quantity', 'Price', 'Trade_Value', 'Order_Number'],
        description: 'HDFC Securities trade summary format'
    }
};

const brokers = [
    { id: 'zerodha', name: 'Zerodha', logo: ' 🇮🇳' },
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
    { id: 'fyers', name: 'Fyers', logo: '🚀' },
    { id: 'tradejini', name: 'Tradejini', logo: '🔥' },
    { id: 'dhan', name: 'Dhan', logo: '🏦' },
];


export default function OnboardingPage() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadError, setUploadError] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [selectedCsvBroker, setSelectedCsvBroker] = useState('');
    const [connectedBrokers, setConnectedBrokers] = useState([]);
    const [showBrokerModal, setShowBrokerModal] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [apiSecret, setApiSecret] = useState('');
    const [redirectUrl, setRedirectUrl] = useState('https://tradingjournal.platform.com/callback');
    const [isUploadingCSV, setisUploadingCSV] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);


    const validateCSVFormat = (csvContent, brokerFormat) => {
        try {
            const lines = csvContent.split('\n').filter(line => line.trim());
            if (lines.length < 2) {
                return { isValid: false, error: 'CSV file appears to be empty or has no data rows' };
            }

            const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
            const expectedFormat = CSV_FORMATS[brokerFormat];

            if (!expectedFormat) {
                return { isValid: false, error: 'Unsupported broker format selected' };
            }

            // Check if all required headers are present
            const missingHeaders = expectedFormat.requiredHeaders.filter(
                requiredHeader => !headers.some(header =>
                    header.toLowerCase() === requiredHeader.toLowerCase()
                )
            );

            if (missingHeaders.length > 0) {
                return {
                    isValid: false,
                    error: `Missing required columns for ${expectedFormat.name}: ${missingHeaders.join(', ')}`,
                    expectedHeaders: expectedFormat.requiredHeaders,
                    foundHeaders: headers
                };
            }

            // Check if we have at least one data row
            if (lines.length < 2) {
                return { isValid: false, error: 'CSV file has headers but no trade data' };
            }

            // Validate data row structure
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
            setSelectedOption(null);
            setValidationError('Please select a CSV file');
            return;
        }

        // Check if broker format is selected
        if (!selectedCsvBroker) {
            setValidationError('Please select a broker format first');
            return;
        }

        setIsValidating(true);

        const reader = new FileReader();

        reader.onload = async (e) => {
            const csvContent = e.target.result;

            // Validate CSV format
            const validation = validateCSVFormat(csvContent, selectedCsvBroker);

            setIsValidating(false);

            if (!validation.isValid) {
                setUploadError(true);
                setValidationError(validation.error);
                setUploadedFile(null);
                setSelectedOption(null);
                return;
            }

            // If validation passes
            setUploadError(false);
            setValidationError('');
            setValidationSuccess(true);
            setUploadedFile(file);
            setSelectedOption('csv');

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
                            brokerFormat: selectedCsvBroker,
                            validationResult: validation
                        }),
                    });

                    const result = await response.json();
                    if (response.ok) {
                        setIsSuccess(true);
                        console.log('✅ File uploaded to:', result.url);
                    } else {

                        console.error('❌ Upload failed:', result.error);
                    }
                } catch (err) {

                    console.error('❌ Upload error:', err);
                }
            };
            base64Reader.readAsDataURL(file);
        };

        reader.readAsText(file);
    };

    const handleBrokerConnect = (brokerId) => {
        const broker = brokers.find(b => b.id === brokerId);
        setSelectedBroker(broker);
        setShowBrokerModal(true);
        setApiKey('');
        setApiSecret('');
        setRedirectUrl('https://tradingjournal.platform.com/callback');
    };

    const handleConnectBroker = () => {
        if (apiKey.trim() && apiSecret.trim() && redirectUrl.trim() && selectedBroker) {
            if (!connectedBrokers.includes(selectedBroker.id)) {
                setConnectedBrokers([...connectedBrokers, selectedBroker.id]);
                setSelectedOption('broker');
            }
            setShowBrokerModal(false);
            setSelectedBroker(null);
            setApiKey('');
            setApiSecret('');
            setRedirectUrl('https://tradingjournal.platform.com/callback');
        }
    };

    const handleProceed = () => {
        alert('Proceeding to dashboard...');
    };

    const isDataConnected = connectedBrokers.length > 0 || uploadedFile;
    const router = useRouter();

    return (
        <div className="h-screen bg-gray-50 flex flex-col">

            {/* Header */}
            <div className="bg-white shadow-sm border-b flex-shrink-0">
                <div className="px-6 py-4 flex items-center">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-900">Trading Journal Dashboard</h1>
                        <p className="text-sm text-gray-500">Connect your broker or upload trading data to unlock powerful analytics and insights</p>
                    </div>
                    <div className="flex items-center space-x-4 ml-4">
                        <button
                            onClick={handleProceed}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg flex items-center"
                        >
                            <ArrowRight className="w-4 h-4 mr-2" />
                            Launch Dashboard
                        </button>
                        <button 
                                className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                                onClick={() => router.push("/dashboard")}
                                >
                                Skip Setup
                        </button>
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Main Content */}
                <div className="flex-1 p-6 overflow-auto">
                    {/* Main Options */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Broker Connection */}
                        <Brokers selectedOption={selectedOption} showBrokerModal={showBrokerModal} setShowBrokerModal={setShowBrokerModal} selectedBroker={selectedBroker} />

                        {/* CSV Upload */}
                        <div className={`bg-white rounded-xl shadow-lg border-2 transition-all ${uploadError || validationError ? 'border-red-500 shadow-red-100' :
                            selectedOption === 'csv' && validationSuccess ? 'border-green-500 shadow-green-100' : 'border-gray-200'
                            }`}>
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${uploadError || validationError ? 'bg-red-100' : validationSuccess ? 'bg-green-100' : 'bg-green-100'
                                        }`}>
                                        <Upload className={`w-6 h-6 ${uploadError || validationError ? 'text-red-600' : validationSuccess ? 'text-green-600' : 'text-green-600'
                                            }`} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900">Upload CSV</h3>
                                        <p className="text-gray-600">Historical data analysis</p>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    {/* Broker Selection Dropdown */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Broker Format</label>
                                        <select
                                            value={selectedCsvBroker}
                                            onChange={(e) => {
                                                setSelectedCsvBroker(e.target.value);
                                                // Reset validation states when broker changes
                                                setUploadError(false);
                                                setValidationError('');
                                                setValidationSuccess(false);
                                                setUploadedFile(null);
                                                setSelectedOption(null);
                                            }}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white"
                                        >
                                            <option value="">Choose broker format...</option>
                                            {brokers.filter(broker => CSV_FORMATS[broker.id]).map((broker) => (
                                                <option key={broker.id} value={broker.id}>
                                                    {broker.logo} {broker.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Select the broker whose CSV format you're uploading</p>
                                    </div>

                                    <label htmlFor="csv-upload" className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${uploadError || validationError
                                        ? 'border-red-300 bg-red-50'
                                        : validationSuccess
                                            ? 'border-green-300 bg-green-50'
                                            : selectedCsvBroker
                                                ? 'border-gray-300 hover:border-green-400 hover:bg-green-50'
                                                : 'border-gray-200 bg-gray-50 cursor-not-allowed'
                                        }`}>
                                        <div className="flex flex-col items-center justify-center">
                                            {isValidating ? (
                                                <>
                                                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                                    <p className="text-sm text-blue-700 font-medium">Validating CSV format...</p>
                                                    <p className="text-xs text-blue-600">Please wait</p>
                                                </>
                                            ) : (uploadError || validationError) ? (
                                                <>
                                                    <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
                                                    <p className="text-sm text-red-700 font-medium">Invalid file format</p>
                                                    <p className="text-xs text-red-600 text-center px-2">
                                                        {validationError || 'Please select a valid CSV file'}
                                                    </p>
                                                </>
                                            ) : validationSuccess && uploadedFile ? (
                                                <>
                                                    <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
                                                    <p className="text-sm text-green-700 font-medium">{uploadedFile.name}</p>
                                                    <p className="text-xs text-green-600">
                                                        {brokers.find(b => b.id === selectedCsvBroker)?.name} format • Validated ✓
                                                    </p>
                                                </>
                                            ) : selectedCsvBroker ? (
                                                <>
                                                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                                                    <p className="text-sm text-gray-600 font-medium">Click to upload CSV</p>
                                                    <p className="text-xs text-gray-500">
                                                        {brokers.find(b => b.id === selectedCsvBroker)?.name} format selected
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <Upload className="w-10 h-10 text-gray-300 mb-2" />
                                                    <p className="text-sm text-gray-400 font-medium">Select broker format first</p>
                                                    <p className="text-xs text-gray-400">Choose format above to enable upload</p>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            id="csv-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".csv"
                                            onChange={handleFileUpload}
                                            disabled={!selectedCsvBroker || isValidating}
                                        />
                                    </label>
                                </div>

                                {/* Format Info Display */}
                                <div className={`rounded-lg p-4 mb-4 ${uploadError || validationError ? 'bg-red-50' : validationSuccess ? 'bg-green-50' : 'bg-blue-50'
                                    }`}>
                                    <h4 className={`font-semibold mb-2 ${uploadError || validationError ? 'text-red-900' : validationSuccess ? 'text-green-900' : 'text-blue-900'
                                        }`}>
                                        {uploadError || validationError ? 'Required Format:' : validationSuccess ? 'Format Validated:' : 'Expected Format:'}
                                    </h4>
                                    {selectedCsvBroker && CSV_FORMATS[selectedCsvBroker] ? (
                                        <div className={`text-sm ${uploadError || validationError ? 'text-red-800' : validationSuccess ? 'text-green-800' : 'text-blue-800'
                                            }`}>
                                            <p className="mb-2">{CSV_FORMATS[selectedCsvBroker].description}</p>
                                            <div className="text-xs">
                                                <strong>Required columns:</strong> {CSV_FORMATS[selectedCsvBroker].requiredHeaders.join(', ')}
                                            </div>
                                        </div>
                                    ) : (
                                        <ul className={`text-sm space-y-1 ${uploadError || validationError ? 'text-red-800' : 'text-blue-800'
                                            }`}>
                                            <li>• Zerodha trade exports</li>
                                            <li>• Fyers transaction history</li>
                                            <li>• Dhan tradebook statements</li>
                                        </ul>
                                    )}
                                </div>

                                <button
                                    onClick={() => {
                                        if (selectedCsvBroker) {
                                            alert(`Viewing sample format for ${brokers.find(b => b.id === selectedCsvBroker)?.name}`);
                                        }
                                    }}
                                    disabled={!selectedCsvBroker}
                                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${selectedCsvBroker
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {selectedCsvBroker
                                        ? `View ${brokers.find(b => b.id === selectedCsvBroker)?.name} Format`
                                        : 'Select Broker to View Format'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Features Preview */}
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">What You'll Get Access To</h3>
                        <div className="grid grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <BarChart3 className="w-8 h-8 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Advanced Analytics</h4>
                                <p className="text-gray-600 text-sm">Win rates, Sharpe ratio, P&L trends</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Settings className="w-8 h-8 text-purple-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">AI Insights</h4>
                                <p className="text-gray-600 text-sm">Risk alerts and recommendations</p>
                            </div>
                            <div className="text-center">
                                <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <TrendingUp className="w-8 h-8 text-orange-600" />
                                </div>
                                <h4 className="font-bold text-gray-900 mb-2">Real-time Tracking</h4>
                                <p className="text-gray-600 text-sm">Live portfolio monitoring</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    {(selectedOption || connectedBrokers.length > 0 || uploadedFile) && (
                        <div className="text-center">
                            <button
                                onClick={handleProceed}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-xl text-lg font-bold hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                            >
                                Launch Dashboard
                            </button>
                            <p className="text-gray-500 text-sm mt-2">
                                {connectedBrokers.length > 0 && `Connected to ${connectedBrokers.length} broker${connectedBrokers.length > 1 ? 's' : ''}`}
                                {uploadedFile && connectedBrokers.length > 0 && ' • '}
                                {uploadedFile && `CSV file ready`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-auto">
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-purple-100 rounded flex items-center justify-center mr-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Getting Started</h3>
                            <span className="ml-auto text-xs text-gray-500">Step 1 of 2</span>
                        </div>

                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-gray-900">Setup Progress</span>
                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                        {isDataConnected ? '50%' : '0%'}
                                    </span>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: isDataConnected ? '50%' : '0%' }}
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
                                            ? 'text-green-700 font-medium'
                                            : 'text-blue-600 font-medium'
                                            }`}>
                                            Connect Data Source
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${isDataConnected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-gray-300 text-gray-500'
                                            }`}>
                                            <span className="text-xs font-bold">2</span>
                                        </div>
                                        <span className={`${isDataConnected
                                            ? 'text-blue-600 font-medium'
                                            : 'text-gray-500'
                                            }`}>
                                            Launch Dashboard
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 text-xs text-gray-600">
                                    {isDataConnected ?
                                        'Great! You\'ve connected your data source. Ready to launch your dashboard.' :
                                        'Choose your data source to get started with trading analytics.'
                                    }
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-green-50 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-green-900">Quick Tips</span>
                                    <span className="ml-auto text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full">Tips</span>
                                </div>
                                <div className="text-sm text-green-800">
                                    For best results, connect multiple brokers or upload comprehensive CSV data with at least 30 days of trading history.
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-orange-50 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-orange-900">Security</span>
                                    <span className="ml-auto text-xs bg-orange-200 text-orange-800 px-2 py-1 rounded-full">Secure</span>
                                </div>
                                <div className="text-sm text-orange-800">
                                    Your trading data is encrypted and stored securely. We never share your information with third parties.
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-purple-50 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-purple-900">What's Next</span>
                                    <span className="ml-auto text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full">Preview</span>
                                </div>
                                <div className="text-sm text-purple-800 space-y-1">
                                    <div>• View comprehensive analytics</div>
                                    <div>• Get AI-powered insights</div>
                                    <div>• Track real-time performance</div>
                                    <div>• Set up custom alerts</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="border-t border-gray-200 pt-4">
                        <div className="text-center">
                            <p className="text-xs text-gray-600 mb-2">Trusted by 10,000+ traders</p>
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <Shield className="w-3 h-3" />
                                <span>Bank-level security</span>
                                <span>•</span>
                                <span>24/7 support</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}