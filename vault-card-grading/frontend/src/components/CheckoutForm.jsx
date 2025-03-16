import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import "./CheckoutForm.css";
import { FaShippingFast, FaCreditCard, FaCheckCircle } from "react-icons/fa";

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const { cart, clearCart } = useContext(CartContext);
  const { user, csrfToken } = useContext(AuthContext); // ✅ Récupère le token CSRF
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  const [customerInfo, setCustomerInfo] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({ ...customerInfo, [name]: value });
  };

  const calculateGradingPrice = (declaredValue) => {
    if (declaredValue < 50) return 15;
    if (declaredValue < 100) return 20;
    if (declaredValue < 500) return 30;
    return 45;
  };

  const totalAmount = cart.reduce((sum, card) => sum + calculateGradingPrice(card.declaredValue || 0), 0);

  const handleNextStep = () => {
    if (step === 1) {
      if (!customerInfo.firstName || !customerInfo.lastName || !customerInfo.address || !customerInfo.city || !customerInfo.postalCode) {
        setMessage("Veuillez remplir toutes les informations de livraison.");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) {
      setLoading(false);
      return;
    }

    try {
      // ✅ Étape 2 : Paiement avec protection CSRF
      const response = await fetch("http://localhost:5000/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // 🔥 Ajout du token CSRF
        },
        credentials: "include", // ✅ Nécessaire pour envoyer le cookie de session sécurisé
        body: JSON.stringify({ amount: Math.round(totalAmount * 100) }),
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

        // ✅ Enregistrement sécurisé de la commande
        await fetch("http://localhost:5000/api/order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": csrfToken, // 🔥 Protection CSRF
          },
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            items: cart,
            total: totalAmount,
            customerInfo,
          }),
        });

        clearCart(); // ✅ Vide le panier après commande
        localStorage.removeItem("cart"); // ✅ Supprime le panier du stockage local

        setStep(3);
        setTimeout(() => {
          navigate("/success");
        }, 2000);
      }
    } catch (error) {
      console.error("Erreur lors du paiement :", error);
      setMessage("Erreur de paiement, veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="progress-bar">
        <div className={`step ${step >= 1 ? "active" : ""}`}>1. Infos Client</div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>2. Paiement</div>
        <div className={`step ${step >= 3 ? "active" : ""}`}>3. Confirmation</div>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        {step === 1 && (
          <>
            <h2><FaShippingFast /> Informations Client</h2>
            <input type="text" name="firstName" placeholder="Prénom" value={customerInfo.firstName} onChange={handleChange} required />
            <input type="text" name="lastName" placeholder="Nom" value={customerInfo.lastName} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Adresse" value={customerInfo.address} onChange={handleChange} required />
            <input type="text" name="city" placeholder="Ville" value={customerInfo.city} onChange={handleChange} required />
            <input type="text" name="postalCode" placeholder="Code Postal" value={customerInfo.postalCode} onChange={handleChange} required />
            <select name="country" value={customerInfo.country} onChange={handleChange}>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
            </select>
            <button type="button" onClick={handleNextStep}>Continuer</button>
          </>
        )}

        {step === 2 && (
          <>
            <h2><FaCreditCard /> Paiement sécurisé</h2>
            <CardElement options={{ hidePostalCode: true, disableLink: true }} />
            <p>Total à payer : {totalAmount.toFixed(2).replace(".", ",")} €</p>
            <div className="checkout-buttons">
              <button type="button" onClick={handlePrevStep}>⬅ Retour</button>
              <button type="submit" disabled={loading}>
                {loading ? "Traitement..." : "Payer"}
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <div className="confirmation">
            <h2><FaCheckCircle /> Commande validée</h2>
            <p>Merci pour votre commande, elle est en cours de traitement.</p>
          </div>
        )}

        {message && <p>{message}</p>}
      </form>
    </div>
  );
}

export default CheckoutForm;
