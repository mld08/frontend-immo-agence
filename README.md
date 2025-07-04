# 🏡 Agence Immo - Frontend (ReactJS)

Interface utilisateur de l’application **Agence Immo**, développée avec **ReactJS**. Elle permet de naviguer dans les biens immobiliers, s’inscrire, se connecter, réserver un bien, ou gérer les biens (si admin).

---

## ⚙️ Fonctionnalités

- 👤 Authentification : Inscription, Connexion, Déconnexion
- 🏠 Affichage des biens immobiliers
- 🔎 Filtres de recherche (ville, type, prix...)
- 📅 Réservation de biens
- 🧑‍💼 Espace administrateur pour gérer les biens
- 💬 Notifications UI
- 🌐 Communication avec une API Flask sécurisée via JWT

---

## 🚀 Stack utilisée

- **ReactJS** (Vite)
- **React Hooks** (`useState`, `useEffect`)
- **Fetch API** pour les appels HTTP
- **Tailwind CSS** pour le design
- **Lucide-react** pour les icônes
- **React Router DOM** (optionnel si navigation entre pages)
- Compatible avec une API Flask sur `http://localhost:5000/api`

---

## 🛠️ Installation & lancement

### 1. Cloner le projet

```bash
git clone https://github.com/ton-utilisateur/agence-immo-frontend.git
cd agence-immo-frontend
```

### 2. Installer les dépendances
```bash
npm install 
```

### 3. Démarrer le serveur
```bash
npm run dev
```