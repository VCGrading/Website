const API_URL = "http://localhost:5000/api/auth";

// 🔹 Tester l'inscription
async function testRegister() {
  const response = await globalThis.fetch(`${API_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@email.com",
      password: "motdepasse123",
    }),
  });
  const data = await response.json();
  console.log("🔹 Inscription :", data);
}

// 🔹 Tester la connexion
async function testLogin() {
  const response = await globalThis.fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "test@email.com",
      password: "motdepasse123",
    }),
  });
  const data = await response.json();
  console.log("🔹 Connexion :", data);
  return data.token; // Récupérer le token JWT pour le test suivant
}

// 🔹 Tester la vérification du token
async function testMe(token) {
  const response = await globalThis.fetch(`${API_URL}/me`, {
    method: "GET",
    headers: { Authorization: token },
  });
  const data = await response.json();
  console.log("🔹 Vérification utilisateur :", data);
}

// 🔹 Exécuter les tests dans l'ordre
(async () => {
  await testRegister();
  const token = await testLogin();
  if (token) {
    await testMe(token);
  }
})();
