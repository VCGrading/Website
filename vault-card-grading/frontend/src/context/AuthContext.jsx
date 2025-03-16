import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [csrfToken, setCsrfToken] = useState(""); // ✅ Stockage du token CSRF

  // ✅ Récupération du token CSRF dès le chargement de l'app
  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/csrf-token", {
        credentials: "include", // ✅ Indique au navigateur d'inclure les cookies
      });
      const data = await response.json();
      if (response.ok) setCsrfToken(data.csrfToken);
    } catch (error) {
      console.error("Erreur récupération CSRF:", error);
    }
  };

  // ✅ Récupérer l'utilisateur automatiquement depuis le backend via le cookie
  const fetchUser = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        credentials: "include", // ✅ Envoie les cookies pour récupérer l'utilisateur
      });
      const data = await response.json();
      if (response.ok) setUser(data);
    } catch (error) {
      console.error("Erreur de récupération de l'utilisateur :", error);
    }
  };

  useEffect(() => {
    fetchCsrfToken(); // ✅ Récupère le token CSRF au lancement
    fetchUser(); // ✅ Vérifie l'utilisateur au lancement
  }, []);

  // ✅ Connexion - envoie les identifiants avec le token CSRF
  const login = async (email, password) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // 🔥 Ajout du token CSRF
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", // ✅ Stocke le token en cookie sécurisé
      });

      const data = await response.json();
      if (response.ok) {
        fetchUser(); // ✅ On récupère l'utilisateur après connexion
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Erreur de connexion :", error);
      return false;
    }
  };

  // ✅ Déconnexion - supprime le cookie du backend et envoie le token CSRF
  const logout = async () => {
    try {
      await fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken, // 🔥 Ajout du token CSRF
        },
        credentials: "include",
      });
      setUser(null);
    } catch (error) {
      console.error("Erreur de déconnexion :", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, csrfToken }}>
      {children}
    </AuthContext.Provider>
  );
};
