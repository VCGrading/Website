import React, { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import CartPreview from "../components/CartPreview"; // ✅ Import du composant preview du panier
import "./Order.css"; // ✅ Style spécifique
import { FaShieldAlt } from "react-icons/fa";

function Order() {
  const { addToCart, cart } = useContext(CartContext);
  const [card, setCard] = useState({
    name: "",
    language: "Français",
    series: "",
    serialNumber: "",
    minGrade: "10",
    declaredValue: "",
    insurance: false, // ✅ L'assurance est maintenant une propriété de la carte
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCard({ ...card, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!card.name || !card.series || !card.serialNumber || !card.declaredValue) {
      alert("Veuillez remplir tous les champs obligatoires !");
      return;
    }

    addToCart(card); // ✅ L'assurance est bien stockée avec la carte

    setCard({
      name: "",
      language: "Français",
      series: "",
      serialNumber: "",
      minGrade: "10",
      declaredValue: "",
      insurance: false,
    });

    alert("Carte ajoutée au panier !");
  };

  return (
    <div className="order-container">
      <div className="order-content">
        <div className="order-form-container">
          <h1><FaShieldAlt /> Certifier mes cartes</h1>
          <form onSubmit={handleSubmit} className="order-form">
            <label>Nom de la carte :</label>
            <input type="text" name="name" value={card.name} onChange={handleChange} required />

            <label>Langue :</label>
            <select name="language" value={card.language} onChange={handleChange}>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Japonais">Japonais</option>
            </select>

            <label>Série :</label>
            <input type="text" name="series" value={card.series} onChange={handleChange} required />

            <label>Numéro de série :</label>
            <input type="text" name="serialNumber" value={card.serialNumber} onChange={handleChange} required />

            <label>Note minimale souhaitée :</label>
            <select name="minGrade" value={card.minGrade} onChange={handleChange}>
              <option value="10">10</option>
              <option value="9">9</option>
              <option value="8">8</option>
              <option value="7">7</option>
              <option value="6">6</option>
              <option value="5">5</option>
            </select>

            <label>Valeur déclarée (€) :</label>
            <input type="number" name="declaredValue" value={card.declaredValue} onChange={handleChange} required />

            <label className="insurance-label">
              <input type="checkbox" name="insurance" checked={card.insurance} onChange={handleChange} />
              Ajouter une assurance (+5€)
            </label>

            <button type="submit">➕ Ajouter au panier</button>
          </form>
        </div>

        {/* ✅ Aperçu du panier à côté du formulaire */}
        <div className="cart-preview-container">
          <CartPreview cart={cart} />
        </div>
      </div>
    </div>
  );
}

export default Order;
