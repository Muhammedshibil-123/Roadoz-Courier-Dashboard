import React from 'react';
import { FaEye, FaDownload, FaRegCopy } from 'react-icons/fa';

const mockInvoices = [
  {
    invoiceNumber: 366,
    description: 'Very satisfied with the product quality',
    period: 'Period: Oct 01 - Oct 07',
    noOfOrders: 1,
    subTotalAmount: 150,
    taxAmount: 27,
    amount: 177,
  },
  {
    invoiceNumber: 367,
    description: 'Services used for month feb',
    period: '',
    noOfOrders: 1,
    subTotalAmount: 1320,
    taxAmount: 237.2,
    amount: 1558,
  },
  {
    invoiceNumber: 368,
    description: 'Services used\nFrom 01 Dec 2025\nTo 31 Dec 2025',
    period: '',
    noOfOrders: 14,
    subTotalAmount: 196,
    taxAmount: 196,
    amount: 238,
  },
];

const Invoices = () => {
  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Invoice</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Invoice</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">(Showing: Invoice )</h2>
          <button className="bg-red-600/80 hover:bg-red-600 text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Export</button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Invoice Number</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Description</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">No of Orders</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Sub Total Amount</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tax Amount</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Amount</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {mockInvoices.map((inv, i) => (
                <tr key={i} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center text-sm text-[var(--color-text-primary)]">{inv.invoiceNumber}</td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] block whitespace-pre-line">{inv.description}</span>
                    {inv.period && <span className="text-[10px] text-[var(--color-text-secondary)]">{inv.period}</span>}
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold">{inv.noOfOrders}</span>
                  </td>
                  <td className="p-4 text-center text-sm text-[var(--color-text-primary)]">{inv.subTotalAmount}</td>
                  <td className="p-4 text-center text-sm text-[var(--color-text-primary)]">{inv.taxAmount}</td>
                  <td className="p-4 text-center text-sm font-bold text-[var(--color-text-primary)]">{inv.amount}</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="View"><FaEye className="text-sm" /></button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Download"><FaDownload className="text-sm" /></button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Copy"><FaRegCopy className="text-sm" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
