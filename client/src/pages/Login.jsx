import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      await login({ email: email.trim(), password });
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <div className="auth-logo">
          Finance<span>Flow</span>
        </div>

        <div>
          <h1>Know where every rupee goes.</h1>
          <p>
            Track income, set a monthly budget and see your spending by
            category in one place.
          </p>
        </div>

        <div className="balance-card" aria-hidden="true">
          <div className="label">Total balance</div>
          <div className="amount">₹33,500</div>
          <div className="delta">₹18,500 left in this month's budget</div>
          <svg viewBox="0 0 300 64" preserveAspectRatio="none">
            <defs>
              <linearGradient id="g" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#3ddc97" stopOpacity=".35" />
                <stop offset="1" stopColor="#3ddc97" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path
              d="M0 48 L40 42 L80 46 L120 30 L160 34 L200 18 L240 22 L300 6 L300 64 L0 64Z"
              fill="url(#g)"
            />
            <path
              d="M0 48 L40 42 L80 46 L120 30 L160 34 L200 18 L240 22 L300 6"
              fill="none"
              stroke="#12503d"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <div className="txn-row">
            <div>
              Monthly Salary<small>Income</small>
            </div>
            <b className="in">+₹35,000</b>
          </div>
          <div className="txn-row">
            <div>
              Groceries<small>Food</small>
            </div>
            <b className="out">−₹500</b>
          </div>
        </div>
      </aside>

      <main className="auth-form-wrap">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2>Welcome back</h2>
          <p className="sub">Sign in to see your balance and recent activity.</p>

          {error && (
            <div className="form-error" role="alert">
              {error}
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <div className="input-box">
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <div className="input-box">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div className="row-between">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="switch">
            New to FinanceFlow? <Link to="/register">Create an account</Link>
          </p>
        </form>
      </main>
    </div>
  );
}