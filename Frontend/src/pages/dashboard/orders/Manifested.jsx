import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaEllipsisV, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const mockOrders = [
  {
    id: 1,
    customer: { name: 'Sakshi Jaiswal', phone: '9555995009', status: 'Manifested', statusColor: 'bg-[#d4af26]' },
    shipment: { id: '10001359', courier: 'CourierWa Air' },
    route: { from: 'Patna', fromPin: '800001', to: 'Gorakhpur', toPin: '273165' },
    payment: { method: 'PREPAID', sub: 'Prepaid', amount: 'Total: ₹16.52' },
    weight: { box: 'Box: 1', wt: 'Wt: 25 kg', vol: 'Vol: 0.2 kg' },
    created: { id: '#27168', date: '17 Mar 2026,', time: '04:48 PM' },
  },
  {
    id: 2,
    customer: { name: 'RELIVR', phone: '8858888888', status: 'Not Picked', statusColor: 'bg-red-500' },
    shipment: { id: '10001358', courier: 'CourierWa Air' },
    route: { from: 'Patna', fromPin: '800001', to: 'Gorakhpur', toPin: '273165' },
    payment: { method: 'PREPAID', sub: 'Prepaid', amount: 'Total: ₹17' },
    weight: { box: 'Box: 1', wt: 'Wt: 35 kg', vol: 'Vol: 0.35 kg' },
    created: { id: '#26344', date: '13 Mar 2026,', time: '04:56 PM' },
  },
  {
    id: 3,
    customer: { name: 'I FIRST SOLUTIONS', phone: '9310648106', status: 'Not Picked', statusColor: 'bg-red-500' },
    shipment: { id: '10001357', courier: 'CourierWa Surface' },
    route: { from: 'Patna', fromPin: '800001', to: 'Solan', toPin: '173229' },
    payment: { method: 'PREPAID', sub: 'Prepaid', amount: 'Total: ₹13' },
    weight: { box: 'Box: 1', wt: 'Wt: 1 kg', vol: 'Vol: 0.12 kg' },
    created: { id: '#26434', date: '14 Mar 2026,', time: '02:05 PM' },
  },
];

const tabs = [
  { label: 'Processing Order', count: 0, path: '/processing-order' },
  { label: 'Manifested', count: 0, path: '/orders/manifested' },
  { label: 'In Transit', count: 1, path: '/orders/in-transit' },
  { label: 'NDR', count: 0, path: '/orders/ndr' },
  { label: 'Pending', count: 0, path: '/orders/pending' },
  { label: 'Out For Delivery', count: 0, path: '/orders/out-of-delivery' },
  { label: 'Delivery', count: 0, path: '/orders/delivery' },
  { label: 'RTO In Transit', count: 0, path: '/orders/rto-in-transit' },
  { label: 'RTO Delivered', count: 0, path: '/orders/rto-delivery' },
  { label: 'Return', count: 0, path: '/orders/return' },
  { label: 'Lost', count: 0, path: '/orders/cancelled' },
];

const Manifested = () => {
  const navigate = useNavigate();
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Manifested');
  const [filters, setFilters] = useState({
    timeRange: '2026-03-07 to 2026-03-13',
    orderIds: '', awbNo: '', buyerName: '', paymentMethod: 'All', limit: '25',
  });

  const toggleSelect = (id) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Manifested Orders</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span>
          <span className="text-[var(--color-text-secondary)]">Manifested Orders</span>
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Manifested Orders</h2>
          <div className="flex flex-wrap gap-2">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors"><FaDownload className="text-[10px]" /> Labels</button>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Export</button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Invoices</button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Time Range</label>
            <input type="text" className={`${inputClass} w-52`} value={filters.timeRange} onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Ids</label>
            <input type="text" placeholder="Order ids Separate by" className={`${inputClass} w-36`} value={filters.orderIds} onChange={(e) => setFilters({ ...filters, orderIds: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">AWB NO</label>
            <input type="text" placeholder="AWB NO" className={`${inputClass} w-24`} value={filters.awbNo} onChange={(e) => setFilters({ ...filters, awbNo: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Buyer Name</label>
            <input type="text" placeholder="Buyer Name" className={`${inputClass} w-28`} value={filters.buyerName} onChange={(e) => setFilters({ ...filters, buyerName: e.target.value })} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Payment Method</label>
            <select className={`${inputClass} w-24`} value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}>
              <option value="All">All</option><option value="COD">COD</option><option value="Prepaid">Prepaid</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Limit:</label>
            <input type="text" className={`${inputClass} w-16`} value={filters.limit} onChange={(e) => setFilters({ ...filters, limit: e.target.value })} />
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-4">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Status:</label>
            <div className="bg-white dark:bg-[#1a2332] border border-[var(--color-border)] rounded-md px-3 py-2 space-y-1.5">
              {['Manifested', 'All Orders'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${selectedStatus === opt ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'}`} onClick={() => setSelectedStatus(opt)}>
                    {selectedStatus === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#d4af26]" />}
                  </div>
                  <span className="text-xs text-[var(--color-text-primary)]">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2 mt-5">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Search</button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="border-b border-[var(--color-border)] overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => (
            <button key={tab.label} onClick={() => navigate(tab.path)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${tab.path === '/orders/manifested' ? 'text-[var(--color-text-primary)] border-[#d4af26]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>
              {tab.label}({tab.count})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.length === mockOrders.length} onChange={() => setSelectedOrders(selectedOrders.length === mockOrders.length ? [] : mockOrders.map(o => o.id))} /></th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Shipment</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Route</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Payment</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Weight</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Created</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockOrders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelect(order.id)} /></td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{order.customer.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)] block">{order.customer.phone}</span>
                    <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded inline-block mt-1 ${order.customer.statusColor}`}>{order.customer.status}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm text-[var(--color-text-primary)] block">{order.shipment.id}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{order.shipment.courier}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-xs text-[var(--color-text-secondary)] space-y-0.5">
                      <div>{order.route.from}<br /><span className="text-[10px]">({order.route.fromPin})</span></div>
                      <div className="text-[var(--color-text-primary)]">↓</div>
                      <div>{order.route.to}<br /><span className="text-[10px]">({order.route.toPin})</span></div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-xs font-bold text-[#d4af26] block">{order.payment.method}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] block">{order.payment.sub}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{order.payment.amount}</span>
                  </td>
                  <td className="p-3">
                    <div className="text-xs text-[var(--color-text-secondary)] space-y-0.5">
                      <div>{order.weight.box}</div>
                      <div>{order.weight.wt}</div>
                      <div>{order.weight.vol}</div>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-bold text-[#d4af26] block">{order.created.id}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] block">{order.created.date}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{order.created.time}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <button className="p-1.5 bg-[#d4af26] text-white rounded hover:bg-[#c39f19] transition-colors"><FaDownload className="text-xs" /></button>
                      <button className="p-1.5 bg-gray-500/30 text-[var(--color-text-secondary)] rounded"><div className="w-3.5 h-3.5 border border-current rounded-sm" /></button>
                      <button className="p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors"><FaEllipsisV className="text-xs" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-1 p-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronLeft className="text-xs" /></button>
          {[1, 2, 3].map((p) => (<button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${currentPage === p ? 'bg-[#3B82F6] text-white' : 'text-[var(--color-text-secondary)]'}`}>{p}</button>))}
          <button onClick={() => setCurrentPage(p => Math.min(3, p + 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronRight className="text-xs" /></button>
        </div>
      </div>
    </div>
  );
};

export default Manifested;
