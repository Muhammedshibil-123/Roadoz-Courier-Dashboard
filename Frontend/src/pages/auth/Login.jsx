import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../redux/authSlice";
import api, { setAccessToken } from "../../lib/axios";
import logo from "../../assets/images/logo.png";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/api/auth/login/", {
        username: identifier,
        password,
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
      if (data?.detail) {
        setError(data.detail);
      } else if (data?.non_field_errors) {
        setError(data.non_field_errors[0]);
      } else {
        setError("Invalid credentials. Please check your username and password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1D2D49] flex items-center justify-center overflow-hidden px-4 py-4 sm:px-6">
      <div className="w-full max-w-[1100px] min-h-[92vh] sm:min-h-[90vh] rounded-[24px] sm:rounded-[32px] bg-[#1D2D49] flex items-center justify-center">
        <div className="w-full max-w-[320px] sm:max-w-[430px] md:max-w-[500px] rounded-[24px] sm:rounded-[32px] bg-[#707B8F] px-5 py-8 sm:px-8 sm:py-10 md:px-10 md:py-12 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-7 sm:mb-8">
            <img
              src={logo}
              alt="Roadoz Logo"
              className="w-24 sm:w-28 md:w-32 h-auto object-contain"
            />
          </div>

          <div className="bg-[#020F2D] rounded-[22px] sm:rounded-[28px] px-4 py-5 sm:px-6 sm:py-7 md:px-7 md:py-8 shadow-xl">
            {error && (
              <div className="mb-4 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs sm:text-sm text-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="username"
                required
                className="w-full h-11 sm:h-12 md:h-14 rounded-full border border-[#D4AF26] bg-transparent px-4 sm:px-5 text-sm sm:text-base text-[#E3BE3A] placeholder:text-[#E3BE3A] outline-none transition-all focus:ring-2 focus:ring-[#D4AF26]/30"
              />

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                required
                className="w-full h-11 sm:h-12 md:h-14 rounded-full border border-[#D4AF26] bg-transparent px-4 sm:px-5 text-sm sm:text-base text-[#E3BE3A] placeholder:text-[#E3BE3A] outline-none transition-all focus:ring-2 focus:ring-[#D4AF26]/30"
              />

              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex items-center justify-between gap-1 pt-1">
                  <p className="text-[11px] sm:text-xs md:text-sm text-[#E3BE3A]/80">
                    New here?
                  </p>

                  <Link
                    to="/register"
                    className="text-[11px] sm:text-xs md:text-sm text-[#E3BE3A] hover:text-[#f1cf58] font-medium transition-colors"
                  >
                   Register
                  </Link>
                </div>

                <Link
                  to="/forgot-password"
                  className="text-[11px] sm:text-xs md:text-sm text-[#E3BE3A] hover:text-[#f1cf58] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>

              <div className="pt-3 sm:pt-4 flex justify-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="h-11 sm:h-12 md:h-14 min-w-[130px] sm:min-w-[150px] rounded-full bg-[#D4AF26] px-8 text-sm sm:text-base font-semibold text-[#071225] transition-all hover:brightness-110 disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}