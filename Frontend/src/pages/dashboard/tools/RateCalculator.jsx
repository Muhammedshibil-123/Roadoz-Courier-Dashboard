import React, { useState } from 'react';
import { FaTrash } from 'react-icons/fa';

const RateCalculator = () => {
  const [activeTab, setActiveTab] = useState('b2c');
  const [mode, setMode] = useState('cod');
  const [form, setForm] = useState({
    pickupPincode: '', deliveryPincode: '', declaredValue: '', shipmentType: 'Forward',
    length: '', breath: '', height: '', weight: '', volWeight: '',
    noOfBoxes: '', totalWeight: '', totalVolWeight: '', chargeableWeight: '', rov: '',
    appointmentDelivery: 'No',
  });
  const [boxes, setBoxes] = useState([
    { id: 1, count: '1', length: '', breath: '', height: '', volWeight: '', physicalWeight: '' },
  ]);

  const inputClass = 'bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full';

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const updateBox = (id, key, value) => {
    setBoxes(boxes.map(b => b.id === id ? { ...b, [key]: value } : b));
  };

  const addBox = () => {
    const newId = boxes.length > 0 ? Math.max(...boxes.map(b => b.id)) + 1 : 1;
    setBoxes([...boxes, { id: newId, count: '1', length: '', breath: '', height: '', volWeight: '', physicalWeight: '' }]);
  };

  const deleteBox = (id) => {
    if (boxes.length > 1) setBoxes(boxes.filter(b => b.id !== id));
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">Rate Calculator</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">Rate Calculator</span>
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-lg overflow-hidden border border-[var(--color-border)]">
        <button onClick={() => setActiveTab('b2c')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'b2c' ? 'bg-[#d4af26] text-white' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
          B2C Rate Calculator
        </button>
        <button onClick={() => setActiveTab('b2c2')}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'b2c2' ? 'bg-[#d4af26] text-white' : 'bg-[var(--color-bg-surface)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}>
          B2C Rate Calculator
        </button>
      </div>

      {/* B2C Tab Content */}
      {activeTab === 'b2c' && (
        <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
          {/* Top Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">pickup Pincode</label>
              <input type="text" placeholder="pickup Pincode" className={inputClass} value={form.pickupPincode} onChange={(e) => updateForm('pickupPincode', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Delivery Pincode:</label>
              <input type="text" placeholder="Delivery Pincode" className={inputClass} value={form.deliveryPincode} onChange={(e) => updateForm('deliveryPincode', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Declared Value in INR:</label>
              <input type="text" placeholder="Amount" className={inputClass} value={form.declaredValue} onChange={(e) => updateForm('declaredValue', e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Shipment Type:</label>
              <select className={inputClass} value={form.shipmentType} onChange={(e) => updateForm('shipmentType', e.target.value)}>
                <option value="Forward">Forward</option>
                <option value="Reverse">Reverse</option>
              </select>
            </div>
          </div>

          {/* Mode */}
          <div>
            <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">Mode:</h3>
            <div className="flex items-center gap-6">
              {[{ value: 'cod', label: 'Cash on Delivery' }, { value: 'prepaid', label: 'Prepaid' }, { value: 'topay', label: 'To pay' }].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === opt.value ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'}`} onClick={() => setMode(opt.value)}>
                    {mode === opt.value && <div className="w-2 h-2 rounded-full bg-[#d4af26]" />}
                  </div>
                  <span className="text-sm text-[var(--color-text-primary)]">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dimension, Weight, Volumetric Weight */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Dimension:</label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Length" className={`${inputClass}`} value={form.length} onChange={(e) => updateForm('length', e.target.value)} />
                <input type="text" placeholder="Breath" className={`${inputClass}`} value={form.breath} onChange={(e) => updateForm('breath', e.target.value)} />
                <input type="text" placeholder="Height" className={`${inputClass}`} value={form.height} onChange={(e) => updateForm('height', e.target.value)} />
                <span className="bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-3 py-2.5 rounded-md whitespace-nowrap">cm</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Weight:</label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Height" className={`${inputClass}`} value={form.weight} onChange={(e) => updateForm('weight', e.target.value)} />
                <span className="bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-3 py-2.5 rounded-md whitespace-nowrap">kg</span>
              </div>
            </div>
            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Volumetric Weight:</label>
              <div className="flex items-center gap-2">
                <input type="text" placeholder="Height" className={`${inputClass}`} value={form.volWeight} onChange={(e) => updateForm('volWeight', e.target.value)} />
                <span className="bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-3 py-2.5 rounded-md whitespace-nowrap">kg</span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors">
            Submit
          </button>
        </div>
      )}

      {/* B2C2 Tab Content */}
      {activeTab === 'b2c2' && (
        <div className="space-y-5">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
            {/* Top Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">pickup Pincode</label>
                <input type="text" placeholder="pickup Pincode" className={inputClass} value={form.pickupPincode} onChange={(e) => updateForm('pickupPincode', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Delivery Pincode:</label>
                <input type="text" placeholder="Delivery Pincode" className={inputClass} value={form.deliveryPincode} onChange={(e) => updateForm('deliveryPincode', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Declared Value in INR:</label>
                <input type="text" placeholder="Amount" className={inputClass} value={form.declaredValue} onChange={(e) => updateForm('declaredValue', e.target.value)} />
              </div>
            </div>

            {/* Mode */}
            <div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-3">Mode:</h3>
              <div className="flex items-center gap-6">
                {[{ value: 'cod', label: 'Cash on Delivery' }, { value: 'prepaid', label: 'Prepaid' }, { value: 'topay', label: 'To pay' }].map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === opt.value ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'}`} onClick={() => setMode(opt.value)}>
                      {mode === opt.value && <div className="w-2 h-2 rounded-full bg-[#d4af26]" />}
                    </div>
                    <span className="text-sm text-[var(--color-text-primary)]">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Weight Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">No Of Boxes *</label>
                <input type="text" placeholder="Length" className={inputClass} value={form.noOfBoxes} onChange={(e) => updateForm('noOfBoxes', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Total Weight</label>
                <input type="text" placeholder="Total Weight" className={inputClass} value={form.totalWeight} onChange={(e) => updateForm('totalWeight', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Total Vol.Weight</label>
                <input type="text" placeholder="Height" className={inputClass} value={form.totalVolWeight} onChange={(e) => updateForm('totalVolWeight', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Chargeable Weight *</label>
                <input type="text" placeholder="Chargeable Weight" className={`${inputClass} border-[#d4af26]`} value={form.chargeableWeight} onChange={(e) => updateForm('chargeableWeight', e.target.value)} />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">ROV</label>
                <input type="text" placeholder="Height" className={inputClass} value={form.rov} onChange={(e) => updateForm('rov', e.target.value)} />
              </div>
            </div>

            {/* Appointment Delivery */}
            <div className="max-w-[200px]">
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Appointment Delivery</label>
              <select className={inputClass} value={form.appointmentDelivery} onChange={(e) => updateForm('appointmentDelivery', e.target.value)}>
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div><input type="checkbox" className="w-4 h-4 accent-[#d4af26] cursor-pointer" /></div>
          </div>

          {/* Dynamic Box Rows */}
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-4">
            {boxes.map((box) => (
              <div key={box.id} className="flex flex-wrap items-end gap-3">
                <div className="w-16">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Count</label>
                  <input type="text" placeholder="" className={inputClass} value={box.count} onChange={(e) => updateBox(box.id, 'count', e.target.value)} />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Length:</label>
                  <input type="text" placeholder="Length" className={inputClass} value={box.length} onChange={(e) => updateBox(box.id, 'length', e.target.value)} />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Breath:</label>
                  <input type="text" placeholder="Breath" className={inputClass} value={box.breath} onChange={(e) => updateBox(box.id, 'breath', e.target.value)} />
                </div>
                <div className="flex-1 min-w-[80px]">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Height:</label>
                  <input type="text" placeholder="Height" className={inputClass} value={box.height} onChange={(e) => updateBox(box.id, 'height', e.target.value)} />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Vol. Weight(Kg)*</label>
                  <input type="text" placeholder="volumatric weight" className={inputClass} value={box.volWeight} onChange={(e) => updateBox(box.id, 'volWeight', e.target.value)} />
                </div>
                <div className="flex-1 min-w-[100px]">
                  <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">Physical Weight(Kg)*</label>
                  <input type="text" placeholder="Physical Weight" className={inputClass} value={box.physicalWeight} onChange={(e) => updateBox(box.id, 'physicalWeight', e.target.value)} />
                </div>
                <button onClick={() => deleteBox(box.id)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors">
                  Delete
                </button>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button onClick={addBox} className="bg-[#d4af26]/20 text-[#d4af26] hover:bg-[#d4af26]/30 text-sm font-semibold px-6 py-2.5 rounded-md transition-colors border border-[#d4af26]/30">
                Add New
              </button>
            </div>

            <button className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors">
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateCalculator;
