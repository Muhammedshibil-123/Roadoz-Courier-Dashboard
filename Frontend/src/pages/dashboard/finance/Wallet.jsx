import React, { useState, useEffect } from "react";
import api from "../../../lib/axios";

const Wallet = () => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, txRes] = await Promise.all([
          api.get("/api/finance/wallet/"),
          api.get("/api/finance/wallet/transactions/"),
        ]);
        setBalance(walletRes.data.balance);
        setTransactions(txRes.data);
      } catch (err) {
        console.error("Failed to fetch wallet data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const [filters, setFilters] = useState({
    timeRange: "",
    orderIds: "",
    type: "All",
    limit: "25",
  });

  const inputClass =
    "bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors";

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Wallet Transactions
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            Wallet Transactions
          </span>
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            (Showing: Wallet Transactions )
          </h2>
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">
            Export
          </button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">
              Time Range
            </label>
            <input
              type="text"
              placeholder="Select time and date"
              className={`${inputClass} w-44`}
              value={filters.timeRange}
              onChange={(e) =>
                setFilters({ ...filters, timeRange: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">
              Order Ids
            </label>
            <input
              type="text"
              placeholder="Order ids"
              className={`${inputClass} w-32`}
              value={filters.orderIds}
              onChange={(e) =>
                setFilters({ ...filters, orderIds: e.target.value })
              }
            />
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">
              Type:
            </label>
            <select
              className={`${inputClass} w-24`}
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="All">All</option>
              <option value="DEBIT">DEBIT</option>
              <option value="CREDIT">CREDIT</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-text-secondary)] mb-1 block">
              Limit:
            </label>
            <input
              type="text"
              className={`${inputClass} w-16`}
              value={filters.limit}
              onChange={(e) =>
                setFilters({ ...filters, limit: e.target.value })
              }
            />
          </div>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">
            Search
          </button>
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-md transition-colors">
            Clean Filter
          </button>
        </div>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  ID
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Amount
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Type
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Opening Bal.
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Closing Bal.
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Description
                </th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                  Created At
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
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="p-8 text-center text-sm text-[var(--color-text-secondary)]"
                  >
                    No transactions yet
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3 text-center text-sm font-bold text-[#d4af26]">
                      #{tx.id}
                    </td>
                    <td
                      className={`p-3 text-center text-sm font-semibold whitespace-pre-line ${tx.transaction_type === "CREDIT" ? "text-green-400" : "text-red-400"}`}
                    >
                      {tx.transaction_type === "CREDIT" ? "+" : "-"}₹{tx.amount}
                    </td>
                    <td className="p-3 text-center">
                      <span
                        className={`text-[10px] font-bold text-white px-3 py-1 rounded ${tx.transaction_type === "CREDIT" ? "bg-green-500" : "bg-red-500"}`}
                      >
                        {tx.transaction_type}
                      </span>
                    </td>
                    <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">
                      ₹{tx.opening_balance}
                    </td>
                    <td className="p-3 text-center text-sm text-[var(--color-text-primary)] whitespace-pre-line">
                      ₹{tx.closing_balance}
                    </td>
                    <td className="p-3 text-center text-xs text-[var(--color-text-secondary)] max-w-[200px]">
                      {tx.description}
                    </td>
                    <td className="p-3 text-center text-xs text-[var(--color-text-secondary)] whitespace-pre-line">
                      {new Date(tx.created_at).toLocaleString("en-IN", {
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
      </div>
    </div>
  );
};

export default Wallet;
