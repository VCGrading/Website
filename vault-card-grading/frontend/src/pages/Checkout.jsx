import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/CheckoutForm";

const stripePromise = loadStripe("pk_test_51R0rLVFykQmzl0zVSDjkeJeNDZ6qiqhXOsDqYHLfLEWwrAZ2GALkyp6ra6DFlQSrncUKWss8n2oz3ie2RWMEG6Wg004B7W39Mj");

// Fonction pour calculer le coût du grading en fonction de la valeur déclarée
const calculateGradingPrice = (declaredValue) => {
  if (declaredValue < 50) return 15;
  if (declaredValue < 100) return 20;
  if (declaredValue < 500) return 30;
  return 45;
};

function Checkout() {
  const { cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  // Calcul du total en fonction du coût de grading
  const totalAmount = cart.reduce((sum, card) => sum + calculateGradingPrice(card.declaredValue || 0), 0);

  return (
    <div className="checkout-container">
      <h1>💳 Paiement sécurisé</h1>

      <div className="checkout-summary">
        <h2>🛒 Résumé de votre commande</h2>
        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <ul>
            {cart.map((item, index) => (
              <li key={index} className="checkout-item">
                <p><strong>{item.name}</strong> ({item.language})</p>
                <p><small>Série : {item.series} - Note : {item.minGrade || "Authentification seule"}</small></p>
                <p><strong>Valeur déclarée :</strong> {item.declaredValue}€</p>
                <p><strong>Coût du grading :</strong> {calculateGradingPrice(item.declaredValue || 0)}€</p>
              </li>
            ))}
          </ul>
        )}
        <h3>Total : {totalAmount.toFixed(2).replace(".", ",")} €</h3>
      </div>

      <Elements stripe={stripePromise}>
        <CheckoutForm />
      </Elements>
    </div>
  );
}

export default Checkout;
