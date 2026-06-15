import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const HeroSection = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const setPlaybackSpeed = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "command",
            func: "setPlaybackRate",
            args: [0.75], // 0.75x speed (un poco más lento, tiempo real/relajado)
          }),
          "*"
        );
      }
    };

    // Intentar aplicar la velocidad a los 2, 4 y 6 segundos para asegurar que el reproductor esté listo
    const t1 = setTimeout(setPlaybackSpeed, 2000);
    const t2 = setTimeout(setPlaybackSpeed, 4000);
    const t3 = setTimeout(setPlaybackSpeed, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  return (
    <section 
      id="inicio" 
      className="relative min-h-[auto] md:min-h-screen flex flex-col md:flex-row md:items-center overflow-hidden pt-16 md:pt-20 bg-background md:bg-transparent"
    >
      {/* Background video (YouTube Embed) */}
      <div className="relative md:absolute md:inset-0 w-full h-[56.25vw] md:h-auto pointer-events-none overflow-hidden bg-black flex items-center justify-center shrink-0">
        <iframe
          ref={iframeRef}
          src="https://www.youtube.com/embed/fMEoESMiADQ?autoplay=1&mute=1&loop=1&playlist=fMEoESMiADQ&controls=0&showinfo=0&rel=0&playsinline=1&iv_load_policy=3&modestbranding=1&enablejsapi=1&disablekb=1&fs=0"
          title="Background Video"
          style={{ pointerEvents: "none" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 portrait:top-0 portrait:left-0 portrait:transform-none portrait:w-full portrait:h-[56.25vw] portrait:min-h-0 portrait:min-w-0 portrait:scale-100 portrait:object-contain landscape:w-screen landscape:h-[56.25vw] landscape:min-h-screen landscape:min-w-[177.77vh] landscape:scale-[1.15] landscape:object-cover pointer-events-none"
          allow="autoplay; encrypted-media"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-presentation"
          onLoad={() => {
            // Intentar aplicar inmediatamente al cargar
            setTimeout(() => {
              if (iframeRef.current && iframeRef.current.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  JSON.stringify({
                    event: "command",
                    func: "setPlaybackRate",
                    args: [0.75],
                  }),
                  "*"
                );
              }
            }, 1000);
          }}
        />
        <div className="absolute inset-0 bg-black/0 md:bg-black/50" />
      </div>

      <div className="container relative z-10 py-10 md:py-20 flex-grow">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-primary md:text-rose-gold text-xs md:text-base font-medium tracking-[0.25em] uppercase mb-4"
          >
            ESTUDIO DE UÑAS, ESTÉTICA & BIENESTAR INTEGRAL · RECOLETA
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-6xl lg:text-7xl font-display font-bold text-foreground md:text-cream leading-tight"
          >
            Mucho más que
            <br />
            <span className="italic text-primary md:text-rose-gold">belleza</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-muted-foreground md:text-nude text-sm md:text-lg mt-6 max-w-md leading-relaxed"
          >
            Brindamos salud y descanso para tus manos y pies. Somos expertos en la prevención y el tratamiento de patologías, combinando el cuidado estético con el bienestar que tu cuerpo necesita.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 mt-8"
          >
            <a
              href="#servicios"
              className="px-8 py-4 rounded-full bg-primary text-primary-foreground font-semibold text-center hover:opacity-90 transition-opacity"
            >
              Ver Servicios
            </a>
            <a
              href="https://wa.me/5491127485584"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 rounded-full border-2 border-primary/30 text-primary md:border-cream/30 md:text-cream font-semibold text-center hover:bg-cream/10 transition-colors"
            >
              Reservar Turno
            </a>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex"
      >
        <div className="w-6 h-10 border-2 border-cream/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-cream/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
