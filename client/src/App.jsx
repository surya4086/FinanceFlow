
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";

import ForgotPassword from "./pages/ForgotPassword";
import VerifyOtp from "./pages/VerifyOtp";
import ResetPassword from "./pages/ResetPassword";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <Routes>

      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* Authentication routes */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Password recovery routes */}
      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/verify-otp"
        element={<VerifyOtp />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Protected dashboard */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
      </Route>

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />

    </Routes>
  );
}
