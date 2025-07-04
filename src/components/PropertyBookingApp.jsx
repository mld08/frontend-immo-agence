import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, User, LogOut, Home, Clock, CheckCircle, XCircle, Plus, Edit, Trash2, Search, Filter, Eye, Phone, Mail, Users, Bell, Star, Heart, Share2, Car, Wifi, Tv, Bath, Bed } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const PropertyBookingApp = ({ currentUser, onLogin }) => {
    const isAuthenticated = !!currentUser;
    const [loading, setLoading] = useState(false);
    const [properties, setProperties] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [selectedProperty, setSelectedProperty] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showReservationModal, setShowReservationModal] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [notification, setNotification] = useState('');
    const [notificationType, setNotificationType] = useState('info');
    const [activeTab, setActiveTab] = useState('properties');
    const [viewMode, setViewMode] = useState('grid');
    const [loginError, setLoginError] = useState('');

    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const [registerForm, setRegisterForm] = useState({
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        password: '',
        confirmPassword: ''
    });

    const [bookingForm, setBookingForm] = useState({
        date_debut: '',
        date_fin: '',
        nb_personnes: 1,
        message: ''
    });

    const [filters, setFilters] = useState({
        type_bien: '',
        type_transaction: '',
        ville: '',
        prix_min: '',
        prix_max: ''
    });

    const [searchTerm, setSearchTerm] = useState('');

    // useEffect(() => {
    //     checkAuthStatus();
    // }, []);

    // useEffect(() => {
    //     if (isAuthenticated) {
    //         fetchProperties();
    //         fetchReservations();
    //     }
    // }, [isAuthenticated, filters]);

    // const checkAuthStatus = async () => {
    //     try {
    //         const response = await fetch(`${API_BASE_URL}/current-user`, {
    //             credentials: 'include'
    //         });
    //         if (response.ok) {
    //             const user = await response.json();
    //             setCurrentUser(user);
    //             setIsAuthenticated(true);
    //         }
    //     } catch (error) {
    //         console.error('Erreur lors de la vérification de l\'authentification:', error);
    //     } finally {
    //         setLoading(false);
    //     }
    // };
    useEffect(() => {
        if (currentUser) {
            fetchProperties();
            fetchReservations();
        }
    }, [currentUser, filters]);


    const fetchProperties = async () => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/biens?${queryParams}`, {
                credentials: 'include'
            });
            const data = await response.json();
            setProperties(data);
        } catch (error) {
            console.error('Erreur lors du chargement des biens:', error);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                credentials: 'include'
            });
            const data = await response.json();
            setReservations(data);
        } catch (error) {
            console.error('Erreur lors du chargement des réservations:', error);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const result = await onLogin(loginForm);
        if (result.success) {
            setShowLoginModal(false);
            setLoginForm({ email: '', password: '' });
            showNotification('Connexion réussie!', 'success');
        } else {
            setLoginError(result.error || 'Erreur de connexion');
            showNotification(result.error, 'error');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (registerForm.password !== registerForm.confirmPassword) {
            showNotification('Les mots de passe ne correspondent pas', 'error');
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(registerForm)
            });

            const data = await response.json();
            if (response.ok) {
                setShowRegisterModal(false);
                setRegisterForm({ nom: '', prenom: '', email: '', telephone: '', password: '', confirmPassword: '' });
                showNotification('Inscription réussie! Vous pouvez maintenant vous connecter.', 'success');
                setShowLoginModal(true);
            } else {
                showNotification(data.error || 'Erreur lors de l\'inscription', 'error');
            }
        } catch (error) {
            showNotification('Erreur lors de l\'inscription', 'error');
        }
    };

    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/';
            setCurrentUser(null);
            setIsAuthenticated(false);
            setProperties([]);
            setReservations([]);
            showNotification('Déconnexion réussie', 'info');

        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    ...bookingForm,
                    bien_id: selectedProperty.id
                })
            });

            const data = await response.json();
            if (response.ok) {
                setShowBookingModal(false);
                setSelectedProperty(null);
                setBookingForm({ date_debut: '', date_fin: '', nb_personnes: 1, message: '' });
                fetchProperties();
                fetchReservations();
                showNotification('Réservation créée avec succès!', 'success');
            } else {
                showNotification(data.error || 'Erreur lors de la réservation', 'error');
            }
        } catch (error) {
            showNotification('Erreur lors de la réservation', 'error');
        }
    };

    const handleReservationUpdate = async (reservationId, newStatus) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ statut: newStatus })
            });

            const data = await response.json();
            if (response.ok) {
                fetchReservations();
                fetchProperties();
                showNotification('Réservation mise à jour avec succès!', 'success');
                setShowReservationModal(false);
            } else {
                showNotification(data.error || 'Erreur lors de la mise à jour', 'error');
            }
        } catch (error) {
            showNotification('Erreur lors de la mise à jour', 'error');
        }
    };

    const handleReservationDelete = async (reservationId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (response.ok) {
                    fetchReservations();
                    fetchProperties();
                    showNotification('Réservation supprimée avec succès!', 'success');
                } else {
                    const data = await response.json();
                    showNotification(data.error || 'Erreur lors de la suppression', 'error');
                }
            } catch (error) {
                showNotification('Erreur lors de la suppression', 'error');
            }
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
            setNotification('');
        }, 5000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'XOF',
        }).format(price);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-100 text-yellow-800';
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING':
                return 'En attente';
            case 'CONFIRMED':
                return 'Confirmée';
            case 'CANCELLED':
                return 'Annulée';
            case 'COMPLETED':
                return 'Terminée';
            default:
                return status;
        }
    };

    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.ville.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* === Zone accessible aux NON connectés === */}
            {!isAuthenticated && (
                <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Home className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">ImmoBooking</h1>
                                <p className="text-gray-600">Votre plateforme immobilière</p>
                            </div>

                            <div className="space-y-4">
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                >
                                    Se connecter
                                </button>
                                <button
                                    onClick={() => setShowRegisterModal(true)}
                                    className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                                >
                                    S'inscrire
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                                    <Home className="w-5 h-5 text-white" />
                                </div>
                            </div>
                            <div className="ml-4">
                                <h1 className="text-xl font-bold text-gray-900">ImmoBooking</h1>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <User className="w-5 h-5 text-gray-400" />
                                <span className="text-sm font-medium text-gray-700">
                                    {currentUser?.prenom} {currentUser?.nom}
                                </span>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${notificationType === 'success' ? 'bg-green-500 text-white' :
                    notificationType === 'error' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                    }`}>
                    <div className="flex items-center">
                        {notificationType === 'success' && <CheckCircle className="w-5 h-5 mr-2" />}
                        {notificationType === 'error' && <XCircle className="w-5 h-5 mr-2" />}
                        {notificationType === 'info' && <Bell className="w-5 h-5 mr-2" />}
                        <span>{notification}</span>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('properties')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'properties'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Home className="w-4 h-4 inline mr-2" />
                            Biens disponibles
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reservations'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Mes réservations
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {activeTab === 'properties' && (
                    <div>
                        {/* Search and Filters */}
                        <div className="mb-8 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Rechercher un bien..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    {viewMode === 'grid' ? 'Vue liste' : 'Vue grille'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                <select
                                    value={filters.type_bien}
                                    onChange={(e) => setFilters({ ...filters, type_bien: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Type de bien</option>
                                    <option value="APPARTEMENT">Appartement</option>
                                    <option value="MAISON">Maison</option>
                                    <option value="TERRAIN">Terrain</option>
                                    <option value="COMMERCIAL">Commercial</option>
                                    <option value="BUREAU">Bureau</option>
                                </select>

                                <select
                                    value={filters.type_transaction}
                                    onChange={(e) => setFilters({ ...filters, type_transaction: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Type de transaction</option>
                                    <option value="VENTE">Vente</option>
                                    <option value="LOCATION">Location</option>
                                </select>

                                <input
                                    type="text"
                                    placeholder="Ville"
                                    value={filters.ville}
                                    onChange={(e) => setFilters({ ...filters, ville: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                <input
                                    type="number"
                                    placeholder="Prix minimum"
                                    value={filters.prix_min}
                                    onChange={(e) => setFilters({ ...filters, prix_min: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />

                                <input
                                    type="number"
                                    placeholder="Prix maximum"
                                    value={filters.prix_max}
                                    onChange={(e) => setFilters({ ...filters, prix_max: e.target.value })}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Properties Grid */}
                        <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                            {filteredProperties.map((property) => (
                                <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                    <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-100 to-indigo-100 p-8 flex items-center justify-center">
                                        <Home className="w-16 h-16 text-blue-600" />
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 truncate">{property.titre}</h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${property.type_transaction === 'VENTE' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {property.type_transaction}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-600 mb-3">
                                            <MapPin className="w-4 h-4 mr-1" />
                                            <span className="text-sm">{property.adresse.ville}</span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{property.description}</p>

                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center">
                                                    <Bed className="w-4 h-4 mr-1" />
                                                    <span>{property.nb_pieces} pièces</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span>{property.surface} m²</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-2xl font-bold text-gray-900">
                                                {formatPrice(property.prix)}
                                                {property.type_transaction === 'LOCATION' && <span className="text-sm font-normal text-gray-500">/mois</span>}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedProperty(property);
                                                    setShowBookingModal(true);
                                                }}
                                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Réserver
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredProperties.length === 0 && (
                            <div className="text-center py-12">
                                <Home className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bien trouvé</h3>
                                <p className="text-gray-600">Essayez de modifier vos critères de recherche.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reservations' && (
                    <div>
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mes réservations</h2>
                            <p className="text-gray-600">Gérez vos réservations immobilières</p>
                        </div>

                        <div className="space-y-4">
                            {reservations.map((reservation) => (
                                <div key={reservation.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Home className="w-6 h-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{reservation.bien?.titre}</h3>
                                                <p className="text-sm text-gray-600">{reservation.bien?.adresse.ville}</p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(reservation.statut)}`}>
                                            {getStatusText(reservation.statut)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-4 h-4 mr-2" />
                                            <span className="text-sm">Du {reservation.date_debut}</span>
                                        </div>
                                        {reservation.date_fin && (
                                            <div className="flex items-center text-gray-600">
                                                <Calendar className="w-4 h-4 mr-2" />
                                                <span className="text-sm">Au {reservation.date_fin}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center text-gray-600">
                                            <Users className="w-4 h-4 mr-2" />
                                            <span className="text-sm">{reservation.nb_personnes} personne(s)</span>
                                        </div>
                                    </div>

                                    {reservation.message && (
                                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-700">{reservation.message}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <div className="text-lg font-semibold text-gray-900">
                                            {formatPrice(reservation.bien?.prix)}
                                            {reservation.bien?.type_transaction === 'LOCATION' && <span className="text-sm font-normal text-gray-500">/mois</span>}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedReservation(reservation);
                                                    setShowReservationModal(true);
                                                }}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Voir
                                            </button>
                                            {reservation.statut === 'PENDING' && (
                                                <button
                                                    onClick={() => handleReservationDelete(reservation.id)}
                                                    className="inline-flex items-center px-3 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 bg-white hover:bg-red-50"
                                                >
                                                    <Trash2 className="w-4 h-4 mr-1" />
                                                    Annuler
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {reservations.length === 0 && (
                            <div className="text-center py-12">
                                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réservation</h3>
                                <p className="text-gray-600">Vous n'avez pas encore effectué de réservation.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>


            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Connexion</h2>
                        <form onSubmit={handleLogin} className="space-y-4">
                            {loginError && (
                                <div className="text-red-600 text-sm font-medium">
                                    {loginError}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={loginForm.email}
                                    onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                <input
                                    type="password"
                                    value={loginForm.password}
                                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus :ring-blue-500 focus:border-transparent"
                                    required />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Se connecter
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowLoginModal(false)}
                                    className="ml-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Register Modal */}
            {showRegisterModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">Inscription</h2>
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                                <input
                                    type="text"
                                    value={registerForm.nom}
                                    onChange={(e) => setRegisterForm({ ...registerForm, nom: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                                <input
                                    type="text"
                                    value={registerForm.prenom}
                                    onChange={(e) => setRegisterForm({ ...registerForm, prenom: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={registerForm.email}
                                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                                <input
                                    type="tel"
                                    value={registerForm.telephone}
                                    onChange={(e) => setRegisterForm({ ...registerForm, telephone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mot de passe</label>
                                <input
                                    type="password"
                                    value={registerForm.password}
                                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
                                <input
                                    type="password"
                                    value={registerForm.confirmPassword}
                                    onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    S'inscrire
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterModal(false)}
                                    className="ml-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Booking Modal */}
            {showBookingModal && selectedProperty && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Réserver {selectedProperty.titre}</h2>
                        <form onSubmit={handleBooking} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                <input
                                    type="date"
                                    value={bookingForm.date_debut}
                                    onChange={(e) => setBookingForm({ ...bookingForm, date_debut: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                <input
                                    type="date"
                                    value={bookingForm.date_fin}
                                    onChange={(e) => setBookingForm({ ...bookingForm, date_fin: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={bookingForm.nb_personnes}
                                    onChange={(e) => setBookingForm({ ...bookingForm, nb_personnes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message (optionnel)</label>
                                <textarea
                                    value={bookingForm.message}
                                    onChange={(e) => setBookingForm({ ...bookingForm, message: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                ></textarea>
                            </div>
                            <div className="flex items-center justify-between">
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Réserver
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowBookingModal(false)}
                                    className="ml-2 w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors" t
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Reservation Modal */}
            {showReservationModal && selectedReservation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-md w-full p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Détails de la réservation</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bien réservé</label>
                                <p className="text-gray-900">{selectedReservation.bien?.titre}</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                                <p className="text-gray-900">{selectedReservation.date_debut}</p>
                            </div>
                            {selectedReservation.date_fin && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
                                    <p className="text-gray-900">{selectedReservation.date_fin}</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de personnes</label>
                                <p className="text-gray-900">{selectedReservation.nb_personnes}</p>
                            </div>
                            {selectedReservation.message && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                    <p className="text-gray-900">{selectedReservation.message}</p>
                                </div>
                            )}
                            <div className={`px-3 py-1 inline-block rounded-full ${getStatusColor(selectedReservation.statut)}`}>
                                {getStatusText(selectedReservation.statut)}
                            </div>

                            {selectedReservation.statut === 'PENDING' && (
                                <div className="flex space-x-2 mt-4">
                                    <button
                                        onClick={() => handleReservationUpdate(selectedReservation.id, 'CONFIRMED')}
                                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Confirmer
                                        <CheckCircle className="w-4 h-4 ml-1" />
                                    </button>
                                    <button
                                        onClick={() => handleReservationUpdate(selectedReservation.id, 'CANCELLED')}
                                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                    >
                                        Annuler
                                        <XCircle className="w-4 h-4 ml-1" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <button
                                onClick={() => setShowReservationModal(false)}
                                className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
export default PropertyBookingApp;