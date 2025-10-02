import React, { useState } from 'react';
import { api } from '../api';

interface AuthFormProps {
    onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                // Login
                const response = await api('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });

                const token = typeof response === 'string' ? response : response.token;

                if (!token) {
                    throw new Error('No token received from server');
                }

                localStorage.setItem('token', token);
                onSuccess();
            } else {
                // Register
                const response = await api('/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                if (response.token) {
                    localStorage.setItem('token', response.token);
                    onSuccess();
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err);
            setError(isLogin ? 'Invalid email or password' : 'Registration failed. Email may already exist.');
        } finally {
            setLoading(false);
        }
    }

    function toggleMode() {
        setIsLogin(!isLogin);
        setError('');
    }

    return (
        <div data-automation-id="auth-container" style={{
            maxWidth: '400px',
            margin: '50px auto',
            padding: '30px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
            <h2 data-automation-id="auth-title" style={{
                textAlign: 'center',
                marginBottom: '30px',
                color: '#333',
                fontSize: '28px'
            }}>
                {isLogin ? 'Sign In' : 'Create Account'}
            </h2>

            <form onSubmit={handleSubmit} data-automation-id="auth-form" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <div>
                    <label htmlFor="auth-email" style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#555',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Email
                    </label>
                    <input
                        id="auth-email"
                        data-automation-id="auth-email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                </div>

                <div>
                    <label htmlFor="auth-password" style={{
                        display: 'block',
                        marginBottom: '8px',
                        color: '#555',
                        fontSize: '14px',
                        fontWeight: '500'
                    }}>
                        Password
                    </label>
                    <input
                        id="auth-password"
                        data-automation-id="auth-password-input"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        required
                        style={{
                            width: '100%',
                            padding: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            fontSize: '16px',
                            boxSizing: 'border-box',
                            transition: 'border-color 0.3s'
                        }}
                        onFocus={(e) => e.target.style.borderColor = '#2196f3'}
                        onBlur={(e) => e.target.style.borderColor = '#ddd'}
                    />
                </div>

                {error && (
                    <div
                        data-automation-id="auth-error"
                        style={{
                            padding: '12px',
                            background: '#ffebee',
                            color: '#c62828',
                            borderRadius: '8px',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}
                    >
                        {error}
                    </div>
                )}

                <button
                    data-automation-id="auth-submit-btn"
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '14px',
                        background: loading ? '#ccc' : '#2196f3',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.3s',
                        marginTop: '10px'
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.background = '#1976d2')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.background = '#2196f3')}
                >
                    {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
            </form>

            <div style={{
                marginTop: '25px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666'
            }}>
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                {' '}
                <button
                    data-automation-id="auth-toggle-btn"
                    onClick={toggleMode}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#2196f3',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontSize: '14px',
                        padding: 0,
                        fontWeight: '600'
                    }}
                >
                    {isLogin ? 'Register here' : 'Sign in'}
                </button>
            </div>
        </div>
    );
}
