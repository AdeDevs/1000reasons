import React, { useState } from 'react';
import { Send, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { submitReason } from '../lib/api';

export default function Submit() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'Education',
    content: '',
    citation: '',
    anonymous: false,
    agree: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const categories = ['Education', 'Economy', 'Infrastructure', 'Healthcare', 'Governance', 'Security', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.agree) {
      setError('You must agree to the privacy policy.');
      return;
    }
    
    setLoading(true);
    try {
      await submitReason(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-32 flex flex-col items-center text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <CheckCircle className="w-20 h-20 text-blue-600 mb-6 mx-auto" />
        </motion.div>
        <h1 className="text-4xl font-display font-black uppercase text-slate-900 mb-4 tracking-tighter">Submission Received</h1>
        <p className="text-lg text-slate-600 mb-8 font-sans max-w-md">
          Thank you for contributing. Your reason has been submitted to the moderators for review.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setFormData({ ...formData, content: '', citation: '', agree: false });
          }}
          className="px-8 py-4 bg-white text-slate-900 font-display font-black uppercase tracking-widest border-2 border-slate-900 hover:bg-slate-50 transition-colors shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:translate-y-1 active:shadow-none"
        >
          Submit Another Reason
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 pt-24 pb-16 md:pt-28 md:pb-20 w-full">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-2 border-slate-900 p-[15px] shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
      >
        <div className="flex flex-col mb-6 border-b-2 border-slate-100 pb-6 px-2 md:px-6 pt-4 text-center md:text-left">
          <h1 className="text-3xl font-display font-black uppercase tracking-tighter text-slate-900">Submit a Reason</h1>
          <p className="text-slate-600 font-medium font-sans">Contribute verifiable facts to the repository.</p>
        </div>

        {error && (
          <div className="mb-6 mx-2 md:mx-6 p-4 bg-red-50 border-2 border-red-900 text-red-900 font-bold uppercase text-xs tracking-wider">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="px-2 md:px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className={`block text-xs font-display font-bold uppercase tracking-widest transition-colors ${formData.anonymous ? 'text-slate-400' : 'text-slate-900'}`}>Full Name</label>
              <input 
                required={!formData.anonymous} 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={formData.anonymous}
                className={`w-full border-2 border-slate-200 p-3 rounded-none focus:border-blue-600 focus:outline-none transition-all font-sans ${formData.anonymous ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'bg-white'}`}
                placeholder={formData.anonymous ? "Hidden (Anonymous)" : "John Doe"}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-xs font-display font-bold uppercase tracking-widest text-slate-900">Email Address</label>
              <input 
                required 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border-2 border-slate-200 p-3 rounded-none focus:border-blue-600 focus:outline-none transition-colors font-sans"
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50/50 border border-blue-100 flex items-start gap-3">
            <input 
              type="checkbox" 
              name="anonymous"
              id="anonymous"
              checked={formData.anonymous}
              onChange={handleChange}
              className="mt-1 w-5 h-5 border-2 border-slate-900 rounded-none checked:bg-blue-600 cursor-pointer"
            />
            <label htmlFor="anonymous" className="text-sm font-sans font-medium text-slate-700 cursor-pointer select-none">
              <strong className="block text-slate-900 mb-0.5 font-display tracking-wide">Submit Anonymously</strong>
              Check this to hide your public name. Email remains strictly confidential.
            </label>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-slate-900">Category</label>
            <select 
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border-2 border-slate-200 p-3 rounded-none focus:border-blue-600 focus:outline-none bg-white transition-colors font-sans"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-slate-900">The Reason</label>
            <textarea 
              required 
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="w-full border-2 border-slate-200 p-3 rounded-none focus:border-blue-600 focus:outline-none min-h-[120px] transition-colors font-sans resize-y"
              placeholder="Detail the achievement, policy, or action..."
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-display font-bold uppercase tracking-widest text-slate-900">Citation / Source URL</label>
            <input 
              required 
              type="url" 
              name="citation"
              value={formData.citation}
              onChange={handleChange}
              className="w-full border-2 border-slate-200 p-3 rounded-none focus:border-blue-600 focus:outline-none transition-colors font-sans"
              placeholder="https://source.com/article"
            />
          </div>

          <div className="pt-4 flex items-start gap-3">
            <input 
              required
              type="checkbox" 
              name="agree"
              id="agree"
              checked={formData.agree}
              onChange={handleChange}
              className="mt-1 w-5 h-5 border-2 border-slate-900 rounded-none checked:bg-slate-900 cursor-pointer shrink-0"
            />
            <label htmlFor="agree" className="text-sm font-sans text-slate-600 cursor-pointer pt-0.5">
              I agree to the Terms of Service. I confirm this information is factual and correctly cited to the best of my knowledge.
            </label>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 mt-8 bg-slate-900 text-white font-display font-black uppercase tracking-widest border-2 border-slate-900 hover:bg-white hover:text-slate-900 transition-all flex items-center justify-center gap-2 disabled:opacity-70 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] active:shadow-none active:translate-y-[4px] active:translate-x-[4px]"
          >
            {loading ? 'Submitting...' : 'Submit Reason'}
            {!loading && <Send className="w-5 h-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
