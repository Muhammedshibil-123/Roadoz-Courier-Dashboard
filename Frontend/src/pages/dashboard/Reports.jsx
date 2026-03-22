import React, { useState } from 'react';

const orderFields = [
  'Select all', 'Buyer Name', 'Buyer State', 'Breadth',
  'Buyer Mobile', 'Address 1', 'PinCode', 'Order Status',
  'Order Date', 'Order Date', 'Address', 'Amount',
  'Total Order Qty', 'Weight', 'Phone', 'Length',
  'Shipping Charges', 'Payment Type', 'Payment Type', '',
  'City', 'Height', 'Product Details', '',
];

const shipmentFields = [
  'Select all', 'Delivered Time', 'Courier Name', 'AWB Number',
  'shipment Date', 'Remittance ID', 'Zone', '',
  'RTO Delivered Time', '', '', '',
];

const Reports = () => {
  const [dateRange, setDateRange] = useState('');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedShipments, setSelectedShipments] = useState([]);

  const toggleField = (list, setList, field) => {
    if (field === 'Select all') {
      if (list.includes('Select all')) {
        setList([]);
      } else {
        const allFields = list === selectedOrders
          ? orderFields.filter(f => f && f !== 'Select all')
          : shipmentFields.filter(f => f && f !== 'Select all');
        setList(['Select all', ...allFields]);
      }
      return;
    }
    setList(prev => prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]);
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Generate Report</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Generate Report</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Generate Report</h2>

        {/* Date Range */}
        <div className="max-w-[250px]">
          <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Date Range</label>
          <input type="text" className={`${inputClass} w-full`} value={dateRange} onChange={(e) => setDateRange(e.target.value)} />
        </div>

        {/* Orders Section */}
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Orders:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {orderFields.filter(f => f).map((field, i) => (
              <label key={`order-${i}`} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                  checked={selectedOrders.includes(field)}
                  onChange={() => toggleField(selectedOrders, setSelectedOrders, field)}
                />
                <span className="text-sm text-[var(--color-text-primary)]">{field}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Shipment Section */}
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Shipment:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {shipmentFields.filter(f => f).map((field, i) => (
              <label key={`ship-${i}`} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                  checked={selectedShipments.includes(field)}
                  onChange={() => toggleField(selectedShipments, setSelectedShipments, field)}
                />
                <span className="text-sm text-[var(--color-text-primary)]">{field}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Generate Button */}
        <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors">
          Generate
        </button>
      </div>
    </div>
  );
};

export default Reports;
