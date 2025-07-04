import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Home, MapPin, Euro, Calendar, Filter, X, LogOut } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000/api';

const BiensManager = () => {
    const [biens, setBiens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingBien, setEditingBien] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState('');
    const [notificationType, setNotificationType] = useState('info');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [reservations, setReservations] = useState([]);
    const [filters, setFilters] = useState({
        type_bien: '',
        type_transaction: '',
        ville: '',
        statut: ''
    });
    const [stats, setStats] = useState({});

    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        prix: '',
        surface: '',
        nb_pieces: '',
        type_bien: 'APPARTEMENT',
        type_transaction: 'VENTE',
        rue: '',
        ville: '',
        code_postal: '',
        pays: 'France',
        balcon: false,
        terrasse: false,
        garage: false,
        cave: false,
        ascenseur: false
    });

    useEffect(() => {
        fetchBiens();
        fetchStats();
    }, [filters]);

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchBiens = async () => {
        try {
            const queryParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value) queryParams.append(key, value);
            });

            const response = await fetch(`${API_BASE_URL}/biens?${queryParams}`);
            const data = await response.json();
            setBiens(data);
            setLoading(false);
        } catch (error) {
            console.error('Erreur lors du chargement des biens:', error);
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/stats`, {
                credentials: 'include'
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Erreur lors du chargement des statistiques:', error);
        }
    };

    const fetchReservations = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                setReservations(data);
            }
        } catch (err) {
            console.error('Erreur chargement réservations:', err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const url = editingBien ? `${API_BASE_URL}/biens/${editingBien.id}` : `${API_BASE_URL}/biens`;
            const method = editingBien ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData),
            });

            if (response.ok) {
                fetchBiens();
                fetchStats();
                resetForm();
                setShowModal(false);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bien ?')) {
            try {
                await fetch(`${API_BASE_URL}/biens/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                fetchBiens();
                fetchStats();
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    const handleEdit = (bien) => {
        setEditingBien(bien);
        setFormData({
            titre: bien.titre,
            description: bien.description || '',
            prix: bien.prix,
            surface: bien.surface,
            nb_pieces: bien.nb_pieces,
            type_bien: bien.type_bien,
            type_transaction: bien.type_transaction,
            rue: bien.adresse.rue,
            ville: bien.adresse.ville,
            code_postal: bien.adresse.code_postal,
            pays: bien.adresse.pays,
            balcon: bien.caracteristiques.balcon,
            terrasse: bien.caracteristiques.terrasse,
            garage: bien.caracteristiques.garage,
            cave: bien.caracteristiques.cave,
            ascenseur: bien.caracteristiques.ascenseur
        });
        setShowModal(true);
    };

    const updateReservation = async (id, statut) => {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ statut })
            });

            if (response.ok) {
                fetchReservations(); // refresh
            }
        } catch (err) {
            console.error('Erreur mise à jour réservation:', err);
        }
    };


    const handleLogout = async () => {
        try {
            await fetch(`${API_BASE_URL}/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            window.location.href = '/';
            showNotification('Déconnexion réussie', 'info');
        } catch (error) {
            console.error('Erreur lors de la déconnexion:', error);
        }
    };

    const showNotification = (message, type = 'info') => {
        setNotification(message);
        setNotificationType(type);
        setTimeout(() => {
            setNotification('');
        }, 5000);
    };

    const resetForm = () => {
        setFormData({
            titre: '',
            description: '',
            prix: '',
            surface: '',
            nb_pieces: '',
            type_bien: 'APPARTEMENT',
            type_transaction: 'VENTE',
            rue: '',
            ville: '',
            code_postal: '',
            pays: 'France',
            balcon: false,
            terrasse: false,
            garage: false,
            cave: false,
            ascenseur: false
        });
        setEditingBien(null);
    };

    const filteredBiens = biens.filter(bien =>
        bien.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bien.adresse.ville.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-md shadow-lg ${notificationType === 'success' ? 'bg-green-500 text-white' :
                    notificationType === 'error' ? 'bg-red-500 text-white' :
                        'bg-blue-500 text-white'
                    }`}>
                    {notification}
                </div>
            )}
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Home className="h-8 w-8 text-blue-600" />
                            <h1 className="ml-2 text-xl font-bold text-gray-900">Agence Immobilière</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setShowModal(true)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                Ajouter un bien
                            </button>
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
            </div>
            {/* Tabs */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'dashboard'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Home className="w-4 h-4 inline mr-2" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('reservations')}
                            className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reservations'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Réservations
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistiques */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Home className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Biens</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.total_biens || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Disponibles</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.biens_disponibles || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Euro className="h-6 w-6 text-yellow-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">À Vendre</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.biens_vente || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white overflow-hidden shadow-lg rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <Calendar className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">À Louer</dt>
                                        <dd className="text-lg font-medium text-gray-900">{stats.biens_location || 0}</dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {activeTab === 'dashboard' && (
                    <div>
                        {/* Recherche et Filtres */}
                        <div className="bg-white shadow-lg rounded-lg mb-8">
                            <div className="p-6">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="flex-1">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Rechercher par titre ou ville..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <select
                                            value={filters.type_bien}
                                            onChange={(e) => setFilters({ ...filters, type_bien: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Tous les types</option>
                                            <option value="APPARTEMENT">Appartement</option>
                                            <option value="MAISON">Maison</option>
                                        </select>

                                        <select
                                            value={filters.type_transaction}
                                            onChange={(e) => setFilters({ ...filters, type_transaction: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Vente/Location</option>
                                            <option value="VENTE">Vente</option>
                                            <option value="LOCATION">Location</option>
                                        </select>

                                        <select
                                            value={filters.statut}
                                            onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
                                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">Tous les statuts</option>
                                            <option value="DISPONIBLE">Disponible</option>
                                            <option value="RESERVE">Réservé</option>
                                            <option value="VENDU_LOUE">Vendu/Loué</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Liste des biens */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredBiens.map((bien) => (
                                <div key={bien.id} className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow">
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{bien.titre}</h3>
                                                <div className="flex items-center text-sm text-gray-500 mb-2">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {bien.adresse.rue}, {bien.adresse.ville}
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                    <span>{bien.surface} m²</span>
                                                    <span>{bien.nb_pieces} pièces</span>
                                                    <span className="capitalize">{bien.type_bien.toLowerCase()}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-xl font-bold text-blue-600">
                                                        {bien.prix.toLocaleString()} FCFA
                                                        {bien.type_transaction === 'LOCATION' && <span className="text-sm">/mois</span>}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-1 text-xs rounded-full ${bien.statut === 'DISPONIBLE' ? 'bg-green-100 text-green-800' :
                                                            bien.statut === 'RESERVE' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                            {bien.statut}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Caractéristiques */}
                                        <div className="mt-4 flex flex-wrap gap-2">
                                            {bien.caracteristiques.balcon && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Balcon</span>}
                                            {bien.caracteristiques.terrasse && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Terrasse</span>}
                                            {bien.caracteristiques.garage && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Garage</span>}
                                            {bien.caracteristiques.cave && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Cave</span>}
                                            {bien.caracteristiques.ascenseur && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Ascenseur</span>}
                                        </div>

                                        <div className="mt-4 flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(bien)}
                                                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bien.id)}
                                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Supprimer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredBiens.length === 0 && (
                            <div className="text-center py-12">
                                <Home className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun bien trouvé</h3>
                                <p className="mt-1 text-sm text-gray-500">Commencez par ajouter un nouveau bien.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'reservations' && (
                    <div>
                        {/* Liste des réservations */}
                        <div className="mt-10">
                            <h2 className="text-2xl font-bold mb-4">Réservations</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {reservations.map((res) => (
                                    <div
                                        key={res.id}
                                        className="bg-white shadow-lg rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                                    >
                                        <div className="p-6">
                                            {/* Infos réservation */}
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                                        Réservation de {res.client.prenom} {res.client.nom}
                                                    </h3>
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        <strong>Email :</strong> {res.client.email}
                                                    </div>

                                                    {/* Détails bien réservé */}
                                                    <div className="text-sm text-gray-500 mb-2">
                                                        <strong>Bien :</strong> {res.bien.titre} ({res.bien.ville})
                                                    </div>

                                                    <div className="text-sm text-gray-500 mb-2">
                                                        <strong>Période :</strong> {res.date_debut} → {res.date_fin}
                                                    </div>

                                                    <div className="text-sm text-gray-500 mb-2">
                                                        <strong>Nombre de personnes :</strong> {res.nb_personnes}
                                                    </div>

                                                    {res.message && (
                                                        <div className="text-sm text-gray-500 mb-2">
                                                            <strong>Message :</strong> {res.message}
                                                        </div>
                                                    )}

                                                    {/* Statut */}
                                                    <div className="mt-2">
                                                        <span
                                                            className={`px-2 py-1 text-xs rounded-full ${res.statut === 'CONFIRMED'
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : res.statut === 'CANCELLED'
                                                                        ? 'bg-red-100 text-red-800'
                                                                        : res.statut === 'COMPLETED'
                                                                            ? 'bg-blue-100 text-blue-800'
                                                                            : 'bg-yellow-100 text-yellow-800' // PENDING ou inconnu
                                                                }`}
                                                        >
                                                            {res.statut === 'PENDING'
                                                                ? 'En attente'
                                                                : res.statut === 'CONFIRMED'
                                                                    ? 'Confirmée'
                                                                    : res.statut === 'CANCELLED'
                                                                        ? 'Annulée'
                                                                        : res.statut === 'COMPLETED'
                                                                            ? 'Terminée'
                                                                            : res.statut}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Boutons action */}
                                            <div className="mt-4 flex justify-end gap-2">
                                                {res.statut === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => updateReservation(res.id, 'CONFIRMED')}
                                                            className="inline-flex items-center px-3 py-2 text-sm rounded-md text-white bg-green-600 hover:bg-green-700"
                                                        >
                                                            Valider
                                                        </button>
                                                        <button
                                                            onClick={() => updateReservation(res.id, 'CANCELLED')}
                                                            className="inline-flex items-center px-3 py-2 text-sm rounded-md text-white bg-red-600 hover:bg-red-700"
                                                        >
                                                            Refuser
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                )}



            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">
                                {editingBien ? 'Modifier le bien' : 'Ajouter un bien'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    resetForm();
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                                    <input
                                        type="text"
                                        value={formData.titre}
                                        onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                                    <input
                                        type="number"
                                        value={formData.prix}
                                        onChange={(e) => setFormData({ ...formData, prix: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                                    <input
                                        type="number"
                                        value={formData.surface}
                                        onChange={(e) => setFormData({ ...formData, surface: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de pièces</label>
                                    <input
                                        type="number"
                                        value={formData.nb_pieces}
                                        onChange={(e) => setFormData({ ...formData, nb_pieces: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type de bien</label>
                                    <select
                                        value={formData.type_bien}
                                        onChange={(e) => setFormData({ ...formData, type_bien: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="APPARTEMENT">Appartement</option>
                                        <option value="MAISON">Maison</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Transaction</label>
                                    <select
                                        value={formData.type_transaction}
                                        onChange={(e) => setFormData({ ...formData, type_transaction: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="VENTE">Vente</option>
                                        <option value="LOCATION">Location</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Description du bien..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Rue</label>
                                    <input
                                        type="text"
                                        value={formData.rue}
                                        onChange={(e) => setFormData({ ...formData, rue: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
                                    <input
                                        type="text"
                                        value={formData.ville}
                                        onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
                                    <input
                                        type="text"
                                        value={formData.code_postal}
                                        onChange={(e) => setFormData({ ...formData, code_postal: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Caractéristiques</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="balcon"
                                            checked={formData.balcon}
                                            onChange={(e) => setFormData({ ...formData, balcon: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="balcon" className="ml-2 block text-sm text-gray-700">Balcon</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="terrasse"
                                            checked={formData.terrasse}
                                            onChange={(e) => setFormData({ ...formData, terrasse: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="terrasse" className="ml-2 block text-sm text-gray-700">Terrasse</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="garage"
                                            checked={formData.garage}
                                            onChange={(e) => setFormData({ ...formData, garage: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="garage" className="ml-2 block text-sm text-gray-700">Garage</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="cave"
                                            checked={formData.cave}
                                            onChange={(e) => setFormData({ ...formData, cave: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="cave" className="ml-2 block text-sm text-gray-700">Cave</label>
                                    </div>

                                    <div className="flex items-center">
                                        <input
                                            type="checkbox"
                                            id="ascenseur"
                                            checked={formData.ascenseur}
                                            onChange={(e) => setFormData({ ...formData, ascenseur: e.target.checked })}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="ascenseur" className="ml-2 block text-sm text-gray-700">Ascenseur</label>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    {editingBien ? 'Modifier' : 'Ajouter'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BiensManager;