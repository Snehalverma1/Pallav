
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';

const TemporaryAdmin: React.FC = () => {
  const { signUp, navigate } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signUp(email, password, "");
      if (typeof userCredential === 'string' || !userCredential?.user) {
          throw new Error(typeof userCredential === 'string' ? userCredential : 'Failed to create user.');
      }
      const adminUser = userCredential.user as User;
      await setDoc(doc(db, "admins", adminUser.uid), { email: adminUser.email, joined: new Date() });
      navigate({ name: 'ADMIN_DASHBOARD' });
    } catch (err: any) {
      setError(err.message);
      console.error("Admin Auth Error:", err);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h2 className="text-2xl font-bold">Create Temporary Admin Account</h2>
            </div>
      
            <form onSubmit={handleSignUp} className="space-y-6">
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <input
                            aria-label="Email address"
                            name="email"
                            type="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            aria-label="Password"
                            name="password"
                            type="password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Create Admin Account
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>
        </div>
    </div>
  );
};

export default TemporaryAdmin;
