import React, { useState, useEffect } from "react";
import {
  FaFileInvoiceDollar,
  FaChevronDown,
  FaChevronUp,
  FaDownload,
  FaTruck,
  FaBoxOpen,
  FaPercent,
} from "react-icons/fa";
import api from "../../../lib/axios";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/finance/invoices/", {
        skipLoading: true,
      });
      setInvoices(res.data);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (idx) => {
    setExpandedInvoice(expandedInvoice === idx ? null : idx);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownload = (inv) => {
    let text = `ROADOZ COURIER — SHIPPING INVOICE\n`;
    text += `${"═".repeat(50)}\n\n`;
    text += `Invoice No : ${inv.invoice_number}\n`;
    text += `Period     : ${inv.period_label}\n`;
    text += `Orders     : ${inv.order_count}\n\n`;
    text += `${"─".repeat(50)}\n`;
    text += `CHARGES BREAKDOWN\n`;
    text += `${"─".repeat(50)}\n`;
    text += `Delivery Charge (₹${inv.delivery_charge_per_order} × ${inv.order_count})  : ₹${inv.subtotal.toLocaleString()}\n`;
    text += `GST (${inv.gst_rate}%)                            : ₹${inv.gst_amount.toLocaleString()}\n`;
    text += `${"─".repeat(50)}\n`;
    text += `TOTAL                                : ₹${inv.total_amount.toLocaleString()}\n`;
    text += `${"═".repeat(50)}\n\n`;
    text += `ORDER DETAILS\n`;
    text += `${"─".repeat(50)}\n`;
    inv.orders?.forEach((o, i) => {
      text += `${i + 1}. ${o.tracking_id} | ${o.customer_name} | ${o.order_type} | ₹${o.product_amount}\n`;
    });
    text += `\n${"═".repeat(50)}\n`;
    text += `Generated on: ${new Date().toLocaleDateString("en-IN")}\n`;

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoice_number}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalDeliveryCharges = invoices.reduce(
    (sum, inv) => sum + inv.subtotal,
    0,
  );
  const totalGST = invoices.reduce((sum, inv) => sum + inv.gst_amount, 0);
  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  const totalOrders = invoices.reduce((sum, inv) => sum + inv.order_count, 0);

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Shipping Invoices
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Invoices</span>
        </p>
      </div>

      {!loading && invoices.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
                Total Billed
              </p>
              <div className="w-8 h-8 rounded-full bg-[#d4af26]/10 flex items-center justify-center">
                <FaFileInvoiceDollar className="text-[#d4af26] text-sm" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#d4af26]">
              ₹{totalAmount.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Across {invoices.length} invoices
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
                Delivery Charges
              </p>
              <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                <FaTruck className="text-blue-400 text-sm" />
              </div>
            </div>
            <p className="text-2xl font-black text-blue-400">
              ₹{totalDeliveryCharges.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              ₹100 per order
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
                GST Charged
              </p>
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
                <FaPercent className="text-purple-400 text-sm" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-400">
              ₹{totalGST.toLocaleString()}
            </p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              18% GST on charges
            </p>
          </div>

          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[var(--color-text-secondary)] uppercase tracking-wider font-bold">
                Orders Shipped
              </p>
              <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <FaBoxOpen className="text-green-400 text-sm" />
              </div>
            </div>
            <p className="text-2xl font-black text-green-400">{totalOrders}</p>
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
              Total delivered orders
            </p>
          </div>
        </div>
      )}

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
            Monthly Invoices
          </h2>
          <button
            onClick={fetchInvoices}
            className="bg-[#d4af26]/20 text-[#d4af26] hover:bg-[#d4af26]/30 text-xs font-semibold px-4 py-2 rounded-md transition-colors border border-[#d4af26]/30"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto">
              <FaFileInvoiceDollar className="text-[var(--color-text-secondary)] text-xl" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">
              No invoices yet
            </p>
            <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mx-auto">
              Invoices are auto-generated monthly based on your delivered
              orders. Ship your first order to see an invoice here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {invoices.map((inv, idx) => (
              <div
                key={inv.invoice_number}
                className="border border-[var(--color-border)] rounded-lg overflow-hidden"
              >
                <div
                  className="flex flex-wrap items-center justify-between gap-3 p-4 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                  onClick={() => toggleExpand(idx)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#d4af26]/10 flex items-center justify-center flex-shrink-0">
                      <FaFileInvoiceDollar className="text-[#d4af26]" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#d4af26]">
                        {inv.invoice_number}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-secondary)]">
                        {inv.period_label}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[var(--color-text-secondary)] uppercase">
                        Orders
                      </p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">
                        {inv.order_count}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[var(--color-text-secondary)] uppercase">
                        Subtotal
                      </p>
                      <p className="text-sm font-bold text-[var(--color-text-primary)]">
                        ₹{inv.subtotal.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-[10px] text-[var(--color-text-secondary)] uppercase">
                        GST (18%)
                      </p>
                      <p className="text-sm font-bold text-purple-400">
                        ₹{inv.gst_amount.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-[var(--color-text-secondary)] uppercase">
                        Total
                      </p>
                      <p className="text-base font-black text-[#d4af26]">
                        ₹{inv.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(inv);
                      }}
                      className="p-2 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors"
                      title="Download Invoice"
                    >
                      <FaDownload className="text-sm" />
                    </button>
                    <div className="text-[var(--color-text-secondary)]">
                      {expandedInvoice === idx ? (
                        <FaChevronUp className="text-xs" />
                      ) : (
                        <FaChevronDown className="text-xs" />
                      )}
                    </div>
                  </div>
                </div>

                {expandedInvoice === idx && (
                  <div className="border-t border-[var(--color-border)] bg-black/5 dark:bg-white/5 px-4 py-4 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[var(--color-bg-surface)] rounded-md p-3 border border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase mb-1">
                          Delivery Charges
                        </p>
                        <p className="text-sm font-bold text-[var(--color-text-primary)]">
                          ₹{inv.delivery_charge_per_order} × {inv.order_count} =
                          ₹{inv.subtotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[var(--color-bg-surface)] rounded-md p-3 border border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase mb-1">
                          GST ({inv.gst_rate}%)
                        </p>
                        <p className="text-sm font-bold text-purple-400">
                          ₹{inv.gst_amount.toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[var(--color-bg-surface)] rounded-md p-3 border border-[var(--color-border)]">
                        <p className="text-[10px] text-[var(--color-text-secondary)] uppercase mb-1">
                          Product Value Shipped
                        </p>
                        <p className="text-sm font-bold text-green-400">
                          ₹{inv.total_product_value?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[550px]">
                        <thead>
                          <tr className="bg-[#d4af26]/10 border border-[#d4af26]/30">
                            {[
                              "#",
                              "Tracking ID",
                              "Customer",
                              "Type",
                              "Value",
                              "Delivered",
                            ].map((col) => (
                              <th
                                key={col}
                                className="p-2 text-left text-[10px] font-semibold text-[#d4af26] uppercase tracking-wider"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inv.orders?.map((o, oi) => (
                            <tr
                              key={oi}
                              className="border-b border-[var(--color-border)]"
                            >
                              <td className="p-2 text-xs text-[var(--color-text-secondary)]">
                                {oi + 1}
                              </td>
                              <td className="p-2 text-xs font-bold text-[#d4af26]">
                                {o.tracking_id}
                              </td>
                              <td className="p-2 text-xs text-[var(--color-text-primary)]">
                                {o.customer_name}
                              </td>
                              <td className="p-2">
                                <span
                                  className={`text-[10px] font-bold ${o.order_type === "COD" ? "text-green-400" : "text-[#d4af26]"}`}
                                >
                                  {o.order_type}
                                </span>
                              </td>
                              <td className="p-2 text-xs font-bold text-[var(--color-text-primary)]">
                                ₹{parseFloat(o.product_amount).toLocaleString()}
                              </td>
                              <td className="p-2 text-xs text-[var(--color-text-secondary)]">
                                {formatDate(o.updated_at)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoices;
