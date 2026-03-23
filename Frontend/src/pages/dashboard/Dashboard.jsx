import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  MdOutlineReceipt,
  MdOutlineLocalShipping,
  MdOutlineAssignmentReturn,
  MdOutlineAccountBalanceWallet,
} from "react-icons/md";
import api from "../../lib/axios";

const StatCard = ({ title, value, subtitle, icon, iconBg }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 flex items-center justify-between border border-[var(--color-border)] transition-colors duration-300">
    <div>
      <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">
        {title}
      </p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">
        {value}
      </p>
      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
        {subtitle}
      </p>
    </div>
    <div
      className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
    >
      {icon}
    </div>
  </div>
);

const renderCustomLabel = ({ cx, cy, midAngle, outerRadius, name }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 18;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="var(--color-text-secondary)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
    >
      {name}
    </text>
  );
};

const ChartLegend = ({ data }) => (
  <div className="flex flex-col gap-2.5 justify-center">
    {data.map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">
          {entry.name}:{" "}
          {entry.isCurrency ? `₹${entry.value.toFixed(2)}` : entry.value}
        </span>
      </div>
    ))}
  </div>
);

const PieChartCard = ({ title, data, isCurrency = false }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border)] transition-colors duration-300">
    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
      {title}
    </h3>
    {data.length === 0 || data.every((d) => d.value === 0) ? (
      <div className="h-[240px] flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
        No data available
      </div>
    ) : (
      <div className="flex items-center">
        <div className="flex-1 h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                outerRadius={85}
                dataKey="value"
                stroke="none"
                paddingAngle={1}
                label={renderCustomLabel}
                labelLine={{
                  stroke: "var(--color-text-secondary)",
                  strokeWidth: 1,
                }}
              >
                {data
                  .filter((d) => d.value > 0)
                  .map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  isCurrency ? `₹${value.toFixed(2)}` : value,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend data={data.filter((d) => d.value > 0)} />
      </div>
    )}
  </div>
);

