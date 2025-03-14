require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const User = require("./models/User");
const Order = require("./models/Order");

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connecté"))
.catch((err) => console.error("Erreur MongoDB :", err));

// 🔹 Route pour créer un paiement
app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount } = req.body; // Le montant arrive en centimes depuis le frontend
      if (!amount || amount <= 0) {
        return res.status(400).json({ error: "Montant invalide" });
      }
  
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Pas besoin de *100 ici car c'est déjà en centimes
        currency: "eur",
      });
  
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// 🔹 Route pour enregistrer une commande après paiement
app.post("/api/order", async (req, res) => {
  const { userId, items, total } = req.body;

  if (!userId) return res.status(400).json({ error: "Utilisateur non authentifié" });

  try {
    const newOrder = new Order({ userId, items, total });
    await newOrder.save();
    res.json({ message: "Commande enregistrée !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🔹 Route pour récupérer les commandes d'un utilisateur
app.get("/api/orders/:userId", async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ date: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

app.listen(5000, () => console.log("Serveur backend sur http://localhost:5000"));
