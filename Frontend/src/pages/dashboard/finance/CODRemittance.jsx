import React, { useState } from 'react';

const CODRemittance = () => {
  const [filters, setFilters] = useState({
    timeRange: '', orderIds: '', type: 'All', limit: '25',
  });

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  const summaryCards = [
    { label: 'Remitted Till Date', value: '₹ 0' },
    { label: 'Remitted For', value: '₹ 0' },
    { label: 'Total Remittance Due', value: '₹ 0' },
    { label: 'Total Remittance for', value: '₹ 0' },
  ];

  const columns = ['Order Id', 'Buyer', 'AWB No', 'COD Amount', 'Delivered On', 'Remit. Status', 'Transferred On', 'Description'];

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Remittance Transactions</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Remittance Transactions</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">(Showing: Remittance Transactions )</h2>
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Export</button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, i) => (
            <div key={i} className="border border-[var(--color-border)] rounded-lg p-4">
              <p className="text-sm text-[var(--color-text-secondary)] mb-1">{card.label}</p>
              <p className="text-xl font-bold text-[var(--color-text-primary)]">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Time Range</label>
            <input type="text" placeholder="Select time and date" className={`${inputClass} w-44`} value={filters.timeRange} onChange={(e) => setFilters({...filters, timeRange: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Order Ids</label>
            <input type="text" placeholder="Order ids" className={`${inputClass} w-32`} value={filters.orderIds} onChange={(e) => setFilters({...filters, orderIds: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Type:</label>
            <select className={`${inputClass} w-24`} value={filters.type} onChange={(e) => setFilters({...filters, type: e.target.value})}>
              <option value="All">All</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Limit:</label>
            <input type="text" className={`${inputClass} w-16`} value={filters.limit} onChange={(e) => setFilters({...filters, limit: e.target.value})} />
          </div>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Search</button>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Clean Filter</button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-[#d4af26]/10 border border-[#d4af26]/30">
                {columns.map((col) => (
                  <th key={col} className="p-3 text-center text-[11px] font-semibold text-[#d4af26] uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No remittance data available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CODRemittance;
