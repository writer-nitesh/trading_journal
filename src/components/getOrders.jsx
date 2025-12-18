"use client";
import useGlobalState from "@/hooks/globalState";
import { orders as ZerodhaOrders } from "@/lib/brokers/zerodhaKite";
import { orders as fyersOrders } from "@/lib/brokers/fyers";
import { orders as upstoxOrders } from "@/lib/brokers/upstox";
import { orders as angleOneOrders } from "@/lib/brokers/angleOne";
import { orders as deltaExchangeOrders } from "@/lib/brokers/deltaExchange";


import {
  createUserData,
  updateUserDocument,
} from "@/lib/firebase/database/index";
import {
  extractAllOrders,
  getNonMatchingOrders,
  groupCompletedTradeSets,
} from "@/lib/logic";
import { trackEvent } from "@/lib/mixpanelClient";
import {
  generateRandomId,
  getCookie,
  parseOrderDate,
  removeCookie,
  setConnectedBroker,
} from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { BROKER, brokers } from "@/lib/brokers/brokers";
import { getDhanOrders } from "@/lib/brokers/dhan";
import { useEffect, useState } from "react";
import { mapData } from "@/lib/brokers/brokerDataMap";
import { getGrowwOrders } from "@/lib/brokers/groww";
import { getKotakOrders } from "@/lib/brokers/kotakneo";


