import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaDownload, FaEllipsisV, FaCheck, FaChevronLeft, FaChevronRight, FaClock } from 'react-icons/fa';
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

const Pending = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [filters, setFilters] = useState({ timeRange: '2026-03-07 to 2026-03-13', orderIds: '', awbNo: '', buyerName: '', paymentMethod: 'All', limit: '25' });
  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  useEffect(() => {
    // First auto-check 24h expiry, then fetch
    const init = async () => {
      try {
        await api.post('/api/orders/check-not-picked/', {}, { skipLoading: true });
      } catch {}
      fetchOrders();
    };
    init();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/api/orders/?status=PICKUP_PENDING', { skipLoading: true });
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

  // Calculate time remaining for each order
  const getTimeInfo = (statusChangedAt) => {
    const changed = new Date(statusChangedAt);
    const now = new Date();
    const diffMs = now - changed;
    const diffHours = diffMs / (1000 * 60 * 60);
    const remaining = 24 - diffHours;
    if (remaining <= 0) return { text: 'Expired — moving to Not Picked', color: 'text-red-400' };
    if (remaining < 6) return { text: `${remaining.toFixed(1)}h remaining`, color: 'text-orange-400' };
    return { text: `${remaining.toFixed(1)}h remaining`, color: 'text-green-400' };
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Pending Orders (Pickup Waiting)</h1>
        <p className="text-xs mt-0.5"><span className="text-[#d4af26]">Dashboard</span><span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span><span className="text-[var(--color-text-secondary)]">Pending Orders</span></p>
      </div>

      {/* Info Banner */}
      <div className="bg-[#d4af26]/10 border border-[#d4af26]/30 rounded-lg px-5 py-3">
        <p className="text-sm text-[#d4af26]">
          <FaClock className="inline mr-2" />
          Orders waiting for courier pickup. If not picked within <strong>24 hours</strong>, they will automatically move to <strong>Not Picked</strong>.
          Tick ✓ to confirm pickup and move to <strong>In Transit</strong>.
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Pending Orders</h2>
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
        <div className="flex items-end gap-2">
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Search</button>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">Clear Filters</button>
        </div>
      </div>

      <div className="border-b border-[var(--color-border)] overflow-x-auto"><div className="flex gap-0 min-w-max">{tabs.map((tab) => (<button key={tab.label} onClick={() => navigate(tab.path)} className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${tab.path === '/orders/pending' ? 'text-[var(--color-text-primary)] border-[#d4af26]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>{tab.label}({tab.count})</button>))}</div></div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-[var(--color-border)]">
              <th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" /></th>
              <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer</th>
              <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tracking</th>
              <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Payment</th>
              <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Weight</th>
              <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Time Left</th>
              <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Picked ✓</th>
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No pending pickup orders</td></tr>
              ) : orders.map((o) => {
                const timeInfo = getTimeInfo(o.status_changed_at);
                return (
                  <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" /></td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{o.customer_name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{o.customer_phone}</span>
                      <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-orange-500 ml-2">PICKUP PENDING</span>
                    </td>
                    <td className="p-3"><span className="text-sm font-bold text-[#d4af26]">{o.tracking_id}</span></td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${o.order_type === 'COD' ? 'text-green-400' : 'text-[#d4af26]'}`}>{o.order_type}</span>
                      <span className="text-sm text-[var(--color-text-primary)] block">₹{o.cod_amount}</span>
                    </td>
                    <td className="p-3 text-xs text-[var(--color-text-primary)]">{o.weight} kg</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        <FaClock className={`text-xs ${timeInfo.color}`} />
                        <span className={`text-xs font-semibold ${timeInfo.color}`}>{timeInfo.text}</span>
                      </div>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleAdvance(o.id)}
                        disabled={advancing === o.id}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center mx-auto transition-colors disabled:opacity-50"
                        title="Confirm pickup → In Transit"
                      >
                        <FaCheck className="text-sm" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-1 p-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronLeft className="text-xs" /></button>
          {[1, 2, 3].map((pg) => (<button key={pg} onClick={() => setCurrentPage(pg)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${currentPage === pg ? 'bg-[#3B82F6] text-white' : 'text-[var(--color-text-secondary)]'}`}>{pg}</button>))}
          <button onClick={() => setCurrentPage(p => Math.min(3, p + 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)]"><FaChevronRight className="text-xs" /></button>
        </div>
      </div>
    </div>
  );
};

export default Pending;
