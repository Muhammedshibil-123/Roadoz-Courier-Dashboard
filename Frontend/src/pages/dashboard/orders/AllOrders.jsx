import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaPrint, FaPen, FaDownload, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { MdLocationOn } from 'react-icons/md';
import api from '../../../lib/axios';

const mockOrders = [
  {
    id: 1,
    customer: { name: 'Arjun Sharma', phone: '+91 9876543210' },
    shipment: { orderId: 'ORD-5542', awb: 'AWB: 982231011', status: 'Manifested', statusColor: 'bg-[#d4af26]' },
    route: { from: 'Mumbai', to: 'Delhi', type: 'Standard Shipping' },
    payment: { amount: '₹1,250.00', method: 'PREPAID', color: 'text-[#d4af26]' },
    weight: '0.5 kg',
    created: 'Oct 12, 2023\n10:45 AM',
    actions: ['eye', 'print'],
  },
  {
    id: 2,
    customer: { name: 'Priya Patel', phone: '+91 8765432109' },
    shipment: { orderId: 'ORD-5541', awb: 'AWB: 982231010', status: 'Not Picked', statusColor: 'bg-red-500' },
    route: { from: 'Surat', to: 'Bangalore', type: 'Express' },
    payment: { amount: '₹890.00', method: 'COD', color: 'text-green-400' },
    weight: '1.2 kg',
    created: 'Oct 12, 2023\n09:15 AM',
    actions: ['eye', 'edit'],
  },
  {
    id: 3,
    customer: { name: 'Rahul Verma', phone: '+91 7654321098' },
    shipment: { orderId: 'ORD-5540', awb: 'AWB: 982231009', status: 'Manifested', statusColor: 'bg-[#d4af26]' },
    route: { from: 'Pune', to: 'Chennai', type: 'Standard Shipping' },
    payment: { amount: '₹2,100.00', method: 'PREPAID', color: 'text-[#d4af26]' },
    weight: '2.5 kg',
    created: 'Oct 11, 2023\n04:30 PM',
    actions: ['eye', 'print'],
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

const AllOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('All Orders');
  const [filters, setFilters] = useState({
    timeRange: '2026-03-07 to 2026-03-13',
    orderIds: '', awbNo: '', buyerName: '', paymentMethod: 'All', limit: '25',
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/api/orders/', { skipLoading: true });
        // Map backend data to display format
        const mapped = res.data.map((o) => ({
          id: o.id,
          customer: { name: o.customer_name, phone: o.customer_phone },
          shipment: {
            orderId: o.tracking_id,
            awb: `AWB: ${o.tracking_id}`,
            status: o.status.replace('_', ' '),
            statusColor: o.status === 'DELIVERED' ? 'bg-green-500' : o.status === 'CANCELLED' ? 'bg-red-500' : 'bg-[#d4af26]',
          },
          route: { from: o.destination_pincode, to: o.destination_address?.split(',').pop()?.trim() || '', type: o.order_type },
          payment: {
            amount: `₹${parseFloat(o.cod_amount || 0).toFixed(2)}`,
            method: o.order_type,
            color: o.order_type === 'COD' ? 'text-green-400' : 'text-[#d4af26]',
          },
          weight: `${o.weight} kg`,
          created: new Date(o.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
          actions: ['eye', 'print'],
          status: o.status,
        }));
        setOrders(mapped);
      } catch (err) {
        console.log('Orders API not available, using mock data');
        setOrders(mockOrders);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleSelect = (id) => {
    setSelectedOrders((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  const renderActionIcon = (type) => {
    const cls = 'p-1.5 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors';
    switch (type) {
      case 'eye': return <button className={cls} title="View"><FaEye className="text-xs" /></button>;
      case 'print': return <button className={cls} title="Print"><FaPrint className="text-xs" /></button>;
      case 'edit': return <button className={cls} title="Edit"><FaPen className="text-xs" /></button>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">All Orders</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span>
          <span className="text-[var(--color-text-secondary)]">All Orders</span>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">All Order</h2>
          <div className="flex flex-wrap gap-2">
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center gap-1.5 transition-colors">
              <FaDownload className="text-[10px]" /> Labels
            </button>
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
              <option value="All">All</option>
              <option value="COD">COD</option>
              <option value="Prepaid">Prepaid</option>
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
              {['All Orders', 'Not Picked'].map((opt) => (
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

      {/* Tabs */}
      <div className="border-b border-[var(--color-border)] overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {tabs.map((tab) => (
            <button key={tab.label} onClick={() => navigate(tab.path)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${tab.path === '/orders/all' ? 'text-[var(--color-text-primary)] border-[#d4af26]' : 'text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-primary)]'}`}>
              {tab.label}({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left w-10"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.length === orders.length} onChange={() => setSelectedOrders(selectedOrders.length === orders.length ? [] : orders.map(o => o.id))} /></th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Customer Details</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Shipment Details</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Route</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Payment</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Weight</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Created At</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">Loading orders...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan="9" className="p-8 text-center text-sm text-[var(--color-text-secondary)]">No orders found</td></tr>
              ) : orders.map((order) => (
                <tr key={order.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3"><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" checked={selectedOrders.includes(order.id)} onChange={() => toggleSelect(order.id)} /></td>
                  <td className="p-3">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{order.customer.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)]">{order.customer.phone}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[var(--color-text-primary)]">{order.shipment.orderId}</span>
                      <span className={`text-[9px] font-bold text-white px-2 py-0.5 rounded ${order.shipment.statusColor}`}>{order.shipment.status}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{order.shipment.awb}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <MdLocationOn className="text-sm flex-shrink-0" />
                      <span>{order.route.from} → {order.route.to}</span>
                    </div>
                    <span className="text-[10px] text-[var(--color-text-secondary)] ml-4">{order.route.type}</span>
                  </td>
                  <td className="p-3">
                    <span className="text-sm font-medium text-[var(--color-text-primary)] block">{order.payment.amount}</span>
                    <span className={`text-[10px] font-bold ${order.payment.color}`}>{order.payment.method}</span>
                  </td>
                  <td className="p-3"><span className="text-xs text-[var(--color-text-primary)]">{order.weight}</span></td>
                  <td className="p-3"><span className="text-[11px] text-[var(--color-text-secondary)] whitespace-pre-line">{order.created}</span></td>
                  <td className="p-3 text-center">
                    {(() => {
                      const statusMap = {
                        PROCESSING: { label: 'Processing', bg: 'bg-gray-500' },
                        MANIFESTED: { label: 'Manifested', bg: 'bg-[#d4af26]' },
                        PICKUP_PENDING: { label: 'Pickup Pending', bg: 'bg-orange-500' },
                        NOT_PICKED: { label: 'Not Picked', bg: 'bg-red-500' },
                        IN_TRANSIT: { label: 'In Transit', bg: 'bg-blue-500' },
                        OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-blue-600' },
                        DELIVERED: { label: 'Delivered', bg: 'bg-green-500' },
                        NDR: { label: 'NDR', bg: 'bg-orange-600' },
                        RTO_IN_TRANSIT: { label: 'RTO In Transit', bg: 'bg-purple-500' },
                        RTO_DELIVERED: { label: 'RTO Delivered', bg: 'bg-purple-700' },
                        RETURN: { label: 'Return', bg: 'bg-pink-500' },
                        CANCELLED: { label: 'Cancelled', bg: 'bg-red-600' },
                      };
                      const s = statusMap[order.status] || { label: order.status || 'Unknown', bg: 'bg-gray-500' };
                      return <span className={`text-[9px] font-bold text-white px-2.5 py-1 rounded-full ${s.bg}`}>{s.label}</span>;
                    })()}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {order.actions.map((a, i) => <React.Fragment key={i}>{renderActionIcon(a)}</React.Fragment>)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end gap-1 p-4">
          <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><FaChevronLeft className="text-xs" /></button>
          {[1, 2, 3].map((p) => (<button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 flex items-center justify-center rounded text-xs font-medium ${currentPage === p ? 'bg-[#3B82F6] text-white' : 'text-[var(--color-text-secondary)]'}`}>{p}</button>))}
          <button onClick={() => setCurrentPage(p => Math.min(3, p + 1))} className="w-8 h-8 flex items-center justify-center rounded text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"><FaChevronRight className="text-xs" /></button>
        </div>
      </div>
    </div>
  );
};

export default AllOrders;
