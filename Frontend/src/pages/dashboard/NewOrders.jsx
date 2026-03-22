import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdSearch, MdDelete, MdAdd } from 'react-icons/md';
import api from '../../lib/axios';

const NewOrders = () => {
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('B2C');
  const [paymentMethod, setPaymentMethod] = useState('prepaid');
  const [submitting, setSubmitting] = useState(false);

  // Consignee
  const [consignee, setConsignee] = useState({
    name: '', mobile: '', altMobile: '', email: '',
    address1: '', address2: '', pincode: '', city: '', state: '',
  });

  // Products (array so user can add more)
  const [orderValue, setOrderValue] = useState('');
  const [products, setProducts] = useState([
    { productName: '', sku: '', unitPrice: '', qty: '', total: '' },
  ]);

  // Packages
  const [packages, setPackages] = useState([
    { count: '', length: '', breadth: '', volWeight: '', physicalWeight: '' },
  ]);

  const addProduct = () => {
    setProducts([...products, { productName: '', sku: '', unitPrice: '', qty: '', total: '' }]);
  };

  const removeProduct = (index) => {
    setProducts(products.filter((_, i) => i !== index));
  };

  const addPackage = () => {
    setPackages([...packages, { count: '', length: '', breadth: '', volWeight: '', physicalWeight: '' }]);
  };

  const removePackage = (index) => {
    setPackages(packages.filter((_, i) => i !== index));
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    // Auto-calculate total
    if (field === 'unitPrice' || field === 'qty') {
      const price = parseFloat(updated[index].unitPrice) || 0;
      const qty = parseFloat(updated[index].qty) || 0;
      updated[index].total = (price * qty).toFixed(2);
    }
    setProducts(updated);
  };

  const updatePackage = (index, field, value) => {
    const updated = [...packages];
    updated[index][field] = value;
    // Auto-calculate volumetric weight
    if (field === 'length' || field === 'breadth' || field === 'count') {
      const l = parseFloat(updated[index].length) || 0;
      const b = parseFloat(updated[index].breadth) || 0;
      const h = parseFloat(updated[index].count) || 0;
      updated[index].volWeight = ((l * b * h) / 5000).toFixed(2);
    }
    setPackages(updated);
  };

  // Calculate totals
  const totalWeight = packages.reduce((sum, p) => sum + (parseFloat(p.physicalWeight) || 0), 0);
  const totalVolWeight = packages.reduce((sum, p) => sum + (parseFloat(p.volWeight) || 0), 0);
  const totalBoxes = packages.length;

  // Shared styles
  const inputClass = "w-full bg-transparent border border-[var(--color-border)] rounded-md px-3 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors duration-200";
  const labelClass = "text-xs font-medium text-[var(--color-text-secondary)] mb-1.5 block";
  const sectionClass = "bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] transition-colors duration-300";

  return (
    <div className="flex-1 p-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">New Order</h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt;&gt; </span>
          <span className="text-[var(--color-text-secondary)]">New order</span>
        </p>
      </div>

      {/* Order Type */}
      <div className="flex items-center gap-4">
        <span className="text-sm text-[var(--color-text-primary)] font-medium">Order Type</span>
        {['B2C', 'B2B', 'International'].map((type) => (
          <label key={type} className="flex items-center gap-1.5 cursor-pointer">
            <div
              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                orderType === type ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'
              }`}
              onClick={() => setOrderType(type)}
            >
              {orderType === type && <div className="w-2 h-2 rounded-full bg-[#d4af26]" />}
            </div>
            <span className="text-sm text-[var(--color-text-primary)]">{type}</span>
          </label>
        ))}
      </div>

      {/* Pickup From */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Pickup From</h2>
        <input
          type="text"
          placeholder="Address"
          className={`${inputClass} max-w-lg`}
        />
      </div>

      {/* Deliver To */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Deliver To</h2>

        {/* Search */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search consignee by Name / Email"
            className={`${inputClass} max-w-2xl`}
          />
        </div>

        {/* Consignee Details */}
        <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-4">Consignee Details</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className={labelClass}>Name*</label>
            <input type="text" className={inputClass} value={consignee.name}
              onChange={(e) => setConsignee({ ...consignee, name: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Mobile*</label>
            <input type="text" className={inputClass} value={consignee.mobile}
              onChange={(e) => setConsignee({ ...consignee, mobile: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Alternate Mobile*</label>
            <input type="text" className={inputClass} value={consignee.altMobile}
              onChange={(e) => setConsignee({ ...consignee, altMobile: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Email*</label>
            <input type="email" className={inputClass} value={consignee.email}
              onChange={(e) => setConsignee({ ...consignee, email: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div>
            <label className={labelClass}>Address 1 *</label>
            <input type="text" className={inputClass} value={consignee.address1}
              onChange={(e) => setConsignee({ ...consignee, address1: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>Address Line 2*</label>
            <input type="text" className={inputClass} value={consignee.address2}
              onChange={(e) => setConsignee({ ...consignee, address2: e.target.value })} />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>PinCode*</label>
            <input type="text" className={inputClass} value={consignee.pincode}
              onChange={(e) => setConsignee({ ...consignee, pincode: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>City*</label>
            <input type="text" className={inputClass} value={consignee.city}
              onChange={(e) => setConsignee({ ...consignee, city: e.target.value })} />
          </div>
          <div>
            <label className={labelClass}>State*</label>
            <input type="text" className={inputClass} value={consignee.state}
              onChange={(e) => setConsignee({ ...consignee, state: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Payment Method</h2>
        <div className="flex items-center gap-6">
          {['COD', 'prepaid', 'To pay'].map((method) => (
            <label key={method} className="flex items-center gap-2 cursor-pointer">
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                  paymentMethod === method ? 'border-[#d4af26]' : 'border-[var(--color-text-secondary)]'
                }`}
                onClick={() => setPaymentMethod(method)}
              >
                {paymentMethod === method && <div className="w-2 h-2 rounded-full bg-[#d4af26]" />}
              </div>
              <span className="text-sm text-[var(--color-text-primary)]">{method}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Product Details */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Product Details</h2>

        <div className="flex items-end justify-between mb-4">
          <div>
            <label className={labelClass}>Order Value*</label>
            <input
              type="number"
              placeholder="Total Order Value"
              className={`${inputClass} w-48`}
              value={orderValue}
              onChange={(e) => setOrderValue(e.target.value)}
            />
          </div>
          {products.length > 1 && (
            <button
              onClick={() => removeProduct(products.length - 1)}
              className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
            >
              Delete
            </button>
          )}
        </div>

        {products.map((product, index) => (
          <div key={index} className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-3">
            <div>
              <label className={labelClass}>Product Name*</label>
              <input type="text" className={inputClass} value={product.productName}
                onChange={(e) => updateProduct(index, 'productName', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>SKU</label>
              <input type="text" className={inputClass} value={product.sku}
                onChange={(e) => updateProduct(index, 'sku', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Unit price*</label>
              <input type="number" className={inputClass} value={product.unitPrice}
                onChange={(e) => updateProduct(index, 'unitPrice', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>QTY*</label>
              <input type="number" className={inputClass} value={product.qty}
                onChange={(e) => updateProduct(index, 'qty', e.target.value)} />
            </div>
            <div>
              <label className={labelClass}>Total*</label>
              <input type="text" className={`${inputClass} bg-transparent`} value={product.total} readOnly />
            </div>
          </div>
        ))}

        <button
          onClick={addProduct}
          className="mt-2 bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-medium px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
        >
          Add New
        </button>
      </div>

      {/* Package Details */}
      <div className={sectionClass}>
        <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">Package Details</h2>

        {packages.map((pkg, index) => (
          <div key={index} className="mb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className={labelClass}>Count</label>
                <input type="number" className={inputClass} value={pkg.count}
                  onChange={(e) => updatePackage(index, 'count', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Length (cm)</label>
                <input type="number" className={inputClass} value={pkg.length}
                  onChange={(e) => updatePackage(index, 'length', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Breath(cm)</label>
                <input type="number" className={inputClass} value={pkg.breadth}
                  onChange={(e) => updatePackage(index, 'breadth', e.target.value)} />
              </div>
              <div>
                <label className={labelClass}>Vol.Weight(kg)*</label>
                <input type="text" className={`${inputClass} bg-transparent`} value={pkg.volWeight} readOnly />
              </div>
              <div>
                <label className={labelClass}>Physical Weight(kg)*</label>
                <input type="number" className={inputClass} value={pkg.physicalWeight}
                  onChange={(e) => updatePackage(index, 'physicalWeight', e.target.value)} />
              </div>
            </div>

            {packages.length > 1 && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => removePackage(index)}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-md transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Weight Summary */}
        <div className="border border-[#d4af26] rounded-lg p-4 mt-4 mb-4">
          <p className="text-sm font-semibold text-[var(--color-text-primary)] mb-2">
            Application Weight {totalWeight.toFixed(2)} Kg
          </p>
          <div className="flex flex-wrap gap-x-10 gap-y-1">
            <span className="text-sm text-[var(--color-text-primary)]">
              No Of Boxes <span className="font-semibold">*{totalBoxes}</span>
            </span>
            <span className="text-sm text-[var(--color-text-primary)]">
              Total Weight {totalWeight.toFixed(2)} <span className="text-[#d4af26]">Kg</span>
            </span>
            <span className="text-sm text-[var(--color-text-primary)]">
              Total Volumetric Wt {totalVolWeight.toFixed(2)} <span className="text-[#d4af26]">Kg</span>
            </span>
          </div>
        </div>

        <button
          onClick={addPackage}
          className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-medium px-4 py-2 rounded-md flex items-center gap-1 transition-colors"
        >
          Add New
        </button>
      </div>

      {/* Submit */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            setSubmitting(true);
            try {
              await api.post('/api/orders/', {
                customer_name: consignee.name,
                customer_phone: consignee.mobile,
                destination_address: [consignee.address1, consignee.address2, consignee.city, consignee.state].filter(Boolean).join(', '),
                destination_pincode: consignee.pincode,
                weight: totalWeight || 0.5,
                order_type: paymentMethod === 'COD' ? 'COD' : 'PREPAID',
                cod_amount: paymentMethod === 'COD' ? (parseFloat(orderValue) || 0) : 0,
                product_amount: parseFloat(orderValue) || 0,
              });
              alert('Order created successfully!');
              navigate('/orders/all');
            } catch (err) {
              alert(err.response?.data?.detail || 'Failed to create order. Make sure backend is running.');
            } finally {
              setSubmitting(false);
            }
          }}
          disabled={submitting}
          className="bg-[#d4af26] hover:bg-[#c39f19] text-white font-semibold text-sm px-8 py-2.5 rounded-md transition-colors duration-200 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default NewOrders;
