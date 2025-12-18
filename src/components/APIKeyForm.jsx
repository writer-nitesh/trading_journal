import { useState } from "react";

export default function APIKeyForm({ userId, onSaved }) {
  const [apiKey, setApiKey] = useState("");
  const [apiSecret, setApiSecret] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await fetch("/api/save-credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, apiKey, apiSecret }),
    });
    setLoading(false);
    onSaved();
  };

  return (
    <div>
      <input value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="API Key" />
      <input value={apiSecret} onChange={e => setApiSecret(e.target.value)} placeholder="API Secret" />
      <button onClick={handleSave} disabled={loading}>Save Changes</button>
    </div>
  );
}
