import React, { useState } from 'react';
import useAngelSession from '../hooks/useAngelSession';

const intervals = [
  { label: '1 Min', value: 'ONE_MINUTE' },
  { label: '5 Min', value: 'FIVE_MINUTE' },
  { label: '15 Min', value: 'FIFTEEN_MINUTE' },
  { label: '1 Day', value: 'ONE_DAY' },
];

export default function StockSearch({ onLtpResult, onCandleResult }) {
  const { isLoggedIn, client_code } = useAngelSession();
  const [symbol, setSymbol] = useState('SBIN-EQ');
  const [interval, setInterval] = useState('ONE_MINUTE');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/angelone/ltp?symbol=${symbol}&client_code=${client_code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch LTP');
      onLtpResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCandles = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/angelone/candles?symbol=${symbol}&interval=${interval}&from=${from}&to=${to}&client_code=${client_code}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch candles');
      onCandleResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return <div className="p-4 text-center text-gray-500">Please connect your AngelOne account to search stocks.</div>;
  }

  return (
    <form className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow flex flex-col gap-4" onSubmit={handleLtp}>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Stock Symbol</label>
        <input
          className="border rounded px-3 py-2"
          value={symbol}
          onChange={e => setSymbol(e.target.value)}
          placeholder="e.g. SBIN-EQ"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="font-medium">Interval</label>
        <select
          className="border rounded px-3 py-2"
          value={interval}
          onChange={e => setInterval(e.target.value)}
        >
          {intervals.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="flex gap-2">
        <div className="flex flex-col gap-2 flex-1">
          <label className="font-medium">From</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 flex-1">
          <label className="font-medium">To</label>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <div className="flex gap-2">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get LTP'}
        </button>
        <button
          type="button"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          onClick={handleCandles}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Candles'}
        </button>
      </div>
    </form>
  );
}
