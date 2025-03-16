import React, { useState } from "react";

function Register() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const response = await fetch("http://localhost:5000/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken, // ✅ Ajout du token CSRF
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Un e-mail de vérification a été envoyé !");
    }
  };

  return (
    <div className="register-container">
      <h2>Créer un compte</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">S'inscrire</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
}

export default Register;
