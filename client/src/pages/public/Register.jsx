import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Register() {
    const [first_name, setFirst_name] = useState('');
    const [last_name, setLast_name] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const { register } = useAuth();

    async function handleSubmit(event) {
        event.preventDefault();
        setError(null);
        const result = await register({ first_name, last_name, email: email.trim(), password })

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
        <form onSubmit={handleSubmit}>
            <h2>Register</h2>

            <div>
                <label>First Name:</label>
                <input type="text" value={first_name} onChange={(e) => setFirst_name(e.target.value)} required />
            </div>

            <div>
                <label>Last Name:</label>
                <input type="text" value={last_name} onChange={(e) => setLast_name(e.target.value)} required />
            </div>

            <div>
                <label>Email:</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
                <label>Password:</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <button type="submit" disabled={isSubmitting}>
                Register
            </button>
        </form>
    )
}