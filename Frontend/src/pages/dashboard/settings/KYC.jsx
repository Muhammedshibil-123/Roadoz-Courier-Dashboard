import React, { useState } from 'react';

const KYC = () => {
  const [activeTab, setActiveTab] = useState('domestic');

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Account Settings</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Account Settings</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Account Settings</h2>

        {/* Warning Banner */}
        <div className="bg-[#d4af26]/10 border border-[#d4af26]/30 rounded-lg px-5 py-3">
          <p className="text-sm text-[#d4af26] text-center">
            Your KYC is under review. You can view your details below but cannot edit until a decision is made.
          </p>
        </div>

        {/* KYC Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('domestic')}
            className={`text-sm font-semibold px-5 py-2 rounded-md transition-colors ${activeTab === 'domestic' ? 'bg-[#d4af26] text-white' : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            Domestic KYC
          </button>
          <button
            onClick={() => setActiveTab('international')}
            className={`text-sm font-semibold px-5 py-2 rounded-md transition-colors ${activeTab === 'international' ? 'bg-[#d4af26] text-white' : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
          >
            INTERNATIONAL KYC
          </button>
        </div>

        {/* Domestic KYC */}
        {activeTab === 'domestic' && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">KYC - DOMESTIC</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Provide the required details</p>
            </div>
            <span className="bg-[#d4af26] text-white text-xs font-bold px-4 py-2 rounded-md">UNDER REVIEW</span>
          </div>
        )}

        {/* International KYC */}
        {activeTab === 'international' && (
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">KYC - INTERNATIONAL</h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">Provide the required details for international shipping</p>
            </div>
            <span className="bg-gray-500 text-white text-xs font-bold px-4 py-2 rounded-md">NOT SUBMITTED</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYC;
