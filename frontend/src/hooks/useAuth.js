// hooks/useAuth.js
import { useState, useEffect } from 'react';

const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:8081/api/auth";

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('authToken');

            if (!token) {
                setIsAuthenticated(false);
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/check-session`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.authenticated) {
                setIsAuthenticated(true);
                setUserRole(data.user.role);
                setUserInfo(data.user);

                // Mettre à jour le localStorage
                localStorage.setItem('role', data.user.role);
                localStorage.setItem('userId', data.user.id);
                localStorage.setItem('username', data.user.username);
                localStorage.setItem('userEmail', data.user.email);
                localStorage.setItem('fullName', data.user.fullName);
            } else {
                // Token expiré, essayer de le rafraîchir
                await refreshToken();
            }
        } catch (error) {
            console.error('Erreur de vérification d\'authentification:', error);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const refreshToken = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                logout();
                return;
            }

            const response = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken })
            });

            const data = await response.json();

            if (response.ok && data.token) {
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);

                // Re-vérifier l'authentification
                await checkAuth();
            } else {
                logout();
            }
        } catch (error) {
            console.error('Erreur lors du rafraîchissement du token:', error);
            logout();
        }
    };

    const login = async (username, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker les tokens et informations
                localStorage.setItem('authToken', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('role', data.role);
                localStorage.setItem('userId', data.id);
                localStorage.setItem('username', data.username);
                localStorage.setItem('userEmail', data.email);
                localStorage.setItem('fullName', data.fullName || data.username);

                // Stocker la date d'expiration
                const expiresAt = new Date();
                expiresAt.setSeconds(expiresAt.getSeconds() + (data.expiresIn || 3600));
                localStorage.setItem('expiresAt', expiresAt.toISOString());

                setIsAuthenticated(true);
                setUserRole(data.role);
                setUserInfo(data);

                return { success: true, data };
            } else {
                return { success: false, error: data.message || 'Échec de l\'authentification' };
            }
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = () => {
        // Appeler l'API de déconnexion
        fetch(`${API_URL}/logout`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        }).catch(console.error);

        // Nettoyer le localStorage
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('fullName');

        setIsAuthenticated(false);
        setUserRole(null);
        setUserInfo(null);
    };

    const getUserRole = () => {
        return localStorage.getItem('role');
    };

    const getUserInfo = () => {
        return {
            id: localStorage.getItem('userId'),
            username: localStorage.getItem('username'),
            email: localStorage.getItem('userEmail'),
            role: localStorage.getItem('role'),
            fullName: localStorage.getItem('fullName'),
            isVerified: localStorage.getItem('isVerified') === 'true',
            isActive: localStorage.getItem('isActive') === 'true'
        };
    };

    const hasRole = (requiredRole) => {
        const userRole = getUserRole();
        if (!userRole) return false;

        // Logique de hiérarchie des rôles
        const roleHierarchy = {
            'ADMIN': ['ADMIN', 'PRESTATAIRE', 'CLIENT'],
            'PRESTATAIRE': ['PRESTATAIRE', 'CLIENT'],
            'CLIENT': ['CLIENT']
        };

        return roleHierarchy[userRole]?.includes(requiredRole) || false;
    };

    return {
        isAuthenticated,
        userRole,
        userInfo,
        loading,
        login,
        logout,
        checkAuth,
        getUserRole,
        getUserInfo,
        hasRole,
        refreshToken
    };
};

export default useAuth;