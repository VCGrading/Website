import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ResetPassword() {
  const { token } = useParams();
  const [newPassword, setNewPassword] = useState("");
  const [csrfToken, setCsrfToken] = useState(""); // ✅ Stockage du token CSRF
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Récupération du token CSRF dès le chargement de la page
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

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      setMessage("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // ✅ Ajout du token CSRF
        },
        credentials: "include", // ✅ Envoie les cookies sécurisés
        body: JSON.stringify({ token, newPassword }),
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
    <div className="reset-container">
      <h2>Réinitialisation du mot de passe</h2>
      <input 
        type="password" 
        placeholder="Nouveau mot de passe" 
        value={newPassword} 
        onChange={(e) => setNewPassword(e.target.value)} 
      />
      <button onClick={handleResetPassword}>Changer le mot de passe</button>
      {message && <p>{message}</p>}
    </div>
  );
}

export default ResetPassword;
