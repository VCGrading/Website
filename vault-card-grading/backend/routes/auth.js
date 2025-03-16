const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const nodemailer = require("nodemailer");
const rateLimit = require("express-rate-limit"); // ✅ Protection contre le Brute Force
const sanitizeHtml = require("sanitize-html"); // ✅ Protection XSS
const xss = require("xss"); // ✅ Nettoyage avancé
require("dotenv").config();

const router = express.Router();

// ✅ Protection contre le Brute Force sur les connexions
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // ⏳ 15 minutes
  max: 5, // ❌ Bloque après 5 tentatives
  message: "Trop de tentatives de connexion. Réessayez plus tard.",
});

// ✅ Nettoyage des entrées utilisateur
const cleanInput = (input) => xss(sanitizeHtml(input));

// ✅ Configuration de Nodemailer pour l'envoi d'e-mails
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Inscription avec hachage du mot de passe
router.post("/register", [
  body("email").isEmail().withMessage("Email invalide").customSanitizer(cleanInput),
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { email } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ error: "Cet email est déjà utilisé" });

    const newUser = new User({ email: cleanInput(email), isVerified: false });
    await newUser.save();

    const verificationToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Confirmez votre compte Vault Card Grading",
      text: `Cliquez sur ce lien pour vérifier votre compte : ${verificationLink} (valide 24h)`,
    });

    res.json({ message: "Un e-mail de vérification a été envoyé. Veuillez confirmer votre adresse." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Vérification d'e-mail
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ error: "Utilisateur introuvable" });
    if (user.isVerified) return res.json({ message: "Compte déjà activé." });

    user.isVerified = true;
    await user.save();

    res.json({ message: "Votre compte a été activé avec succès ! Veuillez définir votre mot de passe.", redirect: `${process.env.FRONTEND_URL}/set-password/${token}` });
  } catch (error) {
    res.status(400).json({ error: "Lien invalide ou expiré." });
  }
});

// ✅ Définition du mot de passe après vérification
router.post("/set-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(400).json({ error: "Utilisateur introuvable" });
    if (!user.isVerified) return res.status(400).json({ error: "Compte non vérifié" });

    if (password.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Mot de passe défini avec succès. Vous pouvez maintenant vous connecter." });
  } catch (error) {
    res.status(400).json({ error: "Lien invalide ou expiré." });
  }
});

// ✅ Connexion sécurisée avec protection contre le Brute Force
// ✅ Connexion sécurisée avec protection contre le Brute Force + sanitisation des entrées
router.post("/login", loginLimiter, async (req, res) => {
  console.log("Tentative de connexion :", req.body.email);

  // ✅ Nettoyage des entrées utilisateur
  const email = cleanInput(req.body.email);
  const password = cleanInput(req.body.password);

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Email ou mot de passe incorrect" });

    if (!user.isVerified) {
      return res.status(403).json({ error: "Veuillez vérifier votre adresse e-mail avant de vous connecter." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Email ou mot de passe incorrect" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 3600000,
    });

    res.json({ message: "Connexion réussie !" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ✅ Vérification de l'utilisateur connecté via le cookie sécurisé
router.get("/me", async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Accès refusé" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Token invalide" });
  }
});

// ✅ Déconnexion (supprime le cookie sécurisé)
router.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
  });
  res.json({ message: "Déconnexion réussie !" });
});

const csurf = require("csurf"); // ✅ Protection CSRF
const csrfProtection = csurf({ cookie: true });

// ✅ Modifier le mot de passe depuis "Mon Compte" (Sécurisé avec CSRF et JWT)
router.post("/change-password", csrfProtection, async (req, res) => {
  try {
    const token = req.cookies.token; // ✅ On récupère le JWT depuis le cookie sécurisé
    if (!token) return res.status(401).json({ error: "Accès refusé" });

    const { currentPassword, newPassword } = req.body;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });

    // 🔹 Vérification de l'ancien mot de passe
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ error: "L'ancien mot de passe est incorrect" });

    // 🔹 Vérification de la longueur du nouveau mot de passe
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Le mot de passe doit contenir au moins 6 caractères." });
    }

    // 🔹 Hachage du nouveau mot de passe et mise à jour
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Mot de passe mis à jour avec succès !" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
