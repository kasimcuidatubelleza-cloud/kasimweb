import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, Send } from "lucide-react";
import { Service } from "@/data/services";
import { Button } from "@/components/ui/button";

interface BookingModalProps {
  service: Service | null;
  isOpen: boolean;
  onClose: () => void;
}

const timeSlots = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "14:00", "14:30", "15:00", "15:30", "16:00",
  "16:30", "17:00", "17:30", "18:00",
];

const BookingModal = ({ service, isOpen, onClose }: BookingModalProps) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const handleWhatsApp = () => {
    if (!service || !selectedDate || !selectedTime) return;

    const dateFormatted = new Date(selectedDate + "T12:00:00").toLocaleDateString("es-AR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const message = encodeURIComponent(
      `¡Hola! 👋 Quisiera reservar un turno:\n\n` +
      `📌 *Servicio:* ${service.name}\n` +
      `📅 *Fecha:* ${dateFormatted}\n` +
      `🕐 *Hora:* ${selectedTime} hs\n` +
      (name ? `👤 *Nombre:* ${name}\n` : "") +
      `\n¡Muchas gracias!`
    );

    window.open(`https://wa.me/5491127485584?text=${message}`, "_blank");
    onClose();
    setSelectedDate("");
    setSelectedTime("");
    setName("");
  };

  const isValid = service && selectedDate && selectedTime;

  return (
    <AnimatePresence>
      {isOpen && service && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-foreground/40 backdrop-blur-sm p-0 md:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-background w-full md:max-w-lg md:rounded-2xl rounded-t-3xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle bar mobile */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
            </div>

            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-semibold">{service.name}</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    {service.category} · {service.duration}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Tu nombre (opcional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: María"
                  maxLength={50}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fecha preferida
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={today}
                  className="w-full px-4 py-3 rounded-xl bg-muted border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
                />
              </div>

              {/* Time */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Horario aproximado
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "bg-muted text-muted-foreground hover:bg-accent"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <Button
                onClick={handleWhatsApp}
                disabled={!isValid}
                className="w-full py-6 rounded-2xl text-base font-semibold bg-[#25D366] hover:bg-[#20bd5a] text-primary-foreground gap-2 disabled:opacity-40 transition-all"
              >
                <Send className="w-5 h-5" />
                Reservar por WhatsApp
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Serás redirigida a WhatsApp para confirmar tu turno
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
