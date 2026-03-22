import React, { useState } from 'react';
import {
  FaTruck, FaEye, FaCopy, FaPen, FaPrint, FaBoxOpen,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';

// ─── Mock Orders Data ────────────────────────────────────────
const mockOrders = [
  {
    id: 1,
    customer: 'Sakshi Jaiswal',
    phone: '+91 9876543210',
    date: '24 Oct 2023, 10:30 AM',
    status: 'PROCESSING',
    route: { from: 'Patna', to: 'Gorakhpur' },
    payment: { type: 'PREPAID', method: 'Prepaid', channel: 'B2C' },
    order: { id: '#27438', sku: 'XYD' },
    weight: { dimensions: '10×10×10 cm', kg: '1.00 kg', vol: '0.001 m3' },
  },
  {
    id: 2,
    customer: 'RELIVR',
    phone: '+91 8877665544',
    date: '24 Oct 2023, 11:15 AM',
    status: 'PROCESSING',
    route: { from: 'Mumbai', to: 'Pune' },
    payment: { type: 'PREPAID', method: 'Prepaid B2B', channel: '' },
    order: { id: '#27439', sku: 'ABC' },
    weight: { dimensions: '20×20×20 cm', kg: '2.50 kg', vol: '0.008 m3' },
  },
  {
    id: 3,
    customer: 'samshtech technologies',
    phone: '+91 7766554433',
    date: '24 Oct 2023, 12:00 PM',
    status: 'PROCESSING',
    route: { from: 'Delhi', to: 'Noida' },
    payment: { type: 'PREPAID', method: 'Prepaid', channel: 'B2C' },
    order: { id: '#27', sku: 'ZYZ', extra: '440' },
    weight: { dimensions: '15×15×15 cm', kg: '1.50 kg', vol: '0.003 m3' },
  },
];

// ─── Status Tabs ─────────────────────────────────────────────
const tabs = [
  { label: 'Processing Order', count: 0 },
  { label: 'Manifested', count: 0 },
  { label: 'In Transit', count: 1 },
  { label: 'NDR', count: 0 },
  { label: 'Out For Delivery', count: 0 },
  { label: 'Delivery', count: 0 },
  { label: 'RTO In Transit', count: 0 },
  { label: 'RTO Delivered', count: 0 },
  { label: 'Lost', count: 0 },
];

const ProcessingOrders = () => {
  const [activeTab, setActiveTab] = useState('Processing Order');
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // Filters
  const [filters, setFilters] = useState({
    timeRange: '2026-03-07 to 2026-03-13',
    orderIds: '',
    buyerName: '',
    paymentMethod: 'All',
    orderChannel: 'All',
    limit: '25',
  });

  const toggleSelect = (id) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedOrders.length === mockOrders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(mockOrders.map((o) => o.id));
    }
  };

  const inputClass =
    'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] transition-colors duration-300">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Processing Orders</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span>
          <span className="text-[var(--color-text-secondary)]">Processing Order</span>
        </p>
      </div>

      {/* Actions & Filters */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] transition-colors duration-300 space-y-4">
        {/* Title + Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Processing Orders</h2>
          <div className="flex flex-wrap gap-2">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
              Ship
            </button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
              Change PickupAddress
            </button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
              Export
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
              Delete
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Time Range</label>
            <input
              type="text"
              className={`${inputClass} w-52`}
              value={filters.timeRange}
              onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Ids</label>
            <input
              type="text"
              placeholder="Order ids Separate by"
              className={`${inputClass} w-40`}
              value={filters.orderIds}
              onChange={(e) => setFilters({ ...filters, orderIds: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">BuyerName</label>
            <input
              type="text"
              placeholder="Buyer Name"
              className={`${inputClass} w-32`}
              value={filters.buyerName}
              onChange={(e) => setFilters({ ...filters, buyerName: e.target.value })}
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Payment Method:</label>
            <select
              className={`${inputClass} w-28`}
              value={filters.paymentMethod}
              onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            >
              <option value="All">All</option>
              <option value="COD">COD</option>
              <option value="Prepaid">Prepaid</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Channel</label>
            <select
              className={`${inputClass} w-24`}
              value={filters.orderChannel}
              onChange={(e) => setFilters({ ...filters, orderChannel: e.target.value })}
            >
              <option value="All">All</option>
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Limit:</label>
            <input
              type="text"
              className={`${inputClass} w-16`}
              value={filters.limit}
              onChange={(e) => setFilters({ ...filters, limit: e.target.value })}
            />
          </div>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors h-fit">
            Search
          </button>
        </div>

        <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          Clear Filters
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.label
                  ? 'text-[var(--color-text-primary)] border-[#d4af26]'
                  : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'
              }`}
            >
              {tab.label}({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                    checked={selectedOrders.length === mockOrders.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Customer
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Route
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Payment
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Order
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Weight
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  {/* Checkbox */}
                  <td className="p-3">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                      checked={selectedOrders.includes(order.id)}
                      onChange={() => toggleSelect(order.id)}
                    />
                  </td>

                  {/* Customer */}
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {order.customer}
                        </span>
                        <span className="text-[9px] font-bold text-[#d4af26] bg-[#d4af26]/10 px-1.5 py-0.5 rounded uppercase tracking-wide">
                          {order.status}
                        </span>
                      </div>
                      <span className="text-xs text-[var(--color-text-secondary)]">{order.phone}</span>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{order.date}</span>
                    </div>
                  </td>

                  {/* Route */}
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <MdLocationOn className="text-[var(--color-text-secondary)] text-sm flex-shrink-0" />
                      <span>{order.route.from}</span>
                      <span>→</span>
                      <span>{order.route.to}</span>
                    </div>
                  </td>

                  {/* Payment */}
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-[#d4af26]">{order.payment.type}</span>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{order.payment.method}</span>
                      {order.payment.channel && (
                        <span className="text-[10px] text-[var(--color-text-secondary)]">{order.payment.channel}</span>
                      )}
                    </div>
                  </td>

                  {/* Order */}
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-[#d4af26]">{order.order.id}</span>
                      {order.order.extra && (
                        <span className="text-xs text-[var(--color-text-primary)]">{order.order.extra}</span>
                      )}
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{order.order.sku}</span>
                    </div>
                  </td>

                  {/* Weight */}
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-[var(--color-text-primary)]">{order.weight.dimensions}</span>
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">{order.weight.kg}</span>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">{order.weight.vol}</span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Ship">
                        <FaTruck className="text-xs" />
                      </button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="View">
                        <FaEye className="text-xs" />
                      </button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Copy">
                        <FaCopy className="text-xs" />
                      </button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Edit">
                        <FaPen className="text-xs" />
                      </button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Print">
                        <FaPrint className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-1 p-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FaChevronLeft className="text-xs" />
          </button>
          {[1, 2, 3].map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                currentPage === page
                  ? 'bg-[#3B82F6] text-white'
                  : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
          >
            <FaChevronRight className="text-xs" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOrders;
