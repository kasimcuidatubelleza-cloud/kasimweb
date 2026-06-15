import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  { name: "Francisca Z.", text: "Una genia Ana Karina, me atendió de muy buena forma y estuve muy cómoda. ¡Recomiendo!" },
  { name: "Joisi S.", text: "Excelente atención, muy recomendado y muy eficiente. ¡Muchas gracias Ana!" },
  { name: "Victoria D.", text: "Excelente profesional, super amable y dedicada. Me alivió mucho y me quedaron los pies divinos." },
  { name: "Mlara", text: "La atención es un 1000! Una mujer súper amable, cálida y súper profesional." },
  { name: "Felicitas L.", text: "Súper recomiendo! Una genia, muy profesional." },
  { name: "Silvana F.", text: "Excelente atención, trabajo sostenido en el tiempo y con buenos productos." },
];

const ReviewsSection = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Testimonios que nos inspiran
          </p>
          <h2 className="text-3xl md:text-5xl font-display font-bold leading-tight">
            Descubre la experiencia de quienes confían en <span className="italic">Kasim</span>
          </h2>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-primary text-primary" />
              ))}
            </div>
            <span className="text-muted-foreground text-sm">
              105 reseñas en Google
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reviews.map((review, i) => (
            <motion.div
              key={review.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-foreground leading-relaxed">"{review.text}"</p>
              <p className="text-muted-foreground text-sm font-medium mt-4">
                — {review.name}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
