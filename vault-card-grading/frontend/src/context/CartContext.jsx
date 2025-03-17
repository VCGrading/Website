import React, { createContext, useState, useEffect, useCallback } from "react";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ✅ Chargement du panier depuis localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Erreur chargement du panier :", error);
      return [];
    }
  });

  // ✅ Sauvegarde automatique dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem("cart", JSON.stringify(cart));
    } catch (error) {
      console.error("Erreur sauvegarde panier :", error);
    }
  }, [cart]);

  // ✅ Ajouter une carte au panier avec assurance optionnelle
  const addToCart = useCallback((card) => {
    setCart((prevCart) => [...prevCart, card]);
  }, []);

  // ✅ Supprimer une carte spécifique du panier
  const removeFromCart = useCallback((index) => {
    setCart((prevCart) => prevCart.filter((_, i) => i !== index));
  }, []);

  // ✅ Vider complètement le panier
  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem("cart");
  }, []);

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};
