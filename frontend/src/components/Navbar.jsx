import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    FaTruck,
    FaHome,
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaDollarSign,
    FaListAlt,
} from "react-icons/fa";

const Navbar = () => {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const userRole = localStorage.getItem("role") || "USER";
    const userName = localStorage.getItem("userName") || "Utilisateur";

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("role");
        localStorage.removeItem("userName");
        navigate("/login");
    };

    const menuItems = [
        //{ to: "/", icon: <FaHome />, label: "Dashboard", roles: ["ADMIN", "PRESTATAIRE", "CLIENT"] },
        { to: "/tarifications", icon: <FaDollarSign />, label: "Tarifications", roles: ["ADMIN", "PRESTATAIRE", "CLIENT"] },
        { to: "/Dashboard", icon: <FaListAlt />, label: "Dashboard", roles: ["ADMIN"] },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.roles.includes(userRole)
    );

    return (
        <>
            {/* Navbar principale */}
            <nav className="sticky top-0 z-50 bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b-2 border-yellow-600 shadow-2xl">
                <div className="min-w-screen mx-auto px-4 py-2 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo et marque */}
                        <div className="flex items-center">
                            <Link to="/" className="flex items-center space-x-3">
                                <motion.div
                                    whileHover={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-gradient-to-br from-yellow-600 to-yellow-500 p-2 rounded-xl"
                                >
                                    <FaTruck className="text-black text-sm" />
                                </motion.div>
                                <div>
                                    <h4 className="font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-yellow-300">
                                        Transport des marchandises.
                                    </h4>
                                    <p className="text-xs text-gray-400">Service de Tarification</p>
                                </div>
                            </Link>
                        </div>

                        {/* Menu desktop */}
                        <div className="hidden md:block">
                            <div className="flex items-center space-x-1">
                                {filteredMenuItems.map((item) => (
                                    <Link
                                        key={item.to}
                                        to={item.to}
                                        className="group relative px-4 py-2 text-gray-300 hover:text-yellow-400 transition-colors"
                                    >
                                        <div className="flex items-center space-x-2">
                                            <span className="text-lg">{item.icon}</span>
                                            <span className="font-medium">{item.label}</span>
                                        </div>
                                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Section utilisateur et actions */}
                        <div className="flex items-center space-x-4">
                            {/* Badge rôle */}
                            <div className="hidden md:flex items-center space-x-2 bg-gray-800/50 px-4 py-2 rounded-full border border-yellow-600/30">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                <span className="text-yellow-400 font-semibold text-sm">
                  {userRole}
                </span>
                                <span className="text-gray-400">|</span>
                                <span className="text-white text-sm">{userName}</span>
                            </div>

                            {/* Bouton déconnexion */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLogout}
                                className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all shadow-lg"
                            >
                                <FaSignOutAlt />
                                <span>Déconnexion</span>
                            </motion.button>

                            {/* Bouton menu mobile */}
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-yellow-500"
                            >
                                {isMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Menu mobile */}
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="md:hidden bg-gradient-to-b from-gray-900 to-black border-b border-yellow-600"
                    >
                        <div className="px-4 py-3 space-y-2">
                            {filteredMenuItems.map((item) => (
                                <Link
                                    key={item.to}
                                    to={item.to}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-gray-800/50 rounded-lg transition-colors"
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            ))}

                            {/* Info utilisateur mobile */}
                            <div className="px-4 py-3 border-t border-gray-800 mt-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                                        <div>
                                            <p className="text-yellow-400 font-semibold">{userRole}</p>
                                            <p className="text-gray-400 text-sm">{userName}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Bouton déconnexion mobile */}
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-500 hover:to-red-400 transition-all mt-2"
                            >
                                <FaSignOutAlt />
                                <span>Déconnexion</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Indicateur de connexion */}
            <div className="fixed bottom-4 right-4 z-40">
                <div className="flex items-center space-x-2 bg-black/80 backdrop-blur-sm border border-yellow-600 rounded-full px-4 py-2 shadow-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-gray-300">Connecté</span>
                    <div className="text-yellow-500 text-sm font-semibold">{userRole}</div>
                </div>
            </div>
        </>
    );
};

export default Navbar;