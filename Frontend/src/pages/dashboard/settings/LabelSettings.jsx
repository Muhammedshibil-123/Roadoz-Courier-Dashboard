import React, { useState } from 'react';

const labelToggles = [
  { name: 'Order value on labels', description: 'Shows order value in COD & Prepaid orders.' },
  { name: 'COD amount on label', description: 'Displays COD amount on the label..' },
  { name: 'Buyer mobile number', description: 'Shows buyer phone number on the label.' },
  { name: 'Shipper mobile numbers', description: 'Displays shipper address on the label.' },
  { name: 'Product name', description: 'Shows product name on the label.' },
  { name: 'Services T&C', description: 'Shows services T&C on the label.' },
];

const LabelSettings = () => {
  const [toggles, setToggles] = useState(
    labelToggles.reduce((acc, t) => ({ ...acc, [t.name]: true }), {})
  );
  const [printType, setPrintType] = useState('Thermal');

  const handleToggle = (name) => {
    setToggles({ ...toggles, [name]: !toggles[name] });
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Label Settings</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Label Settings</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Label Settings</h2>

        {/* Label Logo Upload */}
        <div className="border border-[#d4af26]/30 rounded-lg p-5 bg-[#d4af26]/5">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">Label Logo</h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">Recommended: PNG/WebP with transparent background</p>
          <div className="flex items-center gap-0">
            <label className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-l-md cursor-pointer transition-colors">
              Choose File
              <input type="file" className="hidden" accept=".png,.webp,.jpg,.gif" />
            </label>
            <div className="flex-1 bg-[var(--color-border)] text-xs text-[var(--color-text-secondary)] px-3 py-2 rounded-r-md">
              No file chosen
            </div>
          </div>
        </div>

        {/* Toggle Settings */}
        <div className="space-y-0">
          {labelToggles.map((item) => (
            <div key={item.name} className="border-b border-[var(--color-border)] py-4">
              <div className="flex items-center justify-between">
                <div className="bg-[#d4af26]/10 rounded-lg px-5 py-3 flex-1 mr-6">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">{item.name}</h3>
                </div>
                <button
                  onClick={() => handleToggle(item.name)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${toggles[item.name] ? 'bg-[#d4af26]' : 'bg-gray-500'}`}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles[item.name] ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2 ml-1">{item.description}</p>
            </div>
          ))}
        </div>

        {/* Print Type */}
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Print Type</h3>
          <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-bg-surface)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">Label Type</h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">Choose A4 for paper printing or Thermal for label printers.</p>
              </div>
              <div className="flex rounded-md overflow-hidden border border-[var(--color-border)]">
                <button
                  onClick={() => setPrintType('A4')}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${printType === 'A4' ? 'bg-[#d4af26] text-white' : 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPrintType('Thermal')}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${printType === 'Thermal' ? 'bg-[#d4af26] text-white' : 'bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                >
                  Thermal
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button className="border border-[#d4af26] text-[#d4af26] hover:bg-[#d4af26] hover:text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors">Save Change</button>
          <button className="bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default LabelSettings;
