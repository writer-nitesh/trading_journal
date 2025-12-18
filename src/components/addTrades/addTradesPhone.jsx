"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import React from 'react'
import CSVUploadComponent from "./uploadCSV"
import Brokers from "../onboarding/brokers"

export default function PhoneAddTrades({
    selectedOption = null,
    showBrokerModal,
    setShowBrokerModal,
    selectedBroker = null,
    onUploadSuccess, onUploadError
}) {
    return (
        <Tabs defaultValue="connect_broker" className="w-full gap-4">
            <TabsList className="*:mb-4 grid w-full grid-cols-2">
                <TabsTrigger value="connect_broker">Connect Broker</TabsTrigger>
                <TabsTrigger value="upload_csv">Upload CSV</TabsTrigger>
            </TabsList>
            <TabsContent value="connect_broker">
                <Brokers selectedOption={selectedOption} showBrokerModal={showBrokerModal} setShowBrokerModal={setShowBrokerModal} selectedBroker={selectedBroker} />
            </TabsContent>
            <TabsContent value="upload_csv">
                <CSVUploadComponent onUploadSuccess={onUploadSuccess} onUploadError={onUploadError} />
            </TabsContent>
        </Tabs>
    )
}
