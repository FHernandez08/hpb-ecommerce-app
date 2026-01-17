import { createContext, useContext, useEffect, useState } from "react";
import axios from 'axios';

// creates the context
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    // adding state
    const [status, setStatus] = useState("loading");
    const [user, setUser] = useState(null);

    // derived helpers = values that are calculated from state
    // it keeps logic centralized & prevents repeated checks across components
    const isAuthenticated = status === "authed";
    const isAdmin = user?.role === "admin";

    // securely renews the user's authentication status
    async function refreshSession() {
        try {
            const response = await axios.get('/api/users/me', {
                withCredentials: true
            });

            if (response.status === 200) {
                setUser(response.data.user);
                setStatus("authed");
            };

        }
        catch (error) {
            console.log(error)
            if (error.response?.status === 401) {
                setStatus("unauthed");
                setUser(null);
            }
        }
    }

    // Login action
    async function login(credentials) {
        try {
            const response = await axios.post('/api/auth/login', credentials,{
                withCredentials: true
            });

            if (response.status === 200) {
                await refreshSession();
                return { ok: true }
            };
        }
        catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                setStatus("unauthed");
                setUser(null);
            };
        }
    }

    // Register action
    async function register(payload) {
        try {
            const response = await axios.post('/api/auth/register', payload,{
                withCredentials: true
            });

            if (response.status === 201) {
                await refreshSession();
                return { ok: true }
            };
        }
        catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                setStatus("unauthed");
                setUser(null);
            };
        }
    }

    // Logout action
    async function logout() {
        try {
            const response = await axios.post('/api/auth/logout', null,{
                withCredentials: true
            });

            if (response.status === 204) {
                setStatus("unauthed");
                setUser(null);
            };
        }
        catch (error) {
            if (error.response?.status === 401) {
                console.log("Unauthorized");
            };
        }
    }

    useEffect(() => {
        refreshSession()
    }, [])

    // Provider value
    const value = {
        status,
        user,
        isAuthenticated,
        isAdmin,
        refreshSession,
        login,
        register,
        logout

    }
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
    return useContext(AuthContext);
}