import React from "react";
import { motion } from "framer-motion";
import {
    FaTimes,
    FaMapMarkerAlt,
    FaWeightHanging,
    FaCube,
    FaTruck,
    FaCalendarAlt,
    FaRoad,
    FaClock,
    FaDollarSign,
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle
} from "react-icons/fa";
import { IoMdSpeedometer } from "react-icons/io";

const DemandeDetailModal = ({ demande, onClose, onCalculateTarif }) => {
    if (!demande) return null;

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

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25 }}
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-yellow-600 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="sticky top-0 bg-gray-900/95 backdrop-blur-sm border-b border-yellow-600 p-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-yellow-400">
                            Détails de la demande #{demande.demandeId}
                        </h2>
                        <p className="text-gray-400">Informations complètes et itinéraire associé</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <FaTimes className="text-yellow-500 text-xl" />
                    </button>
                </div>

                {/* Contenu */}
                <div className="p-6 space-y-6">
                    {/* Informations générales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-900/50 border border-yellow-600/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                                <FaInfoCircle /> Informations générales
                            </h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Client ID:</span>
                                    <span className="text-yellow-400 font-semibold">{demande.clientId}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Statut validation:</span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                        demande.statutValidation === "VALIDE" ? "bg-green-900 text-green-400" :
                                            demande.statutValidation === "EN_ATTENTE" ? "bg-yellow-900 text-yellow-400" :
                                                demande.statutValidation === "REJETE" ? "bg-red-900 text-red-400" :
                                                    "bg-gray-800 text-gray-400"
                                    }`}>
                    {demande.statutValidation || "Non défini"}
                  </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-400">Date de départ:</span>
                                    <span className="text-white font-semibold">{formatDate(demande.dateDepart)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-900/50 border border-yellow-600/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                                <FaTruck /> Caractéristiques de la marchandise
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <FaCube className="text-yellow-500" />
                                    <div className="flex-1">
                                        <div className="text-gray-400">Volume</div>
                                        <div className="text-white font-semibold">{demande.volume || 0} m³</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaWeightHanging className="text-yellow-500" />
                                    <div className="flex-1">
                                        <div className="text-gray-400">Poids</div>
                                        <div className="text-white font-semibold">{demande.poids || 0} kg</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <FaTruck className="text-yellow-500" />
                                    <div className="flex-1">
                                        <div className="text-gray-400">Nature de la marchandise</div>
                                        <div className="text-white font-semibold">{demande.natureMarchandise || "Non spécifiée"}</div>
                                    </div>
                                </div>
                                {demande.categorie && (
                                    <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                                        <div className="text-yellow-500 font-semibold mb-1">Catégorie:</div>
                                        <div className="text-white">{demande.categorie.nom}</div>
                                        {demande.categorie.fragile && (
                                            <div className="text-red-400 text-sm mt-1">⚠️ Marchandise fragile</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Route */}
                    <div className="bg-gray-900/50 border border-yellow-600/30 rounded-xl p-6">
                        <h3 className="text-lg font-bold text-yellow-500 mb-4 flex items-center gap-2">
                            <FaRoad /> Trajet
                        </h3>
                        <div className="flex items-center justify-between mb-6">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400 mb-2">{demande.villeDepart || "Non spécifié"}</div>
                                <div className="text-gray-400">Ville de départ</div>
                            </div>
                            <div className="flex-1 mx-8 relative">
                                <div className="h-2 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 rounded-full"></div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black border-2 border-yellow-600 rounded-full p-2">
                                    <FaMapMarkerAlt className="text-yellow-500 text-xl" />
                                </div>
                                <div className="text-center mt-4 text-yellow-500 font-semibold">
                                    {demande.distanceDemande ? `${demande.distanceDemande} km` : "Distance à calculer"}
                                </div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-400 mb-2">{demande.villeDestination || "Non spécifié"}</div>
                                <div className="text-gray-400">Ville de destination</div>
                            </div>
                        </div>
                    </div>

                    {/* Itinéraire */}
                    {demande.itineraireExists && demande.itineraire ? (
                        <div className="bg-gray-900/50 border border-green-600/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-green-500 mb-4 flex items-center gap-2">
                                <FaMapMarkerAlt /> Itinéraire disponible
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaRoad className="text-green-500" />
                                        <div className="text-green-400 font-semibold">Distance</div>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{demande.itineraire.distanceKm || 0} km</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FaClock className="text-green-500" />
                                        <div className="text-green-400 font-semibold">Durée</div>
                                    </div>
                                    <div className="text-3xl font-bold text-white">{demande.itineraire.durationMin || 0} min</div>
                                </div>
                                <div className="bg-gray-800/50 rounded-lg p-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <IoMdSpeedometer className="text-green-500" />
                                        <div className="text-green-400 font-semibold">Statut</div>
                                    </div>
                                    <div className="text-xl font-bold text-white">{demande.itineraire.status || "Non spécifié"}</div>
                                </div>
                            </div>

                            {demande.itineraire.originCity && demande.itineraire.destinationCity && (
                                <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="text-yellow-500 font-semibold">Origine exacte:</div>
                                            <div className="text-white">{demande.itineraire.originAddress}, {demande.itineraire.originCity}</div>
                                        </div>
                                        <div>
                                            <div className="text-yellow-500 font-semibold">Destination exacte:</div>
                                            <div className="text-white">{demande.itineraire.destinationAddress}, {demande.itineraire.destinationCity}</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 border border-red-600/30 rounded-xl p-6">
                            <div className="text-center">
                                <FaTimesCircle className="text-red-500 text-4xl mx-auto mb-4" />
                                <h4 className="text-xl font-bold text-red-400 mb-2">Aucun itinéraire disponible</h4>
                                <p className="text-gray-400">Cette demande n'a pas d'itinéraire associé pour le moment.</p>
                            </div>
                        </div>
                    )}

                    {/* Tarification existante */}
                    {demande.tarifExists && demande.tarification && (
                        <div className="bg-gray-900/50 border border-blue-600/30 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-blue-500 mb-4 flex items-center gap-2">
                                <FaDollarSign /> Tarification existante
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-900/30 rounded-lg p-4">
                                    <div className="text-blue-400 font-semibold mb-1">Tarif Client</div>
                                    <div className="text-2xl font-bold text-white">{demande.tarification.tarifClient || 0} MAD</div>
                                </div>
                                <div className="bg-green-900/30 rounded-lg p-4">
                                    <div className="text-green-400 font-semibold mb-1">Tarif Prestataire</div>
                                    <div className="text-2xl font-bold text-white">{demande.tarification.tarifPrestataire || 0} MAD</div>
                                </div>
                                <div className="bg-yellow-900/30 rounded-lg p-4">
                                    <div className="text-yellow-400 font-semibold mb-1">Marge Service</div>
                                    <div className="text-2xl font-bold text-white">{demande.tarification.margeService || 0} MAD</div>
                                </div>
                            </div>
                            <div className="mt-4 text-center">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    demande.tarification.statut === "VALIDE" ? "bg-green-900 text-green-400" :
                        demande.tarification.statut === "EN_ATTENTE" ? "bg-yellow-900 text-yellow-400" :
                            demande.tarification.statut === "PAYE" ? "bg-blue-900 text-blue-400" :
                                "bg-gray-800 text-gray-400"
                }`}>
                  Statut: {demande.tarification.statut || "Non défini"}
                </span>
                            </div>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-gray-800">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-500 font-bold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all flex-1"
                        >
                            Fermer
                        </button>

                        {demande.itineraireExists && !demande.tarifExists && (
                            <button
                                onClick={onCalculateTarif}
                                className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all flex-1 flex items-center justify-center gap-2"
                            >
                                <FaDollarSign /> Calculer un devis
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DemandeDetailModal;