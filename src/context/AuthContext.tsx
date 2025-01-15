import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Define the type for the Auth context
interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  password: string | null;
  login: (username: string, password: string) => void;
  logout: () => void;
}

// Create the Auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component to provide the context to the rest of the app
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);

  // Load authentication state from localStorage on initialization
  useEffect(() => {
    const storedIsAuthenticated = localStorage.getItem("isAuthenticated");
    const storedUsername = localStorage.getItem("username");
    const storedPassword = localStorage.getItem("password");

    if (storedIsAuthenticated === "true" && storedUsername && storedPassword) {
      setIsAuthenticated(true);
      setUsername(storedUsername);
      setPassword(storedPassword);
    }
  }, []);

  const login = (username: string, password: string) => {
    setIsAuthenticated(true);
    setUsername(username);
    setPassword(password);

    // Save to localStorage
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    setPassword(null);

    // Clear from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, password, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
