import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice";
import api, { setAccessToken } from "../../lib/axios";
import logo from "../../assets/images/logo.png";

const inputClass =
  "w-full h-10 sm:h-11 md:h-12 rounded-full border border-[#D4AF26] bg-transparent px-4 text-sm sm:text-base text-[#E3BE3A] placeholder:text-[#E3BE3A] outline-none transition-all focus:ring-2 focus:ring-[#D4AF26]/30";

const labelClass =
  "block text-[11px] sm:text-xs md:text-sm font-medium text-[#E3BE3A] mb-1.5 sm:mb-2";

function EyeIcon({ show }) {
  return show ? (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ) : (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="w-4 h-4"
    >
      <path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

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

      if (response.status === 200 || response.status === 201) {
        onSuccess(form.email);
      }
    } catch (err) {
      const data = err.response?.data;

      if (!data) {
        setError("Something went wrong. Please try again.");
      } else if (err.response?.status === 409) {
        setError("This email is already verified. Please log in.");
      } else {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        setError(Array.isArray(firstVal) ? firstVal[0] : firstVal);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Username</label>
        <input
          type="text"
          placeholder="username"
          required
          value={form.username}
          onChange={update("username")}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Email</label>
        <input
          type="email"
          placeholder="email"
          required
          value={form.email}
          onChange={update("email")}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>Secret Code</label>
        <input
          type="text"
          placeholder="secret code"
          required
          value={form.secret_code}
          onChange={update("secret_code")}
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className={labelClass}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="password"
              required
              value={form.password}
              onChange={update("password")}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3BE3A] hover:text-[#f1cf58]"
            >
              <EyeIcon show={showPassword} />
            </button>
          </div>
        </div>

        <div>
          <label className={labelClass}>Confirm Password</label>
          <div className="relative">
            <input
              type={showConfirm ? "text" : "password"}
              placeholder="confirm"
              required
              value={form.confirm_password}
              onChange={update("confirm_password")}
              className={`${inputClass} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E3BE3A] hover:text-[#f1cf58]"
            >
              <EyeIcon show={showConfirm} />
            </button>
          </div>
        </div>
      </div>

      <div className="pt-1 flex justify-center">
        <button
          type="submit"
          disabled={loading}
          className="h-10 sm:h-11 md:h-12 min-w-[150px] sm:min-w-[170px] rounded-full bg-[#D4AF26] px-6 text-sm sm:text-base font-semibold text-[#071225] transition-all hover:brightness-110 disabled:opacity-70"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>
      </div>
    </form>
  );
}

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
      const next = [...otp];
      next[index] = "";
      setOtp(next);
      return;
    }

    const char = digits.slice(-1);
    const next = [...otp];
    next[index] = char;
    setOtp(next);
    setError("");

    if (index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      e.preventDefault();

      if (otp[index]) {
        const next = [...otp];
        next[index] = "";
        setOtp(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...otp];
        next[index - 1] = "";
        setOtp(next);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const next = ["", "", "", "", "", ""];
    data.split("").forEach((char, i) => {
      next[i] = char;
    });
    setOtp(next);
    inputsRef.current[Math.min(data.length, 5)]?.focus();
  };

  const handleResend = async () => {
    try {
      await api.post("/api/auth/register/", { email }, { skipLoading: true });
      setResent(true);
      setTimeout(() => setResent(false), 4000);
    } catch {
      setError("Could not resend code. Please try again.");
    }
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

      setAccessToken(data.access);

      dispatch(
        setCredentials({
          accessToken: data.access,
          user: {
            id: data.id,
            username: data.username,
            email: data.email,
          },
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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="text-center">
        <p className="text-xs sm:text-sm text-[#E3BE3A]/90">Enter the 6-digit code sent to</p>
        <p className="mt-1 text-sm sm:text-base font-medium text-[#E3BE3A] break-all">
          {email}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {resent && (
        <div className="rounded-xl border border-green-400/30 bg-green-500/10 px-3 py-2 text-xs text-green-200 text-center">
          New code sent!
        </div>
      )}

      <div className="grid grid-cols-6 gap-2" onPaste={handlePaste}>
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
            className="h-10 sm:h-11 md:h-12 rounded-xl border border-[#D4AF26] bg-transparent text-center text-sm sm:text-base md:text-lg font-semibold text-[#E3BE3A] outline-none transition-all focus:ring-2 focus:ring-[#D4AF26]/30"
          />
        ))}
      </div>

      <div className="pt-1 flex justify-center">
        <button
          type="submit"
          disabled={!isOtpComplete || loading}
          className="h-10 sm:h-11 md:h-12 min-w-[140px] sm:min-w-[160px] rounded-full bg-[#D4AF26] px-6 text-sm sm:text-base font-semibold text-[#071225] transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Verify"}
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 text-[11px] sm:text-xs md:text-sm">
        <button
          type="button"
          onClick={onBack}
          className="text-[#E3BE3A] hover:text-[#f1cf58] transition-colors"
        >
          ← Back
        </button>

        <button
          type="button"
          onClick={handleResend}
          className="text-[#E3BE3A] hover:text-[#f1cf58] transition-colors"
        >
          Resend code
        </button>
      </div>
    </form>
  );
}

export default function Register() {
  const [step, setStep] = useState("form");
  const [email, setEmail] = useState("");

  const handleRegistered = (registeredEmail) => {
    setEmail(registeredEmail);
    setStep("otp");
  };

  return (
    <div className="min-h-screen w-full bg-[#1D2D49] flex items-center justify-center overflow-hidden px-3 py-3 sm:px-4 sm:py-4">
      <div className="w-full max-w-[980px] min-h-screen sm:min-h-0 flex items-center justify-center">
        <div className="w-full max-w-[320px] sm:max-w-[420px] md:max-w-[500px] rounded-[24px] sm:rounded-[28px] bg-[#7A859A] px-4 py-5 sm:px-6 sm:py-6 md:px-7 md:py-7 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-4 sm:mb-5">
            <img
              src={logo}
              alt="Roadoz Logo"
              className="w-20 sm:w-24 md:w-28 h-auto object-contain"
            />
          </div>

          <div className="bg-[#020F2D] rounded-[22px] sm:rounded-[26px] px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 shadow-xl">
            <div className="mb-4 sm:mb-5 text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-[#E3BE3A]">
                {step === "form" ? "Create Account" : "Verify OTP"}
              </h2>
              <p className="mt-1 text-xs sm:text-sm text-[#E3BE3A]/85">
                {step === "form"
                  ? "Create your employee account"
                  : "Complete your email verification"}
              </p>
            </div>

            {step === "form" ? (
              <RegisterForm onSuccess={handleRegistered} />
            ) : (
              <OtpStep email={email} onBack={() => setStep("form")} />
            )}

            {step === "form" && (
              <p className="mt-4 text-center text-xs sm:text-sm text-[#E3BE3A]/80">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="text-[#E3BE3A] hover:text-[#f1cf58] font-medium transition-colors"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}