import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaTruck,
    FaUser,
    FaLock,
    FaEye,
    FaEyeSlash,
} from "react-icons/fa";

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const API_URL = "http://localhost:8081/api/auth";

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        console.log(formData);
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Échec de l'authentification");
            }

            // Stocker les informations de l'utilisateur
            localStorage.setItem("authToken", data.token);
            localStorage.setItem("refreshToken", data.refreshToken);
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", data.username);
            localStorage.setItem("userId", data.id);
            localStorage.setItem("userEmail", data.email);
            localStorage.setItem("fullName", data.fullName || data.username);
            localStorage.setItem("isVerified", data.isVerified);
            localStorage.setItem("isActive", data.isActive);
            localStorage.setItem("id",data.id);

            // Stocker la date d'expiration
            const expiresAt = new Date();
            expiresAt.setSeconds(expiresAt.getSeconds() + (data.expiresIn || 3600));
            localStorage.setItem("expiresAt", expiresAt.toISOString());
            console.log(data);
            // Naviguer vers le dashboard
            navigate("/");


        } catch (err) {
            setError(err.message || "Identifiants incorrects");
        } finally {
            setLoading(false);
        }
    };


    const handleTestLogin = (role) => {
        const testAccounts = {
            ADMIN: { email: "admin@gmail.com", password: "123456" },
            PRESTATAIRE: { email: "presta", password: "presta123" },
            CLIENT: { email: "client@gmail.com", password: "123456" }
        };

        setFormData(testAccounts[role]);
    };

    return (
        <div className="w-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
            {/* Décorations */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 w-64 h-64 bg-yellow-600 rounded-full filter blur-3xl opacity-20"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 right-20 w-80 h-80 bg-yellow-500 rounded-full filter blur-3xl opacity-20"
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block p-4 bg-gradient-to-br from-yellow-600 to-yellow-500 rounded-2xl mb-4"
                    >
                        <FaTruck className="text-black text-4xl" />
                    </motion.div>
                    <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300 mb-2">
                        Transport de Marchandise
                    </h1>
                    <p className="text-gray-400">Service de Tarification</p>
                </div>

                {/* Carte de connexion */}
                <div className="bg-gradient-to-br from-black via-gray-900 to-black border-2 border-yellow-600 rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-bold text-yellow-400 mb-6 text-center">
                         Connexion
                    </h2>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`mb-6 p-4 rounded-lg border ${
                                error.includes("succès")
                                    ? "bg-green-900/30 border-green-600 text-green-400"
                                    : "bg-red-900/30 border-red-600 text-red-400"
                            }`}
                        >
                            {error}
                        </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-yellow-500 font-semibold mb-3 flex items-center gap-2">
                                <FaUser /> Nom d'utilisateur
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    className="w-full px-4 py-3 pl-12 bg-gray-900 border-2 border-yellow-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                    placeholder="admin"
                                    required
                                />
                                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-yellow-500 font-semibold mb-3 flex items-center gap-2">
                                <FaLock /> Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    className="w-full px-4 py-3 pl-12 pr-12 bg-gray-900 border-2 border-yellow-600 rounded-lg text-white focus:outline-none focus:border-yellow-400 transition-colors"
                                    placeholder="••••••••"
                                    required
                                />
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-500" />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-yellow-500 hover:text-yellow-400"
                                >
                                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                                </button>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold rounded-lg hover:from-yellow-500 hover:to-yellow-400 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                    Connexion en cours...
                                </>
                            ) : (
                                <>
                                    <FaUser /> Se connecter
                                </>
                            )}
                        </motion.button>
                    </form>

                    {/* Boutons de connexion test */}
                    <div className="mt-8 pt-6 border-t border-gray-800">
                        <h4 className="text-yellow-500 font-semibold mb-3 text-center">Connexion test :</h4>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleTestLogin("ADMIN")}
                                className="px-3 py-2 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm font-semibold"
                            >
                                Admin
                            </button>
                            <button
                                onClick={() => handleTestLogin("PRESTATAIRE")}
                                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm font-semibold"
                            >
                                Prestataire
                            </button>
                            <button
                                onClick={() => handleTestLogin("CLIENT")}
                                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm font-semibold"
                            >
                                Client
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;