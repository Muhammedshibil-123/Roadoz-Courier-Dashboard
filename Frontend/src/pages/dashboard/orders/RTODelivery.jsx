import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaEllipsisV, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../../lib/axios';

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

const RTODelivery = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('RTO Delivery');
  const [filters, setFilters] = useState({ timeRange: '2026-03-07 to 2026-03-13', orderIds: '', awbNo: '', buyerName: '', paymentMethod: 'All', limit: '25' });
  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  useEffect(() => {
    const f = async () => { try { const r = await api.get('/api/orders/?status=RTO_DELIVERED', { skipLoading: true }); setOrders(r.data); } catch { setOrders([]); } finally { setLoading(false); } }; f();
  }, []);

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">RTO Delivered Orders</h1>
        <p className="text-xs mt-0.5"><span className="text-[#d4af26]">Dashboard</span><span className="text-[var(--color-text-secondary)]"> &gt;&gt; RTO Delivered Orders</span></p>
      </div>
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">RTO Delivered Orders</h2>
          <div className="flex flex-wrap gap-2">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5"><FaDownload className="text-[10px]" /> Labels</button>
            <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-md">Export</button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md">Invoices</button>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Time Range</label><input type="text" className={`${inputClass} w-52`} value={filters.timeRange} onChange={(e) => setFilters({...filters, timeRange: e.target.value})} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Ids</label><input type="text" placeholder="Order ids Separate by" className={`${inputClass} w-36`} value={filters.orderIds} onChange={(e) => setFilters({...filters, orderIds: e.target.value})} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">AWB NO</label><input type="text" placeholder="AWB NO" className={`${inputClass} w-24`} value={filters.awbNo} onChange={(e) => setFilters({...filters, awbNo: e.target.value})} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Buyer Name</label><input type="text" placeholder="Buyer Name" className={`${inputClass} w-28`} value={filters.buyerName} onChange={(e) => setFilters({...filters, buyerName: e.target.value})} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Payment Method</label><select className={`${inputClass} w-24`} value={filters.paymentMethod} onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}><option value="All">All</option><option value="COD">COD</option><option value="Prepaid">Prepaid</option></select></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Limit:</label><input type="text" className={`${inputClass} w-16`} value={filters.limit} onChange={(e) => setFilters({...filters, limit: e.target.value})} /></div>
        </div>
        <div className="flex flex-wrap items-start gap-4">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Status:</label>
            <div className="bg-white dark:bg-[#1a2332] border border-[var(--color-border)] rounded-md px-3 py-2 space-y-1.5">
              {['RTO Delivery', 'All Orders'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${selectedStatus === opt ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'}`} onClick={() => setSelectedStatus(opt)}>{selectedStatus === opt && <div className="w-1.5 h-1.5 rounded-full bg-[#d4af26]" />}</div>
                  <span className="text-xs text-[var(--color-text-primary)]">{opt}</span>
                </label>))}
            </div>
          </div>
          <div className="flex items-end gap-2 mt-5">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md">Search</button>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md">Clear Filters</button>
          </div>
        </div>
      </div>
      <div className="border-b border-[var(--color-border)] overflow-x-auto"><div className="flex gap-0 min-w-max">{tabs.map((tab) => (<button key={tab.label} onClick={() => navigate(tab.path)} className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 ${tab.path === '/orders/rto-delivery' ? 'text-[var(--color-text-primary)] border-[#d4af26]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>{tab.label}({tab.count})</button>))}</div></div>
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <table className="w-full min-w-[900px]">
          <thead><tr className="border-b border-[var(--color-border)]"><th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26]" /></th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Customer</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Shipment</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Route</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Payment</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Weight</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Created</th><th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase">Actions</th></tr></thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No RTO delivered orders</td></tr>
            ) : orders.map((o) => (
              <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26]" /></td>
                <td className="p-3"><span className="text-sm font-semibold text-[var(--color-text-primary)] block">{o.customer_name}</span><span className="text-xs text-[var(--color-text-secondary)]">{o.customer_phone}</span></td>
                <td className="p-3"><span className="text-sm font-bold text-[#d4af26]">{o.tracking_id}</span><span className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-purple-700 ml-2">RTO DELIVERED</span></td>
                <td className="p-3 text-xs text-[var(--color-text-secondary)]">{o.destination_pincode}</td>
                <td className="p-3"><span className={`text-xs font-bold ${o.order_type === 'COD' ? 'text-green-400' : 'text-[#d4af26]'}`}>{o.order_type}</span><span className="text-sm text-[var(--color-text-primary)] block">₹{o.cod_amount}</span></td>
                <td className="p-3 text-xs text-[var(--color-text-primary)]">{o.weight} kg</td>
                <td className="p-3 text-[11px] text-[var(--color-text-secondary)]">{new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                <td className="p-3"><div className="flex items-center gap-1.5"><button className="p-1.5 bg-[#d4af26] text-white rounded"><FaDownload className="text-xs" /></button><button className="p-1.5 text-[var(--color-text-secondary)]"><FaEllipsisV className="text-xs" /></button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-end gap-1 p-4">
          <button onClick={() => setCurrentPage(p => Math.max(1,p-1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronLeft className="text-xs" /></button>
          {[1,2,3].map((pg) => (<button key={pg} onClick={() => setCurrentPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${currentPage === pg ? 'bg-[#3B82F6] text-white' : 'text-[var(--color-text-secondary)]'}`}>{pg}</button>))}
          <button onClick={() => setCurrentPage(p => Math.min(3,p+1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronRight className="text-xs" /></button>
        </div>
      </div>
    </div>
  );
};

export default RTODelivery;
