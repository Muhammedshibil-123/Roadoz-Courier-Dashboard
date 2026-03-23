import React, { useState, useEffect } from "react";
import {
  FaMoneyBillWave,
  FaClock,
  FaCheckCircle,
  FaExchangeAlt,
  FaFilter,
} from "react-icons/fa";
import api from "../../../lib/axios";

const CODRemittance = () => {
  const [remittances, setRemittances] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  const fetchData = async () => {
    setLoading(true);
    try {
      const statusParam = filter !== "ALL" ? `?status=${filter}` : "";
      const [remRes, sumRes] = await Promise.all([
        api.get(`/api/finance/remittances/${statusParam}`, {
          skipLoading: true,
        }),
        api.get("/api/finance/remittances/summary/", { skipLoading: true }),
      ]);
      setRemittances(remRes.data);
      setSummary(sumRes.data);
    } catch {
      setRemittances([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const inputClass =
    "bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] focus:outline-none focus:border-[#d4af26] transition-colors";

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          COD Remittance
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            COD Remittance
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
              Already Remitted
            </p>
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <FaCheckCircle className="text-green-400 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-black text-green-400">
            ₹{summary?.total_remitted?.toLocaleString() || "0"}
          </p>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            {summary?.transferred_count || 0} orders transferred
          </p>
        </div>

        <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
              Due Cash (Pending)
            </p>
            <div className="w-8 h-8 rounded-full bg-[#d4af26]/10 flex items-center justify-center">
              <FaClock className="text-[#d4af26] text-sm" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#d4af26]">
            ₹{summary?.total_pending?.toLocaleString() || "0"}
          </p>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            {summary?.pending_count || 0} orders waiting for admin approval
          </p>
        </div>

        <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
              Total COD Delivered
            </p>
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <FaMoneyBillWave className="text-blue-400 text-sm" />
            </div>
          </div>
          <p className="text-2xl font-black text-blue-400">
            {summary?.total_count || 0}
          </p>
          <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
            Total delivered COD orders
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Remittance Records
          </h2>
          <div className="flex items-center gap-3">
            <FaFilter className="text-[var(--color-text-secondary)] text-xs" />
            <select
              className={`${inputClass} w-40`}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option
                value="ALL"
                className="bg-white dark:bg-[#1a2332] text-black dark:text-white"
              >
                All
              </option>
              <option
                value="PENDING"
                className="bg-white dark:bg-[#1a2332] text-black dark:text-white"
              >
                Pending
              </option>
              <option
                value="TRANSFERRED"
                className="bg-white dark:bg-[#1a2332] text-black dark:text-white"
              >
                Remitted
              </option>
            </select>
            <button
              onClick={fetchData}
              className="bg-[#d4af26]/20 text-[#d4af26] hover:bg-[#d4af26]/30 text-xs font-semibold px-4 py-2 rounded-md transition-colors border border-[#d4af26]/30"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : remittances.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto">
              <FaMoneyBillWave className="text-[var(--color-text-secondary)] text-xl" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              No remittance records found
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              COD remittance records appear here when COD orders are marked as
              "Delivered" in the admin control panel.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="bg-[#d4af26]/10 border border-[#d4af26]/30">
                  {[
                    "#",
                    "Tracking ID",
                    "Customer",
                    "COD Amount",
                    "Delivered On",
                    "Status",
                    "Remitted On",
                  ].map((col) => (
                    <th
                      key={col}
                      className="p-3 text-left text-[11px] font-semibold text-[#d4af26] uppercase tracking-wider"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {remittances.map((r, idx) => (
                  <tr
                    key={r.id}
                    className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-sm font-bold text-[var(--color-text-secondary)]">
                      {idx + 1}
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[#d4af26]">
                        {r.tracking_id}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">
                        {r.customer_name}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)]">
                        {r.customer_phone}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm font-bold text-[var(--color-text-primary)]">
                        ₹{parseFloat(r.cod_amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-[var(--color-text-secondary)]">
                      {formatDate(r.delivered_at)}
                    </td>
                    <td className="p-3">
                      {r.status === "TRANSFERRED" ? (
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2.5 py-1 rounded-full">
                          REMITTED
                        </span>
                      ) : (
                        <span className="bg-[#d4af26]/20 text-[#d4af26] text-[10px] font-bold px-2.5 py-1 rounded-full animate-pulse">
                          PENDING
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-[var(--color-text-secondary)]">
                      {formatDate(r.transferred_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CODRemittance;
