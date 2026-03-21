// src/pages/dashboard/Dashboard.jsx
import React from 'react';
import { MdTrendingUp, MdStore, MdAccountCircle, MdOutlineReceipt } from 'react-icons/md';

const StatCard = ({ title, value, color, icon }) => {
  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm border ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h3>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

const Dashboard = () => {
  return (
    <div className="flex-1 p-8 space-y-8 font-inter">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        {/* You could add a 'Today' filter button here like in the image */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="TOTAL ORDER COUNT" value="2800" color="border-l-4 border-[#3b82f6]" icon={<MdOutlineReceipt className="text-2xl text-[#3b82f6]" />} />
        <StatCard title="ACTIVE ORDERS" value="53" color="border-l-4 border-[#3b82f6]" icon={<MdTrendingUp className="text-2xl text-[#3b82f6]" />} />
        <StatCard title="TOTAL GROCERY STORES" value="6" color="border-l-4 border-[#10b981]" icon={<MdStore className="text-2xl text-[#10b981]" />} />
        <StatCard title="NEW CUSTOMERS" value="15" color="border-l-4 border-[#8b5cf6]" icon={<MdAccountCircle className="text-2xl text-[#8b5cf6]" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Total Active Orders</h2>
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 border border-dashed rounded-md">
            Graph Placeholder
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 h-96">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Out for Delivery</h2>
          <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-400 border border-dashed rounded-md">
            Graph Placeholder
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;