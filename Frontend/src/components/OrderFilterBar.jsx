import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import api from '../lib/axios';

// ─── Shared status map (status key → label + path + badge color) ──────
export const STATUS_MAP = {
  PROCESSING:       { label: 'Processing Order', path: '/processing-order',        badge: 'bg-gray-500' },
  MANIFESTED:       { label: 'Manifested',        path: '/orders/manifested',       badge: 'bg-[#d4af26]' },
  IN_TRANSIT:       { label: 'In Transit',        path: '/orders/in-transit',       badge: 'bg-blue-500' },
  NDR:              { label: 'NDR',               path: '/orders/ndr',             badge: 'bg-orange-600' },
  PICKUP_PENDING:   { label: 'Pending',           path: '/orders/pending',          badge: 'bg-orange-500' },
  OUT_FOR_DELIVERY: { label: 'Out For Delivery',  path: '/orders/out-of-delivery',  badge: 'bg-blue-600' },
  DELIVERED:        { label: 'Delivery',          path: '/orders/delivery',         badge: 'bg-green-500' },
  RTO_IN_TRANSIT:   { label: 'RTO In Transit',    path: '/orders/rto-in-transit',   badge: 'bg-purple-500' },
  RTO_DELIVERED:    { label: 'RTO Delivered',      path: '/orders/rto-delivery',     badge: 'bg-purple-700' },
  RETURN:           { label: 'Return',            path: '/orders/return',           badge: 'bg-pink-500' },
  CANCELLED:        { label: 'Lost / Cancelled',  path: '/orders/cancelled',        badge: 'bg-red-600' },
  NOT_PICKED:       { label: 'Not Picked',        path: '/orders/not-picked',       badge: 'bg-red-500' },
};

const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

