import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import AuthForm from './components/AuthForm.tsx';
import Items from './components/Items.tsx';

export default function App() {
    const [me, setMe] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    async function loadMe(){
        try {
            const data = await api('/users/me');
            setMe(data);
        } catch {
            setMe(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadMe(); }, []);

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px',
                color: '#666'
            }}>
                Loading...
            </div>
        );
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            {!me ? (
                <div>
                    <div style={{
                        textAlign: 'center',
                        paddingTop: '50px',
                        paddingBottom: '20px'
                    }}>
                        <h1 data-automation-id="title" style={{
                            color: 'white',
                            fontSize: '48px',
                            margin: '0 0 10px 0',
                            textShadow: '2px 2px 4px rgba(0,0,0,0.2)'
                        }}>
                            QA Practice Site
                        </h1>
                        <p style={{
                            color: 'rgba(255,255,255,0.9)',
                            fontSize: '18px',
                            margin: 0
                        }}>
                            Practice your automation testing skills
                        </p>
                    </div>
                    <AuthForm onSuccess={loadMe} />
                </div>
            ) : (
                <div>
                    <header style={{
                        background: 'white',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        padding: '20px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h1 data-automation-id="app-title" style={{
                                margin: '0 0 5px 0',
                                color: '#333',
                                fontSize: '28px'
                            }}>
                                QA Practice Site
                            </h1>
                            <p data-automation-id="welcome" style={{
                                margin: 0,
                                color: '#666',
                                fontSize: '14px'
                            }}>
                                Welcome, {me.email}
                            </p>
                        </div>
                        <button
                            data-automation-id="logout-btn"
                            onClick={() => { localStorage.removeItem('token'); setMe(null); }}
                            style={{
                                padding: '10px 24px',
                                background: '#f44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '14px',
                                fontWeight: '600',
                                transition: 'background 0.3s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#d32f2f'}
                            onMouseLeave={(e) => e.currentTarget.style.background = '#f44336'}
                        >
                            Logout
                        </button>
                    </header>
                    <div style={{
                        maxWidth: '1400px',
                        margin: '0 auto',
                        padding: '20px'
                    }}>
                        <Items />
                    </div>
                </div>
            )}
        </div>
    );
}