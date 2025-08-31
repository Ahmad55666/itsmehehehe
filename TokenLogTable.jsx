import React from "react";

export default function TokenLogTable({ transactions }) {
  if (!transactions.length)
    return <div className="text-gray-500">No token activity yet.</div>;
  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full bg-[#222a2d] rounded-xl">
        <thead>
          <tr>
            <th className="py-4 px-2">Date</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Detail</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(tx => (
            <tr key={tx.id}>
              <td className="text-sm text-gray-400 py-2 px-2">{new Date(tx.created_at).toLocaleString()}</td>
              <td className={`font-bold ${tx.amount > 0 ? "text-green-400" : "text-red-400"}`}>{tx.amount}</td>
              <td>{tx.type}</td>
              <td>{tx.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}