import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
    const { status, isAuthenticated, isAdmin } = useAuth();

    if (status === 'loading') {
        return <div>Loading...</div>
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace/>
    }
    else if (isAuthenticated && !isAdmin) {
        return <Navigate to="/" replace />
    }
    return children;
};