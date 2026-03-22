import React from 'react';
import { FaEye } from 'react-icons/fa';

const mockTickets = [
  {
    id: 6,
    orderId: 1,
    subject: 'test',
    priority: 'low',
    priorityColor: 'text-red-400',
    status: ['CLOSED', 'ANSWERED'],
    statusColors: ['bg-red-500', 'bg-red-600'],
    openedDate: '14-01-2026 02:42 PM',
  },
];

const summaryCards = [
  { label: 'opened', value: 0 },
  { label: 'Answered', value: 0 },
  { label: 'Not Answered', value: 0 },
  { label: 'closed', value: 0 },
];

const Tickets = () => {
  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Ticket</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Ticket</span>
        </p>
      </div>

      {/* Tickets Section */}
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Tickets</h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-lg p-4 bg-[var(--color-bg-surface)]">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">{card.label}</p>
              <p className="text-2xl font-bold text-[var(--color-text-primary)]">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Add New Button */}
        <div className="flex justify-end">
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors">
            Add New
          </button>
        </div>

        {/* Table */}
        <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Order ID</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Subject</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Priority</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Opened Date</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {mockTickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 text-center text-sm font-bold text-[var(--color-text-primary)]">{ticket.id}</td>
                    <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">{ticket.orderId}</td>
                    <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">{ticket.subject}</td>
                    <td className={`p-3 text-center text-sm font-semibold ${ticket.priorityColor}`}>{ticket.priority}</td>
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {ticket.status.map((s, i) => (
                          <span key={i} className={`text-[9px] font-bold text-white px-2 py-0.5 rounded ${ticket.statusColors[i]}`}>{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center text-xs text-[var(--color-text-secondary)]">{ticket.openedDate}</td>
                    <td className="p-3 text-center">
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="View">
                        <FaEye className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex gap-3">
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Search</button>
          <button className="bg-red-500/80 hover:bg-red-500 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Clean Filter</button>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
