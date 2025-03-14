import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // Fonction pour calculer le coût du grading en fonction de la valeur déclarée
  const calculateGradingPrice = (declaredValue) => {
    if (declaredValue < 50) return 15;
    if (declaredValue < 100) return 20;
    if (declaredValue < 500) return 30;
    return 45;
  };

  // Calcul du total en fonction du coût de grading
  const totalAmount = cart.reduce((sum, card) => sum + calculateGradingPrice(card.declaredValue || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    // ✅ Envoi du bon montant à Stripe en centimes
    const response = await fetch("http://localhost:5000/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Math.round(totalAmount * 100) }), // Conversion en centimes
    });

    const { clientSecret } = await response.json();
    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: { card: elements.getElement(CardElement) },
    });

    if (result.error) {
      setMessage(result.error.message);
      setLoading(false);
    } else {
      setMessage("Paiement réussi !");
      console.log("Paiement confirmé :", result.paymentIntent);

      // ✅ Enregistrer la commande dans MongoDB
      const token = localStorage.getItem("token");
      await fetch("http://localhost:5000/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          userId: user._id,
          items: cart,
          total: totalAmount,
        }),
      });

      setLoading(false);
      setTimeout(() => {
        navigate("/success");
      }, 2000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Entrez vos informations de paiement</h2>
      <CardElement options={{ hidePostalCode: true }} />
      <p>Total à payer : {totalAmount.toFixed(2).replace(".", ",")} €</p>
      <button type="submit" disabled={!stripe || loading}>
        {loading ? "Traitement..." : "Payer"}
      </button>
      {message && <p>{message}</p>}
    </form>
  );
}

export default CheckoutForm;
