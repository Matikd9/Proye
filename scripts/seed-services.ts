// Script para poblar la base de datos con servicios de ejemplo
// Ejecutar con: npx ts-node scripts/seed-services.ts

import 'dotenv/config';
import connectDB from '../lib/db';
import Service from '../models/Service';

const sampleServices = [
  {
    name: 'Banquetería y Catering Lo Barnechea',
    category: 'catering',
    price: 28000,
    description: 'Empresa familiar que arma menús personalizados para eventos corporativos y celebraciones en Santiago.',
    provider: 'Banquetería y Catering',
    region: 'Región Metropolitana',
    city: 'Lo Barnechea',
    contactEmail: 'banqueteraprofesional@gmail.com',
    contactUrl: 'https://banqueteriaycatering.cl',
  },
  {
    name: 'BARRITA Catering & Banquetería',
    category: 'catering',
    price: 32000,
    description: 'Coffee breaks, matrimonios y cumpleaños con ambientación temática y montaje completo.',
    provider: 'Productora Barrita',
    region: 'Región Metropolitana',
    city: 'Providencia',
    contactEmail: 'andrea@productorabarrita.cl',
    contactUrl: 'https://productorabarrita.cl',
  },
  {
    name: 'Marie Gourmet',
    category: 'catering',
    price: 35000,
    description: 'Banquetería gourmet con coctelería y presentación elegante para eventos en Santiago.',
    provider: 'Marie Gourmet',
    region: 'Región Metropolitana',
    city: 'La Reina',
    contactEmail: 'ventas@mariegourmet.cl',
    contactUrl: 'https://mariegourmet.cl',
  },
  {
    name: 'Pi Pay Pizzas',
    category: 'catering',
    price: 18000,
    description: 'Food truck y fiestas de pizzas artesanales con masa madre para matrimonios y cumpleaños.',
    provider: 'Pi Pay Pizzas',
    region: 'Región Metropolitana',
    city: 'Providencia',
    contactEmail: 'contacto@pipaypizzas.cl',
    contactUrl: 'https://pipaypizzas.cl',
  },
  {
    name: 'Gourmand Catering',
    category: 'catering',
    price: 40000,
    description: 'Cócteles gourmet, tablas y menús personalizados con enfoque creativo en Las Condes.',
    provider: 'Gourmand',
    region: 'Región Metropolitana',
    city: 'Las Condes',
    contactEmail: 'reservas@gourmand.cl',
    contactUrl: 'https://gourmand.cl',
  },
  {
    name: 'Cataleno Banquetería',
    category: 'catering',
    price: 27000,
    description: 'Coffee breaks, brunch y banquetes desde Cerro Alegre para la V Región y Santiago.',
    provider: 'Cataleno',
    region: 'Valparaíso',
    city: 'Valparaíso',
    contactEmail: 'contacto@cataleno.cl',
    contactUrl: 'https://cataleno.cl',
  },
  {
    name: 'Víctor Hidalgo Díaz Fotografía',
    category: 'photography',
    price: 180000,
    description: 'Cobertura completa de matrimonios y eventos especiales con estudio propio en Las Condes.',
    provider: 'VMH Destudio',
    region: 'Región Metropolitana',
    city: 'Las Condes',
    contactPhone: '+56 9 9768 1241',
    contactUrl: 'https://vmhdestudio.com',
  },
  {
    name: 'Marcelo Tapia Fotografía Corporativa',
    category: 'photography',
    price: 220000,
    description: 'Retratos ejecutivos y cobertura de eventos empresariales con entrega express para RRSS.',
    provider: 'Marcelo Tapia',
    region: 'Región Metropolitana',
    city: 'Santiago',
    contactEmail: 'fotos@marcelotapia.cl',
    contactPhone: '+56 9 3504 0862',
    contactUrl: 'https://marcelotapia.cl',
  },
  {
    name: 'Rodolfo Páez Estudio Foto & Video',
    category: 'photography',
    price: 210000,
    description: 'Estudio con más de 30 años realizando fotografía publicitaria, social y video corporativo.',
    provider: 'Rodolfo Páez',
    region: 'Región Metropolitana',
    city: 'Providencia',
    contactEmail: 'info@rodolfopaez.cl',
    contactPhone: '+56 9 6373 1009',
    contactUrl: 'https://rodolfopaez.cl',
  },
  {
    name: 'Axel Garrido Fotógrafo',
    category: 'photography',
    price: 170000,
    description: 'Cobertura de matrimonios, festivales y eventos en la V Región con estilo artístico.',
    provider: 'Axel Garrido',
    region: 'Valparaíso',
    city: 'Viña del Mar',
    contactUrl: 'https://axelgarrido.cl',
  },
  {
    name: 'Luis Gustavo Zamudio Fotografía',
    category: 'photography',
    price: 165000,
    description: 'Paquetes completos de cobertura fotográfica estilo documental en Concepción y alrededores.',
    provider: 'Luis Gustavo Zamudio',
    region: 'Biobío',
    city: 'Concepción',
    contactUrl: 'https://luisgustavozamudio.art',
  },
  {
    name: 'ATE Producciones',
    category: 'decoration',
    price: 260000,
    description: 'Ambientación, arriendo de carpas y producción integral con 26 años de experiencia.',
    provider: 'ATE Producciones',
    region: 'Región Metropolitana',
    city: 'Las Condes',
    contactEmail: 'ate@atepro.cl',
    contactPhone: '+56 2 2228 3506',
    contactUrl: 'https://ateproducciones.cl',
  },
  {
    name: 'HC Ambientación de Eventos',
    category: 'decoration',
    price: 185000,
    description: 'Montajes decorativos temáticos para matrimonios y celebraciones en Concepción y alrededores.',
    provider: 'HC Ambientación',
    region: 'Biobío',
    city: 'Hualpén',
    contactPhone: '+56 9 9199 9038',
    contactUrl: 'https://m.facebook.com/HCambientacion',
  },
  {
    name: 'MPR Ambientación',
    category: 'decoration',
    price: 240000,
    description: 'Montajes creativos, iluminación y mobiliario para bodas boutique en el sur de Chile.',
    provider: 'MPR Ambientación',
    region: 'La Araucanía',
    city: 'Temuco',
    contactUrl: 'https://www.instagram.com/mpr_ambientacion',
  },
];

async function seedServices() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Clear existing services (optional)
    // await Service.deleteMany({});

    // Insert sample services
    for (const service of sampleServices) {
      const existingService = await Service.findOne({ name: service.name });
      if (!existingService) {
        await Service.create(service);
        console.log(`Created service: ${service.name}`);
      } else {
        console.log(`Service already exists: ${service.name}`);
      }
    }

    console.log('Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding services:', error);
    process.exit(1);
  }
}

seedServices();

