
import React, { useState } from 'react';
import { useStore } from '../context/Store';
import { Plus, Edit2, Trash2, MapPin, CheckCircle2, AlertTriangle, RefreshCw, Database, Cloud, UploadCloud, Info, Server, ShieldCheck } from 'lucide-react';
import { connectionStatus, connectionError, firebaseConfig, db } from '../services/firebase';
import { collection, addDoc, deleteDoc, doc } from 'firebase/firestore';

export const AdminDashboard: React.FC = () => {
  const { properties, navigate, deleteProperty, isOnline, syncLocalToCloud } = useStore();
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{status: 'idle' | 'testing' | 'success' | 'fail', message?: string}>({status: 'idle'});

  const runConnectionTest = async () => {
    if (!db) {
        setTestResult({status: 'fail', message: 'Firestore object is null. Ensure you updated services/firebase.ts with your own API keys.'});
        return;
    }
    setTestResult({status: 'testing'});
    try {
        const testRef = await addDoc(collection(db, '_connection_test'), {
            timestamp: Date.now(),
            message: 'Connectivity test'
        });
        await deleteDoc(doc(db, '_connection_test', testRef.id));
        setTestResult({status: 'success', message: 'Perfect! Your database is reachable and permissions are correct.'});
    } catch (err: any) {
        let msg = err.message;
        if (msg.includes('permission-denied')) {
            msg = "Rules Error: Your Firestore Rules are blocking access. Go to Firestore > Rules and set 'allow read, write: if true;'.";
        } else if (msg.includes('not-found')) {
            msg = "Service Error: Database not provisioned. Click 'Create Database' in the Firebase Console.";
        }
        setTestResult({status: 'fail', message: msg});
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncLocalToCloud();
      alert("Success! Cloud database updated.");
      window.location.reload(); 
    } catch (err) {
      alert("Sync failed. Check your Firebase Rules.");
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
            {connectionStatus === 'connected' ? (
                <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                    <CheckCircle2 size={12}/> Firebase Connected
                </div>
            ) : (
                <div className="flex items-center gap-1.5 text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full text-xs font-bold">
                    <AlertTriangle size={12}/> Offline Mode
                </div>
            )}
            <span className="text-slate-400 text-[10px] font-mono uppercase bg-slate-100 px-2 py-1 rounded">ID: {firebaseConfig.projectId}</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate({ name: 'ADMIN_EDIT', propertyId: null })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-200 transition-all active:scale-95"
        >
          <Plus size={20} /> Create New Listing
        </button>
      </div>

      {/* Database Diagnostic Card - Always show if not connected or test failed */}
      {(connectionStatus !== 'connected' || testResult.status !== 'success') && (
        <div className="bg-white border-2 border-slate-200 rounded-[2rem] p-8 mb-10 shadow-sm overflow-hidden relative">
           <div className="absolute top-0 right-0 p-6 opacity-5">
              <Database size={120} />
           </div>
           
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="p-2 bg-slate-900 rounded-lg text-white"><Server size={20} /></div>
                 <h3 className="text-xl font-bold text-slate-900 tracking-tight">Database Connection Tool</h3>
              </div>
              
              <p className="text-slate-500 mb-8 max-w-2xl text-sm font-medium">
                {connectionStatus !== 'connected' 
                  ? "Your app is currently saving data only to your browser (Local Storage). To use the Cloud, update your Firebase Config." 
                  : "Database object initialized. Let's test if we can actually read/write to it."}
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-4">
                      {testResult.status === 'idle' ? (
                        <button 
                          onClick={runConnectionTest}
                          className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-slate-200 transition-all"
                        >
                          <RefreshCw size={18} /> Test Firebase Connectivity
                        </button>
                      ) : (
                        <div className={`p-5 rounded-2xl border-2 ${
                            testResult.status === 'testing' ? 'bg-slate-50 border-slate-100' :
                            testResult.status === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' :
                            'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                            <div className="flex gap-3">
                                {testResult.status === 'testing' ? <RefreshCw className="animate-spin shrink-0" size={18}/> : 
                                 testResult.status === 'success' ? <CheckCircle2 className="shrink-0" size={18}/> : <AlertTriangle className="shrink-0" size={18}/>}
                                <div className="text-sm">
                                    <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">
                                        {testResult.status === 'testing' ? 'Contacting Servers...' : 
                                         testResult.status === 'success' ? 'Connection OK' : 'Cloud Error'}
                                    </p>
                                    <p className="font-medium leading-relaxed">{testResult.message || 'Running diagnostic...'}</p>
                                    {testResult.status !== 'testing' && (
                                        <button onClick={() => setTestResult({status: 'idle'})} className="mt-3 text-[10px] font-black underline uppercase">Try Again</button>
                                    )}
                                </div>
                            </div>
                        </div>
                      )}

                      {testResult.status === 'success' && (
                        <button 
                          onClick={handleSync}
                          disabled={isSyncing}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-100"
                        >
                          {isSyncing ? <RefreshCw className="animate-spin" /> : <UploadCloud />}
                          {isSyncing ? 'Processing...' : 'Sync Local Data to Cloud'}
                        </button>
                      )}
                  </div>

                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                     <h4 className="font-bold text-slate-800 text-sm mb-3 flex items-center gap-2">
                        <Info size={16} className="text-slate-400" /> Troubleshoot Checklist
                     </h4>
                     <ul className="space-y-3 text-xs font-medium text-slate-500">
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1"></div> 1. Copy config from Firebase Project Settings.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1"></div> 2. Click "Create Database" in Firestore tab.</li>
                        <li className="flex gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-1"></div> 3. Rules: <b>allow read, write: if true;</b></li>
                     </ul>
                  </div>
              </div>
           </div>
        </div>
      )}

      {/* Listings Grid */}
      <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Database size={20} className="text-slate-400" /> Active Property Listings
      </h3>
      
      {properties.length === 0 ? (
        <div className="py-24 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
            <Cloud size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">No properties found. Create your first one above!</p>
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
