import React, { useState } from 'react';

const mockConsignees = [
  {
    id: '#CON-8291',
    name: 'Alex Mercer',
    phone: '+1 (555) 0123',
    email: 'alex.m@velocity.com',
    address: '122 Broadwa...',
    city: 'New York',
    state: 'NY',
    pincode: '10001',
    status: true,
  },
  {
    id: '#CON-8292',
    name: 'Sarah Chen',
    phone: '+1 (555) 9876',
    email: 'schen@techflow.io',
    address: '45 Market St,...',
    city: 'San Francisco',
    state: 'CA',
    pincode: '94103',
    status: true,
  },
  {
    id: '#CON-8293',
    name: 'Rober King',
    phone: '+1 (555) 4433',
    email: 'rking@logi-solutions.com',
    address: '888 Industria...',
    city: 'Chicago',
    state: 'IL',
    pincode: '60601',
    status: false,
  },
  {
    id: '#CON-8294',
    name: 'Jessi Hill',
    phone: '+1 (555) 7788',
    email: 'jhill@retail-giant.net',
    address: '12 North Star...',
    city: 'Austin',
    state: 'TX',
    pincode: '73301',
    status: true,
  },
];

const Consignees = () => {
  const [consignees, setConsignees] = useState(mockConsignees);
  const [filters, setFilters] = useState({
    dateRange: '', name: '', mobileNo: '', email: '', pincode: '', status: 'All',
  });

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2 text-xs text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors';

  const toggleStatus = (id) => {
    setConsignees(consignees.map(c => c.id === id ? { ...c, status: !c.status } : c));
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Consignee</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Consignee</span>
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Consignee</h2>
          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-5 py-2 rounded-md transition-colors">Export</button>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Date Range</label>
            <input type="text" placeholder="Select time and date" className={`${inputClass} w-40`} value={filters.dateRange} onChange={(e) => setFilters({...filters, dateRange: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Name</label>
            <input type="text" placeholder="Order ids" className={`${inputClass} w-32`} value={filters.name} onChange={(e) => setFilters({...filters, name: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Mobile No:</label>
            <input type="text" placeholder="Mobile No:" className={`${inputClass} w-28`} value={filters.mobileNo} onChange={(e) => setFilters({...filters, mobileNo: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Email</label>
            <input type="text" placeholder="Email" className={`${inputClass} w-28`} value={filters.email} onChange={(e) => setFilters({...filters, email: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">pincode</label>
            <input type="text" placeholder="pincode" className={`${inputClass} w-24 border-[#d4af26]`} value={filters.pincode} onChange={(e) => setFilters({...filters, pincode: e.target.value})} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-1 block font-medium">Status:</label>
            <select className={`${inputClass} w-20 border-[#d4af26]`} value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
              <option value="All">All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Name</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Mobile No</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Email</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Address 1</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">City/State</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pincode</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {consignees.map((c) => (
                <tr key={c.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-3 text-center">
                    <span className="bg-[#1e293b] text-[#d4af26] text-xs font-bold px-2 py-1 rounded">{c.id}</span>
                  </td>
                  <td className="p-3 text-center text-sm font-semibold text-blue-400">{c.name}</td>
                  <td className="p-3 text-center text-xs text-[var(--color-text-primary)]">{c.phone}</td>
                  <td className="p-3 text-center text-xs text-[var(--color-text-primary)]">{c.email}</td>
                  <td className="p-3 text-center text-xs text-[var(--color-text-primary)]">{c.address}</td>
                  <td className="p-3 text-center">
                    <span className="text-sm text-[var(--color-text-primary)] block">{c.city}</span>
                    <span className="text-[10px] text-[var(--color-text-secondary)]">{c.state}</span>
                  </td>
                  <td className="p-3 text-center text-sm text-[var(--color-text-primary)]">{c.pincode}</td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(c.id)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${c.status ? 'bg-[#d4af26]' : 'bg-gray-500'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${c.status ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                      <span className={`text-[10px] font-bold ${c.status ? 'text-green-400' : 'text-red-400'}`}>
                        {c.status ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Consignees;
