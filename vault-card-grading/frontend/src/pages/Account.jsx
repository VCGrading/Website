import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Account() {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);

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

  return (
    <div className="account-container">
      <h1>👤 Mon Compte</h1>
      <div className="account-info">
        <p><strong>Email :</strong> {user?.email}</p>
        <p><strong>ID utilisateur :</strong> {user?._id}</p>
      </div>

      <h2>📜 Historique des commandes</h2>
      {orders.length === 0 ? (
        <p>Vous n'avez encore passé aucune commande.</p>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <h3>Commande du {new Date(order.date).toLocaleDateString()}</h3>
              <p><strong>Total :</strong> {order.total}€</p>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div className="order-item" key={index}>
                    <p><strong>{item.name}</strong></p>
                    <p><small>Langue : {item.language}</small></p>
                    <p><small>Série : {item.series}</small></p>
                    <p><small>Note : {item.minGrade || "Authentification seule"}</small></p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Account;
