import React, { useState } from 'react';

const ChangePassword = () => {
  const [form, setForm] = useState({
    oldPassword: '', newPassword: '', retypePassword: '',
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Change Password</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Change Password</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Change Password</h2>

        {/* Upload/Reset buttons */}
        <div className="flex gap-3">
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2 rounded-md transition-colors">Upload</button>
          <button className="border border-[#d4af26] text-[#d4af26] hover:bg-[#d4af26] hover:text-white text-sm font-semibold px-6 py-2 rounded-md transition-colors">Rest</button>
        </div>
        <p className="text-xs text-[var(--color-text-secondary)]">Allowed JPG, GIF or PNG. Max size of 800kB</p>

        {/* Form Fields */}
        <div className="max-w-md space-y-5">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Old Password</label>
            <input type="password" placeholder="Old Password" className={inputClass} value={form.oldPassword} onChange={(e) => updateForm('oldPassword', e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">New password</label>
            <input type="password" placeholder="New password" className={inputClass} value={form.newPassword} onChange={(e) => updateForm('newPassword', e.target.value)} />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Retype New Password</label>
            <input type="password" placeholder="New password" className={inputClass} value={form.retypePassword} onChange={(e) => updateForm('retypePassword', e.target.value)} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2 rounded-md transition-colors">Save change</button>
          <button className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-6 py-2 rounded-md transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
