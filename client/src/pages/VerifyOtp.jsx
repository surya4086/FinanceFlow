
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function VerifyOtp() {

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Email not found. Please request a new OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    try {
      setLoading(true);

      await authService.verifyOtp(email, otp);

      navigate("/reset-password", {
        state: { email }
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <h1 className="text-3xl font-bold text-emerald-600 text-center">
          FinanceFlow
        </h1>

        <h2 className="mt-6 text-2xl font-bold text-slate-800 text-center">
          Verify Your Email
        </h2>

        <p className="mt-2 text-sm text-slate-500 text-center">
          Enter the 6-digit OTP sent to your email.
        </p>

        {email && (
          <p className="mt-3 text-sm text-center font-medium text-slate-700">
            {email}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Enter OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
              }
              placeholder="000000"
              required
              className="w-full rounded-lg border border-slate-300 p-3 text-center text-2xl tracking-[0.5em] outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Didn't receive the code?{" "}
          <Link
            to="/forgot-password"
            className="font-semibold text-emerald-600"
          >
            Request again
          </Link>
        </p>

      </div>
    </div>
  );
}
