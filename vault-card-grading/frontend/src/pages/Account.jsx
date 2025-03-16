import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Account.css"; // ✅ Ajout du CSS spécifique
import { FaUserCircle, FaHistory, FaKey } from "react-icons/fa";

function Account() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [expandedOrders, setExpandedOrders] = useState({});
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/orders/${user._id}`, {
        headers: { Authorization: token },
      });
      const data = await response.json();
      setOrders(data);
    };

    if (user) fetchOrders();
  }, [user]);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId], // Bascule entre ouvert et fermé
    }));
  };

  // ✅ Fonction pour modifier le mot de passe
  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) {
      setPasswordMessage("Veuillez remplir les deux champs.");
      return;
    }
  
    try {
      // ✅ Récupérer le token CSRF avant d'envoyer la requête
      const csrfToken = await fetchCsrfToken();
      if (!csrfToken) throw new Error("CSRF Token introuvable");
  
      const response = await fetch("http://localhost:5000/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // ✅ Ajout du token CSRF
        },
        credentials: "include", // ✅ Envoie les cookies sécurisés
        body: JSON.stringify({ currentPassword, newPassword }),
      });
  
      const data = await response.json();
      setPasswordMessage(data.message);
      if (response.ok) {
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch (err) {
      setPasswordMessage("Une erreur est survenue.");
    }
  };
  

  return (
    <div className="account-container">
      <h1><FaUserCircle /> Mon compte</h1>
      <div className="account-info">
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>ID utilisateur :</strong> {user?._id}</p>
      </div>

      {/* ✅ Modification du mot de passe */}
      <div className="change-password">
        <h2><FaKey /> Modifier mon mot de passe</h2>
        <input
          type="password"
          placeholder="Ancien mot de passe"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Nouveau mot de passe"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <button onClick={handleChangePassword}>Modifier</button>
        {passwordMessage && <p>{passwordMessage}</p>}
      </div>

      <h2><FaHistory /> Historique des commandes</h2>
      {orders.length === 0 ? (
        <p>Vous n'avez encore passé aucune commande.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div className={`order-card ${expandedOrders[order._id] ? "open" : ""}`} key={order._id}>
              <div className="order-header" onClick={() => toggleOrder(order._id)}>
                <h3>Commande #{order._id.slice(-6).toUpperCase()}</h3>
                <p className="order-date">{new Date(order.date).toLocaleDateString()}</p>
                <button className="toggle-btn">
                  {expandedOrders[order._id] ? "▲" : "▼"}
                </button>
              </div>

              {expandedOrders[order._id] && (
                <div className="order-details">
                  {order.items.map((item, index) => (
                    <div className="order-item" key={index}>
                      <p><strong>{item.name}</strong> ({item.language})</p>
                      <p><small>Série : {item.series} - Note : {item.minGrade || "Authentification seule"}</small></p>
                      <p><strong>Valeur déclarée :</strong> {item.declaredValue}€</p>
                      <p><strong>Assurance :</strong> {item.insurance ? "5€" : "Non"}</p>
                    </div>
                  ))}
                  <div className="order-footer">
                    <h3>Total : {order.total.toFixed(2).replace(".", ",")} €</h3>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Account;
