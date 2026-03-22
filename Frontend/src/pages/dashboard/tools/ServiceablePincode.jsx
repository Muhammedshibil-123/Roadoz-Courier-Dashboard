import React, { useState } from 'react';

const ServiceablePincode = () => {
  const [fromPincode, setFromPincode] = useState('');
  const [toPincode, setToPincode] = useState('');

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Serviceable Pincode</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Serviceable Pincode</span>
        </p>
      </div>

      {/* Form */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)]">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-5">Serviceable Pincode</h2>
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">From Pincode</label>
            <input
              type="text"
              placeholder="From Pincode"
              className={inputClass}
              value={fromPincode}
              onChange={(e) => setFromPincode(e.target.value)}
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">To Pincode</label>
            <input
              type="text"
              placeholder="From Pincode"
              className={inputClass}
              value={toPincode}
              onChange={(e) => setToPincode(e.target.value)}
            />
          </div>
          <div>
            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceablePincode;
