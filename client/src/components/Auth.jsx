import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
            const res = await axios.post(endpoint, formData);
            localStorage.setItem('token', res.data.token);
            navigate('/home');
        } catch (err) {
            alert(err.response?.data?.msg || 'Error occurred');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <div className="glass-card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--accent-color)' }}>
                    Gym Lab Login
                </h1>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '10px' }}>
                        Login
                    </button>
                </form>
                <p style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                    Private instance for Minh Vững
                </p>
            </div>
        </div >
    );
};

export default Auth;
