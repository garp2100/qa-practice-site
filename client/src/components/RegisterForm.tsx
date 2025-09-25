import React, { useState } from 'react';
import { api } from '../api';

export default function RegisterForm({ onSuccess }: { onSuccess: () => void }) {
    const [email, setEmail] = useState('newuser@example.com');
    const [password, setPassword] = useState('password');
    const [msg, setMsg] = useState('');

    async function submit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const response = await api('/auth/register', { method: 'POST', body: JSON.stringify({ email, password })});
        if (response.token) {
            localStorage.setItem('token', response.token);
        }
        setMsg('Registered! now log in.');
        onSuccess();
    }

    return (
      <form onSubmit={submit} data-automation-id="register-form">
          <h2>Register</h2>
          <label>Email
              <input data-automation-id="register-email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>Password
              <input data-automation-id="register-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button data-automation-id="register-submit" type="submit">Create account</button>
          {msg && <p data-automation-id="register-success">{msg}</p>}
      </form>
    );
}