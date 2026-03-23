import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
} from "react-icons/fa";
import api from "../../../lib/axios";

const ServiceablePincode = () => {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputClass =
    "bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full";

  const handleCheck = async () => {
    if (!pincode || pincode.length < 4) {
      setError("Please enter a valid pincode.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await api.get(`/api/auth/check-pincode/?pincode=${pincode}`, {
        skipLoading: true,
      });
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to check pincode. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleCheck();
  };

  const handleClear = () => {
    setPincode("");
    setResult(null);
    setError("");
  };

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Serviceable Pincode
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            Serviceable Pincode
          </span>
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)]">
        <div className="flex items-center gap-2 mb-5">
          <FaMapMarkerAlt className="text-[#d4af26]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Check Serviceable Pincode
          </h2>
        </div>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Enter a pincode to check if we deliver to that area.
        </p>

        <div className="flex flex-wrap items-end gap-4 max-w-xl">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
              Pincode
            </label>
            <input
              type="text"
              placeholder="Enter pincode (e.g. 560001)"
              className={inputClass}
              value={pincode}
              onChange={(e) => {
                setPincode(e.target.value.replace(/[^0-9]/g, ""));
                setResult(null);
                setError("");
              }}
              onKeyDown={handleKeyDown}
              maxLength={10}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCheck}
              disabled={loading}
              className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <FaSearch className="text-xs" />
                  Check
                </>
              )}
            </button>
            {(result || error) && (
              <button
                onClick={handleClear}
                className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-4 py-2.5 rounded-md transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mt-5 bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {result && (
          <div
            className={`mt-5 rounded-lg px-5 py-5 border ${
              result.serviceable
                ? "bg-green-500/10 border-green-500/30"
                : "bg-red-500/10 border-red-500/30"
            }`}
          >
            <div className="flex items-start gap-4">
              {result.serviceable ? (
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <FaCheckCircle className="text-green-400 text-xl" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
                  <FaTimesCircle className="text-red-400 text-xl" />
                </div>
              )}
              <div>
                <h3
                  className={`text-lg font-bold ${result.serviceable ? "text-green-400" : "text-red-400"}`}
                >
                  {result.serviceable ? "Serviceable ✓" : "Not Serviceable ✗"}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Pincode:{" "}
                  <span className="font-bold text-[var(--color-text-primary)]">
                    {result.pincode}
                  </span>
                </p>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  {result.serviceable ? result.message : result.reason}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceablePincode;
