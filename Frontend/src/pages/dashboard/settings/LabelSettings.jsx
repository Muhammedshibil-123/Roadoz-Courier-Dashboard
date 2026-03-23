import React, { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaTag } from "react-icons/fa";
import api from "../../../lib/axios";

const labelToggles = [
  {
    name: "Order value on labels",
    key: "show_order_value",
    description: "Shows order value in COD & Prepaid orders.",
  },
  {
    name: "COD amount on label",
    key: "show_cod_amount",
    description: "Displays COD amount on the label.",
  },
  {
    name: "Buyer mobile number",
    key: "show_buyer_mobile",
    description: "Shows buyer phone number on the label.",
  },
  {
    name: "Shipper mobile numbers",
    key: "show_shipper_mobile",
    description: "Displays shipper phone number on the label.",
  },
  {
    name: "Product name",
    key: "show_product_name",
    description: "Shows product name on the label.",
  },
  {
    name: "Services T&C",
    key: "show_services_tc",
    description: "Shows services T&C on the label.",
  },
];

const LabelSettings = () => {
  const [toggles, setToggles] = useState(
    labelToggles.reduce((acc, t) => ({ ...acc, [t.key]: true }), {}),
  );
  const [printType, setPrintType] = useState("Thermal");
  const [labelLogoUrl, setLabelLogoUrl] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/api/auth/settings/label/", {
          skipLoading: true,
        });
        const data = res.data;
        setPrintType(data.print_type || "Thermal");
        setLabelLogoUrl(data.label_logo_url || null);
        const newToggles = {};
        labelToggles.forEach((t) => {
          newToggles[t.key] = data[t.key] !== undefined ? data[t.key] : true;
        });
        setToggles(newToggles);
      } catch {
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (key) => {
    setToggles({ ...toggles, [key]: !toggles[key] });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = [
      "image/png",
      "image/webp",
      "image/jpeg",
      "image/jpg",
      "image/gif",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Only PNG, WebP, JPG, and GIF images are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image size must be less than 2MB.");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const formData = new FormData();
      formData.append("print_type", printType);
      labelToggles.forEach((t) => {
        formData.append(t.key, toggles[t.key]);
      });

      if (logoFile) {
        formData.append("label_logo_url", "");
      }

      await api.put("/api/auth/settings/label/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSuccess("Label settings saved successfully!");
      setLogoFile(null);
      setLogoPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Failed to save settings. Please try again.",
      );
    } finally {
      setSaving(false);
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
      <div className="bg-[var(--color-bg-surface)] rounded-lg p-5 border border-[var(--color-border)]">
        <h1 className="text-xl font-semibold text-[var(--color-text-primary)]">
          Label Settings
        </h1>
        <p className="text-xs mt-0.5">
          <span className="text-[#d4af26]">Dashboard</span>
          <span className="text-[var(--color-text-secondary)]"> &gt; </span>
          <span className="text-[var(--color-text-secondary)]">
            Label Settings
          </span>
        </p>
      </div>

      <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 border border-[var(--color-border)] space-y-6">
        <div className="flex items-center gap-2">
          <FaTag className="text-[#d4af26]" />
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Label Settings
          </h2>
        </div>

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg px-4 py-3 flex items-center gap-3">
            <FaCheckCircle className="text-green-400 flex-shrink-0" />
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="border border-[#d4af26]/30 rounded-lg p-5 bg-[#d4af26]/5">
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-1">
            Label Logo
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mb-3">
            Recommended: PNG/WebP with transparent background
          </p>

          <div className="flex items-center gap-4">
            {(logoPreview || labelLogoUrl) && (
              <div className="w-16 h-16 rounded-lg border border-[var(--color-border)] bg-white/5 flex items-center justify-center overflow-hidden">
                <img
                  src={logoPreview || labelLogoUrl}
                  alt="Logo"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            )}

            <div className="flex items-center gap-0">
              <label className="bg-[#d4af26] hover:bg-[#c39f19] text-white text-xs font-semibold px-4 py-2 rounded-l-md cursor-pointer transition-colors">
                Choose File
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".png,.webp,.jpg,.gif"
                  onChange={handleFileSelect}
                />
              </label>
              <div className="flex-1 bg-[var(--color-border)] text-xs text-[var(--color-text-secondary)] px-3 py-2 rounded-r-md min-w-[120px]">
                {logoFile ? logoFile.name : "No file chosen"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-0">
          {labelToggles.map((item) => (
            <div
              key={item.key}
              className="border-b border-[var(--color-border)] py-4"
            >
              <div className="flex items-center justify-between">
                <div className="bg-[#d4af26]/10 rounded-lg px-5 py-3 flex-1 mr-6">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
                    {item.name}
                  </h3>
                </div>
                <button
                  onClick={() => handleToggle(item.key)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors flex-shrink-0 ${toggles[item.key] ? "bg-[#d4af26]" : "bg-gray-500"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${toggles[item.key] ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              <p className="text-xs text-[var(--color-text-secondary)] mt-2 ml-1">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)] mb-4">
            Print Type
          </h3>
          <div className="border border-[var(--color-border)] rounded-lg p-5 bg-[var(--color-bg-surface)]">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-[var(--color-text-primary)]">
                  Label Type
                </h4>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                  Choose A4 for paper printing or Thermal for label printers.
                </p>
              </div>
              <div className="flex rounded-md overflow-hidden border border-[var(--color-border)]">
                <button
                  onClick={() => setPrintType("A4")}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${printType === "A4" ? "bg-[#d4af26] text-white" : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                >
                  A4
                </button>
                <button
                  onClick={() => setPrintType("Thermal")}
                  className={`px-5 py-2 text-sm font-semibold transition-colors ${printType === "Thermal" ? "bg-[#d4af26] text-white" : "bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"}`}
                >
                  Thermal
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
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
              "Save Changes"
            )}
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-red-500/80 hover:bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default LabelSettings;
