import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Vérification en cours...");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/auth/verify-email/${encodeURIComponent(token)}`, {
          method: "GET",
          credentials: "include", // ✅ Gère les cookies sécurisés
        });

        const data = await response.json();
        if (response.ok) {
          setMessage("Votre compte est activé ! Redirection vers la création du mot de passe...");
          setTimeout(() => navigate(`/set-password/${token}`), 2000);
        } else {
          setMessage(data.error || "Échec de la vérification.");
        }
      } catch (error) {
        setMessage("Erreur lors de la vérification. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [token, navigate]);

  return (
    <div className="verify-container">
      <h2>{loading ? "Vérification en cours..." : message}</h2>
      {!loading && (
        <button onClick={() => navigate("/login")}>Retour à la connexion</button>
      )}
    </div>
  );
}

export default VerifyEmail;
