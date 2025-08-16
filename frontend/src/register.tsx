import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import './App.css'
import axios from 'axios'


function Registration () {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [password2, setPassword2] = useState<string>('');
    const [full_name, setFull_name] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [password2Error, setPassword2Error] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!email.trim() || !password.trim() || !full_name.trim()){
            setError('Please fill all the information required')
            return;
        };
        
        if (passwordError) {
            return
        };

        setLoading(true);
        setError(null);
        
        try{
            const data = { email, password, full_name}
            const response = await axios.post('/api/register/', data)
            console.log('Sign up success', response.data)
            navigate('/verify-email', { state: { email: email } })

        } catch (err) {
            if (axios.isAxiosError(err)){
                const serverError = err.response?.data?.detail || 'Something went wrong'
                setError(serverError)
                setLoading(false)
            };
        } finally {
            setLoading(false);
        };
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password = e.target.value;
        setPassword(password);

        if (password.trim().length < 8) {
            setPasswordError('The password must be at least 8 characters long')
        } else {
            setPasswordError(null);
        };
    };

    const handlePassword2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
        const password2 = e.target.value;
        setPassword2(password2);

        if (password !== password2) {
            setPassword2Error('Password do not match')
        } else {
            setPassword2Error(null);
        };
    };

    return(
        <div className="container">
            <h1>Sign up</h1>
            <div className="submit-form">
                <form onSubmit={handleSubmit}> 
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
                            onChange={handlePasswordChange}
                        />
                        <div className="error-placeholder">
                            {passwordError && <div className="pass-error">{passwordError}</div>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password">verify your Password: </label>
                        <input
                            type="password" 
                            placeholder="Reenter the password"
                            value={password2}
                            onChange={handlePassword2Change}
                        />
                        <div className="error-placeholder">
                            {password2Error && <div className="pass-error">{password2Error}</div>}                            
                        </div>
                    </div>
                    <div>
                        <label htmlFor="full_name">Full name: </label>
                        <input
                            type="text"
                            placeholder="Enter your full name"
                            value={full_name}
                            onChange={(e) => setFull_name(e.target.value)}
                        />
                    </div>

                    <div className="error-placeholder">
                        {error && <div className="error">{error}</div>}                        
                    </div>

                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Signing up...' : 'Sign up'}
                    </button>
                </form>
            </div>

            <p>
                Already have an account? <Link to="/login">Log in</Link>
            </p>
        </div>
    )
};

export default Registration