// ─── useOrderFilters hook ─────────────────────────────────────
export function useOrderFilters(allOrders) {
  const [startDate, setStartDate]         = useState('');
  const [endDate, setEndDate]             = useState('');
  const [searchOrderId, setSearchOrderId] = useState('');
  const [searchBuyerName, setSearchBuyerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [limit, setLimit]                 = useState(25);
  const [currentPage, setCurrentPage]     = useState(1);

  const hasActiveFilters = !!(startDate || endDate || searchOrderId || searchBuyerName || paymentMethod !== 'All');

  const filteredOrders = useMemo(() => {
    let result = [...allOrders];
    if (startDate) { const s = new Date(startDate); s.setHours(0, 0, 0, 0); result = result.filter(o => new Date(o.created_at) >= s); }
    if (endDate)   { const e = new Date(endDate);   e.setHours(23, 59, 59, 999); result = result.filter(o => new Date(o.created_at) <= e); }
    if (searchOrderId.trim()) {
      const ids = searchOrderId.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      result = result.filter(o => ids.some(id => o.tracking_id?.toLowerCase().includes(id) || String(o.id).includes(id)));
    }
    if (searchBuyerName.trim()) {
      const n = searchBuyerName.trim().toLowerCase();
      result = result.filter(o => o.customer_name?.toLowerCase().includes(n));
    }
    if (paymentMethod !== 'All') {
      const type = paymentMethod === 'COD' ? 'COD' : 'PREPAID';
      result = result.filter(o => o.order_type === type);
    }
    return result;
  }, [allOrders, startDate, endDate, searchOrderId, searchBuyerName, paymentMethod]);

  const itemsPerPage = Math.max(1, Number(limit) || 25);
  const totalPages   = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const s = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(s, s + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  // reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [startDate, endDate, searchOrderId, searchBuyerName, paymentMethod, limit]);

  const clearFilters = () => {
    setStartDate(''); setEndDate(''); setSearchOrderId(''); setSearchBuyerName('');
    setPaymentMethod('All'); setLimit(25);
  };

  return {
    startDate, setStartDate, endDate, setEndDate,
    searchOrderId, setSearchOrderId, searchBuyerName, setSearchBuyerName,
    paymentMethod, setPaymentMethod, limit, setLimit,
    currentPage, setCurrentPage,
    hasActiveFilters, clearFilters,
    filteredOrders, paginatedOrders, totalPages, itemsPerPage,
  };
}

// ─── Export helper ────────────────────────────────────────────
export function exportOrdersCsv(orders, filenamePrefix = 'orders') {
  if (!orders.length) { alert('No orders to export.'); return; }
  const header = ['Tracking ID','Buyer Name','Buyer Mobile','Address','PinCode','Order Status','Order Date','Weight (kg)','Type','COD Amount','Product Value','Last Updated'];
  const rows = orders.map(o => [
    o.tracking_id||'', o.customer_name||'', o.customer_phone||'',
    o.destination_address||'', o.destination_pincode||'',
    o.status?.replace(/_/g,' ')||'',
    o.created_at ? new Date(o.created_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '',
    o.weight||0, o.order_type||'',
    o.order_type==='COD' ? (o.cod_amount||0) : 0,
    o.product_amount||0,
    o.updated_at ? new Date(o.updated_at).toLocaleString('en-IN',{dateStyle:'medium',timeStyle:'short'}) : '',
  ]);
  const esc = v => { const s = String(v); return (s.includes(',')||s.includes('"')||s.includes('\n')) ? `"${s.replace(/"/g,'""')}"` : s; };
  const csv = [header.map(esc).join(','), ...rows.map(r => r.map(esc).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url;
  a.setAttribute('download', `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(a); a.click(); window.URL.revokeObjectURL(url); a.remove();
}

// ─── OrderFilterBar component ─────────────────────────────────
export function OrderFilterBar({
  title, currentPath, filters, actionButtons, children: extraContent,
}) {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});

  useEffect(() => {
    api.get('/api/orders/stats/', { skipLoading: true }).then(r => setStats(r.data)).catch(() => {});
  }, []);

  const {
    startDate, setStartDate, endDate, setEndDate,
    searchOrderId, setSearchOrderId, searchBuyerName, setSearchBuyerName,
    paymentMethod, setPaymentMethod, limit, setLimit,
    hasActiveFilters, clearFilters,
    filteredOrders,
  } = filters;

  // Build dropdown options from STATUS_MAP
  const statusOptions = Object.entries(STATUS_MAP).map(([key, { label, path }]) => ({
    key, label: `${label} (${stats[key] || 0})`, path,
  }));

  const handleStatusNav = (e) => {
    const path = e.target.value;
    if (path) navigate(path);
  };

  return (
    <>
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">{title}</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span>
          <span className="text-[var(--color-text-secondary)]">{title}</span>
        </p>
      </div>

      {extraContent}

      {/* Filters + Actions */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">{title}</h2>
          <div className="flex flex-wrap gap-2">
            {actionButtons}
          </div>
        </div>

        {/* Filter Row */}
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Start Date</label>
            <input type="date" className={`${inputClass} w-40`} value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">End Date</label>
            <input type="date" className={`${inputClass} w-40`} value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Order / Tracking ID</label>
            <input type="text" placeholder="e.g. RDZ123, RDZ456" className={`${inputClass} w-44`} value={searchOrderId} onChange={e => setSearchOrderId(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Buyer Name</label>
            <input type="text" placeholder="Search buyer..." className={`${inputClass} w-36`} value={searchBuyerName} onChange={e => setSearchBuyerName(e.target.value)} />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Payment Method</label>
            <select className={`${inputClass} w-28`} value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}>
              <option value="All" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">All</option>
              <option value="COD" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">COD</option>
              <option value="Prepaid" className="bg-white dark:bg-[#1a2332] text-black dark:text-white">Prepaid</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Per Page</label>
            <select className={`${inputClass} w-20`} value={limit} onChange={e => setLimit(Number(e.target.value))}>
              <option value={10} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">10</option>
              <option value={25} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">25</option>
              <option value={50} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">50</option>
              <option value={100} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">100</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">Status</label>
            <select
              className={`${inputClass} w-48`}
              value={currentPath}
              onChange={handleStatusNav}
            >
              {statusOptions.map(opt => (
                <option key={opt.key} value={opt.path} className="bg-white dark:bg-[#1a2332] text-black dark:text-white">{opt.label}</option>
              ))}
            </select>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="bg-transparent border border-red-500/50 text-red-400 hover:bg-red-500/10 text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 h-fit"
            >
              <FaTimes className="text-[10px]" /> Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
}

// ─── OrderPagination component ────────────────────────────────
export function OrderPagination({ currentPage, totalPages, setCurrentPage, totalItems, itemsPerPage }) {
  const getPages = () => {
    const pages = [];
    const max = 5;
    let start = Math.max(1, currentPage - Math.floor(max / 2));
    let end = Math.min(totalPages, start + max - 1);
    if (end - start < max - 1) start = Math.max(1, end - max + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  return (
    <div className="flex items-center justify-between p-4 border-t border-[var(--color-border)]">
      <span className="text-xs text-[var(--color-text-secondary)]">
        {totalItems > 0
          ? `Showing ${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalItems)} of ${totalItems}`
          : 'No orders'
        }
      </span>
      <div className="flex items-center gap-1">
        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
          className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] disabled:opacity-30">
          <FaChevronLeft className="text-xs" />
        </button>
        {getPages().map(p => (
          <button key={p} onClick={() => setCurrentPage(p)}
            className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${currentPage === p ? 'bg-[#3B82F6] text-white' : 'text-[var(--color-text-secondary)] hover:bg-white/10'}`}>
            {p}
          </button>
        ))}
        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] disabled:opacity-30">
          <FaChevronRight className="text-xs" />
        </button>
      </div>
    </div>
  );
}

export default OrderFilterBar;
