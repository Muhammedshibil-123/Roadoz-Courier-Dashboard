import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';

const STATUS_OPTIONS = [
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery', color: 'bg-blue-500' },
  { value: 'DELIVERED', label: 'Delivered', color: 'bg-green-500' },
  { value: 'NDR', label: 'NDR (Non-Delivery)', color: 'bg-orange-500' },
  { value: 'RTO_IN_TRANSIT', label: 'RTO In Transit', color: 'bg-purple-500' },
  { value: 'RTO_DELIVERED', label: 'RTO Delivered', color: 'bg-purple-700' },
  { value: 'RETURN', label: 'Return', color: 'bg-pink-500' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'bg-red-500' },
];

const getStatusBadge = (status) => {
  const map = {
    PROCESSING: { label: 'Processing', color: 'bg-gray-500' },
    MANIFESTED: { label: 'Manifested', color: 'bg-[#d4af26]' },
    PICKUP_PENDING: { label: 'Pickup Pending', color: 'bg-orange-500' },
    NOT_PICKED: { label: 'Not Picked', color: 'bg-red-500' },
    IN_TRANSIT: { label: 'In Transit', color: 'bg-blue-500' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'bg-blue-600' },
    DELIVERED: { label: 'Delivered', color: 'bg-green-500' },
    NDR: { label: 'NDR', color: 'bg-orange-600' },
    RTO_IN_TRANSIT: { label: 'RTO In Transit', color: 'bg-purple-500' },
    RTO_DELIVERED: { label: 'RTO Delivered', color: 'bg-purple-700' },
    RETURN: { label: 'Return', color: 'bg-pink-500' },
    CANCELLED: { label: 'Cancelled', color: 'bg-red-600' },
  };
  return map[status] || { label: status, color: 'bg-gray-500' };
};

const AdminControl = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/orders/', { skipLoading: true });
      setOrders(res.data);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const updateStatus = async (orderId, newStatus) => {
    setUpdating(orderId);
    try {
      const res = await api.patch(`/api/orders/${orderId}/status/`, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
    setUpdating(null);
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)] p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">🛠️ Admin Control Panel</h1>
        <p className="text-xs mt-0.5 text-[var(--color-text-secondary)]">
          Simulate courier boy actions — update order statuses for testing
        </p>
      </div>

      {/* Info */}
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-3">
        <p className="text-sm text-red-400">
          ⚠️ <strong>Admin Only</strong> — This page simulates actions performed by the courier delivery partner.
          Use the dropdown on each order to change its status.
        </p>
      </div>

      {/* Filter */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 border border-[var(--color-border)] flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Filter by status:</span>
        <select
          className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26]"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="ALL" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">All Orders</option>
          <option value="IN_TRANSIT" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">In Transit</option>
          <option value="OUT_FOR_DELIVERY" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Out for Delivery</option>
          <option value="DELIVERED" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Delivered</option>
          <option value="NDR" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">NDR</option>
          <option value="RTO_IN_TRANSIT" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">RTO In Transit</option>
          <option value="RTO_DELIVERED" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">RTO Delivered</option>
          <option value="RETURN" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Return</option>
          <option value="CANCELLED" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Cancelled</option>
          <option value="PROCESSING" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Processing</option>
          <option value="MANIFESTED" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Manifested</option>
          <option value="PICKUP_PENDING" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Pickup Pending</option>
          <option value="NOT_PICKED" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Not Picked</option>
        </select>
        <button onClick={fetchOrders} className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
          Refresh
        </button>
        <span className="text-xs text-[var(--color-text-secondary)]">{filteredOrders.length} orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tracking ID</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Destination</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Type</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Current Status</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Change To</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading all orders...</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No orders found</td></tr>
              ) : filteredOrders.map((o) => {
                const badge = getStatusBadge(o.status);
                return (
                  <tr key={o.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#d4af26]">{o.tracking_id}</span>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block">ID: {o.id}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{o.customer_name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)]">{o.customer_phone}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-[var(--color-text-secondary)]">{o.destination_pincode}</span>
                      <span className="text-[10px] text-[var(--color-text-secondary)] block">{o.destination_address?.substring(0, 40)}</span>
                    </td>
                    <td className="p-3">
                      <span className={`text-xs font-bold ${o.order_type === 'COD' ? 'text-green-400' : 'text-[#d4af26]'}`}>{o.order_type}</span>
                      <span className="text-xs text-[var(--color-text-primary)] block">₹{o.cod_amount}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`text-[10px] font-bold text-white px-3 py-1 rounded-full ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <select
                          disabled={updating === o.id}
                          className="bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-2 py-1.5 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26] disabled:opacity-50"
                          defaultValue=""
                          onChange={(e) => {
                            if (e.target.value) {
                              updateStatus(o.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                        >
                          <option value="" disabled className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Select...</option>
                          {STATUS_OPTIONS.map(s => (
                            <option key={s.value} value={s.value} disabled={s.value === o.status} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">{s.label}</option>
                          ))}
                        </select>
                        {updating === o.id && <span className="text-[10px] text-[#d4af26] animate-pulse">Updating...</span>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminControl;
