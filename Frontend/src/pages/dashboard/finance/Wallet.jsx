import React, { useState } from 'react';

const mockTransactions = [
  {
    id: '#0521',
    amount: 'Rs. 15.52',
    amountColor: 'text-red-400',
    type: 'DEBIT',
    typeColor: 'bg-red-500',
    openingBal: 'Rs. 450.00',
    closingBal: 'Rs. 433.48',
    description: 'Debited for order id #7841 (processed by Admin #2)',
    createdAt: 'Oct 24, 2023\n14:22',
  },
  {
    id: '#0520',
    amount: 'Rs.\n1,200.00',
    amountColor: 'text-green-400',
    type: 'CREDIT',
    typeColor: 'bg-green-500',
    openingBal: 'Rs. 0.00',
    closingBal: 'Rs.\n1,200.00',
    description: 'Wallet top-up via Gateway Transaction #tx_90892',
    createdAt: 'Oct 24, 2023\n10:05',
  },
  {
    id: '#0519',
    amount: 'Rs. 57.90',
    amountColor: 'text-red-400',
    type: 'DEBIT',
    typeColor: 'bg-red-500',
    openingBal: 'Rs. 539.10',
    closingBal: 'Rs. 450.00',
    description: 'Shipment adjustment for order #7830',
    createdAt: 'Oct 23, 2023\n18:45',
  },
  {
    id: '#0518',
    amount: 'Rs. 24.00',
    amountColor: 'text-red-400',
    type: 'DEBIT',
    typeColor: 'bg-red-500',
    openingBal: 'Rs. 563.10',
    closingBal: 'Rs. 539.10',
    description: 'Admin deduction for manual correction (order 27144)',
    createdAt: 'Oct 23, 2023\n11:30',
  },
];

const Wallet = () => {
  const [filters, setFilters] = useState({
    timeRange: '', orderIds: '', type: 'All', limit: '25',
  });

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Wallet Transactions</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Wallet Transactions</span>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">(Showing: Wallet Transactions )</h2>
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Export</button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Time Range</label>
            <input type="text" placeholder="Select time and date" className={`${inputClass} w-44`} value={filters.timeRange} onChange={(e) => setFilters({...filters, timeRange: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Ids</label>
            <input type="text" placeholder="Order ids" className={`${inputClass} w-32`} value={filters.orderIds} onChange={(e) => setFilters({...filters, orderIds: e.target.value})} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Type:</label>
            <select className={`${inputClass} w-24`} value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
              <option value="All">All</option>
              <option value="DEBIT">DEBIT</option>
              <option value="CREDIT">CREDIT</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Limit:</label>
            <input type="text" className={`${inputClass} w-16`} value={filters.limit} onChange={(e) => setFilters({...filters, limit: e.target.value})} />
          </div>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Search</button>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Clean Filter</button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Amount</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Opening Bal.</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Closing Bal.</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Description</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Created At</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((tx, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 text-center text-sm font-bold text-[#d4af26]">{tx.id}</td>
                  <td className={`p-3 text-center text-sm font-semibold whitespace-pre-line ${tx.amountColor}`}>{tx.amount}</td>
                  <td className="p-3 text-center">
                    <span className={`text-[10px] font-bold text-white px-3 py-1 rounded ${tx.typeColor}`}>{tx.type}</span>
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">{tx.openingBal}</td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)] whitespace-pre-line">{tx.closingBal}</td>
                  <td className="p-3 text-center text-xs text-[var(--color-text-secondary)] max-w-[200px]">{tx.description}</td>
                  <td className="p-3 text-center text-xs text-[var(--color-text-secondary)] whitespace-pre-line">{tx.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
