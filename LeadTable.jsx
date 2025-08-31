import React from "react";

// Compute a lead score (simple version: longer message, interest, positive sentiment)
function scoreLead(lead) {
  let score = 0;
  if (lead.message?.length > 60) score += 2;
  if (/buy|order|interested|yes|please/i.test(lead.message)) score += 3;
  if (/love|great|excited|happy/i.test(lead.message)) score += 2;
  if (/not|no|hate|bad|frustrated/i.test(lead.message)) score -= 2;
  return Math.max(1, score);
}

export default function LeadTable({ leads }) {
  if (!leads.length)
    return <div className="text-gray-500">No leads captured yet.</div>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-[#222a2d] rounded-xl">
        <thead>
          <tr>
            <th className="py-4 px-2">Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Message</th>
            <th>Created</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leads.map(l => (
            <tr key={l.id}>
              <td>{l.name}</td>
              <td>{l.email}</td>
              <td>{l.phone}</td>
              <td>{l.message}</td>
              <td className="text-sm text-gray-400">{new Date(l.created_at).toLocaleString()}</td>
              <td>
                <span className={`rounded-full px-3 py-1 text-white font-bold text-xs
                  ${scoreLead(l) >= 5 ? "bg-green-500" : scoreLead(l) >= 3 ? "bg-yellow-500" : "bg-red-500"}
                `}>{scoreLead(l)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}