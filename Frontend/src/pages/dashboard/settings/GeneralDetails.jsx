import React, { useState, useEffect, useRef } from 'react';
import { FaCamera, FaUser, FaCheckCircle, FaTrash } from 'react-icons/fa';
import api from '../../../lib/axios';

const GeneralDetails = () => {
  const [form, setForm] = useState({
    username: '',
    email: '',
    mobile: '',
    order_report_email: '',
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  // Fetch existing data
  const fetchDetails = async () => {
    try {
      const res = await api.get('/api/auth/settings/general/', { skipLoading: true });
      const data = res.data;
      setForm({
        username: data.username || '',
        email: data.email || '',
        mobile: data.mobile || '',
        order_report_email: data.order_report_email || '',
      });
      if (data.profile_image_url) {
        // Cloudinary returns full URL; local dev might return relative path
        const imgUrl = data.profile_image_url.startsWith('http')
          ? data.profile_image_url
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${data.profile_image_url}`;
        setProfileImageUrl(imgUrl);
      }
    } catch {
      // First time
    } finally {
      setFetchLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Only JPG, PNG, GIF, and WebP images are allowed.');
      return;
    }
    if (file.size > 800 * 1024) {
      setError('Image size must be less than 800KB.');
      return;
    }

    setProfileImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!form.email) {
      setError('Email is required.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('email', form.email);
      if (form.mobile) formData.append('mobile', form.mobile);
      if (form.order_report_email) formData.append('order_report_email', form.order_report_email);
      if (profileImage) {
        formData.append('profile_image', profileImage);
      }

      await api.put('/api/auth/settings/general/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setSuccess('Profile updated successfully!');
      setProfileImage(null);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Re-fetch to get the updated Cloudinary image URL
      await fetchDetails();
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.email?.[0] || 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setSuccess('');
    setProfileImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  const displayImage = previewUrl || profileImageUrl;

  if (fetchLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">General Details</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">General Details</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">General Details</h2>

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

        {/* Profile Image Upload */}
        <div className="flex items-start gap-6">
          {/* Image Preview */}
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[var(--color-border)] bg-[var(--color-border)]/30 flex items-center justify-center">
              {displayImage ? (
                <img src={displayImage} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-3xl text-[var(--color-text-secondary)]" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[#d4af26] flex items-center justify-center text-white shadow-lg hover:bg-[#c39f19] transition-colors"
            >
              <FaCamera className="text-xs" />
            </button>
          </div>

          {/* Upload Controls */}
          <div className="space-y-3 pt-2">
            <div className="flex gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2 rounded-md transition-colors"
              >
                Upload Photo
              </button>
              {(previewUrl || profileImageUrl) && (
                <button
                  onClick={handleRemoveImage}
                  className="border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm font-semibold px-4 py-2 rounded-md transition-colors flex items-center gap-1.5"
                >
                  <FaTrash className="text-xs" />
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-[var(--color-text-secondary)]">
              Allowed JPG, PNG, GIF or WebP. Max size of 800kB
            </p>
            {profileImage && (
              <p className="text-xs text-[#d4af26]">
                Selected: {profileImage.name} ({(profileImage.size / 1024).toFixed(1)}KB)
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".jpg,.jpeg,.png,.gif,.webp"
            onChange={handleImageSelect}
          />
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Username</label>
            <input
              type="text"
              placeholder="Username"
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              value={form.username}
              readOnly
            />
            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">Username cannot be changed</p>
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">E-mail</label>
            <input
              type="email"
              placeholder="E-mail"
              className={inputClass}
              value={form.email}
              onChange={(e) => updateForm('email', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Mobile Number</label>
            <input
              type="text"
              placeholder="Mobile Number"
              className={inputClass}
              value={form.mobile}
              onChange={(e) => updateForm('mobile', e.target.value.replace(/[^0-9+]/g, ''))}
              maxLength={15}
            />
          </div>
          <div>
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Order Report Email</label>
            <input
              type="email"
              placeholder="Order report email"
              className={inputClass}
              value={form.order_report_email}
              onChange={(e) => updateForm('order_report_email', e.target.value)}
            />
          </div>
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
                Saving...
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

export default GeneralDetails;
