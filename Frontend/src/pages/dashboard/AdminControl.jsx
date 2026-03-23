import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaMapMarkerAlt, FaExchangeAlt, FaMoneyBillWave, FaTicketAlt, FaPaperPlane } from 'react-icons/fa';
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

  // Non-delivery pincodes state
  const [blockedPincodes, setBlockedPincodes] = useState([]);
  const [pincodeLoading, setPincodeLoading] = useState(true);
  const [newPincode, setNewPincode] = useState('');
  const [newReason, setNewReason] = useState('');
  const [pincodeError, setPincodeError] = useState('');
  const [pincodeSuccess, setPincodeSuccess] = useState('');

  // Remittance state
  const [remittances, setRemittances] = useState([]);
  const [remLoading, setRemLoading] = useState(true);
  const [transferring, setTransferring] = useState(null);
  const [bulkTransferring, setBulkTransferring] = useState(false);

  // Tickets state
  const [openTickets, setOpenTickets] = useState([]);
  const [ticketsLoading, setTicketsLoading] = useState(true);
  const [replyTicketId, setReplyTicketId] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  useEffect(() => {
    fetchOrders();
    fetchBlockedPincodes();
    fetchRemittances();
    fetchOpenTickets();
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
      if (newStatus === 'DELIVERED') {
         fetchRemittances(); // refresh remittances if needed
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update status');
    }
    setUpdating(null);
  };

  // --- Remittances ---
  const fetchRemittances = async () => {
    setRemLoading(true);
    try {
      const res = await api.get('/api/finance/remittances/?status=PENDING', { skipLoading: true });
      setRemittances(res.data);
    } catch {
      setRemittances([]);
    } finally {
      setRemLoading(false);
    }
  };

  const handleTransfer = async (id) => {
    setTransferring(id);
    try {
      await api.post(`/api/finance/remittances/${id}/transfer/`);
      fetchRemittances();
    } catch (err) {
      alert(err.response?.data?.detail || 'Transfer failed');
    } finally {
      setTransferring(null);
    }
  };

  const handleBulkTransfer = async () => {
    if (!confirm('Transfer ALL pending COD amounts?')) return;
    setBulkTransferring(true);
    try {
      await api.post('/api/finance/remittances/transfer-all/');
      fetchRemittances();
    } catch (err) {
      alert(err.response?.data?.detail || 'Bulk transfer failed');
    } finally {
      setBulkTransferring(false);
    }
  };

  // --- Tickets ---
  const fetchOpenTickets = async () => {
    setTicketsLoading(true);
    try {
      const res = await api.get('/api/auth/tickets/open-all/', { skipLoading: true });
      setOpenTickets(res.data);
    } catch {
      setOpenTickets([]);
    } finally {
      setTicketsLoading(false);
    }
  };

  const handleAdminReply = async (ticketId) => {
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await api.post(`/api/auth/tickets/${ticketId}/admin-reply/`, { message: replyText });
      setReplyText('');
      setReplyTicketId(null);
      fetchOpenTickets();
    } catch {
      alert('Failed to send reply');
    } finally {
      setReplying(false);
    }
  };

  // --- Non-delivery pincodes ---
  const fetchBlockedPincodes = async () => {
    setPincodeLoading(true);
    try {
      const res = await api.get('/api/auth/settings/non-delivery-pincodes/', { skipLoading: true });
      setBlockedPincodes(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setBlockedPincodes([]);
    } finally {
      setPincodeLoading(false);
    }
  };

  const addPincode = async () => {
    if (!newPincode || newPincode.length < 4) {
      setPincodeError('Enter a valid pincode.');
      return;
    }
    setPincodeError('');
    try {
      await api.post('/api/auth/settings/non-delivery-pincodes/', {
        pincode: newPincode,
        reason: newReason || 'Not serviceable',
      });
      setNewPincode('');
      setNewReason('');
      setPincodeSuccess('Pincode added!');
      fetchBlockedPincodes();
      setTimeout(() => setPincodeSuccess(''), 2000);
    } catch (err) {
      const data = err.response?.data;
      if (data?.pincode) {
        setPincodeError(Array.isArray(data.pincode) ? data.pincode[0] : data.pincode);
      } else {
        setPincodeError('Failed to add pincode.');
      }
    }
  };

  const removePincode = async (id) => {
    try {
      await api.delete(`/api/auth/settings/non-delivery-pincodes/${id}/`);
      fetchBlockedPincodes();
    } catch {
      // Silent
    }
  };

  const filteredOrders = statusFilter === 'ALL'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  const inputClass = 'bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

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

      {/* ============= NON-DELIVERY PINCODES SECTION ============= */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center gap-2">
          <FaMapMarkerAlt className="text-red-400" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Non-Delivery Pincodes</h2>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Add pincodes where delivery is not available. Users checking these in the Serviceable Pincode tool will be told delivery isn't possible.
        </p>

        {/* Add pincode form */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Pincode *</label>
            <input
              type="text"
              placeholder="e.g. 110001"
              className={`${inputClass} w-36`}
              value={newPincode}
              onChange={(e) => { setNewPincode(e.target.value.replace(/[^0-9]/g, '')); setPincodeError(''); }}
              maxLength={10}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <label className="text-xs text-[var(--color-text-secondary)] mb-1 block">Reason (optional)</label>
            <input
              type="text"
              placeholder="e.g. Remote area, No delivery partner"
              className={`${inputClass} w-full`}
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
          </div>
          <button
            onClick={addPincode}
            className="bg-red-500 hover:bg-red-600 text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors flex items-center gap-1.5"
          >
            <FaPlus className="text-xs" />
            Block Pincode
          </button>
        </div>

        {pincodeError && <p className="text-xs text-red-400">{pincodeError}</p>}
        {pincodeSuccess && <p className="text-xs text-green-400">{pincodeSuccess}</p>}

        {/* Blocked pincodes list */}
        {pincodeLoading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Loading...</p>
        ) : blockedPincodes.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-4">No pincodes blocked yet. All pincodes are serviceable.</p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-2">
            {blockedPincodes.map((bp) => (
              <div
                key={bp.id}
                className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 group"
                title={bp.reason || 'No reason'}
              >
                <span className="text-sm font-bold text-red-400">{bp.pincode}</span>
                {bp.reason && <span className="text-[10px] text-[var(--color-text-secondary)] max-w-[120px] truncate">({bp.reason})</span>}
                <button
                  onClick={() => removePincode(bp.id)}
                  className="text-red-400/50 hover:text-red-400 transition-colors ml-1"
                  title="Remove"
                >
                  <FaTrash className="text-[10px]" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============= COD REMITTANCE SECTION ============= */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaMoneyBillWave className="text-[#d4af26]" />
            <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Pending COD Remittances</h2>
          </div>
          {remittances.length > 0 && (
            <button
              onClick={handleBulkTransfer}
              disabled={bulkTransferring}
              className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              {bulkTransferring ? 'Processing...' : 'Approve All Pending'}
            </button>
          )}
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Approve and transfer pending COD amounts from delivered orders to the user's wallet.
        </p>

        {remLoading ? (
          <p className="text-sm text-[var(--color-text-secondary)]">Loading pending remittances...</p>
        ) : remittances.length === 0 ? (
          <p className="text-sm text-[var(--color-text-secondary)] py-2">No pending remittances to process.</p>
        ) : (
          <div className="overflow-x-auto border border-[var(--color-border)] rounded-md">
            <table className="w-full min-w-[600px]">
              <thead className="bg-black/20 dark:bg-white/5">
                <tr>
                  <th className="p-2 text-left text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Tracking ID</th>
                  <th className="p-2 text-left text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer</th>
                  <th className="p-2 text-left text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Amount</th>
                  <th className="p-2 text-center text-[10px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {remittances.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-2">
                      <span className="text-xs font-bold text-[#d4af26]">{r.tracking_id}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-xs text-[var(--color-text-primary)] block">{r.customer_name}</span>
                    </td>
                    <td className="p-2">
                      <span className="text-xs font-bold text-[var(--color-text-primary)]">₹{parseFloat(r.cod_amount).toLocaleString()}</span>
                    </td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => handleTransfer(r.id)}
                        disabled={transferring === r.id}
                        className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        {transferring === r.id ? '...' : (
                          <>
                            <FaExchangeAlt className="text-[9px]" />
                            Approve
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============= ORDER STATUS SECTION ============= */}
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

      {/* ─── Open Support Tickets ──────────────────────────────── */}
      <div className="bg-white dark:bg-[var(--color-bg-surface)] rounded-lg shadow p-6 mt-6 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-4">
          <FaTicketAlt className="text-orange-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Open Support Tickets</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">View and reply to open tickets from sellers. Your reply will mark the ticket as "Answered".</p>

        {ticketsLoading ? (
          <p className="text-sm text-gray-400 py-4">Loading tickets...</p>
        ) : openTickets.length === 0 ? (
          <p className="text-sm text-green-500 py-4">All caught up! No open tickets.</p>
        ) : (
          <div className="space-y-3">
            {openTickets.map((t) => (
              <div key={t.id} className="border border-[var(--color-border)] rounded-lg p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-[#d4af26]">{t.ticket_id}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        t.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' :
                        t.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        t.priority === 'MEDIUM' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
                      }`}>{t.priority}</span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400">{t.category?.replace('_', ' ')}</span>
                      <span className="text-[9px] text-gray-500 dark:text-gray-400">by {t.username}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{t.subject}</p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 whitespace-pre-line">{t.message}</p>
                    {t.order_tracking_id && (
                      <p className="text-[10px] text-[#d4af26] mt-1">Order: {t.order_tracking_id}</p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] text-gray-500">Replies: {t.reply_count}</p>
                  </div>
                </div>

                {/* Reply area */}
                {replyTicketId === t.ticket_id ? (
                  <div className="mt-3 flex gap-2 items-end">
                    <textarea
                      className="flex-1 bg-white dark:bg-[#1a2332] border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 text-xs focus:outline-none focus:border-[#d4af26] resize-none min-h-[60px]"
                      placeholder="Type your admin reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={2}
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handleAdminReply(t.ticket_id)}
                        disabled={replying || !replyText.trim()}
                        className="p-2 bg-green-500 hover:bg-green-600 text-white rounded-md text-xs disabled:opacity-50"
                        title="Send Reply"
                      >
                        <FaPaperPlane />
                      </button>
                      <button
                        onClick={() => { setReplyTicketId(null); setReplyText(''); }}
                        className="p-2 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-md text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyTicketId(t.ticket_id)}
                    className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-green-500 hover:text-green-400 transition-colors"
                  >
                    <FaPaperPlane className="text-[10px]" /> Reply as Admin
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminControl;
