import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function SetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [csrfToken, setCsrfToken] = useState(""); // ✅ Stockage du token CSRF

  // ✅ Récupération du token CSRF au chargement
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/csrf-token", {
          credentials: "include",
        });
        const data = await response.json();
        setCsrfToken(data.csrfToken);
      } catch (error) {
        console.error("Erreur récupération CSRF Token :", error);
      }
    };
    fetchCsrfToken();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/set-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // ✅ Ajout du token CSRF
        },
        credentials: "include", // ✅ Gère les cookies sécurisés
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();
      setMessage(data.message);

      if (response.ok) {
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      setMessage("Une erreur est survenue. Veuillez réessayer.");
    }
  };

  return (
    <div className="set-password-container">
      <h2>Définissez votre mot de passe</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Enregistrer</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default SetPassword;
