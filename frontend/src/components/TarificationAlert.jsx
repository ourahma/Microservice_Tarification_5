import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaDollarSign,
    FaClipboardCheck,
    FaClock,
    FaTimes
} from "react-icons/fa";

const TarificationAlert = ({ alert, onClose }) => {
    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => {
                onClose();
            }, 8000);
            return () => clearTimeout(timer);
        }
    }, [alert, onClose]);

    if (!alert) return null;

    const getAlertConfig = () => {
        switch (alert.type) {
            case "success":
                return {
                    icon: <FaCheckCircle className="text-3xl" />,
                    bgColor: "from-green-900 to-green-800",
                    borderColor: "border-green-600",
                    iconColor: "text-green-500",
                    title: "Succès !"
                };
            case "error":
                return {
                    icon: <FaTimesCircle className="text-3xl" />,
                    bgColor: "from-red-900 to-red-800",
                    borderColor: "border-red-600",
                    iconColor: "text-red-500",
                    title: "Erreur !"
                };
            case "info":
                return {
                    icon: <FaInfoCircle className="text-3xl" />,
                    bgColor: "from-blue-900 to-blue-800",
                    borderColor: "border-blue-600",
                    iconColor: "text-blue-500",
                    title: "Information"
                };
            default:
                return {
                    icon: <FaInfoCircle className="text-3xl" />,
                    bgColor: "from-gray-900 to-gray-800",
                    borderColor: "border-yellow-600",
                    iconColor: "text-yellow-500",
                    title: "Notification"
                };
        }
    };


    const config = getAlertConfig();

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                className="fixed top-6 right-6 z-500 max-w-md w-full"
            >
                <div className={`bg-gradient-to-br ${config.bgColor} border-2 ${config.borderColor} rounded-2xl shadow-2xl overflow-hidden`}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 ${config.iconColor} bg-black/30 rounded-lg`}>
                                {config.icon}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{config.title}</h3>
                                <p className="text-gray-400 text-sm">{alert.message}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-800 rounded-full transition-colors"
                        >
                            <FaTimes className="text-gray-400" />
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="p-4">
                        {alert.tarification ? (
                            <div className="space-y-4">
                                <div className="bg-black/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <FaClipboardCheck className="text-yellow-500" />
                                        <h4 className="text-yellow-400 font-semibold">Tarification créée</h4>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mb-3">
                                        <div className="bg-gray-900/50 rounded-lg p-3">
                                            <div className="text-gray-400 text-sm">Tarif Client</div>
                                            <div className="text-2xl font-bold text-green-400">
                                                {alert.tarification.tarifClient} MAD
                                            </div>
                                        </div>
                                        <div className="bg-gray-900/50 rounded-lg p-3">
                                            <div className="text-gray-400 text-sm">Tarif Prestataire</div>
                                            <div className="text-2xl font-bold text-blue-400">
                                                {alert.tarification.tarifPrestataire} MAD
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-900/50 rounded-lg p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <FaDollarSign className="text-yellow-500" />
                                                <span className="text-gray-400">Marge Service:</span>
                                            </div>
                                            <span className="text-yellow-400 font-bold">
                        {alert.tarification.margeService} MAD
                      </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <FaClock className="text-yellow-500" />
                                            <span className="text-gray-400">Statut:</span>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            alert.tarification.statut === "EN_ATTENTE"
                                                ? "bg-yellow-900 text-yellow-400"
                                                : "bg-green-900 text-green-400"
                                        }`}>
                      {alert.tarification.statut}
                    </span>
                                    </div>
                                </div>

                                <div className="text-center">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-semibold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
                                    >
                                        Compris
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-gray-300">{alert.details}</p>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default TarificationAlert;