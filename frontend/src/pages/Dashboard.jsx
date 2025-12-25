import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    FaTruck,
    FaMapMarkerAlt,
    FaWeightHanging,
    FaCube,
    FaCalendarAlt,
    FaCalculator,
    FaEye,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaExclamationTriangle
} from "react-icons/fa";
import { MdRefresh, MdFilterList } from "react-icons/md";
import { BsDatabaseFillSlash } from "react-icons/bs";
import {TarificationAlert,CalculateTarifModal,DemandeDetailModal} from "../components";

const Dashboard = () => {
    const [demandes, setDemandes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDemande, setSelectedDemande] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCalculateModal, setShowCalculateModal] = useState(false);
    const [tarificationAlert, setTarificationAlert] = useState(null);
    const [filters, setFilters] = useState({
        villeDepart: "",
        villeDestination: "",
        statutValidation: ""
    });

    const API_URL = "http://localhost:8081/api/tarification/demandes";
    const token = localStorage.getItem("authToken");
    console.log(token);
    // Récupérer les demandes avec itinéraires
    useEffect(() => {
        fetchDemandes();
    }, []);

    const fetchDemandes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/avec-itineraire`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur lors de la récupération des demandes");

            const data = await response.json();
            setDemandes(data);
        } catch (error) {
            console.error("Error:", error);
            setTarificationAlert({
                type: "error",
                message: "Erreur lors du chargement des demandes",
                details: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    // Filtrer les demandes
    const filteredDemandes = demandes.filter(demande => {
        return (
            (!filters.villeDepart || demande.villeDepart?.toLowerCase().includes(filters.villeDepart.toLowerCase())) &&
            (!filters.villeDestination || demande.villeDestination?.toLowerCase().includes(filters.villeDestination.toLowerCase())) &&
            (!filters.statutValidation || demande.statutValidation === filters.statutValidation)
        );
    });

    // Ouvrir le modal de détails
    const handleViewDetails = (demande) => {
        setSelectedDemande(demande);
        setShowDetailModal(true);
    };

    // Ouvrir le modal de calcul de tarif
    const handleCalculateTarif = (demande) => {
        setSelectedDemande(demande);
        setShowCalculateModal(true);
    };

    // Calculer le tarif
    const handleCalculateSubmit = async (data) => {
        try {
            const response = await fetch(`${API_URL}/calculer-tarif`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error("Erreur lors du calcul du tarif");

            const result = await response.json();

            // Afficher l'alerte de succès
            setTarificationAlert({
                type: "success",
                message: "Tarification calculée avec succès !",
                tarification: result,
                demandeId: data.demandeId
            });

            // Fermer le modal
            setShowCalculateModal(false);

            // Rafraîchir les données
            setTimeout(() => fetchDemandes(), 1000);

        } catch (error) {
            console.error("Error:", error);
            setTarificationAlert({
                type: "error",
                message: "Erreur lors du calcul du tarif",
                details: error.message
            });
        }
    };

    // Formater la date
    const formatDate = (dateString) => {
        if (!dateString) return "Non défini";
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Obtenir la couleur du statut
    const getStatusColor = (statut) => {
        switch (statut) {
            case "EN_ATTENTE": return "bg-yellow-600";
            case "VALIDE": return "bg-green-600";
            case "REJETE": return "bg-red-600";
            case "ANNULE": return "bg-gray-600";
            default: return "bg-gray-600";
        }
    };

    // Obtenir l'icône du statut
    const getStatusIcon = (statut) => {
        switch (statut) {
            case "EN_ATTENTE": return <FaClock className="text-yellow-400" />;
            case "VALIDE": return <FaCheckCircle className="text-green-400" />;
            case "REJETE": return <FaTimesCircle className="text-red-400" />;
            case "ANNULE": return <FaExclamationTriangle className="text-gray-400" />;
            default: return <FaClock className="text-gray-400" />;
        }
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
                    <p className="text-yellow-400 text-xl">Chargement des demandes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 px-4">
            {/* Décorations d'arrière-plan */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-10 left-20 w-64 h-64 bg-yellow-600 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-500 rounded-full filter blur-3xl opacity-20 pointer-events-none"
            />

            {/* Alert de tarification */}
            {tarificationAlert && (
                <TarificationAlert
                    alert={tarificationAlert}
                    onClose={() => setTarificationAlert(null)}
                />
            )}

            {/* Modal de détails */}
            {showDetailModal && selectedDemande && (
                <DemandeDetailModal
                    demande={selectedDemande}
                    onClose={() => setShowDetailModal(false)}
                    onCalculateTarif={() => {
                        setShowDetailModal(false);
                        handleCalculateTarif(selectedDemande);
                    }}
                />
            )}

            {/* Modal de calcul de tarif */}
            {showCalculateModal && selectedDemande && (
                <CalculateTarifModal
                    demande={selectedDemande}
                    onSubmit={handleCalculateSubmit}
                    onClose={() => setShowCalculateModal(false)}
                />
            )}

            <div className="relative z-10 max-w-7xl mx-auto">
                {/* En-tête */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300 mb-2">
                        Tableau de bord des demandes
                    </h1>
                    <p className="text-gray-400">Gérez et calculez les tarifs pour les demandes de transport</p>
                </motion.div>

                {/* Filtres */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl shadow-2xl p-6 mb-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-yellow-500 flex items-center gap-2">
                            <MdFilterList /> Filtres
                        </h2>
                        <div className="flex gap-2">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setFilters({ villeDepart: "", villeDestination: "", statutValidation: "" })}
                                className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-500 font-semibold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all border-2 border-yellow-600 flex items-center gap-2"
                            >
                                <MdRefresh /> Réinitialiser
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={fetchDemandes}
                                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all flex items-center gap-2"
                            >
                                <MdRefresh /> Actualiser
                            </motion.button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-yellow-500 font-semibold mb-2">
                                Ville de départ
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-900 border-2 border-yellow-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                placeholder="Filtrer par ville de départ"
                                value={filters.villeDepart}
                                onChange={(e) => setFilters({...filters, villeDepart: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-yellow-500 font-semibold mb-2">
                                Ville de destination
                            </label>
                            <input
                                type="text"
                                className="w-full px-4 py-3 bg-gray-900 border-2 border-yellow-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                placeholder="Filtrer par ville de destination"
                                value={filters.villeDestination}
                                onChange={(e) => setFilters({...filters, villeDestination: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-yellow-500 font-semibold mb-2">
                                Statut de validation
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-gray-900 border-2 border-yellow-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                value={filters.statutValidation}
                                onChange={(e) => setFilters({...filters, statutValidation: e.target.value})}
                            >
                                <option value="">Tous les statuts</option>
                                <option value="EN_ATTENTE">En attente</option>
                                <option value="VALIDE">Validé</option>
                                <option value="REJETE">Rejeté</option>
                                <option value="ANNULE">Annulé</option>
                            </select>
                        </div>
                    </div>
                </motion.div>

                {/* Statistiques */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
                >
                    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400">Total demandes</p>
                                <p className="text-3xl font-bold text-yellow-400">{demandes.length}</p>
                            </div>
                            <FaTruck className="text-yellow-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400">Demandes avec itinéraire</p>
                                <p className="text-3xl font-bold text-green-400">
                                    {demandes.filter(d => d.itineraireExists).length}
                                </p>
                            </div>
                            <FaMapMarkerAlt className="text-green-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400">Tarifications calculées</p>
                                <p className="text-3xl font-bold text-blue-400">
                                    {demandes.filter(d => d.tarifExists).length}
                                </p>
                            </div>
                            <FaCalculator className="text-blue-500 text-3xl" />
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400">Demandes en attente</p>
                                <p className="text-3xl font-bold text-yellow-400">
                                    {demandes.filter(d => d.statutValidation === "EN_ATTENTE").length}
                                </p>
                            </div>
                            <FaClock className="text-yellow-500 text-3xl" />
                        </div>
                    </div>
                </motion.div>

                {/* Liste des demandes en cards */}
                {filteredDemandes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-12 text-center"
                    >
                        <BsDatabaseFillSlash className="text-yellow-500 text-6xl mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-yellow-500 mb-2">Aucune demande trouvée</h3>
                        <p className="text-gray-400">Aucune demande ne correspond à vos filtres</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDemandes.map((demande, index) => (
                            <motion.div
                                key={demande.demandeId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl shadow-2xl overflow-hidden hover:shadow-yellow-500/20 transition-shadow"
                            >
                                {/* Header de la card */}
                                <div className="p-6 border-b border-gray-800">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-yellow-400 mb-1">
                                                Demande #{demande.demandeId}
                                            </h3>
                                            <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(demande.statutValidation)}`}>
                          {getStatusIcon(demande.statutValidation)}
                            {demande.statutValidation || "Non défini"}
                        </span>
                                                {demande.itineraireExists && (
                                                    <span className="px-3 py-1 bg-green-900 text-green-400 rounded-full text-sm font-semibold">
                            Itinéraire disponible
                          </span>
                                                )}
                                                {demande.tarifExists && (
                                                    <span className="px-3 py-1 bg-blue-900 text-blue-400 rounded-full text-sm font-semibold">
                            Tarif calculé
                          </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-gray-400 text-sm">Client ID</div>
                                            <div className="text-yellow-400 font-bold">{demande.clientId}</div>
                                        </div>
                                    </div>

                                    {/* Route */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="text-center">
                                            <div className="text-yellow-500 font-semibold">Départ</div>
                                            <div className="text-white">{demande.villeDepart || "Non spécifié"}</div>
                                        </div>
                                        <div className="flex-1 mx-4">
                                            <div className="h-1 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full"></div>
                                            <div className="text-center text-yellow-500 text-sm mt-1">
                                                {demande.distanceDemande ? `${demande.distanceDemande} km` : "Distance non calculée"}
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-yellow-500 font-semibold">Destination</div>
                                            <div className="text-white">{demande.villeDestination || "Non spécifié"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails de la demande */}
                                <div className="p-6">
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="flex items-center gap-3">
                                            <FaCube className="text-yellow-500 text-xl" />
                                            <div>
                                                <div className="text-gray-400 text-sm">Volume</div>
                                                <div className="text-white font-semibold">{demande.volume || 0} m³</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaWeightHanging className="text-yellow-500 text-xl" />
                                            <div>
                                                <div className="text-gray-400 text-sm">Poids</div>
                                                <div className="text-white font-semibold">{demande.poids || 0} kg</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaTruck className="text-yellow-500 text-xl" />
                                            <div>
                                                <div className="text-gray-400 text-sm">Marchandise</div>
                                                <div className="text-white font-semibold truncate">{demande.natureMarchandise || "Non spécifiée"}</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <FaCalendarAlt className="text-yellow-500 text-xl" />
                                            <div>
                                                <div className="text-gray-400 text-sm">Date départ</div>
                                                <div className="text-white font-semibold">{formatDate(demande.dateDepart)}</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Itinéraire */}
                                    {demande.itineraire && (
                                        <div className="mb-6 p-4 bg-gray-900/50 rounded-lg border border-yellow-600/30">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FaMapMarkerAlt className="text-green-500" />
                                                <h4 className="text-green-400 font-semibold">Itinéraire disponible</h4>
                                            </div>
                                            <div className="text-sm text-gray-300">
                                                <div className="flex justify-between mb-1">
                                                    <span>Distance:</span>
                                                    <span className="text-yellow-400">{demande.itineraire.distanceKm} km</span>
                                                </div>
                                                <div className="flex justify-between mb-1">
                                                    <span>Durée:</span>
                                                    <span className="text-yellow-400">{demande.itineraire.durationMin} min</span>
                                                </div>
                                                {demande.itineraire.includeReturn && (
                                                    <div className="flex justify-between">
                                                        <span>Retour inclus:</span>
                                                        <span className="text-yellow-400">Oui</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => handleViewDetails(demande)}
                                            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaEye /> Détails
                                        </motion.button>

                                        {demande.itineraireExists && !demande.tarifExists && (
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => handleCalculateTarif(demande)}
                                                className="flex-1 px-4 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all flex items-center justify-center gap-2"
                                            >
                                                <FaCalculator /> Calculer devis
                                            </motion.button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;