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
              ¿Quiénes Somos?
            </p>
            <h2 className="text-3xl md:text-4xl font-display font-bold leading-tight">
              Ana Karina Campos y Fernando Higa.
            </h2>
            <p className="text-muted-foreground mt-6 leading-relaxed text-sm">
              Somos dos jóvenes profesionales que nos atrevimos a creer en una belleza consciente; una que respeta el cuerpo y resalta su esencia de forma natural. Con el respaldo de los 22 años de trayectoria de Ana en el cuidado estético y la experiencia de Fernando en la administración de negocios, fundamos Kasim: un espacio pensado para quienes buscan cuidar su salud y belleza, restaurarse y reconciliarse con su cuerpo.
            </p>

            <div className="mt-8 space-y-3">
              <h4 className="font-display font-bold text-foreground uppercase tracking-wider text-xs">Nuestro valor diferencial:</h4>
              <p className="text-muted-foreground leading-relaxed text-sm">
                En Kasim, nuestra misión es fusionar la salud y la belleza de manera responsable, apoyados en:
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm pl-4 list-disc marker:text-primary">
                <li>Profesionales expertos.</li>
                <li>Tratamiento y prevención de patologías en manos y pies.</li>
                <li>Bioseguridad: Uso de productos de primera calidad y descartables.</li>
              </ul>
            </div>

            <div className="mt-8 space-y-2">
              <h4 className="font-display font-bold text-foreground uppercase tracking-wider text-xs">¿Dónde te atendemos?</h4>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Llevamos bienestar a donde lo necesites. Disfruta de la experiencia Kasim en nuestras instalaciones o a domicilio (atención particular, comunidades y empresas).
              </p>
            </div>
          </motion.div>

          {/* Features grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
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
