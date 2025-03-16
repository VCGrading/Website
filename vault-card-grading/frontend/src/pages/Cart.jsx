import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { FaShoppingCart } from "react-icons/fa";

function Cart() {
  const { cart, removeFromCart } = useContext(CartContext);

  // Fonction pour calculer le coût du grading en fonction de la valeur déclarée
  const calculateGradingPrice = (declaredValue) => {
    if (declaredValue < 50) return 15;
    if (declaredValue < 100) return 20;
    if (declaredValue < 500) return 30;
    return 45;
  };

  // Vérifie si une carte a l'assurance
  const hasInsurance = (item) => item.insurance === true;

  // Calcul du total en fonction du coût de grading et de l'assurance
  const gradingTotal = cart.reduce((sum, card) => sum + calculateGradingPrice(card.declaredValue || 0), 0);
  const insuranceTotal = cart.reduce((sum, card) => sum + (hasInsurance(card) ? 5 : 0), 0);
  const totalAmount = gradingTotal + insuranceTotal;

  return (
    <div className="cart-container">
      <h1><FaShoppingCart /> Votre Panier</h1>

      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <ul className="cart-list">
            {cart.map((item, index) => (
              <li key={index} className="cart-item">
                <div className="cart-info">
                  <p><strong>{item.name}</strong> ({item.language})</p>
                  <p><small>Série : {item.series} - Note : {item.minGrade || "Authentification seule"}</small></p>
                  <p><strong>Valeur déclarée :</strong> {item.declaredValue}€</p>
                  <p><strong>Assurance :</strong> {hasInsurance(item) ? "5€" : "Non"}</p>
                  <p><strong>Coût du grading :</strong> {calculateGradingPrice(item.declaredValue || 0)}€</p>
                </div>
                <button className="remove-btn" onClick={() => removeFromCart(index)}>🗑 Retirer</button>
              </li>
            ))}
          </ul>

          <div className="cart-total">
            <h3>Coût du grading : {gradingTotal.toFixed(2).replace(".", ",")} €</h3>
            <h3>Assurance : {insuranceTotal.toFixed(2).replace(".", ",")} €</h3>
            <h2>Total : {totalAmount.toFixed(2).replace(".", ",")} €</h2>
            <Link to="/checkout" className="checkout-btn">💳 Passer au paiement</Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
