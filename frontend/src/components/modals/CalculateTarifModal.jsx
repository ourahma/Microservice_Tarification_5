import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaTimes, FaCalculator, FaRoute, FaUndo, FaCheck } from "react-icons/fa";

const CalculateTarifModal = ({ demande, onSubmit, onClose }) => {
    const [formData, setFormData] = useState({
        demandeId: demande.demandeId,
        itineraireId: demande.itineraireAssocieId,
        typeRoute: "ROUTE_NATIONALE",
        inclureRetour: false
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit(formData);
        } finally {
            setLoading(false);
        }
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
                className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border-2 border-yellow-600 rounded-2xl shadow-2xl max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-yellow-600 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-900/50 rounded-lg">
                            <FaCalculator className="text-yellow-500 text-xl" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-yellow-400">Calculer un devis</h2>
                            <p className="text-gray-400 text-sm">Demande #{demande.demandeId}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <FaTimes className="text-yellow-500" />
                    </button>
                </div>

                {/* Formulaire */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Type de route */}
                    <div>
                        <label className="block text-yellow-500 font-semibold mb-3 flex items-center gap-2">
                            <FaRoute /> Type de route
                        </label>
                        <div className="space-y-2">
                            {["ROUTE_NATIONALE", "AUTOROUTE", "VILLE", "MIXTE"].map((type) => (
                                <div key={type} className="flex items-center">
                                    <input
                                        type="radio"
                                        id={`type-${type}`}
                                        name="typeRoute"
                                        value={type}
                                        checked={formData.typeRoute === type}
                                        onChange={(e) => setFormData({...formData, typeRoute: e.target.value})}
                                        className="sr-only"
                                    />
                                    <label
                                        htmlFor={`type-${type}`}
                                        className={`flex-1 px-4 py-3 rounded-lg cursor-pointer transition-all ${
                                            formData.typeRoute === type
                                                ? "bg-yellow-600 text-black font-bold"
                                                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                                        }`}
                                    >
                                        {type.replace("_", " ")}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Inclure retour */}
                    <div className="bg-gray-900/50 border border-yellow-600/30 rounded-xl p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-900/30 rounded-lg">
                                    <FaUndo className="text-yellow-500" />
                                </div>
                                <div>
                                    <div className="text-yellow-400 font-semibold">Inclure le retour</div>
                                    <div className="text-gray-400 text-sm">Calculer le tarif aller-retour</div>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.inclureRetour}
                                    onChange={(e) => setFormData({...formData, inclureRetour: e.target.checked})}
                                    className="sr-only peer"
                                />
                                <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-yellow-600"></div>
                            </label>
                        </div>

                        {formData.inclureRetour && demande.itineraire && (
                            <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-600/30">
                                <div className="text-yellow-400 text-sm font-semibold mb-1">Distance aller-retour:</div>
                                <div className="text-white font-bold">
                                    {demande.itineraire.distanceKm} km × 2 = {demande.itineraire.distanceKm * 2} km
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Résumé */}
                    <div className="bg-gray-900/50 border border-blue-600/30 rounded-xl p-4">
                        <h4 className="text-blue-400 font-semibold mb-3">Résumé de la demande</h4>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Volume:</span>
                                <span className="text-white">{demande.volume} m³</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Poids:</span>
                                <span className="text-white">{demande.poids} kg</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Distance:</span>
                                <span className="text-white">{demande.itineraire?.distanceKm || 0} km</span>
                            </div>
                            {formData.inclureRetour && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Distance totale:</span>
                                    <span className="text-yellow-400 font-semibold">
                    {demande.itineraire?.distanceKm * 2 || 0} km
                  </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-600 text-yellow-500 font-bold rounded-lg hover:from-gray-600 hover:to-gray-500 transition-all flex-1 disabled:opacity-50"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Calcul en cours...
                                </>
                            ) : (
                                <>
                                    <FaCheck /> Calculer le devis
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CalculateTarifModal;