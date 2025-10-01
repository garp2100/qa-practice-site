import React, { useEffect, useState } from 'react';
import { api } from './api.js';
import LoginForm from './components/LoginForm.tsx';
import RegisterForm from './components/RegisterForm.tsx';
import Items from './components/Items.tsx';

export default function App() {
    const [me, setMe] = useState<any>(null);

    async function loadMe(){
        try {
            const data = await api('/users/me');
            setMe(data);
        } catch { setMe(null); }
    }

    useEffect(() => { loadMe(); }, []);

    return (
        <div className="App">
            <h1 data-automation-id="title">QA Practice Site - </h1>
                <h3>Please login or register</h3>
            {!me ? (
                <>
                    <LoginForm onSuccess={loadMe} />
                    <hr />
                    <RegisterForm onSuccess={loadMe} />
                </>
                ) : (
                    <>
                        <p data-automation-id="welcome">Welcome {me.email}</p>
                        <button
                            data-automation-id="logout-btn"
                            onClick={() => { localStorage.removeItem('token'); setMe(null); }}>
                            Logout
                        </button>
                        <Items />
                    </>
                )}
        </div>
    )
}