/*import React, { useEffect, useState, createContext, useContext } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for saved login on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}*/

import React, { useEffect, useState, createContext, useContext } from "react";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for saved login on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userInfo = localStorage.getItem("userInfo");

    console.log("AuthContext initializing:", {
      token: !!token,
      userInfo: !!userInfo,
    });

    if (token && userInfo) {
      try {
        const parsedUser = JSON.parse(userInfo);
        console.log("AuthContext: User loaded from localStorage", parsedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Error parsing userInfo from localStorage:", error);
        // Clear invalid data
        localStorage.removeItem("token");
        localStorage.removeItem("userInfo");
      }
    }

    setLoading(false);
  }, []);

  const login = (userData, token) => {
    console.log("AuthContext: Login called with", userData);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("userInfo", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("token", token);
    }
  };

  const logout = () => {
    console.log("AuthContext: Logout called");
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("userInfo");
    localStorage.removeItem("token");
    // Also remove legacy "user" key if it exists
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
