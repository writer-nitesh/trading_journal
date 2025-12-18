import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function StockResults({ ltp, candles, loading, error }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow flex flex-col gap-4 mt-4">
      {loading && <div className="text-blue-500">Loading...</div>}
      {error && <div className="text-red-500">{error}</div>}
      {ltp && (
        <div className="text-lg font-semibold">Current LTP: <span className="text-blue-600">{ltp}</span></div>
      )}
      {candles && candles.length > 0 && (
        <div>
          <div className="font-medium mb-2">Historical Data</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={candles.map(c => ({ time: c[0], close: c[4] }))}>
              <XAxis dataKey="time" hide={candles.length > 20} />
              <YAxis domain={['auto', 'auto']} />
              <Tooltip />
              <Line type="monotone" dataKey="close" stroke="#2563eb" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
      {!ltp && (!candles || candles.length === 0) && !loading && !error && (
        <div className="text-gray-500">No data to display.</div>
      )}
    </div>
  );
}
