import { MapPin, Phone, Instagram, Clock, Map } from "lucide-react";
import GallerySection from "./GallerySection";

interface FooterSectionProps {
  ctaTitle?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
}

const FooterSection = ({
  ctaTitle = "Es momento de priorizarte",
  ctaDescription = "No postergues más tu bienestar. Da el primer paso para aliviar esas molestias y regálale a tu cuerpo el cuidado que merece.",
  ctaButtonText = "Reservá tu Turno Ahora"
}: FooterSectionProps) => {
  return (
    <footer id="contacto" className="bg-foreground text-background">
      {/* CTA band */}
      <div className="bg-primary py-10 md:py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground">
            {ctaTitle}
          </h2>
          <p className="text-primary-foreground/80 mt-3 max-w-lg mx-auto">
            {ctaDescription}
          </p>
          <a
            href="#servicios"
            className="inline-block mt-6 px-8 py-4 rounded-full bg-background text-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            {ctaButtonText}
          </a>
        </div>
      </div>

      <GallerySection />

      <div className="relative overflow-hidden">
        {/* Logo Watermark */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none mix-blend-screen overflow-hidden">
          <img src="/logo.jpeg" alt="" className="w-[300px] md:w-[400px] object-contain" />
        </div>

        <div className="container relative z-10 py-12 md:py-16">
          <div className="grid md:grid-cols-3 gap-10">
            {/* Brand */}
            <div>
              <h3 className="text-2xl brand-name tracking-wider">KASIM</h3>
              <p className="text-[10px] tracking-[0.3em] text-background/50 -mt-0.5 mb-4">
                CUIDA TU BELLEZA
              </p>
              <p className="text-background/60 text-sm leading-relaxed">
                Estudio de Uñas, Estética & Bienestar Integral en Recoleta. Más de dos décadas cuidando la salud y belleza de tus manos y pies.
              </p>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="font-display font-semibold text-lg mb-4">Contacto</h4>
              <div className="flex items-center gap-3 text-background/70 text-sm">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>CABA, Argentina</span>
              </div>
              <div className="flex items-center gap-3 text-background/70 text-sm">
                <Map className="w-4 h-4 shrink-0" />
                <span>Zonas: Recoleta, Retiro y Tribunales</span>
              </div>
              <a
                href="https://wa.me/5491127485584"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Phone className="w-4 h-4 shrink-0" />
                (+54) 11-2748-5584
              </a>
              <a
                href="https://www.instagram.com/kasim.cuidatubelleza"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-background/70 hover:text-background transition-colors text-sm"
              >
                <Instagram className="w-4 h-4 shrink-0" />
                @kasim.cuidatubelleza
              </a>
            </div>

            {/* Services links */}
            <div>
              <h4 className="font-display font-semibold text-lg mb-4">Servicios</h4>
              <div className="grid grid-cols-1 gap-2 text-sm text-background/70">
                <span>Manicura Americana / Rusa / Japonesa</span>
                <span>Capping</span>
                <span>Sistema de Alargamiento</span>
                <span>Pedicuría</span>
                <span>Podoestética: Ortonixia / Hiperqueratosis y más.</span>
                <span>Alteraciones Plantares</span>
                <span>Reflexología</span>
                <span>Perfilado de Cejas</span>
                <span>Masajes</span>
                <span>Servicio a Domicilio</span>
              </div>
            </div>
          </div>

          <div className="border-t border-background/10 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-background/40 text-xs">
            <span>
              © {new Date().getFullYear()} Kasim — Estudio de Uñas, Estética & Bienestar Integral. Todos los derechos reservados.
            </span>
            <span>
              Desarrollado por{" "}
              <a
                href="https://wa.me/541171284865?text=Hola%20Salvatore,%20vi%20tu%20contacto%20en%20la%20web%20de%20Kasim%20y%20me%20gustar%C3%ADa%20consultarte%20para%20desarrollar%20mi%20p%C3%A1gina%20web."
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-background transition-colors underline font-semibold"
              >
                Salvatore Perozzi
              </a>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
