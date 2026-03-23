import React, { useState } from "react";
import { FaCalculator, FaTruck, FaBox, FaRupeeSign } from "react-icons/fa";

const RateCalculator = () => {
  const [form, setForm] = useState({
    pickupPincode: "",
    deliveryPincode: "",
    weight: "",
    length: "",
    breadth: "",
    height: "",
    paymentMode: "prepaid",
    declaredValue: "",
  });
  const [result, setResult] = useState(null);

  const inputClass =
    "bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full";

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setResult(null);
  };

  const getVolWeight = () => {
    const l = parseFloat(form.length) || 0;
    const b = parseFloat(form.breadth) || 0;
    const h = parseFloat(form.height) || 0;
    if (l && b && h) return (l * b * h) / 5000;
    return 0;
  };

  const getChargeableWeight = () => {
    const actual = parseFloat(form.weight) || 0;
    const vol = getVolWeight();
    return Math.max(actual, vol);
  };

  const handleCalculate = () => {
    if (!form.pickupPincode || !form.deliveryPincode || !form.weight) {
      return;
    }

    const chargeableWt = getChargeableWeight();

    let freight = 0;
    let weightSlab = "";
    if (chargeableWt <= 0.5) {
      freight = 30;
      weightSlab = "0 - 0.5 kg";
    } else if (chargeableWt <= 5) {
      freight = 30 + Math.ceil((chargeableWt - 0.5) / 0.5) * 20;
      weightSlab = "0.5 - 5 kg";
    } else if (chargeableWt <= 15) {
      freight =
        30 +
        Math.ceil((5 - 0.5) / 0.5) * 20 +
        Math.ceil((chargeableWt - 5) / 0.5) * 15;
      weightSlab = "5 - 15 kg";
    } else {
      freight =
        30 +
        Math.ceil((5 - 0.5) / 0.5) * 20 +
        Math.ceil((15 - 5) / 0.5) * 15 +
        Math.ceil((chargeableWt - 15) / 0.5) * 12;
      weightSlab = "15+ kg";
    }

    const codCharge =
      form.paymentMode === "cod"
        ? Math.max(25, (parseFloat(form.declaredValue) || 0) * 0.02)
        : 0;

    const subtotal = freight + codCharge;
    const gst = subtotal * 0.18;
    const total = subtotal + gst;

    setResult({
      weightSlab,
      actualWeight: parseFloat(form.weight) || 0,
      volWeight: getVolWeight(),
      chargeableWeight: chargeableWt,
      freight: freight.toFixed(2),
      codCharge: codCharge.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    });
  };

  const handleReset = () => {
    setForm({
      pickupPincode: "",
      deliveryPincode: "",
      weight: "",
      length: "",
      breadth: "",
      height: "",
      paymentMode: "prepaid",
      declaredValue: "",
    });
    setResult(null);
  };

  const volWeight = getVolWeight();
  const chargeableWeight = getChargeableWeight();

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Rate Calculator
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            Rate Calculator
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-5">
            <div className="flex items-center gap-2">
              <FaTruck className="text-[#d4af26]" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Shipping Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                  Pickup Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 560001"
                  className={inputClass}
                  value={form.pickupPincode}
                  onChange={(e) =>
                    updateForm(
                      "pickupPincode",
                      e.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                  maxLength={10}
                />
              </div>
              <div>
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                  Delivery Pincode <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 400001"
                  className={inputClass}
                  value={form.deliveryPincode}
                  onChange={(e) =>
                    updateForm(
                      "deliveryPincode",
                      e.target.value.replace(/[^0-9]/g, ""),
                    )
                  }
                  maxLength={10}
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-3 block font-medium">
                Payment Mode
              </label>
              <div className="flex items-center gap-6">
                {[
                  { value: "prepaid", label: "Prepaid" },
                  { value: "cod", label: "Cash on Delivery" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                        form.paymentMode === opt.value
                          ? "border-[#d4af26]"
                          : "border-[var(--color-text-secondary)]"
                      }`}
                      onClick={() => updateForm("paymentMode", opt.value)}
                    >
                      {form.paymentMode === opt.value && (
                        <div className="w-2 h-2 rounded-full bg-[#d4af26]" />
                      )}
                    </div>
                    <span className="text-sm text-[var(--color-text-primary)]">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {form.paymentMode === "cod" && (
              <div className="max-w-xs">
                <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                  COD Amount (₹)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 500"
                  className={inputClass}
                  value={form.declaredValue}
                  onChange={(e) =>
                    updateForm(
                      "declaredValue",
                      e.target.value.replace(/[^0-9.]/g, ""),
                    )
                  }
                />
              </div>
            )}
          </div>

          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-5">
            <div className="flex items-center gap-2">
              <FaBox className="text-[#d4af26]" />
              <h2 className="text-base font-semibold text-[var(--color-text-primary)]">
                Package Details
              </h2>
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                Actual Weight (kg) <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-2 max-w-xs">
                <input
                  type="text"
                  placeholder="e.g. 1.5"
                  className={inputClass}
                  value={form.weight}
                  onChange={(e) =>
                    updateForm("weight", e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <span className="bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-3 py-2.5 rounded-md whitespace-nowrap">
                  kg
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                Dimensions (optional)
              </label>
              <div className="flex items-center gap-2 max-w-lg">
                <input
                  type="text"
                  placeholder="Length"
                  className={inputClass}
                  value={form.length}
                  onChange={(e) =>
                    updateForm("length", e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <span className="text-[var(--color-text-secondary)] text-sm">
                  ×
                </span>
                <input
                  type="text"
                  placeholder="Breadth"
                  className={inputClass}
                  value={form.breadth}
                  onChange={(e) =>
                    updateForm(
                      "breadth",
                      e.target.value.replace(/[^0-9.]/g, ""),
                    )
                  }
                />
                <span className="text-[var(--color-text-secondary)] text-sm">
                  ×
                </span>
                <input
                  type="text"
                  placeholder="Height"
                  className={inputClass}
                  value={form.height}
                  onChange={(e) =>
                    updateForm("height", e.target.value.replace(/[^0-9.]/g, ""))
                  }
                />
                <span className="bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-3 py-2.5 rounded-md whitespace-nowrap">
                  cm
                </span>
              </div>
              <p className="text-[10px] text-[var(--color-text-secondary)] mt-1">
                Volumetric weight = (L × B × H) / 5000
              </p>
            </div>

            {(form.weight || volWeight > 0) && (
              <div className="bg-[var(--color-border)]/20 rounded-lg p-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest">
                    Actual Wt.
                  </p>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {parseFloat(form.weight) || 0}{" "}
                    <span className="text-xs font-normal">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest">
                    Vol. Wt.
                  </p>
                  <p className="text-lg font-bold text-[var(--color-text-primary)]">
                    {volWeight.toFixed(2)}{" "}
                    <span className="text-xs font-normal">kg</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-[var(--color-text-secondary)] uppercase tracking-widest">
                    Chargeable
                  </p>
                  <p className="text-lg font-bold text-[#d4af26]">
                    {chargeableWeight.toFixed(2)}{" "}
                    <span className="text-xs font-normal">kg</span>
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleCalculate}
                disabled={
                  !form.pickupPincode || !form.deliveryPincode || !form.weight
                }
                className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FaCalculator className="text-xs" />
                Calculate Rate
              </button>
              <button
                onClick={handleReset}
                className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {result ? (
            <div className="bg-[var(--color-bg-surface)] rounded-lg border border-[var(--color-border)] overflow-hidden">
              <div className="bg-[#d4af26] px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-white/70 uppercase tracking-widest">
                      Estimated Rate
                    </p>
                    <p className="text-3xl font-bold text-white mt-1">
                      ₹{result.total}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/70 uppercase tracking-widest">
                      Weight Slab
                    </p>
                    <p className="text-lg font-bold text-white">
                      {result.weightSlab}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Rate Breakdown
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      Freight Charge
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      ₹{result.freight}
                    </span>
                  </div>
                  {parseFloat(result.codCharge) > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[var(--color-text-secondary)]">
                        COD Charge
                      </span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        ₹{result.codCharge}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm border-t border-[var(--color-border)] pt-2">
                    <span className="text-[var(--color-text-secondary)]">
                      Subtotal
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      ₹{result.subtotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--color-text-secondary)]">
                      GST (18%)
                    </span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      ₹{result.gst}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base border-t border-[var(--color-border)] pt-2">
                    <span className="font-bold text-[var(--color-text-primary)]">
                      Total
                    </span>
                    <span className="font-bold text-[#d4af26] text-lg">
                      ₹{result.total}
                    </span>
                  </div>
                </div>

                <div className="bg-[var(--color-border)]/20 rounded-lg p-3 mt-4 space-y-1.5">
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Actual Weight:{" "}
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {result.actualWeight} kg
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Vol. Weight:{" "}
                    <span className="font-bold text-[var(--color-text-primary)]">
                      {result.volWeight.toFixed(2)} kg
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)]">
                    Chargeable:{" "}
                    <span className="font-bold text-[#d4af26]">
                      {result.chargeableWeight.toFixed(2)} kg
                    </span>
                  </p>
                </div>

                <p className="text-[10px] text-[var(--color-text-secondary)] mt-3">
                  * These are estimated rates. Actual charges may vary.
                </p>
              </div>
            </div>
          ) : (
            /* Placeholder Card */
            <div className="bg-[var(--color-bg-surface)] rounded-lg p-8 border border-[var(--color-border)] text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#d4af26]/10 flex items-center justify-center mx-auto">
                <FaRupeeSign className="text-[#d4af26] text-2xl" />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                Rate Estimate
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Fill in the shipping and package details, then click "Calculate
                Rate" to see the estimated cost.
              </p>
            </div>
          )}

          <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)] space-y-3">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
              Weight-Based Pricing
            </h3>
            <div className="space-y-0">
              {[
                { slab: "First 0.5 kg", rate: "₹30", desc: "Base rate" },
                { slab: "0.5 – 5 kg", rate: "₹20 / 0.5 kg", desc: "Standard" },
                { slab: "5 – 15 kg", rate: "₹15 / 0.5 kg", desc: "Bulk" },
                { slab: "15+ kg", rate: "₹12 / 0.5 kg", desc: "Heavy" },
              ].map((s, i) => (
                <div
                  key={s.slab}
                  className={`flex items-center justify-between py-2.5 ${i < 3 ? "border-b border-[var(--color-border)]" : ""}`}
                >
                  <div>
                    <span className="text-sm font-medium text-[var(--color-text-primary)]">
                      {s.slab}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-secondary)] ml-2">
                      ({s.desc})
                    </span>
                  </div>
                  <span className="text-sm font-bold text-[#d4af26]">
                    {s.rate}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[var(--color-text-secondary)] pt-1">
              + COD: 2% of value (min ₹25) &middot; GST: 18%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RateCalculator;
