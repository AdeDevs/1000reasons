import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ReasonCard } from './ReasonCard';
import { Reason } from '../types';
import { fetchReasons as getReasons } from '../lib/api';

export function GalleryModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const activeReasonId = searchParams.get('reason');

  const isExplorePage = location.pathname === '/explore';
  const showModal = isExplorePage && !!activeReasonId;

  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (showModal && reasons.length === 0) {
      setLoading(true);
      getReasons({ page: 1, limit: 1000 }) // Fetch all approved reasons for gallery navigation
        .then(data => {
          setReasons(data.data || []);
        })
        .catch(err => {
          console.error('Failed to load gallery reasons', err);
        })
        .finally(() => setLoading(false));
    }
  }, [showModal, reasons.length]);

  const currentIndex = reasons.findIndex(r => String(r.number) === activeReasonId);
  const activeReason = reasons[currentIndex] || reasons.find(r => String(r.number) === activeReasonId);

  const handleClose = () => {
    const params = new URLSearchParams(location.search);
    params.delete('reason');
    navigate(`${location.pathname}?${params.toString()}`);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      const prevReason = reasons[currentIndex - 1];
      const params = new URLSearchParams(location.search);
      params.set('reason', String(prevReason.number));
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (currentIndex > -1 && currentIndex < reasons.length - 1) {
      const nextReason = reasons[currentIndex + 1];
      const params = new URLSearchParams(location.search);
      params.set('reason', String(nextReason.number));
      navigate(`${location.pathname}?${params.toString()}`);
    }
  };

  useEffect(() => {
    if (!showModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, reasons, navigate, location.pathname, location.search, showModal]);

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-slate-900/90 backdrop-blur-sm"
          onClick={handleClose}
        >
          <button 
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 text-white hover:bg-white/10 transition-colors z-50 cursor-pointer"
          >
            <X className="w-8 h-8" />
          </button>

          {loading && !activeReason ? (
            <div className="text-white font-display uppercase tracking-widest animate-pulse">Loading...</div>
          ) : activeReason ? (
            <div className="relative w-full max-w-lg flex items-center justify-center" onClick={e => e.stopPropagation()}>
              <button 
                onClick={handlePrev}
                disabled={currentIndex <= 0}
                className="absolute -left-12 sm:-left-20 p-2 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-10 h-10" />
              </button>

              <motion.div 
                key={activeReason.number}
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="w-full"
              >
                <ReasonCard reason={activeReason} />
              </motion.div>

              <button 
                onClick={handleNext}
                disabled={currentIndex === -1 || currentIndex >= reasons.length - 1}
                className="absolute -right-12 sm:-right-20 p-2 text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronRight className="w-10 h-10" />
              </button>
            </div>
          ) : (
             <div className="text-white font-display p-8 bg-slate-800 border-2 border-slate-900 text-center">Reason not found.</div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
