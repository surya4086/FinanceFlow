
import {
  createContext,
  useContext,
  useState,
} from "react";

import { authService } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("finance_user")
      );
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem("finance_token")
  );

  const [loading, setLoading] = useState(false);

  const isAuthenticated = Boolean(token && user);

  const saveSession = (data) => {

    const userData = {
      id: data.id,
      name: data.name,
      email: data.email,
    };

    localStorage.setItem("finance_token", data.token);

    localStorage.setItem(
      "finance_user",
      JSON.stringify(userData)
    );

    setToken(data.token);
    setUser(userData);
  };

  const register = async (userData) => {
    setLoading(true);

    try {
      const response =
        await authService.register(userData);

      saveSession(response);

      return response;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response =
        await authService.login(credentials);

      saveSession(response);

      return response;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("finance_token");
    localStorage.removeItem("finance_user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
