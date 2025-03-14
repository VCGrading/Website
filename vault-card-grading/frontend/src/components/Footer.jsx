import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css"; // ✅ Fichier CSS spécifique au Footer

function Footer() {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} Vault Card Grading - Tous droits réservés.</p>
      <nav>
        <ul className="footer-links">
          <li><Link to="/cgv">📜 Conditions Générales</Link></li>
          <li><Link to="/contact">📩 Contact</Link></li>
        </ul>
      </nav>
    </footer>
  );
}

export default Footer;
