
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Plus, Edit2, Trash2, MapPin, CheckCircle2, AlertTriangle, RefreshCw, Database, Cloud, UploadCloud, Info, Server, ShieldCheck, Sparkles, ExternalLink, Code } from 'lucide-react';
import { connectionStatus, connectionError, firebaseConfig, db, isConfigured } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const { properties, navigate, deleteProperty, isOnline, syncLocalToCloud } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'idle' | 'testing' | 'success' | 'fail', message?: string}>({status: 'idle'});

  const runConnectionTest = async () => {
    if (!db) {
        setTestResult({status: 'fail', message: 'Database is not initialized. Please update services/firebase.ts.'});
        return;
    }
    setTestResult({status: 'testing'});
    try {
        const testRef = await addDoc(collection(db, '_connection_test'), {
            timestamp: Date.now(),
            message: 'Connectivity test'
        });
        await deleteDoc(doc(db, '_connection_test', testRef.id));
        setTestResult({status: 'success', message: 'Success! Your database is working perfectly.'});
    } catch (err: any) {
        let msg = err.message;
        if (msg.includes('permission-denied')) {
            msg = "Rules Error: Your database is locked. Go to Firestore > Rules and set 'allow read, write: if true;'.";
        } else if (msg.includes('not-found')) {
            msg = "Database Missing: Go to Firebase Console and click 'Create Database' in the Firestore section.";
        }
        setTestResult({status: 'fail', message: msg});
    }
  };

  const handleMagicInitialize = async () => {
    if (!db || !isOnline) return;
    setIsSyncing(true);
    try {
      const snapshot = await getDocs(collection(db, 'properties'));
      if (snapshot.empty) {
        await syncLocalToCloud();
        alert("Database initialized with professional demo data!");
      } else {
        alert("Database already contains properties. No changes made.");
      }
      window.location.reload();
    } catch (e) {
      alert("Initialization failed. Check your Firebase Rules.");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen overflow-y-auto no-scrollbar pb-32">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Manager Dashboard</h2>
          <div className="flex flex-wrap items-center gap-3 mt-3">
            {isConfigured && connectionStatus === 'connected' ? (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 size={12}/> Cloud Database Active
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-orange-600 bg-orange-50 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold">
                    <AlertTriangle size={12}/> Demo / Local Mode
                </div>
            )}
            {isConfigured && <span className="text-slate-400 text-[10px] font-mono uppercase bg-slate-100 px-2 py-1 rounded">Project: {firebaseConfig.projectId}</span>}
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleMagicInitialize}
            disabled={isSyncing || !isConfigured}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-30 transition-all"
          >
            <Sparkles size={18} /> Push Demo Data
          </button>
          <button
            onClick={() => navigate({ name: 'ADMIN_EDIT', propertyId: null })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
          >
            <Plus size={20} /> Create Listing
          </button>
        </div>
      </div>

      {/* SETUP WIZARD (Only shows if config is missing or failing) */}
      {(!isConfigured || testResult.status === 'fail') && (
        <div className="bg-white border-4 border-blue-100 rounded-[2.5rem] p-8 mb-10 shadow-2xl overflow-hidden">
           <div className="flex items-start gap-6">
              <div className="hidden md:flex p-4 bg-blue-600 rounded-3xl text-white">
                 <Database size={40} />
              </div>
              <div className="flex-1">
                 <h3 className="text-2xl font-black text-slate-900 mb-2">Connect Your Database (Free)</h3>
                 <p className="text-slate-500 mb-6 font-medium">Follow these 3 steps to make your website live and permanent.</p>
                 
                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <div className="text-blue-600 font-black text-xl mb-2">01</div>
                       <h4 className="font-bold text-slate-800 mb-2">Get API Keys</h4>
                       <p className="text-xs text-slate-500 leading-relaxed mb-4">Go to Firebase Console, create a project, and add a Web App.</p>
                       <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 text-xs font-bold flex items-center gap-1 hover:underline">
                          Firebase Console <ExternalLink size={12}/>
                       </a>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <div className="text-blue-600 font-black text-xl mb-2">02</div>
                       <h4 className="font-bold text-slate-800 mb-2">Unlock Rules</h4>
                       <p className="text-xs text-slate-500 leading-relaxed mb-4">In "Firestore Database", click "Rules" tab. Paste this:</p>
                       <code className="block bg-slate-900 text-blue-300 p-2 rounded text-[10px] font-mono">
                          allow read, write: if true;
                       </code>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                       <div className="text-blue-600 font-black text-xl mb-2">03</div>
                       <h4 className="font-bold text-slate-800 mb-2">Update Code</h4>
                       <p className="text-xs text-slate-500 leading-relaxed mb-4">Paste your keys into <span className="font-mono bg-slate-200 px-1">services/firebase.ts</span>.</p>
                       <button 
                         onClick={runConnectionTest}
                         className="mt-3 w-full bg-slate-900 text-white py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2"
                       >
                         {testResult.status === 'testing' ? <RefreshCw className="animate-spin" size={14}/> : <CheckCircle2 size={14}/>}
                         Test Connection
                       </button>
                    </div>
                 </div>

                 {testResult.status === 'fail' && (
                    <div className="mt-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-3 text-rose-700">
                       <AlertTriangle size={20} className="shrink-0" />
                       <p className="text-sm font-bold">Error: {testResult.message}</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {/* Listings Grid */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Database size={20} className="text-slate-400" /> Active Listings ({properties.length})
        </h3>
        {!isConfigured && (
            <span className="text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                ⚠️ DATA NOT SAVING TO CLOUD
            </span>
        )}
      </div>
      
      {properties.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <Cloud size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold mb-4">No properties found.</p>
            {isConfigured && (
                <button onClick={handleMagicInitialize} className="text-blue-600 font-bold hover:underline">
                    Load Demo Data Now
                </button>
            )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group">
              <div className="h-48 relative overflow-hidden">
                 <img src={property.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                 <div className="absolute top-4 right-4 flex gap-2">
                    <button onClick={() => navigate({ name: 'ADMIN_EDIT', propertyId: property.id })} className="bg-white shadow-lg p-2.5 rounded-xl text-slate-700 hover:text-blue-600 transition-colors"><Edit2 size={16}/></button>
                    <button onClick={() => deleteProperty(property.id)} className="bg-white shadow-lg p-2.5 rounded-xl text-slate-700 hover:text-rose-600 transition-colors"><Trash2 size={16}/></button>
                 </div>
              </div>
              <div className="p-6">
                <h4 className="font-bold text-lg text-slate-900 truncate mb-1">{property.title}</h4>
                <p className="text-slate-400 text-xs truncate mb-6 flex items-center gap-1"><MapPin size={12}/> {property.address}</p>
                <div className="flex justify-between items-center pt-5 border-t border-slate-50">
                  <span className="font-black text-blue-600 text-xl">${(property.price/1000).toLocaleString()}k</span>
                  <div className="flex gap-2 text-[10px] font-black uppercase text-slate-400">
                    <span className="bg-slate-50 px-2 py-1 rounded-md">{property.bedrooms} BD</span>
                    <span className="bg-slate-50 px-2 py-1 rounded-md">{property.bathrooms} BA</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
