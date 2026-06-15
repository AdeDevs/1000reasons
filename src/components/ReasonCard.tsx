import React, { useRef } from 'react';
import { toPng } from 'html-to-image';
import { Download, ExternalLink } from 'lucide-react';
import { Reason } from '../types';

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

export function ReasonCard({ reason, onClick }: { reason: Reason, onClick?: () => void }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const cardUrl = `${window.location.origin}/explore?reason=${reason.number}`;

  const getDomainInfo = (url: string) => {
    try {
      const u = new URL(url);
      const domain = u.hostname.replace('www.', '');
      return { domain, full: url };
    } catch {
      return { domain: url, full: url };
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cardRef.current) {
      try {
        const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
        const link = document.createElement('a');
        link.download = `reason-${reason.number}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error('Failed to generate image', err);
      }
    }
  };

  const shareText = `Reason #${reason.number}: ${reason.content}\n\nVia 1000 Reasons: ${cardUrl}`;

  const shareToTwitter = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareToFacebook = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(cardUrl)}`, '_blank');
  };

  const shareToWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-blue-800 border-2 border-slate-900 flex flex-col rounded-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all duration-300 ease-out w-full h-full text-white ${onClick ? 'cursor-pointer hover:translate-y-[1.5px] hover:translate-x-[1.5px] hover:shadow-[2.5px_2.5px_0px_0px_rgba(15,23,42,1)]' : ''}`}
    >
      
      {/* The actual card to capture */}
      <div 
        ref={cardRef} 
        className="p-[15px] flex flex-col flex-1 bg-blue-800 relative z-10 font-sans"
      >
        <div className="flex justify-between items-start mb-2">
          <span className="font-display font-black text-5xl md:text-6xl text-blue-100 block leading-none select-none tracking-tighter">#{String(reason.number).padStart(3, '0')}</span>
          <span className="bg-blue-950 text-blue-100 px-3 py-1 rounded-none text-[10px] md:text-xs uppercase font-black tracking-widest leading-none mt-1 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]">{reason.category}</span>
        </div>
        
        <div className="flex-1 flex flex-col justify-center items-center py-6">
          <p className="text-white leading-relaxed font-medium text-lg md:text-xl text-center font-display tracking-tight">
            {reason.content}
          </p>
        </div>

        <div className="mt-4 pt-4 flex justify-between items-end text-[10px] md:text-xs font-bold border-t-2 border-blue-900/50 uppercase tracking-widest">
          {reason.readMoreLink ? (
            <a onClick={(e) => e.stopPropagation()} href={reason.readMoreLink} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-blue-200 hover:text-white transition-colors flex items-center gap-1 truncate mr-2">
              Read More
            </a>
          ) : (
            <span />
          )}
          
          {reason.citation && (
            <a onClick={(e) => e.stopPropagation()} href={getDomainInfo(reason.citation).full} target="_blank" rel="noopener noreferrer" className="cursor-pointer text-blue-300 hover:text-white transition-colors flex items-center justify-end gap-1.5 truncate max-w-[200px]" title={reason.citation}>
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{getDomainInfo(reason.citation).domain}</span>
            </a>
          )}
        </div>
      </div>

      {/* Actions (Not captured in image) */}
      <div className="bg-blue-900/80 p-[12px] border-t-2 border-slate-900 flex justify-between items-center z-0 relative">
        <div className="flex gap-2">
          <button onClick={shareToTwitter} className="cursor-pointer p-2 bg-blue-950 text-white hover:bg-slate-900 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-none transition-all" title="Share on X">
            <XIcon className="w-4 h-4" />
          </button>
          <button onClick={shareToFacebook} className="cursor-pointer p-2 bg-blue-950 text-white hover:bg-blue-700 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-none transition-all" title="Share on Facebook">
            <FacebookIcon className="w-4 h-4" />
          </button>
          <button onClick={shareToWhatsApp} className="cursor-pointer p-2 bg-blue-950 text-white hover:bg-green-600 hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] rounded-none transition-all" title="Share on WhatsApp">
            <WhatsAppIcon className="w-4 h-4" />
          </button>
        </div>
        <button 
          onClick={handleDownload}
          className="cursor-pointer flex items-center gap-2 px-4 py-2 bg-white border-2 border-slate-900 text-slate-900 font-black uppercase text-xs hover:bg-slate-100 hover:translate-y-[2px] hover:translate-x-[2px] transition-all shadow-[3px_3px_0px_0px_rgba(15,23,42,1)] active:shadow-none duration-200"
        >
          <Download className="w-4 h-4" strokeWidth={3} /> Export
        </button>
      </div>
    </div>
  );
}
