import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { FaTrashAlt, FaShoppingCart } from "react-icons/fa";
import "./CartPreview.css"; // ✅ Style spécifique du panier

function CartPreview() {
  const { cart, removeFromCart } = useContext(CartContext);

  // ✅ Calcul du prix total du panier en temps réel
  const calculateGradingPrice = (declaredValue) => {
    if (declaredValue < 50) return 15;
    if (declaredValue < 100) return 20;
    if (declaredValue < 500) return 30;
    return 45;
  };

  const totalAmount = cart.reduce((sum, card) => sum + calculateGradingPrice(card.declaredValue) + (card.insurance ? 5 : 0), 0);

  return (
    <div className="cart-preview">
      <h2><FaShoppingCart className="fa-icon" />Aperçu du panier ({totalAmount.toFixed(2).replace(".", ",")} €)</h2>
      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <ul>
          {cart.map((card, index) => (
            <li key={index} className="cart-item">
              <div className="cart-info">
                <strong>{card.name}</strong>
                <br />
                <span>Gradation : {calculateGradingPrice(card.declaredValue)} €</span> 
                {card.insurance && <span> + (5 €)</span>}
              </div>
              <FaTrashAlt className="delete-icon" onClick={() => removeFromCart(index)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CartPreview;
