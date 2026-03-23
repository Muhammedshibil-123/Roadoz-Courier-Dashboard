import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaDownload, FaTrash } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import api from "../../lib/axios";
import {
  OrderFilterBar,
  OrderPagination,
  useOrderFilters,
  exportOrdersCsv,
} from "../../components/OrderFilterBar";

const ProcessingOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [advancing, setAdvancing] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const filters = useOrderFilters(orders);
  const {
    filteredOrders,
    paginatedOrders,
    currentPage,
    setCurrentPage,
    totalPages,
    itemsPerPage,
  } = filters;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/api/orders/?status=PROCESSING", {
        skipLoading: true,
      });
      setOrders(res.data);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdvance = async (orderId) => {
    setAdvancing(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/advance/`);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to advance order");
    }
    setAdvancing(null);
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.length === 0) {
      alert("Select at least one order.");
      return;
    }
    if (
      !window.confirm(
        `Delete ${selectedOrders.length} order(s)? This cannot be undone.`,
      )
    )
      return;
    setDeleting(true);
    try {
      const res = await api.post("/api/orders/bulk-delete/", {
        ids: selectedOrders,
      });
      alert(res.data.detail);
      setOrders((prev) => prev.filter((o) => !selectedOrders.includes(o.id)));
      setSelectedOrders([]);
    } catch (err) {
      alert(err.response?.data?.detail || "Failed to delete orders.");
    }
    setDeleting(false);
  };

  const toggleSelect = (id) =>
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const pageIds = paginatedOrders.map((o) => o.id);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedOrders.includes(id));
  const toggleSelectAll = () => {
    if (allPageSelected)
      setSelectedOrders((prev) => prev.filter((id) => !pageIds.includes(id)));
    else setSelectedOrders((prev) => [...new Set([...prev, ...pageIds])]);
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      <OrderFilterBar
        title="Processing Orders"
        currentPath="/processing-order"
        filters={filters}
        actionButtons={
          <>
            <button
              onClick={() => navigate("/settings/pickup-address")}
              className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
            >
              <MdLocationOn className="text-sm" /> Change Pickup Address
            </button>
            <button
              onClick={() =>
                exportOrdersCsv(filteredOrders, "processing_orders")
              }
              disabled={filteredOrders.length === 0}
              className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FaDownload className="text-[10px]" /> Export
            </button>
            <button
              onClick={handleBulkDelete}
              disabled={deleting || selectedOrders.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            >
              <FaTrash className="text-[10px]" />{" "}
              {deleting
                ? "Deleting..."
                : `Delete${selectedOrders.length > 0 ? ` (${selectedOrders.length})` : ""}`}
            </button>
          </>
        }
      />

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-left w-10">
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                    checked={allPageSelected}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Customer
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Tracking
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Route
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Payment
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Weight
                </th>
                <th className="p-3 text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Created
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Manifest ✓
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-sm text-[var(--color-text-secondary)]"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="p-8 text-center text-sm text-[var(--color-text-secondary)]"
                  >
                    {filters.hasActiveFilters
                      ? "No orders match your filters"
                      : "No processing orders"}
                    {filters.hasActiveFilters && (
                      <button
                        onClick={filters.clearFilters}
                        className="text-xs text-[#d4af26] hover:underline ml-2"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                        checked={selectedOrders.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">
                        {order.customer_name}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {order.customer_phone}
                      </span>
                      <span className="text-[9px] font-bold text-[#d4af26] bg-[#d4af26]/10 px-1.5 py-0.5 rounded uppercase tracking-wide ml-2">
                        PROCESSING
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#d4af26]">
                        {order.tracking_id}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                        <MdLocationOn className="text-sm flex-shrink-0" />
                        <span>{order.destination_pincode}</span>
                      </div>
                      <span className="text-[10px] text-[var(--color-text-secondary)]">
                        {order.destination_address?.substring(0, 30)}...
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-bold ${order.order_type === "COD" ? "text-green-400" : "text-[#d4af26]"}`}
                      >
                        {order.order_type}
                      </span>
                      <span className="text-sm text-[var(--color-text-primary)] block">
                        ₹
                        {order.order_type === "COD"
                          ? order.cod_amount
                          : order.product_amount}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs font-medium text-[var(--color-text-primary)]">
                        {order.weight} kg
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-[11px] text-[var(--color-text-secondary)]">
                        {new Date(order.created_at).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleAdvance(order.id)}
                        disabled={advancing === order.id}
                        className="w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-md flex items-center justify-center mx-auto transition-colors disabled:opacity-50"
                        title="Tick to Manifest"
                      >
                        {advancing === order.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <FaCheck className="text-sm" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <OrderPagination
          currentPage={currentPage}
          totalPages={totalPages}
          setCurrentPage={setCurrentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
        />
      </div>
    </div>
  );
};

export default ProcessingOrders;
