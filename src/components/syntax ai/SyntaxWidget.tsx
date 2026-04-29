"use client";

import { useState } from "react";
import { BsChatDotsFill, BsXLg } from "react-icons/bs"; 

export default function SyntaxWidget() {
  const [isOpen, setIsOpen] = useState(false);
  // THE MAGIC KEY: Track if the user has shown intent
  const [hasInteracted, setHasInteracted] = useState(false);
  
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  return (
    <>
      {/* Floating Chat Button - Minimalist Luxury Style */}
      <button
        // Pre-load the iframe if they hover (Desktop)
        onMouseEnter={() => setHasInteracted(true)} 
        onClick={() => {
          // Load the iframe if they click (Mobile)
          setHasInteracted(true); 
          setIsOpen(prev => {
            if (!prev) setIsLoading(false); 
            return !prev;
          });
        }}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 p-3 md:p-4 
          bg-luxury-midnight border-2 border-gold/30 hover:border-gold 
          text-gold rounded-full shadow-luxury hover:shadow-gold-lg 
          hover:scale-110 transition-all duration-300 z-[9999] 
          flex items-center justify-center group pointer-events-auto`}
        aria-label="Toggle Syntax AI Chat"
      >
        <div className="absolute inset-0 rounded-full bg-gold/10 opacity-0 group-hover:opacity-100 animate-pulse transition-opacity pointer-events-none" />
        {isOpen ? (
          <BsXLg size={24} className="relative z-10" />
        ) : (
          <BsChatDotsFill size={24} className="relative z-10 animate-gold-pulse md:animate-none group-hover:animate-gold-pulse" />
        )}
      </button>

      {/* The Iframe Container
        ONLY renders into the DOM after the user interacts.
        Once rendered, it stays mounted for persistence, toggling visibility via CSS.
      */}
      {hasInteracted && (
        <div 
          className={`fixed bottom-20 right-4 md:bottom-24 md:right-6 
            w-[calc(100vw-2rem)] md:w-[400px] 
            h-[85dvh] md:h-[650px] max-h-[800px] 
            z-[9999] transition-all duration-300 origin-bottom-right
            ${isOpen ? "opacity-100 translate-y-0 scale-100 pointer-events-auto" : "opacity-0 translate-y-4 scale-95 pointer-events-none"}`}
        >
          <div className="w-full h-full relative p-[2px] rounded-2xl bg-luxury-gold shadow-gold-lg overflow-hidden">
            {!iframeError ? (
              <div className="w-full h-full relative">
                <iframe
                  key={reloadKey}
                  src="https://syntax.shainwaiyan.com/embed"
                  className="w-full h-full border-none rounded-[calc(1rem-2px)] bg-black"
                  title="Syntax AI Chat"
                  // Now that it's behind an interaction, 'lazy' or 'eager' doesn't matter as much, 
                  // but 'lazy' is safer just in case.
                  loading="lazy" 
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  referrerPolicy="strict-origin-when-cross-origin"
                  onLoad={() => {
                    if (isLoading) setIsLoading(false);
                  }}
                  onError={() => setIframeError(true)}
                />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/90 rounded-[calc(1rem-2px)] z-20">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-10 h-10 border-2 border-gold/20 border-t-gold rounded-full animate-spin" />
                      <span className="text-gold text-xs font-medium animate-pulse tracking-widest uppercase">Initializing AI</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-black p-6 text-center space-y-4 rounded-[calc(1rem-2px)]">
                <div className="w-16 h-16 rounded-full bg-gold/10 flex items-center justify-center">
                  <BsXLg size={24} className="text-gold animate-gold-pulse" />
                </div>
                <h3 className="text-gold font-bold text-lg text-balance">Connection Interrupted</h3>
                <p className="text-sm text-gray-400">Syntax AI is temporarily unavailable. Let&apos;s try reconnecting.</p>
                <button 
                  onClick={() => {
                    setIframeError(false);
                    setIsLoading(true);
                    setReloadKey(prev => prev + 1);
                  }}
                  className="px-6 py-2 border border-gold/30 text-gold text-xs font-bold rounded-full hover:bg-gold/10 transition-colors uppercase tracking-widest"
                >
                  Reconnect AI
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