export default function GetOrders({ showElseCondition = false }) {
  const router = useRouter();
  const {
    requestTokens,
    setRequestTokens,
    credentials,
    setSelectedBroker,
    data,

  } = useGlobalState();

  const findCredential = (broker) =>
    credentials?.find((cred) => cred.broker.toLowerCase() === broker);

  const credential = requestTokens?.broker
    ? findCredential(requestTokens.broker)
    : null;

  const isBrokerConnected = Boolean(requestTokens?.broker && credential);
  // Helper function to clean up zerodha token
  async function fetchOrders() {
    // ADD THIS LINE 👇
    trackEvent("clicked_sync_orders", {
      broker_name: requestTokens?.broker
    });
    try {
      const brokerSession = JSON.parse(getCookie("connectedBroker") || "{}");
      console.log("brokerSession:-----", brokerSession);

      if (!brokerSession?.broker) {
        toast.error("Broker not connected. Please connect again.");
        removeCookie("connectedBroker");
        setSelectedBroker(null);
        setRequestTokens(null);
        return;
      }

      const credential = findCredential(brokerSession.broker);
      if (!credential) {
        toast.error("No stored credentials found for this broker.");
        removeCookie("connectedBroker");
        setSelectedBroker(null);
        setRequestTokens(null);
        return;
      }

      let ORDERS = [];

      if (brokerSession.broker === BROKER.ZERODHA) {
        console.log("zerodhaSession:-----", brokerSession);
        console.log("Zerodha Session:-----", brokerSession.key);

        const orderRequest = await ZerodhaOrders(
          credential.api_key,
          brokerSession.key
        );

        console.log("orderRequest:-----", orderRequest);
        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
          return;
        }

        ORDERS.push(...orderRequest.orders);
      }

      if (brokerSession.broker === BROKER.DHAN) {
        console.log("Fetching Dhan Orders", brokerSession.key);
        console.log("Fetching Dhan Orders", brokerSession);

        const orderRequest = await getDhanOrders(brokerSession.key);

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
        }
        ORDERS.push(...orderRequest.orders);
      }

      if (brokerSession.broker === BROKER.DELTAEXCHANGE) {
        const orderRequest = await deltaExchangeOrders(credential.api_secret, credential.api_key);
        ORDERS.push(...orderRequest.orders);
      }

      if (brokerSession.broker === BROKER.KOTAKNEO) {

        console.log(brokerSession);
        const orderRequest = await getKotakOrders(brokerSession.key.accessToken, brokerSession.key.sessionId, brokerSession.key.sessionToken);
        console.log("kotak Data", orderRequest);

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
          return;
        }

        ORDERS.push(...orderRequest.orders);
      }

      if (brokerSession.broker === BROKER.GROWW) {
        console.log("Fetching Dhan Orders", brokerSession.key);
        console.log("Fetching Dhan Orders", brokerSession);

        const orderRequest = await getGrowwOrders(brokerSession.key);

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
        }
        ORDERS.push(...orderRequest.orders);
      }
      if (brokerSession.broker === BROKER.FYERS) {

        const orderRequest = await fyersOrders(
          credential.app_id,
          brokerSession.key
        );

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
          return;
        }

        ORDERS.push(...orderRequest.orderBook);
      }

      if (brokerSession.broker === BROKER.UPSTOX) {
        const orderRequest = await upstoxOrders(brokerSession.key);
        console.log("orderRequest:-----", orderRequest);

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
          return;
        }
        ORDERS.push(...orderRequest.orders);
      }

      if (brokerSession.broker === BROKER.ANGLEONE) {
        const orderRequest = await angleOneOrders(brokerSession.key);
        console.log("orderRequest:-----", orderRequest);

        if (orderRequest.status === "error") {
          toast.error(orderRequest.error);
          removeCookie("connectedBroker");
          setSelectedBroker(null);
          setRequestTokens(null);
          return;
        }
        ORDERS.push(...orderRequest.orders);
      }

      console.log("ORDERS:-----", ORDERS);

      const mappedData = ORDERS.map((order) =>
        mapData(brokerSession.broker, order)
      );

      console.log("mappedData:-----", mappedData);

      const currentDate = new Date().toLocaleDateString("en-US");

      const ordersDate = new Set(mappedData.map((order) => new Date(order.order_timestamp).toLocaleString("en-US").split(",")[0]))

      console.log("ordersDate:-----", ordersDate);

      if (mappedData.length > 0 && ordersDate.has(currentDate)) {
        console.log("currentDate:-----", currentDate);

        console.log("data:-----", data);

        console.log("mappedData:-----", data);

        const todaysTrades = data.find((entry) => entry?.trades?.date === currentDate) || [];
        console.log("todaysTrades:-----", todaysTrades);




        if (todaysTrades.length === 0) {
          // Handle if no entry for today exists, maybe create new document
          const cleanData = groupCompletedTradeSets(mappedData, null);
          console.log("-------- cleanData ----------", cleanData);
          if (!cleanData.date) {
            toast.info("No valid trade date found. Skipping save.");
            return;
          }

          if (Object.keys(cleanData).length <= 1) {
            // only date key present
            toast.info("No New Trades for Today");
            return;
          }

          await createUserData("journal", cleanData);
          toast.success("Orders fetched successfully");
          trackEvent("orders_synced_successfully", {
            broker_name: brokerSession.broker,
            sync_type: "new_document",
            trade_count: Object.keys(cleanData).length - 1 // minus date key
          });
          return;
        }

        const docId = todaysTrades.id;

        // tradeKeys is an array of keys for todays trades sorted in descending order of todaysTrades without date
        const tradeKeys = Object.keys(todaysTrades.trades || {})
          .filter((key) => key !== "date")
          .sort((a, b) => {
            const numA = parseInt(a.split("_")[1]);
            const numB = parseInt(b.split("_")[1]);
            return numB - numA;
          });

        console.log("tradeKeys:-----", tradeKeys);
        const currentLastKey = tradeKeys.length > 0 ? tradeKeys[0] : null;

        console.log("currentLastKey:-----", currentLastKey);
        const previousTrades = extractAllOrders(data);
        const currentTrades = mappedData;
        const nonMatchingOrders = getNonMatchingOrders(
          previousTrades,
          currentTrades
        );

        if (nonMatchingOrders.length === 0) {
          toast.info("No New Trades for Today");
          return;
        }
        const cleanData = groupCompletedTradeSets(
          nonMatchingOrders,
          currentLastKey
        );
        console.log("cleanData:-----", cleanData);

        if (cleanData.length === 0) {
          toast.info("No New Trades for Today");
          return;
        }

        console.log("nonMatchingOrders:-----", nonMatchingOrders);
        console.log("previousTrades:-----", previousTrades);
        console.log("currentTrades:-----", currentTrades);


        console.log("cleanData:-----", cleanData);
        console.log(tradeKeys.length === 0, "tradeKeys.length === 0");

        const updatePayload = {};

        Object.entries(cleanData).forEach(([key, value]) => {
          if (key !== "date") {
            updatePayload[`trades.${key}`] = value;
            console.log(`trades.${key}`, value);
            console.log(`trades${key}`, value);
          }
        });

        console.log("updatePayload:-----", updatePayload);

        updatePayload.updated_at = new Date();

        console.log(updatePayload, "UP");

        await updateUserDocument("journal", docId, updatePayload);
        toast.success("Orders fetched successfully");
        trackEvent("orders_synced_successfully", {
          broker_name: brokerSession.broker,
          sync_type: "updated_document",
          new_trades_count: Object.keys(cleanData).length
        });
      }



      trackEvent("orders_sync_completed_but_no_new_orders", {
        broker_name: brokerSession.broker,
        result: "no_new_orders"
      });
    } catch (error) {
      console.error("Error fetching orders:", error);

      trackEvent("orders_sync_failed", {
        broker_name: requestTokens?.broker,
        error: error.message || "Unexpected error"
      });
      toast.error(error.message || "Unexpected error");
      removeCookie("connectedBroker");
      setSelectedBroker(null);
      setRequestTokens(null);
      router.push("/dashboard/connect");
    }
  }

  async function handleConnect() {
    trackEvent("clicked_sync_broker_reconnect");
    try {
      const broker = requestTokens && requestTokens.broker.toLowerCase();

      if (!broker) {
        toast.error(`Broker not connected, Connect It!`);
        removeCookie("connectedBroker");
        setSelectedBroker(null);
        setRequestTokens(null);
        return;
      }
    } catch (error) {
      console.error("API Error: PAGE 3", error);
      toast.error(error?.message || "Something went wrong");
      removeCookie("connectedBroker");
      setSelectedBroker(null);
      setRequestTokens(null);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center">
      {isBrokerConnected && (
        <Button
          variant="ghost"
          onClick={fetchOrders}
          title="Sync Orders"
          className="flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw />
          {showElseCondition && "Sync Orders"}
        </Button>
      )}

      {!isBrokerConnected && showElseCondition && (
        <Button
          variant="ghost"
          onClick={handleConnect}
          className={"cursor-pointer"}
        >
          Sync Broker
        </Button>
      )}
    </div>
  );
}
