"use client";
import { useState } from 'react';
import { Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { getCurrentUserId } from '@/lib/firebase/database/index';
import { useRouter } from 'next/navigation';

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
    },
    icici: {
    equity: {
        name: 'ICICI Direct (Equity)',
        requiredHeaders: [
            'Date', 'Stock', 'Action', 'Qty', 'Price', 'Trade Value',
            'Order Ref.', 'Settlement', 'Segment', 'DP Id - Client DP Id',
            'Exchange', 'STT', 'Transaction and SEBI Turnover charges',
            'Stamp Duty', 'Brokerage + Service Tax', 'Brokerage incl. taxes',''
        ],
        description: 'ICICI Direct equity trade report format'
    },
    fno: {
        name: 'ICICI Direct (F&O)',
        requiredHeaders: [
            'Date', 'Stock', 'Action', 'Qty', 'Price', 'Trade Value',
            'Order Ref.', 'Settlement', 'Segment', 'DP Id - Client DP Id',
            'Exchange', 'STT', 'Transaction and SEBI Turnover charges',
            'Stamp Duty', 'Brokerage + Service Tax', 'Brokerage incl. taxes'
        ],
        description: 'ICICI Direct F&O trade report format'
    }
    }
};
// Add this BROKER_VIDEOS object
const BROKER_VIDEOS = {
    zerodha: {
        title: 'How to Download Zerodha CSV',
        videoId: 'HVe5VIw5hW0',
        url: 'https://www.youtube.com/watch?v=HVe5VIw5hW0'
    },
    dhan: {
        title: 'How to Download Dhan CSV',
        videoId: 'E-pgZo-nFgk',
        url: 'https://www.youtube.com/watch?v=E-pgZo-nFgk'
    },
    fyers: {
        title: 'How to Download Fyers CSV',
        videoId: 'NaW_-bmYfak',
        url: 'https://www.youtube.com/watch?v=NaW_-bmYfak'
    },
    upstox: {
        title: 'How to Download Upstox CSV',
        videoId: '',
        url: ''
    },
    angelone: {
        title: 'How to Download Angel One CSV',
        videoId: '',
        url: ''
    },
    icici: {
        title: 'How to Download ICICI Direct CSV',
        videoId: '',
        url: ''
    },
    // Add more brokers as needed
};

const brokers = [
    { id: 'zerodha', name: 'Zerodha', logo: '🇮🇳' },
    { id: 'dhan', name: 'Dhan', logo: '🏦' },
    { id: 'fyers', name: 'Fyers', logo: '🚀' },
    { id: 'upstox', name: 'Upstox', logo: '📈' },
    { id: 'angelone', name: 'Angel One', logo: '👼' },
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
    { id: 'icici', name: 'ICICI Direct', logo: '🏦' },
];

