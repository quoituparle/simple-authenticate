import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './App.css'
import axios from 'axios'

function Login() {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleLogin = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!email.trim() || !password.trim()) {
            setError('Please fill all the information required')
            return
        };

        setLoading(true);
        setError(null);

        try{
            const data = {email, password}
            const response = await axios.post('/api/login/', data)
            console.log('Login success', response.data)
            navigate('/')
        } catch(err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status;
                const serverError = err.response?.data?.detail || 'Something went wrong'
                
                if (status === 403 ) {
                    setError(serverError)
                    navigate('/verify-email', { state: { email: email } });   
                    await axios.post('/api/resend-verification-email/', { email });
                } else {
                    setError(serverError)
                }
            }
        } finally {
            setLoading(false);
        };
    };

    return(
        <div className="container">
            <h1>Login</h1>
            <div className="submit-form">
                <form onSubmit={handleLogin}> 
                    <div>
                        <label htmlFor="email">Email: </label>
                        <input
                            type="email" 
                            placeholder="Enter the email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password: </label>
                        <input
                            type="password" 
                            placeholder="Enter the password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="error-placeholder">
                        {error && <div className="error">{error}</div>}                        
                    </div>
                    
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Login'}
                    </button>
                </form>
            </div>

            <p>
                Don't have an account? <Link to="/register">Sign up</Link>
            </p>
        </div>
    )
};

export default Login