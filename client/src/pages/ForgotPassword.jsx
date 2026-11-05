
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ForgotPassword() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.forgotPassword(
        email.trim()
      );

      setMessage(response.message);

      // Continue to OTP verification
      navigate("/verify-otp", {
        state: { email: email.trim() }
      });

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to send OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">

      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-emerald-600">
            FinanceFlow
          </h1>

          <h2 className="mt-6 text-2xl font-bold text-slate-800">
            Forgot Password?
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Enter your registered email address.
            We'll send you a 6-digit verification code.
          </p>

        </div>

        {error && (
          <p className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-5 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-700">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              Email Address
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Remember your password?{" "}
          <Link
            to="/login"
            className="font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}
