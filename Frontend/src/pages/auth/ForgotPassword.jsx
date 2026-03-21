import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/axios";
import logo from "../../assets/images/logo.png";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            const response = await api.post("/api/auth/forgot-password/", {
                email: email.trim(),
            });

            setSuccess(response.data.message || "Reset code sent to your email.");
            setStep(2);
        } catch (err) {
            const data = err.response?.data;
            setError(
                data?.email?.[0] ||
                data?.error ||
                "Failed to send reset code. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await api.post("/api/auth/reset-password/", {
                email: email.trim(),
                otp: otp.trim(),
                new_password: newPassword,
                confirm_password: confirmPassword, // important
            });

            setSuccess(response.data.message || "Password reset successfully.");

            // ✅ redirect after success
            setTimeout(() => {
                navigate("/login", { replace: true });
            }, 1500); // small delay so user sees success message

        } catch (err) {
            const data = err.response?.data;

            if (data?.confirm_password) {
                setError(data.confirm_password[0]);
            } else if (data?.new_password) {
                setError(data.new_password[0]);
            } else if (data?.otp) {
                setError(data.otp[0]);
            } else {
                setError("Failed to reset password.");
            }
        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        "w-full h-11 sm:h-12 rounded-2xl border border-[#D4AF26] bg-transparent px-4 text-sm sm:text-base text-[#E7C64A] placeholder:text-[#D9BC57]/80 outline-none transition-all focus:ring-2 focus:ring-[#D4AF26]/30";

    const labelClass =
        "block mb-2 text-xs sm:text-sm font-medium text-[#E7C64A]";

    const EyeIcon = ({ open }) =>
        open ? (
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

    return (
        <div className="min-h-screen w-full bg-[#1D2D49] flex items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
            <div className="w-full max-w-[1000px] flex items-center justify-center">
                <div className="w-full max-w-[340px] sm:max-w-[430px] md:max-w-[500px] rounded-[28px] bg-[#7A859A] p-4 sm:p-5 md:p-6 shadow-2xl">
                    <div className="rounded-[24px] bg-[#031433] px-5 py-6 sm:px-7 sm:py-8">
                        <div className="mb-6 flex flex-col items-center text-center">
                            <img
                                src={logo}
                                alt="Roadoz Logo"
                                className="mb-4 w-20 sm:w-24 h-auto object-contain"
                            />

                            <div className="inline-flex items-center rounded-full border border-[#D4AF26]/40 bg-[#D4AF26]/10 px-3 py-1 text-[11px] sm:text-xs font-medium text-[#E7C64A]">
                                {step === 1 ? "Password Recovery" : "Verify & Reset"}
                            </div>

                            <h1 className="mt-4 text-xl sm:text-2xl font-semibold text-[#F3D46A]">
                                {step === 1 ? "Forgot Password?" : "Reset Password"}
                            </h1>

                            <p className="mt-2 max-w-[320px] text-xs sm:text-sm leading-relaxed text-[#D7C27A]">
                                {step === 1
                                    ? "Enter your email address and we’ll send you a reset code."
                                    : "Enter the code from your email and create a new password."}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-xs sm:text-sm text-red-200">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="mb-4 rounded-2xl border border-green-400/30 bg-green-500/10 px-4 py-3 text-xs sm:text-sm text-green-200">
                                {success}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleRequestOtp} className="space-y-4">
                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@company.com"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !email}
                                    className="w-full h-11 sm:h-12 rounded-2xl bg-[#D4AF26] text-sm sm:text-base font-semibold text-[#071225] transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : "Send Reset Code"}
                                </button>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetPassword} className="space-y-4">
                                <div>
                                    <label className={labelClass}>Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        disabled
                                        className="w-full h-11 sm:h-12 rounded-2xl border border-[#D4AF26]/30 bg-white/5 px-4 text-sm sm:text-base text-[#c8cbd3] cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Reset Code</label>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        placeholder="Enter 6-digit code"
                                        maxLength={6}
                                        required
                                        className={`${inputClass} tracking-[0.25em] text-center`}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="New password"
                                            required
                                            className={`${inputClass} pr-11`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E7C64A] hover:text-[#f3d46a]"
                                        >
                                            <EyeIcon open={showPassword} />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className={labelClass}>Confirm Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm password"
                                        required
                                        className={inputClass}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !otp || !newPassword || !confirmPassword}
                                    className="w-full h-11 sm:h-12 rounded-2xl bg-[#D4AF26] text-sm sm:text-base font-semibold text-[#071225] transition-all hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        )}

                        <div className="mt-6 flex items-center justify-center">
                            <Link
                                to="/login"
                                className="text-xs sm:text-sm text-[#D7C27A] hover:text-[#F3D46A] transition-colors"
                            >
                                Back to login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}