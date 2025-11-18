// Script para poblar la base de datos con servicios de ejemplo
// Ejecutar con: npx ts-node scripts/seed-services.ts

import connectDB from '../lib/db';
import Service from '../models/Service';

const sampleServices = [
  {
    name: 'Catering para Eventos',
    category: 'catering',
    price: 15000,
    description: 'Servicio completo de catering para eventos, incluye comida, bebidas y servicio de meseros',
    provider: 'Catering Delicioso',
    contactEmail: 'contacto@cateringdelicioso.cl',
    contactPhone: '+56 9 1234 5678',
  },
  {
    name: 'Decoración de Fiestas',
    category: 'decoration',
    price: 8000,
    description: 'Decoración completa para cumpleaños, incluye globos, manteles y centros de mesa',
    provider: 'Decoraciones Mágicas',
    contactEmail: 'info@decoracionesmagicas.cl',
    contactPhone: '+56 9 2345 6789',
  },
  {
    name: 'Fotografía Profesional',
    category: 'photography',
    price: 50000,
    description: 'Servicio de fotografía profesional para eventos, incluye edición y álbum digital',
    provider: 'Fotografía Pro',
    contactEmail: 'foto@fotografiapro.cl',
    contactPhone: '+56 9 3456 7890',
  },
  {
    name: 'DJ y Sonido',
    category: 'music',
    price: 30000,
    description: 'Servicio de DJ con equipo de sonido profesional para eventos',
    provider: 'DJ Sound',
    contactEmail: 'dj@djsound.cl',
    contactPhone: '+56 9 4567 8901',
  },
  {
    name: 'Salón de Eventos',
    category: 'venue',
    price: 100000,
    description: 'Salón para eventos con capacidad hasta 200 personas, incluye mobiliario básico',
    provider: 'Salones Elegantes',
    contactEmail: 'reservas@saloneselegantes.cl',
    contactPhone: '+56 9 5678 9012',
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

