import { motion } from "framer-motion";

const HeroSection = () => {
  return (
    <section id="inicio" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background video (YouTube Embed) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-black">
        <iframe
          src="https://www.youtube.com/embed/fMEoESMiADQ?autoplay=1&mute=1&loop=1&playlist=fMEoESMiADQ&controls=0&showinfo=0&rel=0&playsinline=1&iv_load_policy=3&modestbranding=1&enablejsapi=1"
          title="Background Video"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-screen h-[56.25vw] min-h-screen min-w-[177.77vh] object-cover scale-[1.15] pointer-events-none"
          allow="autoplay; encrypted-media"
          frameBorder="0"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>

      <div className="container relative z-10 pt-20">
        <div className="max-w-xl">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-rose-gold text-sm md:text-base font-medium tracking-[0.25em] uppercase mb-4"
          >
            ESTUDIO DE UÑAS, ESTÉTICA & BIENESTAR INTEGRAL · RECOLETA
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-cream leading-tight"
          >
            Mucho más que
            <br />
            <span className="italic text-rose-gold">belleza</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-nude text-base md:text-lg mt-6 max-w-md leading-relaxed"
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
              className="px-8 py-4 rounded-full border-2 border-cream/30 text-cream font-semibold text-center hover:bg-cream/10 transition-colors"
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
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-cream/40 rounded-full flex justify-center pt-2">
          <div className="w-1.5 h-1.5 bg-cream/60 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
