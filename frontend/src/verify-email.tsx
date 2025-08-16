import React, { useState } from "react";
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import './App.css'; 

function Verification () {
    const location = useLocation();
    const navigate = useNavigate();

    const email = location.state?.email;

    const [code, setCode] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loading2, setLoading2] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [codeError, setCodeError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    if (!email) {
        return (
            <div className="container">
                <h1>Oops!</h1>
                <p>We don't know which email to verify. Please <Link to="/register">register</Link> first.</p>
            </div>
        );
    }

    const handleSubmit = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        if (!code.trim()) {
            setError('Please enter the verification code!')
            return;
        };

        setLoading(false);
        setLoading2(false);
        setError(null);
        setSuccess(null);

        try {
            const data = { email, code };
            await axios.post('/api/verify-email/', data);
            
            setSuccess('Verification successful! Redirecting to login...');
            
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                const status = err.response?.status
                const serverError = err.response?.data?.detail || 'Verification failed. Please try again.';
                if (status === 200) {
                    setSuccess("The email has been sent successfully")
                } else {
                    setError(serverError)
                }
            }
            
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
    setLoading2(true);
    setError(null);
    setSuccess(null);
    try {
        const response = await axios.post('/api/resend-verification-email/', { email });
        if (response){
            setSuccess('A new code has been sent to your email.');
        }
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const serverError = err.response?.data?.detail || 'Failed to resend code.';
            setError(serverError);
        }
    } finally {
        setLoading2(false);
    }
};


    const handleCode = (e: React.ChangeEvent<HTMLInputElement>) => {
        const code = e.target.value
        setCode(code);
        if (code.trim().length !== 6) {
            setCodeError('The verification code must have 6 numbers')
        } else {
            setCodeError(null)
        };
    };



    return(
        <div className="container">
            <h3>A code has been send to your email, please check your inbox</h3>
            <div className="submit-form">
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="code">Code: </label>
                        <input
                            type="number" 
                            placeholder="Enter the code"
                            value={code}
                            onChange={handleCode}
                        />
                        <div className="error-placeholder">
                            {codeError && <div className="pass-error">{codeError}</div>}                            
                        </div>                        
                    </div>
                    <div className="error-placeholder">
                        {error && <div className="error">{error}</div>}
                        {success && <div className="success">{success}</div>}
                    </div>
                    <button type="submit" className="btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify'}
                    </button>                
                </form>
            </div>
            <button type="button" className="resend-btn" disabled={loading2} onClick={handleResend}>Resend email</button>
            <div>
                <p><Link to='/register'>Register</Link> or <Link to='/login'>Login</Link></p>
            </div>             
        </div>
    )
}

export default Verification