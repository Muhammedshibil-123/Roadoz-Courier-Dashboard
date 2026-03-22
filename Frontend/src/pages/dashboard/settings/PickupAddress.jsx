import React, { useState, useEffect } from 'react';
import { FaPen, FaTrash, FaPlus, FaTimes, FaCheckCircle, FaMapMarkerAlt } from 'react-icons/fa';
import api from '../../../lib/axios';

// Helper to extract readable errors from DRF validation responses
const parseApiError = (err) => {
  const data = err.response?.data;
  if (!data) return 'Failed to save. Please try again.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;
  // DRF field errors: { field: ["error msg"] }
  const messages = [];
  for (const key of Object.keys(data)) {
    const val = data[key];
    const fieldName = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (Array.isArray(val)) {
      messages.push(`${fieldName}: ${val.join(', ')}`);
    } else if (typeof val === 'string') {
      messages.push(`${fieldName}: ${val}`);
    }
  }
  return messages.length > 0 ? messages.join(' | ') : 'Failed to save. Please try again.';
};

const PickupAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const emptyForm = {
    name: '', phone: '', email: '', pincode: '', address: '',
    warehouse_name: '', is_primary: false, is_active: true,
  };
  const [form, setForm] = useState(emptyForm);

  const updateForm = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  // Fetch addresses
  const fetchAddresses = async () => {
    try {
      const res = await api.get('/api/auth/settings/pickup-address/', { skipLoading: true });
      setAddresses(Array.isArray(res.data) ? res.data : res.data.results || []);
    } catch {
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const openModal = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setForm({
        name: address.name || '',
        phone: address.phone || '',
        email: address.email || '',
        pincode: address.pincode || '',
        address: address.address || '',
        warehouse_name: address.warehouse_name || '',
        is_primary: address.is_primary || false,
        is_active: address.is_active !== undefined ? address.is_active : true,
      });
    } else {
      setEditingId(null);
      setForm(emptyForm);
    }
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
    setError('');
  };

  const handleSave = async () => {
    if (!form.name || !form.phone || !form.pincode || !form.address) {
      setError('Name, Phone, Pincode, and Address are required.');
      return;
    }

    // Build a clean payload — only send email if it's a valid format or empty
    const payload = { ...form };
    if (!payload.email || payload.email.trim() === '') {
      payload.email = '';
    }

    setSaving(true);
    setError('');
    try {
      if (editingId) {
        await api.put(`/api/auth/settings/pickup-address/${editingId}/`, payload);
        setSuccess('Address updated successfully!');
      } else {
        await api.post('/api/auth/settings/pickup-address/', payload);
        setSuccess('Address added successfully!');
      }
      closeModal();
      fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    try {
      await api.delete(`/api/auth/settings/pickup-address/${id}/`);
      setSuccess('Address deleted successfully!');
      fetchAddresses();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to delete address.');
    }
  };

  const toggleStatus = async (addr) => {
    try {
      await api.patch(`/api/auth/settings/pickup-address/${addr.id}/`, {
        is_active: !addr.is_active,
      });
      fetchAddresses();
    } catch {
      // Silent fail
    }
  };

  if (loading) {
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
          <button
            onClick={() => openModal()}
            className="border border-[#d4af26] text-[#d4af26] hover:bg-[#d4af26] hover:text-white text-sm font-semibold px-5 py-2 rounded-md transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-xs" />
            New Pickup Address
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <FaCheckCircle className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Table */}
        {addresses.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto">
              <FaMapMarkerAlt className="text-[var(--color-text-secondary)] text-xl" />
            </div>
            <p className="text-sm text-[var(--color-text-secondary)]">No pickup addresses added yet</p>
            <button
              onClick={() => openModal()}
              className="text-sm text-[#d4af26] hover:text-[#c39f19] font-semibold transition-colors"
            >
              + Add your first pickup address
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">ID</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Contact</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Pincode</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Status</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Primary</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Warehouse</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Address</th>
                  <th className="p-3 text-center text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {addresses.map((addr) => (
                  <tr key={addr.id} className="border-b border-[var(--color-border)] hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 text-center text-sm font-bold text-[var(--color-text-primary)]">{addr.id}</td>
                    <td className="p-4 text-center">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] block">{addr.name}</span>
                      <span className="text-xs text-[var(--color-text-secondary)] block">{addr.phone}</span>
                      {addr.email && <span className="text-[10px] text-[#d4af26]">{addr.email}</span>}
                    </td>
                    <td className="p-4 text-center text-sm text-[var(--color-text-primary)]">{addr.pincode}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => toggleStatus(addr)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${addr.is_active ? 'bg-[#d4af26]' : 'bg-gray-500'}`}
                      >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${addr.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      {addr.is_primary ? (
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-1 rounded">PRIMARY</span>
                      ) : (
                        <span className="text-xs text-[var(--color-text-secondary)]">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-sm text-[var(--color-text-secondary)]">{addr.warehouse_name || '—'}</td>
                    <td className="p-4 text-center text-xs text-[var(--color-text-secondary)] max-w-[180px] whitespace-pre-line">{addr.address}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openModal(addr)} className="p-2 text-[var(--color-text-secondary)] hover:text-[#d4af26] transition-colors" title="Edit">
                          <FaPen className="text-sm" />
                        </button>
                        <button onClick={() => handleDelete(addr.id)} className="p-2 text-[var(--color-text-secondary)] hover:text-red-400 transition-colors" title="Delete">
                          <FaTrash className="text-sm" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[var(--color-bg-surface)] rounded-xl border border-[var(--color-border)] w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                {editingId ? 'Edit Pickup Address' : 'New Pickup Address'}
              </h3>
              <button onClick={closeModal} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors">
                <FaTimes />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">
                    Name <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="Contact name" className={inputClass} value={form.name} onChange={(e) => updateForm('name', e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">
                    Phone <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="Phone number" className={inputClass} value={form.phone} onChange={(e) => updateForm('phone', e.target.value.replace(/[^0-9+]/g, ''))} maxLength={15} />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">Email</label>
                  <input type="email" placeholder="Email address (optional)" className={inputClass} value={form.email} onChange={(e) => updateForm('email', e.target.value)} />
                  <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">Leave empty if not needed</p>
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">
                    Pincode <span className="text-red-400">*</span>
                  </label>
                  <input type="text" placeholder="Pincode" className={inputClass} value={form.pincode} onChange={(e) => updateForm('pincode', e.target.value.replace(/[^0-9]/g, ''))} maxLength={10} />
                </div>
                <div>
                  <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">Warehouse Name</label>
                  <input type="text" placeholder="Warehouse name (optional)" className={inputClass} value={form.warehouse_name} onChange={(e) => updateForm('warehouse_name', e.target.value)} />
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_primary}
                      onChange={(e) => updateForm('is_primary', e.target.checked)}
                      className="w-4 h-4 rounded accent-[#d4af26]"
                    />
                    <span className="text-sm text-[var(--color-text-primary)]">Primary</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-1.5 block font-medium">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  placeholder="Full address"
                  className={`${inputClass} resize-none`}
                  rows={3}
                  value={form.address}
                  onChange={(e) => updateForm('address', e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3 p-5 border-t border-[var(--color-border)]">
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  editingId ? 'Update Address' : 'Add Address'
                )}
              </button>
              <button onClick={closeModal} className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-6 py-2.5 rounded-md transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PickupAddress;
