import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaDollarSign,
    FaTruck,
    FaWeightHanging,
    FaCube,
    FaRoad,
    FaClock,
    FaCheckCircle,
    FaTimesCircle,
    FaSearch,
    FaFilter,
    FaSortAmountDown,
    FaExclamationTriangle
} from "react-icons/fa";
import { GiTakeMyMoney } from "react-icons/gi";

const TarificationList = () => {
    const navigate = useNavigate();
    const [tarifications, setTarifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatut, setFilterStatut] = useState("");
    const [error, setError] = useState(null);

    const API_URL = "http://localhost:8081/api/tarification/all";
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchTarifications();
    }, []);

    const fetchTarifications = async () => {
        try {
            setLoading(true);
            setError(null);

            // Vérifier le token
            if (!token) {
                throw new Error("Vous n'êtes pas connecté. Veuillez vous reconnecter.");
            }

            const response = await fetch(API_URL, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            });

            // Vérifier la réponse
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error("Session expirée. Veuillez vous reconnecter.");
                }
                if (response.status === 403) {
                    throw new Error("Accès non autorisé.");
                }
                if (response.status === 404) {
                    // L'endpoint existe mais retourne 404, peut-être qu'il n'y a pas de données
                    setTarifications([]);
                    setLoading(false);
                    return;
                }
                throw new Error(`Erreur serveur: ${response.status}`);
            }

            const data = await response.json();

            // Vérifier que data est un tableau
            if (!Array.isArray(data)) {
                console.error("Format de données invalide reçu:", data);
                throw new Error("Format de données invalide reçu du serveur.");
            }

            setTarifications(data);
        } catch (error) {
            console.error("Erreur lors du chargement des tarifications:", error);
            setError(error.message || "Une erreur est survenue lors du chargement des tarifications.");
            setTarifications([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (statut) => {
        if (!statut) return "bg-gray-800 text-gray-400";

        switch (statut.toUpperCase()) {
            case "EN_ATTENTE": return "bg-yellow-900/50 text-yellow-400 border border-yellow-700";
            case "VALIDE": return "bg-green-900/50 text-green-400 border border-green-700";
            case "PAYE": return "bg-blue-900/50 text-blue-400 border border-blue-700";
            case "REJETE": return "bg-red-900/50 text-red-400 border border-red-700";
            case "EXPIRE": return "bg-gray-800 text-gray-400 border border-gray-700";
            case "ANNULE": return "bg-gray-800 text-gray-400 border border-gray-700";
            default: return "bg-gray-800 text-gray-400 border border-gray-700";
        }
    };

    const getStatusIcon = (statut) => {
        if (!statut) return <FaClock className="text-gray-400" />;

        switch (statut.toUpperCase()) {
            case "EN_ATTENTE": return <FaClock className="text-yellow-400" />;
            case "VALIDE": return <FaCheckCircle className="text-green-400" />;
            case "PAYE": return <GiTakeMyMoney className="text-blue-400" />;
            case "REJETE": return <FaTimesCircle className="text-red-400" />;
            default: return <FaClock className="text-gray-400" />;
        }
    };

    const formatCurrency = (amount) => {
        if (amount === null || amount === undefined || isNaN(amount)) {
            return "0,00 MAD";
        }
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'MAD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return "Non défini";

        try {
            // Nettoyer la date en enlevant les parties supplémentaires après les nanosecondes
            let cleanedDateString = dateString;

            // Si la date contient plusieurs points après les secondes
            if (dateString.includes('.')) {
                const parts = dateString.split('.');
                if (parts.length > 1) {
                    // Garder seulement la partie avec les millisecondes (premier point après les secondes)
                    cleanedDateString = parts[0] + '.' + parts[1].substring(0, 6) + 'Z';
                }
            }

            // Essayer de parser la date nettoyée
            const date = new Date(cleanedDateString);

            // Vérifier si la date est valide
            if (isNaN(date.getTime())) {
                console.warn(`Date invalide: ${dateString}`);
                return "Date invalide";
            }

            return date.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error("Erreur de formatage de date:", error, "pour:", dateString);
            return "Erreur de date";
        }
    };

    const calculateMarge = (tarifClient, margeService) => {
        if (!tarifClient || tarifClient === 0) return "0%";
        const pourcentage = ((margeService || 0) / tarifClient) * 100;
        return `${pourcentage.toFixed(1)}%`;
    };

    // Filtrage des tarifications
    const filteredTarifications = tarifications.filter(tarif => {
        if (!tarif) return false;

        const searchTermLower = searchTerm.toLowerCase();
        const idMatch = tarif.id ? tarif.id.toString().toLowerCase().includes(searchTermLower) : false;
        const clientIdMatch = tarif.clientId ? tarif.clientId.toString().toLowerCase().includes(searchTermLower) : false;
        const marchandiseMatch = tarif.natureMarchandise ?
            tarif.natureMarchandise.toLowerCase().includes(searchTermLower) : false;
        const demandeIdMatch = tarif.demandeId ? tarif.demandeId.toString().toLowerCase().includes(searchTermLower) : false;

        const matchesSearch = searchTerm === "" || idMatch || clientIdMatch || marchandiseMatch || demandeIdMatch;
        const matchesStatut = filterStatut === "" ||
            (tarif.statut && tarif.statut.toUpperCase() === filterStatut.toUpperCase());

        return matchesSearch && matchesStatut;
    });

    const handleCardClick = (tarificationId) => {
        navigate(`/tarification/${tarificationId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-yellow-400 text-xl">Chargement des tarifications...</p>
                    <p className="text-gray-400 text-sm mt-2">Veuillez patienter</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-600 rounded-2xl p-8 text-center"
                    >
                        <FaExclamationTriangle className="text-red-500 text-5xl mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-red-400 mb-4">Erreur de chargement</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={fetchTarifications}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
                            >
                                Réessayer
                            </button>
                            <button
                                onClick={() => navigate("/")}
                                className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all"
                            >
                                Retour au dashboard
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
            {/* Décorations d'arrière-plan */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 w-64 h-64 bg-yellow-600 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            />

            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-20 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            />

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* En-tête de la page */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-300 mb-4">
                        Liste des Tarifications
                    </h1>
                    <p className="text-gray-400 text-lg">
                        {tarifications.length > 0
                            ? `${tarifications.length} tarification${tarifications.length > 1 ? 's' : ''} disponible${tarifications.length > 1 ? 's' : ''}`
                            : "Aucune tarification disponible"
                        }
                    </p>
                </motion.div>

                {/* Barre de recherche et filtres */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Barre de recherche */}
                        <div className="flex-1">
                            <div className="relative">
                                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par ID, client, marchandise..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3.5 bg-black/60 border-2 border-yellow-600/30 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-all text-base"
                                />
                            </div>
                        </div>

                        {/* Filtres */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="relative">
                                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg" />
                                <select
                                    value={filterStatut}
                                    onChange={(e) => setFilterStatut(e.target.value)}
                                    className="pl-12 pr-10 py-3.5 bg-black/60 border-2 border-blue-600/30 rounded-xl text-white focus:outline-none focus:border-blue-500 appearance-none cursor-pointer text-base min-w-[180px]"
                                >
                                    <option value="">Tous les statuts</option>
                                    <option value="EN_ATTENTE">⏳ En attente</option>
                                    <option value="VALIDE">✅ Validé</option>
                                    <option value="PAYE">💰 Payé</option>
                                    <option value="REJETE">❌ Rejeté</option>
                                    <option value="EXPIRE">⌛ Expiré</option>
                                </select>
                            </div>

                            {/* Bouton rafraîchir */}
                            <button
                                onClick={fetchTarifications}
                                className="px-6 py-3.5 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all flex items-center justify-center gap-2"
                            >
                                <motion.span
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    ↻
                                </motion.span>
                                Rafraîchir
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Statistiques */}
                {tarifications.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                    >
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-green-600/20 rounded-xl p-5">
                            <div className="text-gray-400 text-sm mb-1">Total</div>
                            <div className="text-2xl font-bold text-white">{tarifications.length}</div>
                        </div>
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600/20 rounded-xl p-5">
                            <div className="text-gray-400 text-sm mb-1">En attente</div>
                            <div className="text-2xl font-bold text-yellow-400">
                                {tarifications.filter(t => t?.statut === "EN_ATTENTE").length}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-blue-600/20 rounded-xl p-5">
                            <div className="text-gray-400 text-sm mb-1">Validés</div>
                            <div className="text-2xl font-bold text-blue-400">
                                {tarifications.filter(t => t?.statut === "VALIDE").length}
                            </div>
                        </div>
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-purple-600/20 rounded-xl p-5">
                            <div className="text-gray-400 text-sm mb-1">Payés</div>
                            <div className="text-2xl font-bold text-purple-400">
                                {tarifications.filter(t => t?.statut === "PAYE").length}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Message si aucune tarification */}
                {tarifications.length === 0 && !loading && !error && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600/30 rounded-2xl p-12 max-w-2xl mx-auto">
                            <div className="text-yellow-500 text-6xl mb-6">📋</div>
                            <h3 className="text-2xl font-bold text-white mb-4">Aucune tarification</h3>
                            <p className="text-gray-400 mb-8">
                                Aucune tarification n'a été trouvée dans le système.
                            </p>
                            <button
                                onClick={fetchTarifications}
                                className="px-8 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-xl hover:from-yellow-500 hover:to-yellow-400 transition-all"
                            >
                                Vérifier à nouveau
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Grille des tarifications */}
                {filteredTarifications.length > 0 && (
                    <>
                        <div className="mb-6">
                            <div className="text-gray-400 text-sm">
                                Affichage de <span className="text-yellow-400 font-bold">{filteredTarifications.length}</span> tarification{filteredTarifications.length > 1 ? 's' : ''}
                                {searchTerm && ` pour "${searchTerm}"`}
                                {filterStatut && ` avec statut "${filterStatut}"`}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredTarifications.map((tarif, index) => (
                                <motion.div
                                    key={tarif?.id || `tarif-${index}`}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{
                                        delay: Math.min(index * 0.05, 0.5),
                                        duration: 0.3
                                    }}
                                    onClick={() => handleCardClick(tarif.id)}
                                    className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-gray-800 rounded-2xl p-6 cursor-pointer hover:border-yellow-600 hover:shadow-2xl hover:shadow-yellow-600/20 transition-all duration-300 group transform hover:-translate-y-1"
                                >
                                    {/* En-tête de la carte */}
                                    <div className="flex justify-between items-start mb-5">
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                                                Tarif #{tarif.id || "N/A"}
                                            </h3>
                                            <div className="text-gray-400 text-sm mt-1">
                                                Demande: {tarif.demandeId || "N/A"}
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${getStatusColor(tarif.statut)}`}>
                                            {getStatusIcon(tarif.statut)}
                                            <span className="hidden sm:inline">{tarif.statut || "INCONNU"}</span>
                                            <span className="sm:hidden">{tarif.statut?.charAt(0) || "?"}</span>
                                        </span>
                                    </div>

                                    {/* Informations tarifaires */}
                                    <div className="space-y-5 mb-6">
                                        {/* Montants */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-gray-900/50 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">Tarif Client</div>
                                                <div className="text-lg font-bold text-green-400">
                                                    {formatCurrency(tarif.tarifClient)}
                                                </div>
                                            </div>
                                            <div className="bg-gray-900/50 rounded-lg p-3">
                                                <div className="text-gray-400 text-xs mb-1">Marge</div>
                                                <div className="text-lg font-bold text-yellow-400">
                                                    {calculateMarge(tarif.tarifClient, tarif.margeService)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Caractéristiques */}
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="flex flex-col items-center p-2 bg-gray-900/30 rounded-lg">
                                                <FaCube className="text-blue-400 mb-1" />
                                                <div className="text-gray-400 text-xs">Volume</div>
                                                <div className="text-white font-semibold text-sm">{tarif.volume || 0} m³</div>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-gray-900/30 rounded-lg">
                                                <FaWeightHanging className="text-blue-400 mb-1" />
                                                <div className="text-gray-400 text-xs">Poids</div>
                                                <div className="text-white font-semibold text-sm">{tarif.poids || 0} kg</div>
                                            </div>
                                            <div className="flex flex-col items-center p-2 bg-gray-900/30 rounded-lg">
                                                <FaRoad className="text-blue-400 mb-1" />
                                                <div className="text-gray-400 text-xs">Distance</div>
                                                <div className="text-white font-semibold text-sm">{tarif.distanceKm || 0} km</div>
                                            </div>
                                        </div>

                                        {/* Marchandise */}
                                        <div className="bg-gray-900/30 rounded-lg p-3">
                                            <div className="text-gray-400 text-xs mb-1">Marchandise</div>
                                            <div className="text-white font-semibold">{tarif.natureMarchandise || "Non spécifié"}</div>
                                        </div>
                                    </div>

                                    {/* Informations supplémentaires */}
                                    <div className="pt-5 border-t border-gray-800">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <div className="text-gray-400 text-xs">Créé le</div>
                                                <div className="text-white text-sm">{formatDate(tarif.dateCreation)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-gray-400 text-xs">Expire le</div>
                                                <div className={`text-sm font-semibold ${new Date(tarif.dateExpiration) > new Date() ? "text-green-400" : "text-red-400"}`}>
                                                    {formatDate(tarif.dateExpiration)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bouton d'action */}
                                    <div className="mt-6">
                                        <button className="w-full py-3 bg-gradient-to-r from-gray-800 to-gray-700 text-yellow-500 font-bold rounded-xl hover:from-yellow-600 hover:to-yellow-500 hover:text-black transition-all group-hover:shadow-lg group-hover:shadow-yellow-500/20">
                                            <span className="flex items-center justify-center gap-2">
                                                Voir les détails
                                                <motion.span
                                                    initial={{ x: 0 }}
                                                    whileHover={{ x: 5 }}
                                                    transition={{ type: "spring", stiffness: 400 }}
                                                >
                                                    →
                                                </motion.span>
                                            </span>
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </>
                )}

                {/* Message si aucun résultat avec les filtres */}
                {tarifications.length > 0 && filteredTarifications.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-16"
                    >
                        <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-blue-600/30 rounded-2xl p-12 max-w-2xl mx-auto">
                            <FaSearch className="text-blue-500 text-5xl mx-auto mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-4">Aucun résultat</h3>
                            <p className="text-gray-400 mb-6">
                                Aucune tarification ne correspond à vos critères de recherche.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setFilterStatut("");
                                    }}
                                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all"
                                >
                                    Réinitialiser les filtres
                                </button>
                                <button
                                    onClick={fetchTarifications}
                                    className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-white font-bold rounded-xl hover:from-gray-600 hover:to-gray-500 transition-all"
                                >
                                    Rafraîchir
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Informations de débogage (optionnel - à enlever en production) */}
                {process.env.NODE_ENV === 'development' && tarifications.length > 0 && (
                    <div className="mt-10 pt-6 border-t border-gray-800">
                        <details className="text-gray-400 text-sm">
                            <summary className="cursor-pointer hover:text-gray-300">Informations de débogage</summary>
                            <div className="mt-2 p-3 bg-black/50 rounded-lg">
                                <div>Total tarifications: {tarifications.length}</div>
                                <div>Filtrées: {filteredTarifications.length}</div>
                                <div>API: {API_URL}</div>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TarificationList;