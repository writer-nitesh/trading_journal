"use client";
import { useRouter } from "next/navigation";
import APIKeyForm from "@/components/APIKeyForm";
import { useState } from "react";

export default function BrokerConnectionPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <button onClick={() => window.open("https://smartapi.angelbroking.com/signup#", "_blank")}>
        brokerURL
      </button>
      <button onClick={() => setShowForm(true)}>Save API Key</button>
      {showForm && <APIKeyForm userId="CURRENT_USER_ID" onSaved={() => setShowForm(false)} />}
      <button
        onClick={() => {
          // Start OAuth flow
          window.location.href = `https://smartapi.angelbroking.com/publisher-login?api_key=YOUR_API_KEY&state=randomState`;
        }}
      >
        Connect
      </button>
    </div>
  );
}
