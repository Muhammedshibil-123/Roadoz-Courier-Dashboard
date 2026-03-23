import React, { useState, useEffect } from "react";
import {
  FaIdCard,
  FaBuilding,
  FaUniversity,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import api from "../../../lib/axios";

const KYC = () => {
  const [activeTab, setActiveTab] = useState("domestic");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [kycStatus, setKycStatus] = useState("unverified");

  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    pan_number: "",
    aadhar_number: "",
    gst_number: "",
    bank_account_number: "",
    ifsc_code: "",
    bank_name: "",
  });

  const updateForm = (key, value) => setForm({ ...form, [key]: value });

  const inputClass =
    "bg-transparent border border-[var(--color-border)] rounded-md px-4 py-2.5 text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-[#d4af26] transition-colors w-full";

  useEffect(() => {
    const fetchKYC = async () => {
      try {
        const res = await api.get("/api/auth/settings/kyc/", {
          skipLoading: true,
        });
        const data = res.data;
        setForm({
          full_name: data.full_name || "",
          business_name: data.business_name || "",
          pan_number: data.pan_number || "",
          aadhar_number: data.aadhar_number || "",
          gst_number: data.gst_number || "",
          bank_account_number: data.bank_account_number || "",
          ifsc_code: data.ifsc_code || "",
          bank_name: data.bank_name || "",
        });
        setKycStatus(data.kyc_status || "unverified");
        if (data.kyc_status === "pending") {
          setSubmitted(true);
        }
      } catch {
      } finally {
        setFetchLoading(false);
      }
    };
    fetchKYC();
  }, []);

  const handleSubmit = async () => {
    if (!form.full_name || !form.pan_number || !form.aadhar_number) {
      setError(
        "Full Name, PAN Card Number, and Aadhar Card Number are required.",
      );
      return;
    }
    setError("");
    setLoading(true);
    try {
      await api.put("/api/auth/settings/kyc/", form);
      setSubmitted(true);
      setKycStatus("pending");
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to submit KYC. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (kycStatus) {
      case "verified":
        return (
          <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs font-bold px-4 py-2 rounded-md">
            <FaCheckCircle /> VERIFIED
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 bg-[#d4af26]/20 text-[#d4af26] text-xs font-bold px-4 py-2 rounded-md">
            <FaClock /> UNDER REVIEW
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-400 text-xs font-bold px-4 py-2 rounded-md">
            <FaTimesCircle /> REJECTED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 bg-gray-500/20 text-gray-400 text-xs font-bold px-4 py-2 rounded-md">
            <FaExclamationTriangle /> NOT SUBMITTED
          </span>
        );
    }
  };

  const isEditable = kycStatus !== "pending" && kycStatus !== "verified";

  if (fetchLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-amber-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-5">
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          KYC Verification
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            KYC Verification
          </span>
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            KYC Details
          </h2>
          {getStatusBadge()}
        </div>

        {kycStatus === "pending" && (
          <div className="bg-[#d4af26]/10 border border-[#d4af26]/30 rounded-lg px-5 py-4">
            <div className="flex items-center gap-3">
              <FaClock className="text-[#d4af26] text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#d4af26]">
                  KYC Under Review
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Your KYC documents have been submitted successfully. Our team
                  will review your details and get back to you within 2-3
                  business days.
                </p>
              </div>
            </div>
          </div>
        )}

        {kycStatus === "verified" && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-5 py-4">
            <div className="flex items-center gap-3">
              <FaCheckCircle className="text-green-400 text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-400">
                  KYC Verified
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Your KYC has been verified successfully. You now have full
                  access to all features.
                </p>
              </div>
            </div>
          </div>
        )}

        {kycStatus === "rejected" && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-5 py-4">
            <div className="flex items-center gap-3">
              <FaTimesCircle className="text-red-400 text-lg flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-400">
                  KYC Rejected
                </p>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                  Your KYC submission was rejected. Please correct the details
                  and resubmit.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab("domestic")}
            className={`text-sm font-semibold px-5 py-2 rounded-md transition-colors ${activeTab === "domestic" ? "bg-[#d4af26] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
          >
            Domestic KYC
          </button>
          <button
            onClick={() => setActiveTab("international")}
            className={`text-sm font-semibold px-5 py-2 rounded-md transition-colors ${activeTab === "international" ? "bg-[#d4af26] text-white" : "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
          >
            International KYC
          </button>
        </div>

        {activeTab === "domestic" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  KYC - DOMESTIC
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Complete your domestic KYC verification
                </p>
              </div>
            </div>

            {submitted && kycStatus === "pending" && (
              <div className="bg-[#d4af26]/5 border border-[#d4af26]/20 rounded-xl p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#d4af26]/20 flex items-center justify-center mx-auto">
                  <FaClock className="text-[#d4af26] text-2xl" />
                </div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  KYC Submitted Successfully!
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] max-w-md mx-auto">
                  Thank you for submitting your KYC details. Our team will
                  carefully review your documents and verify your identity. You
                  will be notified once the review is complete.
                </p>
                <div className="flex items-center justify-center gap-2 text-xs text-[var(--color-text-secondary)]">
                  <FaClock className="text-[#d4af26]" />
                  <span>Estimated review time: 2-3 business days</span>
                </div>
              </div>
            )}

            {isEditable && !submitted && (
              <>
                {error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <FaIdCard className="text-[#d4af26]" />
                    <h4 className="text-sm font-semibold">Personal Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        className={inputClass}
                        value={form.full_name}
                        onChange={(e) =>
                          updateForm("full_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        PAN Card Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="ABCDE1234F"
                        className={inputClass}
                        value={form.pan_number}
                        onChange={(e) =>
                          updateForm("pan_number", e.target.value.toUpperCase())
                        }
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        Aadhar Card Number{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012"
                        className={inputClass}
                        value={form.aadhar_number}
                        onChange={(e) =>
                          updateForm(
                            "aadhar_number",
                            e.target.value.replace(/[^0-9\s]/g, ""),
                          )
                        }
                        maxLength={14}
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        GST Number
                      </label>
                      <input
                        type="text"
                        placeholder="22AAAAA0000A1Z5"
                        className={inputClass}
                        value={form.gst_number}
                        onChange={(e) =>
                          updateForm("gst_number", e.target.value.toUpperCase())
                        }
                        maxLength={15}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <FaBuilding className="text-[#d4af26]" />
                    <h4 className="text-sm font-semibold">Business Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="md:col-span-2">
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        Business Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter your business name"
                        className={inputClass}
                        value={form.business_name}
                        onChange={(e) =>
                          updateForm("business_name", e.target.value)
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2 text-[var(--color-text-primary)]">
                    <FaUniversity className="text-[#d4af26]" />
                    <h4 className="text-sm font-semibold">Bank Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="Enter bank name"
                        className={inputClass}
                        value={form.bank_name}
                        onChange={(e) =>
                          updateForm("bank_name", e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        Bank Account Number
                      </label>
                      <input
                        type="text"
                        placeholder="Enter account number"
                        className={inputClass}
                        value={form.bank_account_number}
                        onChange={(e) =>
                          updateForm(
                            "bank_account_number",
                            e.target.value.replace(/[^0-9]/g, ""),
                          )
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--color-text-primary)] mb-2 block font-medium">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        placeholder="SBIN0001234"
                        className={inputClass}
                        value={form.ifsc_code}
                        onChange={(e) =>
                          updateForm("ifsc_code", e.target.value.toUpperCase())
                        }
                        maxLength={11}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-sm font-semibold px-8 py-2.5 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit for Review"
                    )}
                  </button>
                  <button
                    onClick={() =>
                      setForm({
                        full_name: "",
                        business_name: "",
                        pan_number: "",
                        aadhar_number: "",
                        gst_number: "",
                        bank_account_number: "",
                        ifsc_code: "",
                        bank_name: "",
                      })
                    }
                    className="border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
                  >
                    Clear Form
                  </button>
                </div>
              </>
            )}

            {(kycStatus === "pending" || kycStatus === "verified") && (
              <div className="space-y-4 pt-2">
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Submitted Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { label: "Full Name", value: form.full_name },
                    { label: "PAN Number", value: form.pan_number },
                    { label: "Aadhar Number", value: form.aadhar_number },
                    { label: "GST Number", value: form.gst_number },
                    { label: "Business Name", value: form.business_name },
                    { label: "Bank Name", value: form.bank_name },
                    {
                      label: "Account Number",
                      value: form.bank_account_number,
                    },
                    { label: "IFSC Code", value: form.ifsc_code },
                  ]
                    .filter((item) => item.value)
                    .map((item) => (
                      <div
                        key={item.label}
                        className="bg-[var(--color-border)]/30 rounded-lg px-4 py-3"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-[var(--color-text-secondary)] mb-1">
                          {item.label}
                        </p>
                        <p className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {item.value}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "international" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                  KYC - INTERNATIONAL
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Provide the required details for international shipping
                </p>
              </div>
              <span className="bg-gray-500/20 text-gray-400 text-xs font-bold px-4 py-2 rounded-md">
                COMING SOON
              </span>
            </div>
            <div className="bg-[var(--color-border)]/20 rounded-xl p-10 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[var(--color-border)]/50 flex items-center justify-center mx-auto">
                <FaIdCard className="text-[var(--color-text-secondary)] text-xl" />
              </div>
              <h4 className="text-base font-semibold text-[var(--color-text-primary)]">
                International KYC
              </h4>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto">
                International KYC verification will be available soon. Complete
                your domestic KYC first to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KYC;
