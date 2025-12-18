"use client";
import { useState } from 'react';
import { Shield, CheckCircle, Zap } from 'lucide-react';
import Brokers from '@/components/onboarding/brokers';
import PhoneAddTrades from '@/components/addTrades/addTradesPhone';
import CSVUploadComponent from '@/components/addTrades/uploadCSV';
import { useRouter } from 'next/navigation';
import CSVLoader from '@/components/csvLoader';

export default function OnboardingPage() {
    const [selectedOption, setSelectedOption] = useState(null);
    const [uploadedFile, setUploadedFile] = useState(null);
    const [connectedBrokers, setConnectedBrokers] = useState([]);
    const [showBrokerModal, setShowBrokerModal] = useState(false);
    const [selectedBroker, setSelectedBroker] = useState(null);
    const [isUploadingCSV, setisUploadingCSV] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const router = useRouter();
    const handleProceed = () => {
        router.push('/dashboard');
    };

    const handleCSVUploadSuccess = (uploadData) => {
        setUploadedFile(uploadData.file);
        setSelectedOption('csv');
        setisUploadingCSV(true)
    };

    const handleCSVUploadError = (error) => {
        console.error('CSV Upload Error:', error);
        setUploadedFile(null);
        if (selectedOption === 'csv') {
            setSelectedOption(null);
        }
        setisUploadingCSV(false)
    };

    const isDataConnected = connectedBrokers.length > 0 || uploadedFile;

    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 flex flex-col h-[calc(100vh-4.5rem)]">

            <CSVLoader isSuccess={isSuccess} isVisible={isUploadingCSV} setIsVisible={setisUploadingCSV} />

            {/* Main Content */}
            <div className="flex-1 flex lg:flex-row flex-col">

                {/* Left Main Content */}
                <div className="flex-1 p-6 overflow-y-auto custom-scroll">
                    <div className='lg:hidden block mb-4 items-center justify-center'>
                        <PhoneAddTrades
                            selectedOption={selectedOption}
                            showBrokerModal={showBrokerModal}
                            setShowBrokerModal={setShowBrokerModal}
                            selectedBroker={selectedBroker}
                            onUploadSuccess={handleCSVUploadSuccess}
                            onUploadError={handleCSVUploadError}
                        />
                    </div>
                    {/* Main Options */}
                    <div className="lg:grid hidden grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        {/* Broker Connection */}
                        <Brokers selectedOption={selectedOption} showBrokerModal={showBrokerModal} setShowBrokerModal={setShowBrokerModal} selectedBroker={selectedBroker} />

                        {/* CSV Upload */}
                        <CSVUploadComponent onUploadSuccess={handleCSVUploadSuccess} onUploadError={handleCSVUploadError} />
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
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-2">
                                {connectedBrokers.length > 0 && `Connected to ${connectedBrokers.length} broker${connectedBrokers.length > 1 ? 's' : ''}`}
                                {uploadedFile && connectedBrokers.length > 0 && ' • '}
                                {uploadedFile && `CSV file ready`}
                            </p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar */}
                <div className="lg:w-80 overflow-y-auto custom-scroll lg:block hidden bg-white dark:bg-neutral-800 border-l border-neutral-200 dark:border-neutral-700 p-6 ">
                    <div className="mb-6">
                        <div className="flex items-center mb-4">
                            <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded flex items-center justify-center mr-2">
                                <Zap className="w-4 h-4 text-purple-600" />
                            </div>
                            <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">Getting Started</h3>
                            <span className="ml-auto text-xs text-neutral-500 dark:text-neutral-400">Step 1 of 2</span>
                        </div>

                        <div className="space-y-4">
                            {/* Progress Bar */}
                            <div className="bg-white dark:bg-neutral-900 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Setup Progress</span>
                                    <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
                                        {isDataConnected ? '50%' : '0%'}
                                    </span>
                                </div>

                                {/* Progress Bar Visual */}
                                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
                                    <div
                                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500 ease-out"
                                        style={{ width: isDataConnected ? '50%' : '0%' }}
                                    ></div>
                                </div>

                                {/* Steps */}
                                <div className="space-y-2 ">
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
                                            : 'text-blue-600 font-medium'
                                            }`}>
                                            Connect Data Source
                                        </span>
                                    </div>

                                    <div className="flex items-center text-sm">
                                        <div className={`w-4 h-4 rounded-full mr-3 flex items-center justify-center ${isDataConnected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-neutral-300 text-neutral-500 dark:bg-neutral-600 dark:text-neutral-300'
                                            }`}>
                                            <span className="text-xs font-bold">2</span>
                                        </div>
                                        <span className={`${isDataConnected
                                            ? 'text-blue-600 font-medium'
                                            : 'text-neutral-500 dark:text-neutral-400'
                                            }`}>
                                            Launch Dashboard
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-3 text-xs text-neutral-600 dark:text-neutral-400">
                                    {isDataConnected ?
                                        'Great! You\'ve connected your data source. Ready to launch your dashboard.' :
                                        'Choose your data source to get started with trading analytics.'
                                    }
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-green-900 dark:text-green-200">Quick Tips</span>
                                    <span className="ml-auto text-xs bg-green-200 dark:bg-green-700 text-green-800 dark:text-green-100 px-2 py-1 rounded-full">Tips</span>
                                </div>
                                <div className="text-sm text-green-800 dark:text-green-200">
                                    For best results, connect multiple brokers or upload comprehensive CSV data with at least 30 days of trading history.
                                </div>
                            </div>

                            {/* Security Notice */}
                            <div className="bg-orange-50 dark:bg-orange-900 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-orange-900 dark:text-orange-200">Security</span>
                                    <span className="ml-auto text-xs bg-orange-200 dark:bg-orange-700 text-orange-800 dark:text-orange-100 px-2 py-1 rounded-full">Secure</span>
                                </div>
                                <div className="text-sm text-orange-800 dark:text-orange-200">
                                    Your trading data is encrypted and stored securely. We never share your information with third parties.
                                </div>
                            </div>

                            {/* Next Steps */}
                            <div className="bg-purple-50 dark:bg-purple-900 rounded-lg p-4">
                                <div className="flex items-center mb-2">
                                    <span className="text-sm font-medium text-purple-900 dark:text-purple-200">What's Next</span>
                                    <span className="ml-auto text-xs bg-purple-200 dark:bg-purple-700 text-purple-800 dark:text-purple-100 px-2 py-1 rounded-full">Preview</span>
                                </div>
                                <div className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
                                    <div>• View comprehensive analytics</div>
                                    <div>• Get AI-powered insights</div>
                                    <div>• Track real-time performance</div>
                                    <div>• Set up custom alerts</div>
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

                {/* Mobile Right Sidebar */}
                <div className="lg:hidden bg-white dark:bg-neutral-800 border-t border-neutral-200 dark:border-neutral-700 p-4">
                    <div className="max-w-sm mx-auto">
                        {/* Progress Indicator */}
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">Connection Progress</span>
                            <span className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded-full">
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
                                <span>Bank-level security</span>
                                <span>•</span>
                                <span>24/7 support</span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-400">
                                Trusted by 10,000+ traders
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}