import { motion } from "framer-motion";
import { Award, Heart, Shield, Star } from "lucide-react";

const features = [
  { icon: Award, title: "22 años", desc: "de experiencia profesional" },
  { icon: Shield, title: "Materiales", desc: "descartables y de primera calidad" },
  { icon: Heart, title: "Salud + Belleza", desc: "unidas de manera responsable" },
  { icon: Star, title: "105 reseñas", desc: "excelentes en Google" },
];

const AboutSection = () => {
  return (
    <section id="nosotros" className="py-20 md:py-28 bg-gradient-warm">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-primary text-sm font-medium tracking-[0.2em] uppercase mb-3">
              Quiénes Somos
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Soy Ana Karina Campos
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed">
              Me dedico hace 22 años a los servicios del cuidado de la belleza. 
              Esto me llevó a la misión de crear <strong className="text-foreground">Kasim</strong>, 
              un proyecto dedicado a cuidar la salud y la belleza de quienes buscan 
              restaurar y reconciliarse con su cuerpo.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Nuestro valor diferencial es unir la salud y la belleza de manera 
              responsable. A través de profesionales expertos, prevención, y el uso 
              de productos de primera calidad.
            </p>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              Ofrecemos nuestros servicios en nuestras instalaciones, a domicilio y para empresas.
            </p>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card rounded-2xl p-6 text-center"
              >
                <f.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <h4 className="font-display font-bold text-xl">{f.title}</h4>
                <p className="text-muted-foreground text-sm mt-1">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