const DonutChartCard = ({ title, data, centerValue, isCurrency = false }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border)] transition-colors duration-300">
    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">
      {title}
    </h3>
    {data.length === 0 || data.every((d) => d.value === 0) ? (
      <div className="h-[240px] flex items-center justify-center text-sm text-[var(--color-text-secondary)]">
        No data available
      </div>
    ) : (
      <div className="flex items-center">
        <div className="flex-1 h-[240px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.filter((d) => d.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                dataKey="value"
                stroke="none"
                paddingAngle={2}
              >
                {data
                  .filter((d) => d.value > 0)
                  .map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
              </Pie>
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-[var(--color-text-primary)]"
                fontSize="20"
                fontWeight="700"
              >
                {centerValue}
              </text>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-bg-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "8px",
                  color: "var(--color-text-primary)",
                  fontSize: "12px",
                }}
                formatter={(value, name) => [
                  isCurrency ? `₹${value.toFixed(2)}` : value,
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <ChartLegend data={data.filter((d) => d.value > 0)} />
      </div>
    )}
  </div>
);

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/api/orders/dashboard/", {
          skipLoading: true,
        });
        setData(res.data);
      } catch (err) {
        console.log("Dashboard API not available yet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--color-border)] border-t-[#d4af26] rounded-full animate-spin" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const wallet = data?.wallet || {};
  const cod = data?.cod || {};
  const orderType = data?.order_type_breakdown || {};
  const orderStats = data?.order_stats || {};

  const walletTransactionData = [
    {
      name: "Credited",
      value: wallet.total_credited || 0,
      color: "#67E8F9",
      isCurrency: true,
    },
    {
      name: "Debited",
      value: wallet.total_debited || 0,
      color: "#FCA779",
      isCurrency: true,
    },
  ];

  const codBreakdownData = [
    {
      name: "COD Transferred",
      value: cod.transferred || 0,
      color: "#34D399",
      isCurrency: true,
    },
    {
      name: "COD Pending",
      value: cod.pending || 0,
      color: "#F9A8D4",
      isCurrency: true,
    },
    {
      name: "Cash with Courier",
      value: cod.cash_with_courier || 0,
      color: "#FCA779",
      isCurrency: true,
    },
  ];

  const orderTypeData = [
    { name: "COD Orders", value: orderType.cod || 0, color: "#F9A8D4" },
    { name: "Prepaid Orders", value: orderType.prepaid || 0, color: "#A78BFA" },
  ];

  const orderStatusesData = [
    { name: "In Transit", value: orderStats.IN_TRANSIT || 0, color: "#3B82F6" },
    { name: "Delivered", value: orderStats.DELIVERED || 0, color: "#34D399" },
    { name: "Processing", value: orderStats.PROCESSING || 0, color: "#F9A8D4" },
    {
      name: "Pending",
      value: orderStats.PICKUP_PENDING || 0,
      color: "#FCA779",
    },
    { name: "NDR", value: orderStats.NDR || 0, color: "#EF4444" },
    {
      name: "RTO",
      value: (orderStats.RTO_IN_TRANSIT || 0) + (orderStats.RTO_DELIVERED || 0),
      color: "#A78BFA",
    },
  ];

  const todayStr = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Dashboard
        </h1>
        <p className="text-xs text-[#d4af26] mt-0.5">
          Dashboard{" "}
          <span className="text-[var(--color-text-secondary)]">&gt;&gt;</span>{" "}
          Dashboard
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ORDERS"
          value={summary.total || 0}
          subtitle={`As of ${todayStr}`}
          iconBg="bg-blue-500"
          icon={<MdOutlineReceipt className="text-white text-xl" />}
        />
        <StatCard
          title="DELIVERED ORDERS"
          value={summary.delivered || 0}
          subtitle={`${summary.total > 0 ? ((summary.delivered / summary.total) * 100).toFixed(1) : 0}% delivery rate`}
          iconBg="bg-green-500"
          icon={<MdOutlineLocalShipping className="text-white text-xl" />}
        />
        <StatCard
          title="RTO ORDERS"
          value={summary.rto || 0}
          subtitle={`${summary.total > 0 ? ((summary.rto / summary.total) * 100).toFixed(1) : 0}% RTO rate`}
          iconBg="bg-orange-500"
          icon={<MdOutlineAssignmentReturn className="text-white text-xl" />}
        />
        <StatCard
          title="WALLET BALANCE"
          value={`₹${(wallet.balance || 0).toFixed(2)}`}
          subtitle={`${summary.pending || 0} pending orders`}
          iconBg="bg-teal-500"
          icon={
            <MdOutlineAccountBalanceWallet className="text-white text-xl" />
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard
          title="Wallet Transactions"
          data={walletTransactionData}
          isCurrency={true}
        />
        <DonutChartCard
          title="COD Breakdown"
          data={codBreakdownData}
          centerValue={`₹${((cod.transferred || 0) + (cod.pending || 0) + (cod.cash_with_courier || 0)).toFixed(0)}`}
          isCurrency={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard title="Order Types" data={orderTypeData} />
        <DonutChartCard
          title="Order Statuses"
          data={orderStatusesData}
          centerValue={summary.total || 0}
        />
      </div>

      {wallet.recent_transactions?.length > 0 && (
        <div className="bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border)]">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Recent Wallet Transactions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider p-3">
                    Description
                  </th>
                  <th className="text-left text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider p-3">
                    Type
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider p-3">
                    Amount
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider p-3">
                    Balance
                  </th>
                  <th className="text-right text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider p-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {wallet.recent_transactions.map((txn, i) => (
                  <tr
                    key={i}
                    className="border-b border-[var(--color-border)] last:border-0"
                  >
                    <td className="p-3 text-sm text-[var(--color-text-primary)]">
                      {txn.description}
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded ${txn.type === "CREDIT" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td
                      className={`p-3 text-sm font-semibold text-right ${txn.type === "CREDIT" ? "text-green-400" : "text-red-400"}`}
                    >
                      {txn.type === "CREDIT" ? "+" : "-"}₹
                      {txn.amount.toFixed(2)}
                    </td>
                    <td className="p-3 text-sm text-[var(--color-text-primary)] text-right">
                      ₹{txn.closing_balance.toFixed(2)}
                    </td>
                    <td className="p-3 text-[11px] text-[var(--color-text-secondary)] text-right">
                      {new Date(txn.date).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
