import React, { useState } from 'react';
import { api } from '../api';

export default function LoginForm({ onSuccess }: { onSuccess:() => void }) {
    const [email, setEmail] = useState('user@example.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');

    interface LoginResponse {
        token: string;
        user?: { id: string; email: string };
    }

    async function submit(e: React.FormEvent) {
        e.preventDefault();
        try {
            // Call backend login
            const response = await api('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const { token } = response as LoginResponse

            if (!token) {
                console.error("No token received from server:", response);
                setError("Login failed: Invalid server response");
                return;
            }

            if (import.meta.env.MODE === 'development') {
                console.log("Storing token:", token);
            }
            localStorage.setItem('token', token.trim());

            // Tell App.tsx to reload user
            onSuccess();
        } catch (err) {
            console.error("Login error:", err);
            setError('Login failed');
        }
    }

    return (
      <form onSubmit={submit} data-automation-id ="login-form">
          <h2>Login</h2>
          <label>Email
              <input data-automation-id ="login-email" value={email} onChange={e=> setEmail(e.target.value)} />
          </label>
          <label>Password
            <input
              data-automation-id="login-password"
              value={password}
              onChange={e=> setPassword(e.target.value)}
              type="password"
            />
          </label>
          <button data-automation-id ="login-submit" type="submit">Sign in</button>
          {error && <p data-automation-id="login-error">{error}</p>}
      </form>
    );
}
