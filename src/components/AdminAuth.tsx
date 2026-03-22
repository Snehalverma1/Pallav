import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/Store';
import { db } from '../../services/firebase';
import { doc, setDoc, collection, getDocs, query, limit } from 'firebase/firestore';
import { User } from 'firebase/auth';

const AdminAuth: React.FC = () => {
  const { login, signUp, navigate } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');
  const [isSignUpAllowed, setIsSignUpAllowed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminExists = async () => {
      try {
        const adminsCollection = collection(db, 'admins');
        const q = query(adminsCollection, limit(1));
        const adminSnapshot = await getDocs(q);
        
        if (adminSnapshot.empty) {
          setIsSignUpAllowed(true);
          setIsSigningUp(true);
        } else {
          setIsSignUpAllowed(false);
          setIsSigningUp(false);
        }
      } catch (err) {
        console.error("Error checking for admin accounts:", err);
        setError("Could not verify admin status. Please try again.");
        setIsSignUpAllowed(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminExists();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isSigningUp && !isSignUpAllowed) {
        setError("Admin sign up is not allowed. An admin account already exists.");
        return;
    }

    try {
      if (isSigningUp) {
        const userCredential = await signUp(email, password, "");
        if (typeof userCredential === 'string' || !userCredential?.user) {
            throw new Error(typeof userCredential === 'string' ? userCredential : 'Failed to create user.');
        }
        const adminUser = userCredential.user as User;
        await setDoc(doc(db, "admins", adminUser.uid), { email: adminUser.email, joined: new Date() });
      } else {
        const result = await login(email, password);
        if (result !== true) {
            throw new Error(result as string);
        }
      }
      navigate({ name: 'ADMIN_DASHBOARD' });
    } catch (err: any) {
      setError(err.message);
      console.error("Admin Auth Error:", err);
    }
  };

  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-100">
            <div className="text-center">
                <h2 className="text-2xl font-semibold">Verifying Admin Status...</h2>
            </div>
        </div>
    );
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
            <div className="text-center">
                <h2 className="text-2xl font-bold">{isSigningUp ? 'Create Admin Account' : 'Admin Login'}</h2>
                <p className="mt-2 text-sm text-gray-600">
                    {isSignUpAllowed && isSigningUp 
                        ? "This will be the only admin account for this application."
                        : "Enter administrator credentials."
                    }
                </p>
            </div>
      
            <form onSubmit={handleAuth} className="space-y-6">
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
                        {isSigningUp ? 'Create Admin Account' : 'Login'}
                    </button>
                </div>
                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
            </form>

            <div className="text-sm text-center">
                {isSignUpAllowed && (
                    <button 
                        className="font-medium text-indigo-600 hover:text-indigo-500"
                        onClick={() => setIsSigningUp(!isSigningUp)}
                    >
                        {isSigningUp ? 'Already have an admin account? Login' : 'Create the first admin account'}
                    </button>
                )}
            </div>

            <div className="text-sm text-center">
                <button
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                    onClick={() => navigate({ name: 'USER_GALLERY'})}
                >
                    Back to Site
                </button>
            </div>
        </div>
    </div>
  );
};

export default AdminAuth;