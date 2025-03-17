require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf");
const sanitizeHtml = require("sanitize-html");
const xss = require("xss");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ✅ OBLIGATOIRE avant `csrf()`

// ✅ Sécurisation des headers
app.use(helmet());

// ✅ Configuration CORS pour gérer les cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Protection contre les attaques Brute Force & DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Trop de requêtes, réessayez plus tard.",
});
app.use("/api/", apiLimiter);

// ✅ Configuration CSRF Protection (après `cookieParser`)
const csrfProtection = csrf({ cookie: { httpOnly: true, secure: false, sameSite: "Strict" } });
app.use(csrfProtection);

// ✅ Route pour récupérer le token CSRF
app.get("/api/csrf-token", (req, res) => {
  try {
    const csrfToken = req.csrfToken();
    res.cookie("XSRF-TOKEN", csrfToken, {
      httpOnly: false, // ✅ Accessible par le client
      secure: false, // 🔴 Désactive temporairement Secure (à activer en production)
      sameSite: "Strict",
    });
    res.json({ csrfToken });
  } catch (error) {
    console.error("Erreur récupération CSRF :", error);
    res.status(500).json({ error: "Erreur lors de la récupération du token CSRF." });
  }
});

// ✅ Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ✅ Nettoyage des entrées utilisateur
const cleanInput = (input) => xss(sanitizeHtml(input));

// ✅ Route pour créer un paiement
app.post("/api/create-payment-intent", csrfProtection, async (req, res) => {
  try {
    const amount = parseInt(cleanInput(req.body.amount), 10);
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Montant invalide" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "eur",
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Erreur paiement:", error);
    res.status(500).json({ error: "Erreur serveur, réessayez plus tard." });
  }
});

// ✅ Route pour enregistrer une commande
app.post("/api/order", csrfProtection, async (req, res) => {
  try {
    const { userId, items, total, customerInfo } = req.body;
    if (!userId || !items || !customerInfo) {
      return res.status(400).json({ error: "Données de commande incomplètes" });
    }

    const sanitizedUserId = cleanInput(userId);
    const sanitizedCustomerInfo = {
      firstName: cleanInput(customerInfo.firstName),
      lastName: cleanInput(customerInfo.lastName),
      address: cleanInput(customerInfo.address),
      city: cleanInput(customerInfo.city),
      postalCode: cleanInput(customerInfo.postalCode),
      country: cleanInput(customerInfo.country),
    };

    const newOrder = new Order({
      userId: sanitizedUserId,
      items,
      total,
      customerInfo: sanitizedCustomerInfo,
      date: new Date(),
    });

    await newOrder.save();
    res.status(201).json({ message: "Commande enregistrée avec succès" });
  } catch (error) {
    console.error("Erreur création commande:", error);
    res.status(500).json({ error: "Erreur serveur, réessayez plus tard." });
  }
});

// ✅ Routes d'authentification
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ Déconnexion sécurisée
app.post("/api/auth/logout", csrfProtection, (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false, // 🔴 À mettre `true` en production
    sameSite: "Strict",
  });
  res.json({ message: "Déconnexion réussie !" });
});

// ✅ Lancement du serveur
app.listen(5000, () => console.log("🚀 Serveur backend sur http://localhost:5000"));
