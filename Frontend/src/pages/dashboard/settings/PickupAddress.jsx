import React, { useState } from 'react';
import { FaPen } from 'react-icons/fa';

const mockAddresses = [
  {
    id: 301,
    name: 'Djdjjd',
    phone: '8886663456',
    email: 'dj@example.com',
    pincode: '500049',
    status: true,
    primary: '1772027177',
    warehouseName: '',
    address: 'Plot no 11, Sbi road, Hyderabad, Telangana, 500049',
  },
  {
    id: 289,
    name: 'rohit',
    phone: '9889999999',
    email: 'rohit@test.com',
    pincode: '110052',
    status: true,
    primary: '1771685013',
    warehouseName: '',
    address: 'ashok vihar phase 2, main market, New Delhi, Delhi, 110052',
  },
  {
    id: 288,
    name: 'Rajesh Kumar',
    phone: '7778889990',
    email: 'rajesh@mail.com',
    pincode: '400001',
    status: true,
    primary: '1771122334',
    warehouseName: '',
    address: 'Unit 45, Marine Drive Industrial Area, Mumbai, Maharashtra, 400001',
  },
];

const PickupAddress = () => {
  const [addresses, setAddresses] = useState(mockAddresses);

  const toggleStatus = (id) => {
    setAddresses(addresses.map(a => a.id === id ? { ...a, status: !a.status } : a));
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Pickup Address</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Pickup Address</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Pickup Address</h2>
          <button className="border border-[#d4af26] text-[#d4af26] hover:bg-[#d4af26] hover:text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors">
            New Pickup Address
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Contact</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pincode</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Primary</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Warehouse Name</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Address</th>
                <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {addresses.map((addr) => (
                <tr key={addr.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center text-sm font-bold text-[var(--color-text-primary)]">{addr.id}</td>
                  <td className="p-4 text-center">
                    <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{addr.name}</span>
                    <span className="text-xs text-[var(--color-text-secondary)] block">{addr.phone}</span>
                    <span className="text-[10px] text-[#d4af26]">{addr.email}</span>
                  </td>
                  <td className="p-4 text-center text-sm text-[var(--color-text-primary)]">{addr.pincode}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => toggleStatus(addr.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addr.status ? 'bg-[#d4af26]' : 'bg-gray-500'}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addr.status ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="p-4 text-center">
                    <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded">{addr.primary}</span>
                  </td>
                  <td className="p-4 text-center text-sm text-[var(--color-text-secondary)]">{addr.warehouseName || '—'}</td>
                  <td className="p-4 text-center text-xs text-[var(--color-text-secondary)] max-w-[180px] whitespace-pre-line">{addr.address}</td>
                  <td className="p-4 text-center">
                    <button className="p-2 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Edit">
                      <FaPen className="text-sm" />
                    </button>
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

export default PickupAddress;
