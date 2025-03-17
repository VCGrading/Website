import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState("");
  const [loading, setLoading] = useState(true);

  // ✅ Récupération du token CSRF dès le chargement de l'app
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/csrf-token", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error("Erreur récupération CSRF:", error);
    }
  };

  // ✅ Récupération de l'utilisateur
  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) setUser(data);
    } catch (error) {
      console.error("Erreur récupération de l'utilisateur :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCsrfToken();
    fetchUser();
  }, []);

  // ✅ Connexion
  const login = async (email, password) => {
    await fetchCsrfToken();
    if (!csrfToken) return false;

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (response.ok) {
        fetchUser();
        fetchCsrfToken();
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      return false;
    }
  };

  // ✅ Déconnexion
  const logout = async () => {
    await fetchCsrfToken();
    if (!csrfToken) return;

    try {
      const response = await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: { "X-CSRF-Token": csrfToken },
        credentials: "include",
      });

      if (response.ok) {
        setUser(null);
        fetchCsrfToken();
      }
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
