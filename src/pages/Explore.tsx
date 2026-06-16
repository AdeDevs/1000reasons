import React, { useState, useEffect } from 'react';
import { ReasonCard } from '../components/ReasonCard';
import { Reason } from '../types';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchReasons as getReasons } from '../lib/api';

export default function Explore() {
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  const query = new URLSearchParams(location.search);
  const currentPage = parseInt(query.get('page') || '1', 10);
  const categoryParam = query.get('category') || '';

  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const handleResize = () => {
      setItemsPerPage(window.innerWidth < 768 ? 1 : 6);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = ['All', 'Education', 'Economy', 'Infrastructure', 'Healthcare', 'Governance', 'Security', 'Other'];

  const fetchReasons = async () => {
    setLoading(true);
    try {
      const data = await getReasons({
        page: currentPage,
        limit: itemsPerPage,
        category: categoryParam || undefined,
      });
      setReasons(data.data);
      setTotalPages(data.totalPages || 1);
      setTotalCount(data.total || 0);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error fetching reasons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReasons();
  }, [currentPage, categoryParam, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      if (categoryParam) {
        navigate(`/explore?page=${newPage}&category=${categoryParam}`);
      } else {
        navigate(`/explore?page=${newPage}`);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.key === 'ArrowLeft') {
        handlePageChange(currentPage - 1);
      } else if (e.key === 'ArrowRight') {
        handlePageChange(currentPage + 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages, categoryParam, navigate]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCategory = e.target.value;
    if (newCategory === 'All') {
       navigate('/explore?page=1');
    } else {
       navigate(`/explore?page=1&category=${newCategory}`);
    }
  };

  return (
    <div className="w-full flex flex-col flex-1 pt-24 pb-16 md:pt-28 md:pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-display font-black uppercase tracking-tighter text-slate-900 mb-2">The Repository</h1>
            <p className="text-slate-600 font-medium font-sans">
              Explore {totalCount} verified reasons to vote for a new Nigeria.
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
             <div className="space-y-1 w-full md:w-48 shrink-0">
               <label className="block text-xs font-display font-bold uppercase tracking-widest text-slate-500">Filter by Category</label>
               <select 
                 className="w-full border-2 border-slate-200 p-2.5 rounded-none focus:border-blue-600 focus:outline-none bg-white transition-colors font-sans text-sm font-medium"
                 value={categoryParam || 'All'}
                 onChange={handleCategoryChange}
               >
                 {categories.map(c => <option key={c} value={c}>{c}</option>)}
               </select>
             </div>
          </div>
        </div>

        {loading && !reasons.length ? (
          <div className="w-full flex items-center justify-center animate-pulse py-20 min-h-[400px]">
            <div className="text-slate-400 font-display font-bold uppercase tracking-widest text-xl">Loading Records...</div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-2 border-red-900 text-red-900 p-8 font-bold text-center font-sans tracking-wide">
            {error}
          </div>
        ) : reasons.length === 0 ? (
          <div className="bg-white border-2 border-slate-300 p-12 text-center py-20 min-h-[400px] flex flex-col items-center justify-center">
            <h3 className="text-2xl font-display font-black mb-2 text-slate-800 uppercase tracking-tight">No reasons found</h3>
            <p className="text-slate-500 font-medium font-sans mb-6">There are no records matching your criteria.</p>
            <Link to="/submit" className="px-6 py-3 bg-slate-900 text-white font-display font-black uppercase tracking-widest text-sm hover:translate-y-1 hover:translate-x-1 shadow-[4px_4px_0px_0px_rgba(15,23,42,0.3)] hover:shadow-none transition-all border border-slate-900">
              Submit a Reason
            </Link>
          </div>
        ) : (
          <>
            <motion.div 
              className="flex flex-wrap gap-6 justify-center lg:justify-start mb-12"
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05 }
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
                  <ReasonCard 
                    reason={reason}
                    truncateLength={120} 
                    onClick={() => {
                      const params = new URLSearchParams(location.search);
                      params.set('reason', String(reason.number));
                      navigate(`${location.pathname}?${params.toString()}`);
                    }} 
                  />
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <div className="flex justify-end items-center gap-1 font-display mt-8">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="cursor-pointer p-2 border-2 border-slate-900 bg-white text-slate-900 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex gap-1 mx-2">
                  {[currentPage, currentPage + 1].filter(p => p <= totalPages).map((page, i) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`cursor-pointer w-10 h-10 flex items-center justify-center border-2 font-bold text-sm transition-colors ${
                        currentPage === page 
                          ? 'border-slate-900 bg-slate-900 text-white' 
                          : 'border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  {currentPage + 1 < totalPages && (
                    <span className="flex items-center justify-center px-1 text-slate-400 font-bold">...</span>
                  )}
                </div>
                
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="cursor-pointer p-2 border-2 border-slate-900 bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
