import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

const WhatsAppFab = () => {
  return (
    <motion.a
      href="https://wa.me/5491127485584"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.5, type: "spring" }}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      aria-label="Contactar por WhatsApp"
    >
      <MessageCircle className="w-7 h-7 text-background" />
    </motion.a>
  );
};

export default WhatsAppFab;
