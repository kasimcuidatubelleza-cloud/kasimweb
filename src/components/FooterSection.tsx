import { MapPin, Phone, Instagram, Clock } from "lucide-react";

const FooterSection = () => {
  return (
    <footer id="contacto" className="bg-foreground text-background">
      {/* CTA band */}
      <div className="bg-primary py-10 md:py-14">
        <div className="container text-center">
          <h2 className="text-2xl md:text-4xl font-display font-bold text-primary-foreground">
            No postergues más tu bienestar
          </h2>
          <p className="text-primary-foreground/80 mt-3 max-w-md mx-auto">
            Da el primer paso para solucionar esas molestias que te preocupan.
          </p>
          <a
            href="https://wa.me/5491127485584"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 px-8 py-4 rounded-full bg-background text-foreground font-semibold hover:opacity-90 transition-opacity"
          >
            Reservar Turno por WhatsApp
          </a>
        </div>
      </div>

      <div className="container py-12 md:py-16">
        <div className="grid md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-display font-bold tracking-wider">KASIM</h3>
            <p className="text-[10px] tracking-[0.3em] text-background/50 -mt-0.5 mb-4">
              CUIDA TU BELLEZA
            </p>
            <p className="text-background/60 text-sm leading-relaxed">
              Salón de Uñas y Estética en Palermo. 22 años cuidando la salud y belleza de tus manos y pies.
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="font-display font-semibold text-lg mb-4">Contacto</h4>
            <a
              href="https://maps.google.com/?q=Libertad+844+Buenos+Aires"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 text-background/70 hover:text-background transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              Libertad 844, C1055 CABA, Argentina
            </a>
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
              <span>Pedicuría & Podoestética</span>
              <span>Sistema de Alargamiento</span>
              <span>Caping</span>
              <span>Perfilado de Cejas</span>
              <span>Masajes</span>
              <span>Servicio a Domicilio</span>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 mt-10 pt-6 text-center text-background/40 text-xs">
          © {new Date().getFullYear()} Kasim — Salón de Uñas y Estética. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
