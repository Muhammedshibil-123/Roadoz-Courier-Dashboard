import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts';
import {
  MdOutlineReceipt,
  MdOutlineLocalShipping,
  MdOutlineAssignmentReturn,
  MdOutlineAccountBalanceWallet
} from 'react-icons/md';
import api from '../../lib/axios';

// ─── Mock Data ───────────────────────────────────────────────
const walletTransactionData = [
  { name: 'Courier Wa', value: 151.66, color: '#F9A8D4' },
  { name: 'Others', value: 80.00, color: '#FCA779' },
  { name: 'Recharge', value: 120.00, color: '#67E8F9' },
];

const courierWiseData = [
  { name: 'CourierWa Ai', value: 97.47, color: '#F9A8D4' },
  { name: 'NewCourierWa', value: 72.00, color: '#A78BFA' },
  { name: 'SurTransit', value: 59.99, color: '#FCA779' },
];

const walletTransaction2Data = [
  { name: 'Pickup', value: 180, color: '#F9A8D4' },
  { name: 'Others', value: 49.46, color: '#A78BFA' },
];

const orderStatusesData = [
  { name: 'In Transit', value: 97.47, color: '#A78BFA' },
  { name: 'Processing', value: 131.99, color: '#F9A8D4' },
];

// ─── Stat Card ───────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, icon, iconBg }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 flex items-center justify-between border border-[var(--color-border)] transition-colors duration-300">
    <div>
      <p className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider mb-1">{title}</p>
      <p className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</p>
      <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">{subtitle}</p>
    </div>
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
      {icon}
    </div>
  </div>
);

// ─── Custom Label for Pie Slices ────────────────────────────
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
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={11}
    >
      {name}
    </text>
  );
};

// ─── Legend Component ──────────────────────────────────────
const ChartLegend = ({ data }) => (
  <div className="flex flex-col gap-2.5 justify-center">
    {data.map((entry, index) => (
      <div key={index} className="flex items-center gap-2">
        <span
          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
          style={{ backgroundColor: entry.color }}
        />
        <span className="text-[11px] text-[var(--color-text-secondary)] whitespace-nowrap">{entry.name}</span>
      </div>
    ))}
  </div>
);

// ─── Pie Chart Card (no center value) ───────────────────────
const PieChartCard = ({ title, data }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border)] transition-colors duration-300">
    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
    <div className="flex items-center">
      <div className="flex-1 h-[240px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={85}
              dataKey="value"
              stroke="none"
              paddingAngle={1}
              label={renderCustomLabel}
              labelLine={{ stroke: 'var(--color-text-secondary)', strokeWidth: 1 }}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend data={data} />
    </div>
  </div>
);

// ─── Donut Chart Card (with center value) ───────────────────
const DonutChartCard = ({ title, data, centerValue }) => (
  <div className="bg-[var(--color-bg-surface)] rounded-xl p-5 border border-[var(--color-border)] transition-colors duration-300">
    <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-2">{title}</h3>
    <div className="flex items-center">
      <div className="flex-1 h-[240px] relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              dataKey="value"
              stroke="none"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            {/* Center Text */}
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
                backgroundColor: 'var(--color-bg-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
              }}
              formatter={(value, name) => [`₹${value.toFixed(2)}`, name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend data={data} />
    </div>
  </div>
);

// ─── Dashboard Page ─────────────────────────────────────────
const Dashboard = () => {
  const [dateRange] = useState('2026-03-07 to 2026-03-13');
  const [stats, setStats] = useState({ TOTAL: 0, DELIVERED: 0, RTO: 0, PENDING: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/orders/stats/', { skipLoading: true });
        setStats(res.data);
      } catch (err) {
        console.log('Stats API not available yet, using defaults');
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Dashboard</h1>
        <p className="text-xs text-[#d4af26] mt-0.5">
          Dashboard <span className="text-[var(--color-text-secondary)]">&gt;&gt;</span> Dashboard
        </p>
      </div>

      {/* Date Range */}
      <div className="inline-flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-md px-3 py-2 transition-colors duration-300">
        <span className="text-xs text-[var(--color-text-primary)]">{dateRange}</span>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="TOTAL ORDERS"
          value={stats.TOTAL || 0}
          subtitle="From 2026-03- to 2026-03-13"
          iconBg="bg-blue-500"
          icon={<MdOutlineReceipt className="text-white text-xl" />}
        />
        <StatCard
          title="DELIVERED ORDERS"
          value={stats.DELIVERED || 0}
          subtitle="With selected period"
          iconBg="bg-orange-500"
          icon={<MdOutlineLocalShipping className="text-white text-xl" />}
        />
        <StatCard
          title="RTO ORDERS"
          value={stats.RTO || 0}
          subtitle="In selected date range"
          iconBg="bg-teal-500"
          icon={<MdOutlineAssignmentReturn className="text-white text-xl" />}
        />
        <StatCard
          title="PENDING ORDERS"
          value={stats.PENDING || 0}
          subtitle="From 2026-03- to 2026-03-13"
          iconBg="bg-red-500"
          icon={<MdOutlineAccountBalanceWallet className="text-white text-xl" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard
          title="Wallet Transaction"
          data={walletTransactionData}
        />
        <DonutChartCard
          title="Courier Wise Load"
          data={courierWiseData}
          centerValue="229.46"
        />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <PieChartCard
          title="Wallet Transaction"
          data={walletTransaction2Data}
        />
        <DonutChartCard
          title="Orders Statuses"
          data={orderStatusesData}
          centerValue="229.46"
        />
      </div>
    </div>
  );
};

export default Dashboard;