const segments = [
    { id: 'equity', name: 'Equity', icon: '📊' },
    { id: 'fno', name: 'F&O', icon: '⚡' }
];
const VideoPopup = ({ isOpen, onClose, video }) => {
    if (!isOpen || !video) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
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

export default function CSVUploadComponent({ onUploadSuccess, onUploadError }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [uploadError, setUploadError] = useState(false);
    const [validationError, setValidationError] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [validationSuccess, setValidationSuccess] = useState(false);
    const [selectedCsvBroker, setSelectedCsvBroker] = useState('');
    const [isUploadingCSV, setIsUploadingCSV] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState('');
const [selectedSegment, setSelectedSegment] = useState('');
const [showVideoPopup, setShowVideoPopup] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState(null);
    const [popupTrigger, setPopupTrigger] = useState(0);

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
    error: `Header mismatch for ${expectedFormat.name}.
Found: ${headers.join(', ')}
Expected: ${expectedFormat.requiredHeaders.join(', ')}`,
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
            onUploadError && onUploadError('Please select a CSV file');
            return;
        }

        // Check if broker format is selected
        if (!selectedCsvBroker) {
            setValidationError('Please select a broker format first');
            onUploadError && onUploadError('Please select a broker format first');
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
                setUploadError(true);
                setValidationError(validation.error);
                setUploadedFile(null);
                onUploadError && onUploadError(validation.error);
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
                    setIsUploadingCSV(true);
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
    validationResult: validation
}),

                    });

                    const result = await response.json();
                    if (response.ok) {
                        setIsSuccess(true);
                        console.log('✅ File uploaded to:', result.url);
                        onUploadSuccess && onUploadSuccess({
                            file,
                            brokerFormat: selectedCsvBroker,
                            validation,
                            uploadResult: result
                        });
                        router.push('/dashboard');
                    } else {
                        console.error('❌ Upload failed:', result.error);
                        onUploadError && onUploadError(result.error);
                    }
                } catch (err) {
                    console.error('❌ Upload error:', err);
                    onUploadError && onUploadError(err.message);
                } finally {
                    setIsUploadingCSV(false);
                }
            };
            base64Reader.readAsDataURL(file);
        };

        reader.readAsText(file);
    };

    const handleViewFormat = () => {
    // Show specific broker video if available, otherwise show generic demo
    if (selectedBroker && BROKER_VIDEOS[selectedBroker]) {
        setSelectedVideo(BROKER_VIDEOS[selectedBroker]);
        setPopupTrigger(prev => prev + 1);
        setShowVideoPopup(true);
    } else {
        // Fallback to generic demo video
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
    }
};

    const resetUpload = () => {
        setUploadedFile(null);
        setUploadError(false);
        setValidationError('');
        setValidationSuccess(false);
        setSelectedBroker('');        // Add this
    setSelectedSegment('');  
        setSelectedCsvBroker('');
        setIsSuccess(false);
    };

    return (
        <div className="w-full max-w-2xl mx-auto">

            <div className={`bg-white dark:bg-neutral-900 rounded-xl shadow-lg border-2 transition-all ${uploadError || validationError
                ? 'border-red-500 shadow-red-100 dark:shadow-red-900'
                : selectedCsvBroker && validationSuccess
                    ? 'border-green-500 shadow-green-100 dark:shadow-green-900'
                    : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${uploadError || validationError
                            ? 'bg-red-100 dark:bg-red-900'
                            : validationSuccess
                                ? 'bg-green-100 dark:bg-green-900'
                                : 'bg-green-100 dark:bg-green-900'
                            }`}>
                            <Upload className={`w-6 h-6 ${uploadError || validationError
                                ? 'text-red-600'
                                : validationSuccess
                                    ? 'text-green-600'
                                    : 'text-green-600'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Upload CSV</h3>
                            <p className="text-neutral-600 dark:text-neutral-300">Historical data analysis</p>
                        </div>
                        {uploadedFile && (
                            <button
                                onClick={resetUpload}
                                className="ml-auto text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 underline"
                            >
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="mb-4">
    <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Broker Selection */}
        <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Select Broker
            </label>
            <select
                value={selectedBroker}
                onChange={(e) => {
                    setSelectedBroker(e.target.value);
                    setSelectedSegment(''); // Reset segment when broker changes
                    setSelectedCsvBroker(''); // Reset combined format
                    setUploadError(false);
                    setValidationError('');
                    setValidationSuccess(false);
                    setUploadedFile(null);
                }}
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-neutral-800 dark:text-neutral-100"
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
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
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
                className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm bg-white dark:bg-neutral-800 dark:text-neutral-100"
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
    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
        Select both broker and segment to enable CSV upload
    </p>
</div>

                {/* File Upload Section */}
<div className="mt-4">
  <label
    htmlFor="csv-upload"
    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
      uploadError || validationError
        ? "border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900"
        : validationSuccess
        ? "border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900"
        : selectedCsvBroker
        ? "border-neutral-300 hover:border-green-400 hover:bg-green-50 dark:border-neutral-600 dark:hover:border-green-700 dark:hover:bg-green-900"
        : "border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 cursor-not-allowed"
    }`}
  >
    <div className="flex flex-col items-center justify-center">
      {isValidating ? (
        <>
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
          <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
            Validating CSV format...
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400">Please wait</p>
        </>
      ) : uploadError || validationError ? (
        <>
          <AlertTriangle className="w-10 h-10 text-red-500 mb-2" />
          <p className="text-sm text-red-700 dark:text-red-300 font-medium">
            Invalid file format
          </p>
          <p className="text-xs text-red-600 dark:text-red-400 text-center px-2">
            {validationError || "Please select a valid CSV file"}
          </p>
        </>
      ) : validationSuccess && uploadedFile ? (
        <>
          <CheckCircle className="w-10 h-10 text-green-500 mb-2" />
          <p className="text-sm text-green-700 dark:text-green-300 font-medium">
            {uploadedFile.name}
          </p>
          <p className="text-xs text-green-600 dark:text-green-400">
            {
              brokers.find((b) => b.id === selectedBroker)?.name
            }{" "}
            {segments.find((s) => s.id === selectedSegment)?.name} format •
            Validated ✓
          </p>
        </>
      ) : selectedCsvBroker ? (
        <>
          <Upload className="w-10 h-10 text-neutral-400 dark:text-neutral-500 mb-2" />
          <p className="text-sm text-neutral-600 dark:text-neutral-300 font-medium">
            Click to upload CSV
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {
              brokers.find((b) => b.id === selectedBroker)?.name
            }{" "}
            {segments.find((s) => s.id === selectedSegment)?.name} format
            selected
          </p>
        </>
      ) : (
        <>
          <Upload className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mb-2" />
          <p className="text-sm text-neutral-400 dark:text-neutral-500 font-medium">
            Select broker & segment first
          </p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500">
            Choose above to enable upload
          </p>
        </>
      )}
    </div>
    <input
      id="csv-upload"
      type="file"
      className="hidden"
      accept=".csv"
      onChange={handleFileUpload}
      disabled={!selectedBroker || !selectedSegment || isUploadingCSV}
    />
  </label>
</div>



                    <div className={`rounded-lg p-4 mb-4 ${uploadError || validationError
                        ? 'bg-red-50 dark:bg-red-900'
                        : validationSuccess
                            ? 'bg-green-50 dark:bg-green-900'
                            : 'bg-blue-50 dark:bg-blue-900'
                        }`}>
                        <h4 className={`font-semibold mb-2 ${uploadError || validationError
                            ? 'text-red-900 dark:text-red-200'
                            : validationSuccess
                                ? 'text-green-900 dark:text-green-200'
                                : 'text-blue-900 dark:text-blue-200'
                            }`}>
                            {uploadError || validationError
                                ? 'Required Format:'
                                : validationSuccess
                                    ? 'Format Validated:'
                                    : 'Expected Format:'
                            }
                        </h4>
                        {selectedBroker && selectedSegment && CSV_FORMATS[selectedBroker]?.[selectedSegment] ? (
    <div className={`text-sm ${uploadError || validationError
        ? 'text-red-800 dark:text-red-300'
        : validationSuccess
            ? 'text-green-800 dark:text-green-300'
            : 'text-blue-800 dark:text-blue-300'
        }`}>
        <p className="mb-2">{CSV_FORMATS[selectedBroker][selectedSegment].description}</p>
        <div className="text-xs">
            <strong>Required columns:</strong> {CSV_FORMATS[selectedBroker][selectedSegment].requiredHeaders.join(', ')}
        </div>
    </div>
) : (
    

                            <ul className={`text-sm space-y-1 ${uploadError || validationError
                                ? 'text-red-800 dark:text-red-300'
                                : 'text-blue-800 dark:text-blue-300'
                                }`}>
                                <li>• Zerodha trade exports</li>
                                <li>• Fyers transaction history</li>
                                <li>• Dhan tradebook statements</li>
                            </ul>
                        )}
                    </div>

                    <button
                        onClick={handleViewFormat}
                        disabled={!selectedCsvBroker || isUploadingCSV}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${selectedCsvBroker && !isUploadingCSV
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
                            }`}
                    >
                    {selectedBroker && selectedSegment
                        ? `View ${brokers.find(b => b.id === selectedBroker)?.name} ${segments.find(s => s.id === selectedSegment)?.name} Format`
                        : 'Select Broker & Segment to View Format'
                    }


                    </button>
                </div>
            </div>
            {/* Video Popup */}
        <VideoPopup 
            key={popupTrigger}
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