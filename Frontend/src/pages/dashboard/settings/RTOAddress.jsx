import React from 'react';

const RTOAddress = () => {
  const columns = ['ID', 'Contact', 'Pincode', 'Status', 'Primary', 'Address'];

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">RTO Address</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">RTO Address</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">RTO Address</h2>
          <button className="border border-[var(--color-text-primary)] text-[var(--color-text-primary)] hover:bg-[var(--color-text-primary)] hover:text-[var(--color-bg-surface)] text-sm font-semibold px-5 py-2 rounded-md transition-colors">
            New RTO Address
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-[#d4af26]/10 border border-[#d4af26]/30">
                {columns.map((col) => (
                  <th key={col} className="p-3 text-left text-[11px] font-semibold text-[#d4af26] uppercase tracking-wider">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No RTO addresses available</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RTOAddress;
