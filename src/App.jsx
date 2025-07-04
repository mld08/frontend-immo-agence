// src/App.jsx
import PropertyBookingApp from './components/PropertyBookingApp'
import BiensManager from './components/BiensManager'
import React, { useState, useEffect } from 'react';


const API_BASE_URL = 'http://localhost:5000/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifie l'utilisateur actuellement connecté
    fetch(`${API_BASE_URL}/current-user`, {
      credentials: 'include'
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        setCurrentUser(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleLogin = async (loginForm) => {
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentUser(data.user);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Erreur de connexion' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  // if (!currentUser) {
  //   return (
  //     <PropertyBookingApp />
  //   );
  // }

  // if (currentUser && currentUser.role === 'ADMIN') {
  //   return <BiensManager />;
  // } else if (currentUser && currentUser.role === 'CLIENT') {
  //   return <PropertyBookingApp />;
  // } else {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-gray-500">Accès non autorisé</div>
  //     </div>
  //   );
  // }

  if (currentUser && currentUser.role === 'ADMIN') {
    return <BiensManager />;
  } else {
    return <PropertyBookingApp
      currentUser={currentUser}
      onLogin={handleLogin}
      setCurrentUser={setCurrentUser}
    />;
  }

  //return <PropertyBookingApp />
}

export default App
