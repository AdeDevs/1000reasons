import React, { useState, useEffect } from 'react';
import { ReasonCard } from '../components/ReasonCard';
import { Reason } from '../types';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { fetchReasons as getReasons } from '../lib/api';

export default function Home() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [featuredReason, setFeaturedReason] = useState<Reason | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  const fetchReasons = async () => {
    setLoading(true);
    try {
      const data = await getReasons({
        page: 1,
        limit: 6, // Request exactly 6 per page
      });
      setReasons(data.data);
      if (data.data.length > 0 && !featuredReason) {
         setFeaturedReason(data.data[0]);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching reasons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, []);

  if (error === 'Site is down for maintenance.') {
    return (
      <div className="flex-1 flex items-center justify-center p-8 mt-20">
        <div className="max-w-md text-center bg-white border-4 border-slate-900 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <h2 className="text-2xl font-black mb-4 uppercase font-display">Maintenance Mode</h2>
          <p className="text-slate-600 font-sans">The site is temporarily down for maintenance. Please check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-1">
      {/* 100VH Hero Section */}
      <div className="min-h-screen bg-slate-900 text-white w-full px-6 md:px-12 lg:px-20 relative overflow-hidden flex items-center justify-center pt-24 pb-12 lg:pt-28">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
        
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col text-center lg:text-left"
          >
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-black mb-6 tracking-tighter uppercase leading-[0.95]">
              1000 Reasons <br />
              <span className="font-cursive lowercase text-blue-400 tracking-normal text-5xl sm:text-6xl lg:text-7xl block mt-2 font-normal">to vote Peter Obi</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-300 font-medium mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans mt-2">
              A comprehensive, crowd-sourced repository of verifiable achievements, proven policies, and a track record of integrity that envisions a new Nigeria.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/submit" className="cursor-pointer px-5 py-3 bg-white text-slate-900 font-black uppercase tracking-widest font-display text-[13px] hover:translate-y-[4px] hover:translate-x-[4px] hover:shadow-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 border-[1px] border-white">
                Submit a Reason
              </Link>
              <Link to="/explore" className="cursor-pointer px-5 py-3 bg-transparent text-white font-black uppercase tracking-widest font-display text-[13px] hover:translate-y-[4px] hover:translate-x-[4px] hover:bg-white/10 transition-all border-2 border-white/20 flex items-center justify-center hover:shadow-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                Explore Repository
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="hidden lg:flex justify-center lg:justify-end"
          >
            {featuredReason ? (
              <div className="w-full max-w-[420px] aspect-[4/5] min-h-[450px] rotate-2 transition-transform duration-500 ease-out origin-bottom-right">
                <ReasonCard reason={featuredReason} />
              </div>
            ) : (
               <div className="w-full max-w-[420px] aspect-[4/5] min-h-[450px] border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-500 font-display uppercase tracking-widest rotate-2">
                 Loading Canvas...
               </div>
            )}
          </motion.div>

        </div>
      </div>

      <div id="reason-list" className="max-w-7xl mx-auto px-4 md:px-8 pt-16 pb-20 flex flex-col flex-1 w-full shrink-0">
        {loading && !reasons.length ? (
          <div className="flex-1 flex items-center justify-center animate-pulse py-20">
            <div className="text-slate-500 font-display font-bold uppercase tracking-widest text-xl">Loading Records...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-900 text-red-900 p-8 font-bold text-center font-sans">
            {error}
          </div>
        ) : reasons.length === 0 ? (
          <div className="bg-white border-2 border-slate-300 p-12 text-center shadow-sm py-20">
            <h3 className="text-2xl font-display font-black mb-2 text-slate-800 uppercase tracking-tight">No reasons found</h3>
            <p className="text-slate-500 font-medium font-sans">Submit a new reason to build the repository.</p>
          </div>
        ) : (
          <div className="w-full">
            <div className="flex justify-between items-end mb-8 border-b-2 border-slate-200 pb-4">
               <h2 className="text-3xl font-display font-black uppercase text-slate-900 tracking-tighter">Today's Picks</h2>
               <div className="flex items-center gap-6">
                 <Link to="/submit" className="cursor-pointer text-slate-500 hover:text-slate-900 font-bold uppercase tracking-widest text-sm flex items-center gap-1 transition-colors hidden sm:flex">
                   Submit a reason <span aria-hidden="true">+</span>
                 </Link>
                 <Link to="/explore" className="cursor-pointer text-blue-600 hover:text-blue-800 font-bold uppercase tracking-widest text-sm flex items-center gap-1 transition-colors">
                   View All <span aria-hidden="true">&rarr;</span>
                 </Link>
               </div>
            </div>
            
            <motion.div 
              className="flex flex-wrap gap-6 justify-center lg:justify-start mb-4"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
          >
            {reasons.map((reason) => (
              <motion.div 
                key={reason.id} 
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] flex items-stretch min-h-[350px]"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <ReasonCard reason={reason} />
              </motion.div>
            ))}

          </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
