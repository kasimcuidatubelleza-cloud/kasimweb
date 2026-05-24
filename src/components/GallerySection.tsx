import { useEffect, useState, useRef } from "react";

const photos = [
  "/842.jpg",
  "/848.jpg",
  "/849.jpg",
  "/853.jpg",
  "/866.jpg",
  "/890.jpg",
  "/935.jpg",
  "/948.jpg",
];

// Extendemos la lista para crear un efecto infinito suave
const extendedPhotos = [...photos, ...photos, ...photos];

const GallerySection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [centerIndex, setCenterIndex] = useState(-1);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const container = containerRef.current;
      
      // Encontrar el elemento más cercano al centro de la pantalla
      const containerCenter = window.innerWidth / 2;
      
      let closestIndex = -1;
      let minDistance = Infinity;

      const items = container.querySelectorAll(".gallery-item");
      items.forEach((item, index) => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.left + rect.width / 2;
        const distance = Math.abs(containerCenter - itemCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      if (closestIndex !== centerIndex) {
        setCenterIndex(closestIndex);
      }
    };

    // Usar requestAnimationFrame para hacer un scroll infinito automático
    let animationId: number;
    const animate = () => {
      if (containerRef.current) {
        containerRef.current.scrollLeft += 1; // Velocidad de scroll
        
        // Reset scroll para hacerlo infinito (cuando llega a un punto)
        if (containerRef.current.scrollLeft >= containerRef.current.scrollWidth / 3) {
          containerRef.current.scrollLeft = 0;
        }
        
        handleScroll();
      }
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    // Permitir interacción táctil manual deteniendo la animación temporalmente?
    // Para simplificar, solo mantendremos el auto-scroll.
    
    return () => cancelAnimationFrame(animationId);
  }, [centerIndex]);

  return (
    <div className="bg-background text-foreground py-16 overflow-hidden border-t border-border">
      <div className="container mb-8 text-center">
        <h3 className="font-display text-2xl md:text-3xl font-bold tracking-tight">Nuestros Trabajos</h3>
        <p className="text-muted-foreground text-sm mt-2">Un poco de lo que hacemos con amor y dedicación</p>
      </div>
      
      <div 
        ref={containerRef}
        className="flex gap-4 md:gap-8 overflow-x-hidden whitespace-nowrap py-10 no-scrollbar items-center cursor-grab active:cursor-grabbing"
      >
        {extendedPhotos.map((src, index) => {
          const isCenter = index === centerIndex;
          return (
            <div 
              key={index} 
              className={`gallery-item flex-none w-[220px] md:w-[300px] h-[280px] md:h-[400px] transition-all duration-700 ease-out rounded-3xl overflow-hidden shadow-sm ${
                isCenter ? 'scale-[1.15] z-10 shadow-2xl border-2 border-primary/20 brightness-110' : 'scale-90 opacity-60 brightness-90 grayscale-[30%]'
              }`}
            >
              <img 
                src={src} 
                alt="Trabajo Kasim" 
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GallerySection;
