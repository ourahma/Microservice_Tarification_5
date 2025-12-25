import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaArrowLeft,
    FaDollarSign,
    FaTruck,
    FaWeightHanging,
    FaCube,
    FaRoad,
    FaInfoCircle,
    FaCalendarAlt,
    FaCheckCircle,
    FaClock,
    FaTimesCircle,
    FaEdit,
    FaTrash,
    FaPrint,
    FaShareAlt,
    FaHistory,
    FaUser,
    FaMapMarkerAlt,
    FaPercentage
} from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";
import { GiTakeMyMoney } from "react-icons/gi";

const TarificationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tarification, setTarification] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    const API_URL = "http://localhost:8081/api/tarification/demandes/tarification";
    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchTarification();
    }, [id]);

    const fetchTarification = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Tarification non trouvée");

            const data = await response.json();
            console.log("data",data);
            setTarification(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleValider = async () => {
        const Url_valider = "http://localhost:8081/api/tarification";
        try {
            setActionLoading(true);
            const response = await fetch(`${Url_valider}/${id}/valider`, {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur lors de la validation");

            const data = await response.json();
            setTarification(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setActionLoading(false);
        }
    };

    const handlePayer = async () => {
        try {
            setActionLoading(true);
            const response = await fetch(`${API_URL}/${id}/paiement`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Erreur lors du paiement");

            const data = await response.json();
            setTarification(data);
        } catch (error) {
            console.error("Error:", error);
        } finally {
            setActionLoading(false);
        }
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

    const getStatusColor = (statut) => {
        switch (statut) {
            case "EN_ATTENTE": return "bg-yellow-900 text-yellow-400";
            case "VALIDE": return "bg-green-900 text-green-400";
            case "PAYE": return "bg-blue-900 text-blue-400";
            case "REJETE": return "bg-red-900 text-red-400";
            case "EXPIRE": return "bg-gray-900 text-gray-400";
            case "ANNULE": return "bg-gray-800 text-gray-400";
            default: return "bg-gray-900 text-gray-400";
        }
    };

    const getStatusIcon = (statut) => {
        switch (statut) {
            case "EN_ATTENTE": return <FaClock className="text-yellow-400" />;
            case "VALIDE": return <FaCheckCircle className="text-green-400" />;
            case "PAYE": return <GiTakeMyMoney className="text-blue-400" />;
            case "REJETE": return <FaTimesCircle className="text-red-400" />;
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
                    <p className="text-yellow-400 text-xl">Chargement de la tarification...</p>
                </div>
            </div>
        );
    }

    if (!tarification) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-600 rounded-2xl p-12 max-w-md"
                >
                    <FaTimesCircle className="text-red-500 text-5xl mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Tarification non trouvée</h2>
                    <p className="text-gray-400 mb-6">
                        La tarification #{id} n'existe pas ou vous n'y avez pas accès.
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
                    >
                        Retour au dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4">
            {/* Décorations */}
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

            <div className="relative z-10 max-w-6xl mx-auto">
                {/* Header avec bouton retour */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-500 font-bold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all"
                    >
                        <FaArrowLeft /> Retour
                    </button>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300">
                            Tarification
                        </h1>
                        <p className="text-gray-400">Détails complets de la tarification</p>
                    </div>

                    <div className="flex items-center gap-2">
            <span className={`px-4 py-2 rounded-full font-bold flex items-center gap-2 ${getStatusColor(tarification.statut)}`}>
              {getStatusIcon(tarification.statut)}
                {tarification.statut}
            </span>
                    </div>
                </div>

                {/* Cartes d'information principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Carte tarif client */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-green-600 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-green-900/50 rounded-xl">
                                    <FaDollarSign className="text-green-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-green-400">Tarif Client</h3>
                                    <p className="text-gray-400 text-sm">Montant facturé au client</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white mb-2">
                                {tarification.tarifClient} MAD
                            </div>
                            <div className="text-gray-400">TTC</div>
                        </div>
                    </motion.div>

                    {/* Carte tarif prestataire */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-blue-600 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-900/50 rounded-xl">
                                    <GiTakeMyMoney className="text-blue-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-400">Tarif Prestataire</h3>
                                    <p className="text-gray-400 text-sm">Montant versé au transporteur</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white mb-2">
                                {tarification.tarifPrestataire} MAD
                            </div>
                            <div className="text-gray-400">HT</div>
                        </div>
                    </motion.div>

                    {/* Carte marge service */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-yellow-900/50 rounded-xl">
                                    <FaPercentage className="text-yellow-400 text-2xl" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-yellow-400">Marge Service</h3>
                                    <p className="text-gray-400 text-sm">Bénéfice de la plateforme</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-5xl font-bold text-white mb-2">
                                {tarification.margeService} MAD
                            </div>
                            <div className="text-yellow-500 font-semibold">
                                {((tarification.margeService / tarification.tarifClient) * 100).toFixed(1)}%
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Détails de la tarification */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Informations de base */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-bold text-yellow-400 mb-6 flex items-center gap-2">
                            <FaInfoCircle /> Informations de base
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-sm">ID Demande</div>
                                    <div className="text-white font-bold">{tarification.demandeId}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">ID Itinéraire</div>
                                    <div className="text-white font-bold">{tarification.itineraireId}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-sm">Client ID</div>
                                    <div className="text-white font-bold">{tarification.clientId}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Chauffeur ID</div>
                                    <div className="text-white font-bold">{tarification.chauffeurId || "Non assigné"}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-sm">Type de route</div>
                                    <div className="text-white font-bold">{tarification.typeRoute || "Non spécifié"}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Retour inclus</div>
                                    <div className={`font-bold ${tarification.inclureRetour ? "text-green-400" : "text-red-400"}`}>
                                        {tarification.inclureRetour ? "Oui" : "Non"}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Caractéristiques du transport */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-blue-600 rounded-2xl p-6"
                    >
                        <h3 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-2">
                            <FaTruck /> Caractéristiques
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <FaCube className="text-blue-500" />
                                    <div>
                                        <div className="text-gray-400 text-sm">Volume</div>
                                        <div className="text-white font-bold">{tarification.volume} m³</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaWeightHanging className="text-blue-500" />
                                    <div>
                                        <div className="text-gray-400 text-sm">Poids</div>
                                        <div className="text-white font-bold">{tarification.poids} kg</div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaRoad className="text-blue-500" />
                                <div className="flex-1">
                                    <div className="text-gray-400 text-sm">Distance</div>
                                    <div className="text-white font-bold">{tarification.distanceKm} km</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <FaTruck className="text-blue-500" />
                                <div className="flex-1">
                                    <div className="text-gray-400 text-sm">Nature de la marchandise</div>
                                    <div className="text-white font-bold">{tarification.natureMarchandise}</div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <div className="text-gray-400 text-sm">Fragile</div>
                                    <div className={`font-bold ${tarification.fragile ? "text-red-400" : "text-green-400"}`}>
                                        {tarification.fragile ? "Oui" : "Non"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-sm">Température requise</div>
                                    <div className="text-white font-bold">{tarification.temperatureRequise || "Ambiente"}</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Dates et timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-purple-600 rounded-2xl p-6 mb-6"
                >
                    <h3 className="text-xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                        <FaHistory /> Chronologie
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-gray-400 mb-2">Date de création</div>
                            <div className="text-white font-bold">{formatDate(tarification.dateCreation)}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-400 mb-2">Date d'expiration</div>
                            <div className={`font-bold ${new Date(tarification.dateExpiration) > new Date() ? "text-green-400" : "text-red-400"}`}>
                                {formatDate(tarification.dateExpiration)}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-gray-400 mb-2">Date de validation</div>
                            <div className="text-white font-bold">
                                {tarification.dateValidation ? formatDate(tarification.dateValidation) : "En attente"}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-gray-700 rounded-2xl p-6"
                >
                    <h3 className="text-xl font-bold text-white mb-6">Actions</h3>
                    <div className="flex flex-wrap gap-4">
                        {tarification.statut === "EN_ATTENTE" && (
                            <button
                                onClick={handleValider}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold rounded-lg hover:from-green-500 hover:to-green-400 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Validation...
                                    </>
                                ) : (
                                    <>
                                        <FaCheckCircle /> Valider la tarification
                                    </>
                                )}
                            </button>
                        )}

                        {tarification.statut === "VALIDE" && (
                            <button
                                onClick={handlePayer}
                                disabled={actionLoading}
                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {actionLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Paiement...
                                    </>
                                ) : (
                                    <>
                                        <GiTakeMyMoney /> Marquer comme payée
                                    </>
                                )}
                            </button>
                        )}

                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default TarificationDetail;