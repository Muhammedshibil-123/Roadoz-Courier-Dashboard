import React, { useState, useEffect } from 'react';
import { FaCheck, FaDownload, FaClock } from 'react-icons/fa';
import api from '../../../lib/axios';
import { OrderFilterBar, OrderPagination, useOrderFilters, exportOrdersCsv } from '../../../components/OrderFilterBar';

const Pending = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(null);
  const [selectedOrders, setSelectedOrders] = useState([]);

  const filters = useOrderFilters(orders);
  const { filteredOrders, paginatedOrders, currentPage, setCurrentPage, totalPages, itemsPerPage } = filters;

  useEffect(() => {
    (async () => {
      try { await api.post('/api/orders/check-not-picked/', {}, { skipLoading: true }); } catch {}
      fetchOrders();
    })();
  }, []);

  const fetchOrders = async () => {
    try { const res = await api.get('/api/orders/?status=PICKUP_PENDING', { skipLoading: true }); setOrders(res.data); }
    catch { setOrders([]); } finally { setLoading(false); }
  };

  const handleAdvance = async (orderId) => {
    setAdvancing(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/advance/`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    } catch (err) { alert(err.response?.data?.detail || 'Failed to advance order'); }
    setAdvancing(null);
  };

  const getTimeInfo = (statusChangedAt) => {
    const changed = new Date(statusChangedAt);
    const diffHours = (new Date() - changed) / (1000 * 60 * 60);
    const remaining = 24 - diffHours;
    if (remaining <= 0) return { text: 'Expired — moving to Not Picked', color: 'text-red-400' };
    if (remaining < 6) return { text: `${remaining.toFixed(1)}h remaining`, color: 'text-orange-400' };
    return { text: `${remaining.toFixed(1)}h remaining`, color: 'text-green-400' };
  };

  const toggleSelect = (id) => setSelectedOrders(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const pageIds = paginatedOrders.map(o => o.id);
  const allPageSelected = pageIds.length > 0 && pageIds.every(id => selectedOrders.includes(id));
  const toggleSelectAll = () => {
    if (allPageSelected) setSelectedOrders(prev => prev.filter(id => !pageIds.includes(id)));
    else setSelectedOrders(prev => [...new Set([...prev, ...pageIds])]);
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      <OrderFilterBar title="Pending Orders (Pickup Waiting)" currentPath="/orders/pending" filters={filters}
        actionButtons={
          <button onClick={() => exportOrdersCsv(filteredOrders, 'pending_orders')} disabled={filteredOrders.length === 0}
            className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50">
            <FaDownload className="text-[10px]" /> Export
          </button>
        }
      >
        {/* Info Banner */}
        <div className="bg-[#d4af26]/10 border border-[#d4af26]/30 rounded-lg px-5 py-3">
          <p className="text-sm text-[#d4af26]">
            <FaClock className="inline mr-2" />
            Orders waiting for courier pickup. If not picked within <strong>24 hours</strong>, they auto-move to <strong>Not Picked</strong>.
            Tick ✓ to confirm pickup → <strong>In Transit</strong>.
          </p>
        </div>
      </OrderFilterBar>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead><tr className="border-b border-[var(--color-border)]">
              <th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={allPageSelected} onChange={toggleSelectAll} /></th>
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
              ) : paginatedOrders.length === 0 ? (
                <tr><td colSpan="7" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
                  {filters.hasActiveFilters ? 'No orders match your filters' : 'No pending pickup orders'}
                </td></tr>
              ) : paginatedOrders.map(o => {
                const timeInfo = getTimeInfo(o.status_changed_at);
                return (
                  <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.includes(o.id)} onChange={() => toggleSelect(o.id)} /></td>
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
                      <button onClick={() => handleAdvance(o.id)} disabled={advancing === o.id}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center mx-auto transition-colors disabled:opacity-50" title="Confirm pickup → In Transit">
                        {advancing === o.id ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <FaCheck className="text-sm" />}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <OrderPagination currentPage={currentPage} totalPages={totalPages} setCurrentPage={setCurrentPage} totalItems={filteredOrders.length} itemsPerPage={itemsPerPage} />
      </div>
    </div>
  );
};

export default Pending;
