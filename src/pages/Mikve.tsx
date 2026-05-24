import { motion } from "framer-motion";
import Header from "@/components/Header";
import FooterSection from "@/components/FooterSection";
import WhatsAppFab from "@/components/WhatsAppFab";
import { Leaf, Flower, Crown, Check, ArrowRight, CalendarDays, MessageCircle } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
import BookingModal from "@/components/BookingModal";

const Mikve = () => {
  const [formStatus, setFormStatus] = useState<"idle" | "submitted">("idle");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: services, isLoading } = useQuery({
    queryKey: ['mikve-services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .eq('category', 'mikve')
        .order('price');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitted");
    const formData = new FormData(e.target as HTMLFormElement);
    const nombre = formData.get("nombre");
    const fase = formData.get("fase");
    const msj = `Hola Kasim, soy ${nombre}. Me gustaría información sobre la preparación para Mikve (Fase: ${fase}).`;
    window.open(`https://wa.me/5491127485584?text=${encodeURIComponent(msj)}`, '_blank');
  };

  const getFaseIcon = (name: string) => {
    if (name.toLowerCase().includes('esencial')) return Leaf;
    if (name.toLowerCase().includes('premium')) return Crown;
    return Flower;
  };

  const getFaseSub = (name: string) => {
    if (name.toLowerCase().includes('esencial')) return "preparación pura";
    if (name.toLowerCase().includes('premium')) return "a domicilio";
    return "cuidado integral";
  };

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="pt-24 pb-16">
        {/* HERO */}
        <section className="relative pt-12 pb-10 overflow-hidden flex flex-col items-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto z-10 w-full"
          >
            <div className="rounded-[32px] overflow-hidden shadow-2xl border border-primary/10 bg-background w-full">
              <img 
                src="/banner-mikve.png" 
                alt="Kasim - Preparación, Cuidado, Intención" 
                className="w-full h-auto object-cover" 
              />
            </div>
          </motion.div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[100px] -z-10"></div>
        </section>

        {/* ABOUT */}
        <section className="py-12 md:py-20 bg-muted/30">
          <div className="container max-w-4xl text-center">
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4">Sobre Kasim</p>
            <h2 className="text-3xl md:text-5xl font-display font-bold mb-8">Un momento <span className="italic text-primary">solo tuyo</span></h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              <p>
                Somos Ana Karina y Fernando, 2 jóvenes que se atrevieron a creer que llega el tiempo del respeto al cuerpo y resaltar la belleza de forma natural. Con esta visión, Kasim nace para acompañar a la mujer judía en su preparación previa a la <strong className="text-foreground font-bold">mikve</strong> — ese instante íntimo y sagrado donde cuerpo y alma se reencuentran.
              </p>
              <p>
                Más que un servicio de cuidado, es <span className="font-display italic text-primary font-semibold">un ritual de presencia</span>: un espacio respetuoso, privado y alineado con las necesidades de la preparación, pensado para que llegues serena, cuidada y completamente lista.
              </p>
            </div>
          </div>
        </section>

        {/* FASES */}
        <section className="py-12 md:py-24">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4">Tres Caminos</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold">Encuentra <span className="italic text-primary">tu ritmo</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {isLoading ? (
                <div className="col-span-3 text-center py-10 text-muted-foreground">Cargando servicios...</div>
              ) : services?.map((service, i) => {
                const Icon = getFaseIcon(service.name);
                return (
                  <motion.div 
                    key={service.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-background border rounded-[20px] md:rounded-[28px] p-5 md:p-6 text-center hover:shadow-xl transition-all group flex flex-col h-full"
                  >
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      {/* Ícono Principal */}
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                        <Icon className="w-8 h-8" />
                      </div>
                      
                      {/* Foto Pequeña (si existe) */}
                      {service.image_url && (
                        <div className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full overflow-hidden shadow-lg ring-4 ring-background z-10 group-hover:scale-125 transition-transform duration-500 bg-muted">
                          <img src={service.image_url} alt={service.name} className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-xl md:text-2xl font-display font-bold mb-1">{service.name}</h3>
                    <p className="text-primary font-display italic text-xs mb-3">{getFaseSub(service.name)}</p>
                    <p className="text-muted-foreground leading-relaxed text-sm flex-grow">{service.description}</p>
                    
                    <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                      <div className="text-lg font-bold mb-1">${service.price}</div>
                      <Button onClick={() => handleBook(service)} className="w-full rounded-xl gap-2 font-bold py-5">
                        <CalendarDays className="w-4 h-4" /> Agendar y Pagar
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RITUAL DETAIL */}
        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container max-w-6xl">
            <div className="text-center mb-16">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4">El cuidado, en detalle</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold">Cada paso, con <span className="italic text-primary">kavaná</span></h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: "Manos", items: ["Uñas cortas y limadas", "Limpieza profunda bajo la uña", "Sin esmalte ni residuos", "Cutículas prolijas", "Piel libre de cremas o aceites"] },
                { title: "Pies", items: ["Uñas cortas y limpias", "Talones suavizados", "Entre dedos limpio y seco", "Sin durezas ni piel suelta", "Sin residuos visibles"] },
                { title: "Control Final", items: ["Sin שום jatzitzá (barrera)", "Piel íntegra, sin lastimar", "Sensación limpia y natural", "Aval halájico de cada detalle", "Tranquilidad antes de la mikve"] },
              ].map((col, i) => (
                <div key={i} className="bg-background rounded-3xl p-8 border-t-4 border-primary shadow-sm">
                  <h3 className="text-xl font-display font-bold text-primary mb-6 pb-4 border-b">{col.title}</h3>
                  <ul className="space-y-4 text-muted-foreground">
                    {col.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PHILOSOPHY */}
        <section className="py-12 md:py-24 text-center">
          <div className="container max-w-3xl">
            <span className="text-6xl text-primary/30 font-display leading-none">"</span>
            <blockquote className="text-2xl md:text-4xl font-display italic font-medium leading-relaxed my-8 text-foreground">
              No es solo un servicio.<br/>
              Es seguridad, sensación de cuidado real,<br/>
              una experiencia preparada para acompañarte.
            </blockquote>
            <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary">— la esencia de Kasim</p>
          </div>
        </section>

        {/* FORMULARIO */}
        <section className="py-12 md:py-24 bg-muted/30" id="agendar">
          <div className="container max-w-3xl">
            <div className="text-center mb-12">
              <p className="text-xs font-bold tracking-[0.3em] uppercase text-primary mb-4">Reservar tu momento</p>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Agendar mi <span className="italic text-primary">preparación</span></h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Déjanos tus datos y te avisaremos cuando se acerque tu fecha, o reserva con anticipación el momento que más te convenga. Toda información es confidencial.
              </p>
            </div>

            {formStatus === "idle" ? (
              <form onSubmit={handleSubmit} className="bg-background p-6 md:p-12 rounded-[24px] md:rounded-[40px] shadow-xl border space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-primary ml-2">Tu nombre</label>
                  <input type="text" name="nombre" required className="w-full bg-muted/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-primary ml-2">Teléfono o WhatsApp</label>
                  <input type="tel" name="telefono" required className="w-full bg-muted/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-primary ml-2">Qué te gustaría reservar</label>
                  <select name="fase" required className="w-full bg-muted/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option value="">— elegir —</option>
                    <option value="esencial">🌿 Esencial</option>
                    <option value="completa">🌸 Completa</option>
                    <option value="premium">👑 Premium (a domicilio)</option>
                    <option value="consulta">solo quiero más información</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-primary ml-2">Fecha aproximada (opcional)</label>
                  <input type="date" name="fecha" className="w-full bg-muted/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-widest uppercase text-primary ml-2">Algo que quieras contarnos</label>
                  <textarea name="mensaje" rows={3} placeholder="alergias, preferencias, primera vez..." className="w-full bg-muted/50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-primary/20 resize-none"></textarea>
                </div>
                <Button type="submit" className="w-full py-8 text-lg rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                  Enviar a WhatsApp <ArrowRight className="w-5 h-5" />
                </Button>
              </form>
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-[40px] p-12 text-center">
                <Check className="w-16 h-16 text-primary mx-auto mb-6" />
                <h3 className="text-2xl font-display italic font-bold mb-4">Gracias.</h3>
                <p className="text-muted-foreground text-lg">
                  Hemos recibido tu mensaje con cariño.<br/>
                  Nos pondremos en contacto contigo muy pronto. 🤍
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <BookingModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <FooterSection />
      <WhatsAppFab />
    </div>
  );
};

export default Mikve;
