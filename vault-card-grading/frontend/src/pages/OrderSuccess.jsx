import React from "react";
import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div>
      <h1>✅ Paiement réussi !</h1>
      <p>Votre commande a été enregistrée et sera traitée sous peu.</p>
      <Link to="/">Retour à l'accueil</Link>
    </div>
  );
}

export default OrderSuccess;
