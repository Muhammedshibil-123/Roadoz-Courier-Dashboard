import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaEllipsisV, FaCheck, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../../../lib/axios';

const tabs = [
  { label: 'Processing Order', count: 0, path: '/processing-order' },
  { label: 'Manifested', count: 0, path: '/orders/manifested' },
  { label: 'In Transit', count: 0, path: '/orders/in-transit' },
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
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Manifested');
  const [filters, setFilters] = useState({
    timeRange: '2026-03-07 to 2026-03-13',
    orderIds: '', awbNo: '', buyerName: '', paymentMethod: 'All', limit: '25',
  });

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/?status=MANIFESTED', { skipLoading: true });
      setOrders(res.data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const handleAdvance = async (orderId) => {
    setAdvancing(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/advance/`);
      setOrders(orders.filter(o => o.id !== orderId));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to advance order');
    }
    setAdvancing(null);
  };

  const toggleSelect = (id) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Manifested Orders</h1>
        <p className="text-xs mt-0.5"><span className="text-[#d4af26]">Dashboard</span><span className="text-[var(--color-text-secondary)]"> &gt;&gt; Manifested Orders</span></p>
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
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Time Range</label><input type="text" className={`${inputClass} w-52`} value={filters.timeRange} onChange={(e) => setFilters({ ...filters, timeRange: e.target.value })} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order Ids</label><input type="text" placeholder="Order ids Separate by" className={`${inputClass} w-36`} value={filters.orderIds} onChange={(e) => setFilters({ ...filters, orderIds: e.target.value })} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">AWB NO</label><input type="text" placeholder="AWB NO" className={`${inputClass} w-24`} value={filters.awbNo} onChange={(e) => setFilters({ ...filters, awbNo: e.target.value })} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Buyer Name</label><input type="text" placeholder="Buyer Name" className={`${inputClass} w-28`} value={filters.buyerName} onChange={(e) => setFilters({ ...filters, buyerName: e.target.value })} /></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Payment Method</label><select className={`${inputClass} w-24`} value={filters.paymentMethod} onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}><option value="All">All</option><option value="COD">COD</option><option value="Prepaid">Prepaid</option></select></div>
          <div><label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Limit:</label><input type="text" className={`${inputClass} w-16`} value={filters.limit} onChange={(e) => setFilters({ ...filters, limit: e.target.value })} /></div>
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

      <div className="border-b border-[var(--color-border)] overflow-x-auto"><div className="flex gap-0 min-w-max">{tabs.map((tab) => (<button key={tab.label} onClick={() => navigate(tab.path)} className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${tab.path === '/orders/manifested' ? 'text-[var(--color-text-primary)] border-[#d4af26]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>{tab.label}({tab.count})</button>))}</div></div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" /></th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tracking</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Route</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Payment</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Weight</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Created</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pickup ✓</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="8" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No manifested orders</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.includes(o.id)} onChange={() => toggleSelect(o.id)} /></td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{o.customer_name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{o.customer_phone}</span>
                    <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-[#d4af26] ml-2">MANIFESTED</span>
                  </td>
                  <td className="p-3"><span className="text-sm font-bold text-[#d4af26]">{o.tracking_id}</span></td>
                  <td className="p-3 text-xs text-[var(--color-text-secondary)]">{o.destination_pincode}<br/><span className="text-[10px]">{o.destination_address?.substring(0, 30)}</span></td>
                  <td className="p-3">
                    <span className={`text-xs font-bold ${o.order_type === 'COD' ? 'text-green-400' : 'text-[#d4af26]'}`}>{o.order_type}</span>
                    <span className="text-sm text-[var(--color-text-primary)] block">₹{o.cod_amount}</span>
                  </td>
                  <td className="p-3 text-xs text-[var(--color-text-primary)]">{o.weight} kg</td>
                  <td className="p-3 text-[11px] text-[var(--color-text-secondary)]">{new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleAdvance(o.id)}
                      disabled={advancing === o.id}
                      className="w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-md flex items-center justify-center mx-auto transition-colors disabled:opacity-50"
                      title="Tick to send for Pickup (Pending)"
                    >
                      <FaCheck className="text-sm" />
                    </button>
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
