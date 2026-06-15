export interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  image: string;
}

export const services: Service[] = [
  {
    id: "manicura-americana",
    name: "Manicura Americana",
    category: "Manicura",
    description: "Técnica de corte manual con instrumento como el alicate, tan conocido como cutículas.",
    price: "Consultar",
    duration: "45 min",
    image: "manicura-americana",
  },
  {
    id: "manicura-rusa",
    name: "Manicura Rusa",
    category: "Manicura",
    description: "Proceso mecánico con torno especial para personas con alteración de crecimiento de eponiquio. Esmaltado más prolijo.",
    price: "Consultar",
    duration: "60 min",
    image: "manicura-rusa",
  },
  {
    id: "manicura-japonesa",
    name: "Manicura Japonesa",
    category: "Manicura",
    description: "Para quienes desean un descanso de materiales como el acrilato. Uñas prolijas y pulidas con brillo natural. La más recomendada.",
    price: "Consultar",
    duration: "50 min",
    image: "manicura-japonesa",
  },
  {
    id: "belleza-pies",
    name: "Belleza de Pies",
    category: "Pies",
    description: "Servicio de emprolijamiento de pies, especial para personas sin patologías.",
    price: "Consultar",
    duration: "45 min",
    image: "pedicuria",
  },
  {
    id: "pedicuria",
    name: "Pedicuría",
    category: "Pies",
    description: "Técnica para personas con cutículas y pequeñas helomas (callos).",
    price: "Consultar",
    duration: "60 min",
    image: "pedicuria",
  },
  {
    id: "podoestetica",
    name: "Podoestética",
    category: "Pies",
    description: "Trata patologías: onicomicosis, hiperqueratosis y corrección de onicocriptosis (uña encarnada). El más pedido.",
    price: "Consultar",
    duration: "75 min",
    image: "pedicuria",
  },
  {
    id: "alargamiento",
    name: "Sistema de Alargamiento",
    category: "Tratamientos",
    description: "Alargamiento de uñas para personas con onicofagia. Tratamiento correctivo con revisión cada 20 días.",
    price: "Consultar",
    duration: "90 min",
    image: "alargamiento",
  },
  {
    id: "capping",
    name: "Capping",
    category: "Tratamientos",
    description: "Capa fina sobre la uña para quienes les falta queratina. Endurecedor con mayor duración del esmaltado. Revisión cada 20 días.",
    price: "Consultar",
    duration: "60 min",
    image: "capping",
  },
  {
    id: "perfilado-cejas",
    name: "Perfilado de Cejas",
    category: "Estética",
    description: "Realza tu mirada y armoniza tu rostro con técnicas precisas. Definimos y embellecemos respetando tu belleza natural.",
    price: "Consultar",
    duration: "30 min",
    image: "perfilado-cejas",
  },
  {
    id: "masajes",
    name: "Masajes",
    category: "Bienestar",
    description: "Masaje deportivo, reflexología y relajación profunda. Ideal para aliviar tensión y recuperar energía.",
    price: "Consultar",
    duration: "60 min",
    image: "masajes",
  },
];

export const categories = [...new Set(services.map((s) => s.category))];
