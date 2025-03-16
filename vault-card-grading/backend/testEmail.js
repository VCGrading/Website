require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTestEmail = async () => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.ADMIN_EMAIL, // Envoie un e-mail test à toi-même
      subject: "Test d'envoi d'e-mail",
      text: "Si vous recevez cet e-mail, nodemailer fonctionne bien.",
    });
    console.log("📧 E-mail test envoyé avec succès !");
  } catch (error) {
    console.error("🚨 Erreur lors de l'envoi de l'e-mail :", error);
  }
};

sendTestEmail();
