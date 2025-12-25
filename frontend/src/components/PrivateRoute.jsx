import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaShieldAlt, FaLock, FaUserLock } from "react-icons/fa";

const PrivateRoute = ({ children, roles = [] }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [userRole, setUserRole] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const role = localStorage.getItem("role");

        setIsAuthenticated(!!token);
        setUserRole(role);
    }, []);

    if (isAuthenticated === null) {
        // En cours de vérification
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-16 h-16 border-4 border-yellow-600 border-t-transparent rounded-full mx-auto mb-4"
                    />
                    <p className="text-yellow-400 text-xl">Vérification des permissions...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        // Non authentifié
        return (
            <div className="min-w-screen min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl p-12 max-w-md"
                >
                    <FaUserLock className="text-yellow-500 text-5xl mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-yellow-400 mb-4">Accès non autorisé</h2>
                    <p className="text-gray-400 mb-6">
                        Vous devez être connecté pour accéder à cette page.
                    </p>
                    <button
                        onClick={() => window.location.href = "/login"}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
                    >
                        Se connecter
                    </button>
                </motion.div>
            </div>
        );
    }

    if (roles.length > 0 && !roles.includes(userRole)) {
        // Rôle insuffisant
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center bg-gradient-to-br from-black via-gray-900 to-black border-2 border-red-600 rounded-2xl p-12 max-w-md"
                >
                    <FaLock className="text-red-500 text-5xl mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Permission refusée</h2>
                    <p className="text-gray-400 mb-2">
                        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                    </p>
                    <p className="text-yellow-400 mb-6">
                        Rôle requis: {roles.join(", ")}<br />
                        Votre rôle: {userRole}
                    </p>
                    <button
                        onClick={() => window.location.href = "/"}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all"
                    >
                        Retour au dashboard
                    </button>
                </motion.div>
            </div>
        );
    }

    // Accès autorisé
    return children;
};

export default PrivateRoute;