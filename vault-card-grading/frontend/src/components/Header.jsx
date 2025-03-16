import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Header.css"; // ✅ Fichier CSS spécifique au Header
import { FaShoppingCart, FaShieldAlt, FaStore, FaUser, FaSignOutAlt, FaKey, FaUserPlus  } from "react-icons/fa";

function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Vault Card Grading</Link>
      </div>

      <nav>
        <ul className="nav-links">
          <li><Link to="/"><FaStore className="fa-icon" /> ACCUEIL</Link></li>
          <li><Link to="/order"><FaShieldAlt className="fa-icon"/> CERTIFIER</Link></li>
          <li><Link to="/cart"><FaShoppingCart className="fa-icon"/> PANIER</Link></li>

          {user ? (
            <>
              <li>
    <Link to="/account">
      <FaUser className="fa-icon-mail"/> <span className="nav-item-email">{user.email}</span>
    </Link>
  </li>
              <li><button onClick={logout} className="logout-btn"><FaSignOutAlt className="fa-icon-logout" /> Déconnexion</button></li>
            </>
          ) : (
            <>
              <li><Link to="/login"><FaKey /> Connexion</Link></li>
              <li><Link to="/register"><FaUserPlus /> Créer un compte</Link></li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
