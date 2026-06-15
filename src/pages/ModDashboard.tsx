import React, { useState, useEffect } from 'react';
import { Shield, Check, Trash2, Power, Eye, Users } from 'lucide-react';
import { Reason } from '../types';

export default function ModDashboard() {
  const [pin, setPin] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  
  const [data, setData] = useState<{ isSiteUp: boolean; trafficCount: number; reasons: Reason[] } | null>(null);
  const [loading, setLoading] = useState(false);

  // Fake auth for MVP
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
      setAuthenticated(true);
      fetchData();
    } else {
      alert('Invalid PIN. Hint: 1234');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/mod/reasons');
      setData(await res.json());
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/mod/reasons/${id}/approve`, { method: 'POST' });
    fetchData();
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to delete this submission?')) {
      await fetch(`/api/mod/reasons/${id}/delete`, { method: 'POST' });
      fetchData();
    }
  };

  const handleToggleSite = async () => {
    if(confirm(`Are you sure you want to take the site ${data?.isSiteUp ? 'offline' : 'online'}?`)) {
      await fetch('/api/mod/system/toggle', { method: 'POST' });
      fetchData();
    }
  };

  if (!authenticated) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 pt-24 md:pt-28">
        <form onSubmit={handleAuth} className="bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] max-w-sm w-full">
          <div className="flex items-center gap-3 mb-6 border-b-2 border-slate-200 pb-4">
            <Shield className="w-8 h-8 text-slate-900" />
            <h1 className="text-2xl font-black uppercase">Moderator Auth</h1>
          </div>
          <input 
            type="password" 
            placeholder="Enter PIN (1234)" 
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full border-2 border-slate-300 p-3 mb-6 rounded-none text-center tracking-widest text-lg focus:border-slate-900 focus:outline-none"
          />
          <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 uppercase hover:bg-slate-800 transition-colors">
            Access Dashboard
          </button>
        </form>
      </div>
    );
  }

  if (loading || !data) {
    return <div className="text-center py-20 font-bold uppercase tracking-widest animate-pulse">Loading System Data...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b-4 border-slate-900 pb-6">
        <h1 className="text-3xl font-black uppercase text-slate-900 flex items-center gap-3">
          <Shield className="w-8 h-8" /> Control Center
        </h1>
        
        <div className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2 bg-white border-2 border-slate-300 px-4 py-2 font-mono font-bold">
            <Users className="w-5 h-5 text-blue-600" />
            Vists: {data.trafficCount}
          </div>
          
          <button 
            onClick={handleToggleSite}
            className={`flex items-center gap-2 px-4 py-2 font-bold uppercase transition-colors text-white ${data.isSiteUp ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}
          >
            <Power className="w-5 h-5" />
            {data.isSiteUp ? 'Take Site Offline' : 'Bring Site Online'}
          </button>
        </div>
      </div>

      <div className="bg-white border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 uppercase text-xs font-black tracking-wider border-b-2 border-slate-900">
                <th className="p-4">Status & Details</th>
                <th className="p-4">Submission Text</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {data.reasons.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 align-top w-1/4">
                    <div className="mb-2">
                       {r.status === 'pending' ? (
                          <span className="bg-yellow-100 text-yellow-800 border-[1px] border-yellow-800 px-2 py-1 text-xs font-bold uppercase mr-2">Pending</span>
                       ) : (
                          <span className="bg-green-100 text-green-800 border-[1px] border-green-800 px-2 py-1 text-xs font-bold uppercase mr-2">Approved</span>
                       )}
                       {r.status === 'approved' && <span className="font-mono font-bold text-slate-400 text-xs">#{String(r.number).padStart(3,'0')}</span>}
                    </div>
                    <div className="font-bold text-slate-900 text-sm mb-1">{r.category}</div>
                    <div className="text-xs text-slate-500 mb-1">By: {r.submittedBy} {r.anonymous ? '(Anon)' : ''}</div>
                    {r.email && <div className="text-xs text-slate-400 font-mono break-all">{r.email}</div>}
                  </td>
                  <td className="p-4 align-top w-2/4">
                    <div className="font-bold text-lg mb-1">{r.title}</div>
                    <div className="text-slate-600 text-sm mb-3">
                      {r.content}
                    </div>
                    <a href={r.citation} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1 font-bold uppercase tracking-wider">
                      <Eye className="w-3 h-3" /> View Source/Citation
                    </a>
                  </td>
                  <td className="p-4 align-top w-1/4">
                    <div className="flex flex-col gap-2">
                      {r.status === 'pending' && (
                        <button 
                          onClick={() => handleApprove(r.id)}
                          className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-green-50 border-2 border-green-600 text-green-700 font-bold uppercase text-xs hover:bg-green-600 hover:text-white transition-colors"
                        >
                          <Check className="w-4 h-4" /> Approve
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDelete(r.id)}
                        className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-50 border-2 border-red-600 text-red-700 font-bold uppercase text-xs hover:bg-red-600 hover:text-white transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.reasons.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 font-bold uppercase tracking-widest">
                    No submissions found in the database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
