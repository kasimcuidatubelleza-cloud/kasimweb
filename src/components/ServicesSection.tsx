import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight, Loader2 } from "lucide-react";
import { Service, supabase } from "@/lib/supabase";
import BookingModal from "./BookingModal";
import { useQuery } from "@tanstack/react-query";

const imageMap: Record<string, string> = {
  "manicura-americana": "/842.jpg",
  "manicura-rusa": "/848.jpg",
  "manicura-japonesa": "/849.jpg",
  "pedicuría-completa": "/853.jpg",
  "alargamiento": "/866.jpg",
  "caping-gel": "/890.jpg",
  "perfilado-de-cejas": "/935.jpg",
  "masajes-relajantes": "/948.jpg",
};

const ServicesSection = () => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: services, isLoading, error } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .eq('category', 'general')
        .order('name');
      
      if (error) throw error;
      return data as Service[];
    }
  });

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20 text-center text-red-500">
        Error al cargar los servicios. Por favor intenta de nuevo.
      </div>
    );
  }

  return (
    <section id="servicios" className="py-20 md:py-28">
      <div className="container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Nuestros Servicios
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold">
            Agendá tu turno de forma <span className="italic">rápida y segura</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Seleccioná el tratamiento que necesitás, elegí la fecha y hora que prefieras. Reservá tu lugar en línea con solo un clic.
          </p>
        </motion.div>

        {/* Servicios grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {services?.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 border border-white/10"
              onClick={() => handleBook(service)}
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                <img
                  src={service.image_url || imageMap[service.name.toLowerCase().replace(/ /g, '-')] || '/842.jpg'}
                  alt={service.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  style={{ objectPosition: service.image_position || '50% 50%' }}
                />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-display font-semibold">{service.name}</h3>
                  <span className="text-primary font-bold">${service.price}</span>
                </div>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration_minutes} min
                  </div>
                  <span className="flex items-center gap-1 text-primary font-semibold text-sm group-hover:gap-2 transition-all">
                    Reservar <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <BookingModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </section>
  );
};

export default ServicesSection;
