import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { login } = useAuth();

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        const result = await login({ email: email.trim(), password });

        if (result.ok === true) {
            navigate('/profile');
            setIsSubmitting(true);
        }
        else {
            setError(result.message);
        }

        setIsSubmitting(false);
    }

    return (
        <div className="page">
            <form onSubmit={handleSubmit}>
                <h2>Login</h2>

                <div>
                    <label>Email:</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div>
                    <label>Password:</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    Log In
                </button>
            </form>
        </div>
    );
};