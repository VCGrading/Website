require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const csrf = require("csurf"); // ✅ Protection CSRF
const sanitizeHtml = require("sanitize-html");
const xss = require("xss");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
app.use(express.json());
app.use(cookieParser());

// ✅ Sécurisation des Headers avec Helmet
app.use(helmet());

// ✅ Configuration CORS avec credentials pour l'envoi des cookies
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Protection contre le Brute Force & DDoS
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏳ 15 minutes
  max: 100, // 🔥 Bloque après 100 requêtes par IP
  message: "Trop de requêtes, réessayez plus tard.",
});
app.use("/api/", apiLimiter);

// ✅ Configuration de CSRF Protection (uniquement sur les requêtes POST/PUT/DELETE)
const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);

// ✅ Middleware pour inclure le token CSRF dans chaque réponse
app.use((req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken(), { httpOnly: false, secure: true, sameSite: "Strict" });
  next();
});

// ✅ Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ✅ Nettoyage des entrées utilisateur avant traitement
const cleanInput = (input) => xss(sanitizeHtml(input));

// ✅ Route pour obtenir le token CSRF (utilisé par le frontend pour envoyer des requêtes sécurisées)
app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// ✅ Route pour créer un paiement (sécurisée)
app.post("/api/create-payment-intent", async (req, res) => {
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

// ✅ Route pour enregistrer une commande après paiement (sécurisée)
app.post("/api/order", async (req, res) => {
  try {
    const { userId, items, total, customerInfo } = req.body;
    if (!userId || !items || !customerInfo) {
      return res.status(400).json({ error: "Données de commande incomplètes" });
    }

    // ✅ Nettoyage des entrées utilisateur
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

// ✅ Route pour récupérer les commandes d'un utilisateur (sécurisée)
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const sanitizedUserId = cleanInput(req.params.userId);
    const orders = await Order.find({ userId: sanitizedUserId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    console.error("Erreur récupération commandes:", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// ✅ Routes d'authentification sécurisées
const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

// ✅ Route de déconnexion - Supprime le cookie sécurisé
app.post("/api/auth/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({ message: "Déconnexion réussie !" });
});

// ✅ Lancement du serveur
app.listen(5000, () => console.log("🚀 Serveur backend sur http://localhost:5000"));
