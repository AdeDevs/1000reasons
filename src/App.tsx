import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Submit from './pages/Submit';
import ModDashboard from './pages/ModDashboard';
import Explore from './pages/Explore';
import { GalleryModal } from './components/GalleryModal';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isSolid = isScrolled || isHovered || menuOpen;
  
  let navClasses = "";
  if (isHomePage) {
    navClasses = isSolid 
      ? "bg-slate-900/80 backdrop-blur-md text-white border-b border-white/10" 
      : "bg-transparent text-white border-b border-transparent";
  } else {
    navClasses = isSolid 
      ? "bg-white/80 backdrop-blur-md text-slate-900 border-b border-slate-200" 
      : "bg-transparent text-slate-900 border-b border-transparent";
  }

  const linkHoverClass = isHomePage 
    ? (isSolid ? "hover:text-blue-300" : "hover:opacity-80")
    : "hover:text-blue-600";

  const brandHoverClass = isHomePage
    ? (isSolid ? "text-blue-400 group-hover:text-blue-300" : "text-blue-200 group-hover:text-white")
    : "text-blue-600 group-hover:text-blue-800";

  return (
    <div className="min-h-screen flex flex-col font-sans bg-slate-50 text-slate-900">
      <header 
        className={`fixed w-full top-0 z-50 transition-all duration-300 ${navClasses}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6 flex justify-between items-center cursor-default">
          <Link to="/" className="text-2xl font-display font-black tracking-tight uppercase group flex items-center gap-2 cursor-pointer transition-colors" onClick={() => setMenuOpen(false)}>
            1000 Reasons
            <span className={`font-cursive lowercase text-2xl font-bold tracking-normal transition-colors hidden sm:inline-block ${brandHoverClass}`}>to vote Obi</span>
          </Link>
          
          <button className={`md:hidden p-2 rounded-none transition-colors border-2 cursor-pointer ${
            isHomePage 
              ? (isSolid ? 'border-transparent hover:bg-slate-800 text-white' : 'border-white/20 hover:bg-white/10 backdrop-blur-sm text-white')
              : (isSolid ? 'border-transparent hover:bg-slate-100 text-slate-900' : 'border-slate-900/20 hover:bg-slate-900/10 backdrop-blur-sm text-slate-900')
          }`} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
          
          <nav className="hidden md:flex gap-8 items-center">
            <Link to="/explore" className={`font-display transition-all uppercase text-sm tracking-widest font-bold cursor-pointer ${linkHoverClass}`}>The 1000 Reasons</Link>
            <Link to="/submit" className={`font-display transition-all uppercase text-sm tracking-widest font-bold cursor-pointer ${linkHoverClass}`}>Submit a Reason</Link>
          </nav>
        </div>
        
        {/* Mobile Nav */}
        <div className={`md:hidden flex flex-col px-6 gap-6 transition-all duration-300 overflow-hidden ${
          isHomePage ? 'bg-slate-900 border-b border-slate-800' : 'bg-white border-b border-slate-200'
        } ${menuOpen ? 'py-6 max-h-96' : 'max-h-0 py-0 border-transparent'}`}>
          <Link to="/explore" className={`uppercase text-sm font-display tracking-widest font-bold transition-colors ${
            isHomePage ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`} onClick={() => setMenuOpen(false)}>The 1000 Reasons</Link>
          <Link to="/submit" className={`uppercase text-sm font-display tracking-widest font-bold transition-colors ${
            isHomePage ? 'text-slate-200 hover:text-white' : 'text-slate-600 hover:text-slate-900'
          }`} onClick={() => setMenuOpen(false)}>Submit a Reason</Link>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col w-full">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/mod" element={<ModDashboard />} />
        </Routes>
      </main>

      <GalleryModal />
      
      <footer className="bg-slate-900 border-t-4 border-slate-800 text-slate-400 py-12 md:py-16 mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-display font-black text-2xl uppercase tracking-tighter mb-4 flex items-center gap-2">
              1000 Reasons
            </h3>
            <p className="text-sm font-medium mb-4 max-w-sm font-sans leading-relaxed">
               A crowd-sourced repository of verifiable reasons, achievements, and policies supporting the movement for a new Nigeria.
            </p>
            <p className="text-sm font-bold text-slate-300 uppercase tracking-widest font-display mt-6">
              Built by <span className="text-blue-400 font-cursive text-[22px] lowercase ml-1 tracking-normal">a concerned Nigerian</span>
            </p>
          </div>
          
          <div className="flex flex-col gap-3 font-display">
            <h4 className="text-white font-bold uppercase tracking-widest mb-2">Platform</h4>
            <Link to="/explore" className="hover:text-blue-400 w-fit transition-colors">Showcase</Link>
            <Link to="/submit" className="hover:text-blue-400 w-fit transition-colors">Submit Reason</Link>
            <Link to="/mod" className="hover:text-blue-400 w-fit transition-colors">Mod Dashboard</Link>
          </div>
          
          <div className="flex flex-col gap-3 font-display">
            <h4 className="text-white font-bold uppercase tracking-widest mb-2">Connect</h4>
            <a href="#" className="hover:text-blue-400 w-fit transition-colors">Share Movement</a>
            <a href="#" className="hover:text-blue-400 w-fit transition-colors">Volunteer</a>
            <a href="#" className="hover:text-blue-400 w-fit transition-colors">Contact</a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-8 border-t-2 border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-display uppercase tracking-widest font-bold">© {new Date().getFullYear()} 1000 Reasons.</p>
          <p className="text-xs font-display uppercase tracking-widest font-bold text-slate-500">For a better Nigeria.</p>
        </div>
      </footer>
    </div>
  );
}
