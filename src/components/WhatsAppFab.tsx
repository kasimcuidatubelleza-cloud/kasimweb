import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";

const WhatsAppFab = () => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Show the tooltip after 3 seconds to catch the user's attention
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTooltip(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const phoneNumber = "5491127485584";
  const defaultMessage = "Hola KASIM, me gustaría realizar una consulta profesional gratuita sobre mis uñas/estética.";
  const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(defaultMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
      {/* Tooltip / Message Bubble */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative bg-background border border-border/80 shadow-2xl p-3 md:p-4 rounded-xl md:rounded-2xl max-w-[220px] md:max-w-sm flex flex-col gap-1 items-start text-left pointer-events-auto"
          >
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowTooltip(false);
              }}
              className="absolute top-1.5 md:top-2 right-1.5 md:right-2 p-1 rounded-full text-muted-foreground hover:bg-muted transition-colors"
              aria-label="Cerrar"
            >
              <X className="w-3 h-3 md:w-3.5 md:h-3.5" />
            </button>

            {/* Content for mobile (compact) */}
            <div className="block md:hidden">
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-foreground"
              >
                <p className="text-xs font-bold text-primary flex items-center gap-1 pr-3 py-0.5">
                  💬 Consulta profesional gratis
                </p>
              </a>
            </div>

            {/* Content for desktop (full details) */}
            <div className="hidden md:flex flex-col gap-1 items-start">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Ana Karina (Online)</span>
              </div>
              
              <a 
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline text-foreground"
              >
                <p className="text-sm font-semibold pr-4 leading-tight">
                  ¿Tenés dudas sobre tu servicio?
                </p>
                <p className="text-xs font-bold text-primary flex items-center gap-1 mt-0.5">
                  💬 ¡Consulta profesional gratis!
                </p>
              </a>
            </div>

            {/* Bubble arrow */}
            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-background border-r border-t border-border/80 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ 
          scale: 1,
          y: [0, -6, 0] // Gentle floating animation!
        }}
        transition={{ 
          scale: { delay: 1.5, type: "spring" },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut" }
        }}
        className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-2xl cursor-pointer select-none group"
        aria-label="Contactar por WhatsApp"
      >
        {/* Outer glowing pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping pointer-events-none" />

        {/* Circular Avatar image of professional */}
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-white bg-muted shadow-inner group-hover:scale-105 transition-transform duration-300">
          <img 
            src="/avatar.png" 
            alt="Ana Karina" 
            className="w-full h-full object-cover" 
          />
        </div>

        {/* Small WhatsApp badge at bottom-right of avatar */}
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg border border-white text-white scale-110 group-hover:scale-125 transition-transform duration-300">
          <MessageCircle className="w-3.5 h-3.5 fill-white text-[#25D366]" />
        </div>
      </motion.a>
    </div>
  );
};

export default WhatsAppFab;
