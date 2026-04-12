import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, ArrowRight } from "lucide-react";
import { services, categories, Service } from "@/data/services";
import BookingModal from "./BookingModal";

import imgAmericana from "@/assets/manicura-americana.jpg";
import imgRusa from "@/assets/manicura-rusa.jpg";
import imgJaponesa from "@/assets/manicura-japonesa.jpg";
import imgPedicuria from "@/assets/pedicuria.jpg";
import imgAlargamiento from "@/assets/alargamiento.jpg";
import imgCaping from "@/assets/caping.jpg";
import imgCejas from "@/assets/perfilado-cejas.jpg";
import imgMasajes from "@/assets/masajes.jpg";

const imageMap: Record<string, string> = {
  "manicura-americana": imgAmericana,
  "manicura-rusa": imgRusa,
  "manicura-japonesa": imgJaponesa,
  "pedicuria": imgPedicuria,
  "alargamiento": imgAlargamiento,
  "caping": imgCaping,
  "perfilado-cejas": imgCejas,
  "masajes": imgMasajes,
};

const ServicesSection = () => {
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filtered = activeCategory === "Todas"
    ? services
    : services.filter((s) => s.category === activeCategory);

  const handleBook = (service: Service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

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
            Elige tu <span className="italic">tratamiento</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
            Seleccioná el servicio que necesitás, elegí fecha y hora, y reservá directamente por WhatsApp.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {["Todas", ...categories].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group glass-card rounded-2xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300"
              onClick={() => handleBook(service)}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={imageMap[service.image]}
                  alt={service.name}
                  loading="lazy"
                  width={800}
                  height={800}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-sm text-xs font-medium text-foreground">
                    {service.category}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-display font-semibold">{service.name}</h3>
                <p className="text-muted-foreground text-sm mt-2 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
                    <Clock className="w-4 h-4" />
                    {service.duration}
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
