
import api from "./api";

export const authService = {

  register: async (userData) => {
    const response = await api.post(
      "/auth/register",
      userData
    );

    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post(
      "/auth/login",
      credentials
    );

    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get("/auth/me");

    return response.data;
  },

  // Send OTP to registered email
  forgotPassword: async (email) => {
    const response = await api.post(
      "/auth/forgot-password",
      { email }
    );

    return response.data;
  },

  // Verify email OTP
  verifyOtp: async (email, otp) => {
    const response = await api.post(
      "/auth/verify-otp",
      { email, otp }
    );

    return response.data;
  },

  // Reset password after OTP verification
  resetPassword: async (email, newPassword) => {
    const response = await api.post(
      "/auth/reset-password",
      { email, newPassword }
    );

    return response.data;
  },
};
