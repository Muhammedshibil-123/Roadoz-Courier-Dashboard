import React, { useState, useEffect } from "react";
import { FaDownload } from "react-icons/fa";
import api from "../../../lib/axios";
import {
  OrderFilterBar,
  OrderPagination,
  useOrderFilters,
  exportOrdersCsv,
} from "../../../components/OrderFilterBar";

const Return = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrders, setSelectedOrders] = useState([]);

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
    (async () => {
      try {
        const res = await api.get("/api/orders/?status=RETURN", {
          skipLoading: true,
        });
        setOrders(res.data);
      } catch {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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
        title="Return Orders"
        currentPath="/orders/return"
        filters={filters}
        actionButtons={
          <button
            onClick={() => exportOrdersCsv(filteredOrders, "return_orders")}
            disabled={filteredOrders.length === 0}
            className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <FaDownload className="text-[10px]" /> Export
          </button>
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
                  Shipment
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
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-[var(--color-text-secondary)]"
                  >
                    Loading...
                  </td>
                </tr>
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-[var(--color-text-secondary)]"
                  >
                    {filters.hasActiveFilters
                      ? "No orders match your filters"
                      : "No return orders"}
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[#d4af26] cursor-pointer"
                        checked={selectedOrders.includes(o.id)}
                        onChange={() => toggleSelect(o.id)}
                      />
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">
                        {o.customer_name}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {o.customer_phone}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#d4af26]">
                        {o.tracking_id}
                      </span>
                      <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded bg-pink-500 ml-2">
                        RETURN
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[var(--color-text-secondary)]">
                      {o.destination_pincode}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-bold ${o.order_type === "COD" ? "text-green-400" : "text-[#d4af26]"}`}
                      >
                        {o.order_type}
                      </span>
                      <span className="text-sm text-[var(--color-text-primary)] block">
                        ₹{o.cod_amount}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[var(--color-text-primary)]">
                      {o.weight} kg
                    </td>
                    <td className="p-3 text-[11px] text-[var(--color-text-secondary)]">
                      {new Date(o.created_at).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
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

export default Return;
