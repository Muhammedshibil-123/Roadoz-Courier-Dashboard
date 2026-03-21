import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice";
import api, { setAccessToken } from "../../lib/axios";

// ─── Step 1: Registration form ───────────────────────────────────────────────
function RegisterForm({ onSuccess }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    secret_code: "",
    password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/auth/register/", form);

      // 200 = unverified account exists, new OTP sent
      // 201 = fresh account created
      if (response.status === 200 || response.status === 201) {
        onSuccess(form.email);
      }
    } catch (err) {
      const data = err.response?.data;
      if (!data) { setError("Something went wrong. Please try again."); return; }

      if (err.response?.status === 409) {
        setError("This email is already verified. Please log in.");
        return;
      }
      const firstKey = Object.keys(data)[0];
      const firstVal = data[firstKey];
      setError(Array.isArray(firstVal) ? firstVal[0] : firstVal);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-zinc-800/60 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/10 transition-all";

  const EyeIcon = ({ show }) => show ? (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Username</label>
        <input type="text" placeholder="john_doe" required value={form.username} onChange={update("username")} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Work Email</label>
        <input type="email" placeholder="you@company.com" required value={form.email} onChange={update("email")} className={inputClass} />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Employee Secret Code</label>
        <input type="text" placeholder="employee1234" required value={form.secret_code} onChange={update("secret_code")} className={inputClass} />
        <p className="text-xs text-zinc-600 mt-1.5">Provided by your manager. Required for access.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Password</label>
          <div className="relative">
            <input type={showPassword ? "text" : "password"} placeholder="••••••" required value={form.password} onChange={update("password")} className={inputClass + " pr-10"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
              <EyeIcon show={showPassword} />
            </button>
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Confirm</label>
          <div className="relative">
            <input type={showConfirm ? "text" : "password"} placeholder="••••••" required value={form.confirm_password} onChange={update("confirm_password")} className={inputClass + " pr-10"} />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors">
              <EyeIcon show={showConfirm} />
            </button>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-black font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-amber-500/20"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </button>
    </form>
  );
}

// ─── Step 2: OTP verification (exact MyCalo VerfiyOtp pattern) ────────────────
function OtpStep({ email, onBack }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const inputsRef = useRef([]);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resent, setResent] = useState(false);

  const isOtpComplete = otp.every((d) => d !== "");

  const handleChange = (e, index) => {
    const raw = e.target.value || "";
    const digits = raw.replace(/\D/g, "");
    if (digits === "") {
      const next = [...otp]; next[index] = ""; setOtp(next); return;
    }
    const char = digits.slice(-1);
    const next = [...otp]; next[index] = char; setOtp(next);
    setError("");
    if (index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (otp[index]) {
        const next = [...otp]; next[index] = ""; setOtp(next);
        inputsRef.current[index]?.focus();
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...otp]; next[index - 1] = ""; setOtp(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = [...otp];
    data.split("").forEach((ch, i) => { next[i] = ch; });
    setOtp(next);
    inputsRef.current[Math.min(data.length, 5)]?.focus();
  };

  const handleResend = async () => {
    try {
      await api.post("/api/auth/register/", { email }, { skipLoading: true });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isOtpComplete) return;

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/api/auth/verify-otp/", {
        email,
        otp: otp.join(""),
      });

      const data = response.data;

      // Exact MyCalo pattern
      setAccessToken(data.access);
      dispatch(
        setCredentials({
          accessToken: data.access,
          user: { id: data.id, username: data.username, email: data.email },
        })
      );

      navigate("/dashboard", { replace: true });
    } catch (err) {
      const data = err.response?.data;
      const first = data ? Object.values(data)[0] : null;
      setError(Array.isArray(first) ? first[0] : first || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6 text-amber-500">
            <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-zinc-400 leading-relaxed">
          We sent a 6-digit code to{" "}
          <span className="text-white font-medium">{email}</span>
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 font-medium">
          {error}
        </div>
      )}

      {resent && (
        <div className="px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-sm text-green-400 font-medium text-center">
          New code sent!
        </div>
      )}

      {/* OTP inputs */}
      <div className="flex justify-between gap-2" onPaste={handlePaste}>
        {otp.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            maxLength="1"
            value={digit}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            onFocus={(e) => e.target.select()}
            className="w-12 h-14 text-center text-xl font-bold rounded-xl border-2 border-zinc-700 bg-zinc-800/60 text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={!isOtpComplete || loading}
        className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/40 disabled:cursor-not-allowed text-black font-bold text-sm rounded-xl transition-all duration-200 active:scale-[0.98]"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            Verifying...
          </span>
        ) : (
          "Verify & Activate"
        )}
      </button>

      <div className="flex items-center justify-between text-sm">
        <button type="button" onClick={onBack} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          ← Back
        </button>
        <button type="button" onClick={handleResend} className="text-amber-500 hover:text-amber-400 transition-colors font-medium">
          Resend code
        </button>
      </div>
    </form>
  );
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default function Register() {
  const [step, setStep] = useState("form"); // "form" | "otp"
  const [email, setEmail] = useState("");

  const handleRegistered = (registeredEmail) => {
    setEmail(registeredEmail);
    setStep("otp");
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[-20%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[5%] w-[400px] h-[400px] rounded-full bg-orange-600/5 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500 mb-4 shadow-lg shadow-amber-500/30">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-black" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Courier Dashboard</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {step === "form" ? "Create your employee account" : "Verify your email"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
          {/* Progress bar */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex-1 h-1 rounded-full bg-amber-500" />
            <div className={`flex-1 h-1 rounded-full transition-colors duration-300 ${step === "otp" ? "bg-amber-500" : "bg-zinc-700"}`} />
          </div>

          <h2 className="text-lg font-semibold text-white mb-6">
            {step === "form" ? "Account details" : "Enter verification code"}
          </h2>

          {step === "form" ? (
            <RegisterForm onSuccess={handleRegistered} />
          ) : (
            <OtpStep email={email} onBack={() => setStep("form")} />
          )}

          {step === "form" && (
            <p className="text-center text-sm text-zinc-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                Sign in
              </Link>
            </p>
          )}
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Employee access only · Requires secret code
        </p>
      </div>
    </div>
  );
}