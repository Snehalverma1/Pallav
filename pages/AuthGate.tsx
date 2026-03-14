import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { LogIn } from 'lucide-react';

export const AuthGate: React.FC = () => {
  const { login, signUp } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(email, password);
    if (typeof result === 'string') {
      setError(result);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signUp(email, password);
    if (typeof result === 'string') {
      setError(result);
    }
  };

  return (
      <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-center">
          <LogIn size={48} className="text-blue-500 mx-auto" />
          <h1 className="text-2xl font-bold text-white mt-4">Welcome</h1>
          <p className="text-slate-400">Sign in or create an account to continue.</p>
        </div>
        <form className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            autoFocus
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="p-2 rounded bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <div className="flex gap-2">
            <button onClick={handleLogin} className="flex-1 bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors">
              Login
            </button>
            <button onClick={handleSignUp} className="flex-1 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors">
              Sign Up
            </button>
          </div>
        </form>
      </div>
  );
};
