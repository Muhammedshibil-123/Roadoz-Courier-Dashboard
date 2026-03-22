import React, { useState } from 'react';
import { FaLock, FaEye, FaEyeSlash, FaCheckCircle } from 'react-icons/fa';
import api from '../../../lib/axios';

const ChangePassword = () => {
  const [form, setForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
    confirm: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const toggleVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!form.old_password || !form.new_password || !form.confirm_password) {
      setError('All fields are required.');
      return;
    }
    if (form.new_password.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (form.new_password !== form.confirm_password) {
      setError('New password and confirm password do not match.');
      return;
    }
    if (form.old_password === form.new_password) {
      setError('New password must be different from the old password.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.post('/api/auth/change-password/', form);
      setSuccess(res.data.message || 'Password changed successfully!');
      setForm({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const errorData = err.response?.data;
      if (errorData?.error) {
        setError(errorData.error);
      } else if (errorData?.old_password) {
        setError(Array.isArray(errorData.old_password) ? errorData.old_password[0] : errorData.old_password);
      } else if (errorData?.confirm_password) {
        setError(Array.isArray(errorData.confirm_password) ? errorData.confirm_password[0] : errorData.confirm_password);
      } else {
        setError('Failed to change password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setForm({ old_password: '', new_password: '', confirm_password: '' });
    setError('');
    setSuccess('');
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full pr-10';

  // Password strength indicator
  const getPasswordStrength = (password) => {
    if (!password) return { level: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { level: 1, label: 'Weak', color: 'bg-red-500' };
    if (score <= 2) return { level: 2, label: 'Fair', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Good', color: 'bg-yellow-500' };
    if (score <= 4) return { level: 4, label: 'Strong', color: 'bg-green-500' };
    return { level: 5, label: 'Very Strong', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(form.new_password);

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
        <div className="flex items-center gap-2">
          <FaLock className="text-[#d4af26]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Change Password</h2>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <FaCheckCircle className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Old Password */}
        <div className="max-w-md space-y-5">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Old Password</label>
            <div className="relative">
              <input
                type={showPasswords.old ? 'text' : 'password'}
                placeholder="Enter your current password"
                className={inputClass}
                value={form.old_password}
                onChange={(e) => updateForm('old_password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('old')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showPasswords.old ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>
        </div>

        {/* New Password + Confirm */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                placeholder="Enter new password"
                className={inputClass}
                value={form.new_password}
                onChange={(e) => updateForm('new_password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('new')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showPasswords.new ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                className={inputClass}
                value={form.confirm_password}
                onChange={(e) => updateForm('confirm_password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => toggleVisibility('confirm')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {showPasswords.confirm ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
              </button>
            </div>
          </div>
        </div>

        {/* Password Strength */}
        {form.new_password && (
          <div className="max-w-md space-y-2">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= strength.level ? strength.color : 'bg-[var(--color-border)]'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Password strength: <span className={`font-semibold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
            </p>
          </div>
        )}

        {/* Password Requirements */}
        <div className="max-w-md bg-[var(--color-border)]/20 rounded-lg px-4 py-3 space-y-1.5">
          <p className="text-xs font-semibold text-[var(--color-text-secondary)]">Password Requirements:</p>
          {[
            { text: 'At least 6 characters', met: form.new_password.length >= 6 },
            { text: 'Contains uppercase letter', met: /[A-Z]/.test(form.new_password) },
            { text: 'Contains a number', met: /[0-9]/.test(form.new_password) },
            { text: 'Contains special character', met: /[^A-Za-z0-9]/.test(form.new_password) },
          ].map((req) => (
            <p key={req.text} className={`text-xs flex items-center gap-1.5 ${req.met ? 'text-green-400' : 'text-[var(--color-text-secondary)]'}`}>
              <span className={`w-1 h-1 rounded-full ${req.met ? 'bg-green-400' : 'bg-[var(--color-text-secondary)]'}`} />
              {req.text}
            </p>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Changing...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
          <button
            onClick={handleCancel}
            className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePassword;
