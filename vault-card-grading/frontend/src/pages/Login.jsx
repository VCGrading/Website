import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      window.location.href = "/account";
    } else {
      setError("Email ou mot de passe incorrect");
    }
  };

  // ✅ Fonction pour envoyer un e-mail de réinitialisation
  const handleForgotPassword = async () => {
    if (!email) {
      alert("Veuillez entrer votre adresse e-mail.");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (response.ok) {
        setForgotPasswordSent(true);
      } else {
        setError(data.error || "Erreur lors de la demande de réinitialisation.");
      }
    } catch (err) {
      setError("Une erreur est survenue.");
    }
  };

  return (
    <div className="login-container">
      <h1>Connexion</h1>
      <form onSubmit={handleSubmit}>
        <label>Email :</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Mot de passe :</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">Se connecter</button>
      </form>

      {/* ✅ Ajout du lien "Mot de passe oublié ?" */}
      <p className="forgot-password" onClick={handleForgotPassword}>
        Mot de passe oublié ?
      </p>

      {/* ✅ Affichage du message après l'envoi du mail */}
      {forgotPasswordSent && <p style={{ color: "green" }}>Un e-mail de réinitialisation a été envoyé !</p>}
    </div>
  );
}

export default Login;
