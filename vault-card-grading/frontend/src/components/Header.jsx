import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Header.css"; // ✅ Fichier CSS spécifique au Header

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Vault Card Grading</Link>
      </div>

      <nav>
        <ul className="nav-links">
          <li><Link to="/">🏠 Accueil</Link></li>
          <li><Link to="/order">📦 Commander</Link></li>
          <li><Link to="/cart">🛒 Panier</Link></li>

          {user ? (
            <>
              <li><Link to="/account">👤 {user.email}</Link></li>
              <li><button onClick={logout} className="logout-btn">🚪 Déconnexion</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login">🔑 Connexion</Link></li>
              <li><Link to="/register">📝 Inscription</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
