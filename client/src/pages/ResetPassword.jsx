
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ResetPassword() {

  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!email) {
      setError("Email not found. Please restart password recovery.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (new TextEncoder().encode(newPassword).length > 72) {
      setError("Password must not exceed 72 UTF-8 bytes.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.resetPassword(
        email,
        newPassword
      );

      setSuccess(response.message || "Password reset successfully!");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Unable to reset password. Please try again."
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
          Create New Password
        </h2>

        <p className="mt-2 text-sm text-slate-500 text-center">
          Your OTP has been verified. Set your new password below.
        </p>

        {email && (
          <p className="mt-3 text-sm text-center text-slate-600">
            {email}
          </p>
        )}

        {error && (
          <p className="mt-5 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {success && (
          <p className="mt-5 rounded-lg bg-emerald-100 p-3 text-sm text-emerald-700">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-7 space-y-5">

          <div>
            <label className="block text-sm font-medium mb-2">
              New Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-lg border border-slate-300 p-3 pr-16 outline-none focus:border-emerald-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-emerald-600"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            <p className="mt-1 text-xs text-slate-500">
              Minimum 8 characters.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Confirm Password
            </label>

            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-lg border border-slate-300 p-3 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email || !!success}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? "Updating Password..." : "Reset Password"}
          </button>

        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
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
