import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]/route';
import { Calendar, Users, Sparkles, TrendingUp } from 'lucide-react';

export default async function Home() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-24">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Planifica tu Evento Perfecto
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Conectamos organizadores con proveedores y utilizamos IA para crear
            experiencias inolvidables
          </p>
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signin"
                className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
              >
                Comenzar Ahora
              </Link>
              <Link
                href="/services"
                className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
              >
                Ver Servicios
              </Link>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Calendar className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Planificación Inteligente</h3>
            <p className="text-gray-600">
              Utiliza IA para obtener sugerencias personalizadas según tu evento
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Red de Proveedores</h3>
            <p className="text-gray-600">
              Conecta con servicios formales e informales en un solo lugar
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Sparkles className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">Estimación de Costos</h3>
            <p className="text-gray-600">
              Obtén presupuestos estimados basados en tus parámetros
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <TrendingUp className="h-12 w-12 text-primary-600 mb-4" />
            <h3 className="text-xl font-semibold mb-2">ODS Alineado</h3>
            <p className="text-gray-600">
              Apoya el crecimiento económico sostenible y consumo responsable
            </p>
          </div>
        </div>

        {/* ODS Section */}
        <div className="mt-16 bg-primary-600 text-white rounded-lg p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
            Objetivos de Desarrollo Sostenible
          </h2>
          <p className="text-lg md:text-xl text-center mb-8 max-w-3xl mx-auto">
            Este proyecto está alineado con los ODS 8 y 12 de las Naciones Unidas
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-3">ODS 8</h3>
              <p className="text-lg">
                Trabajo decente y crecimiento económico: Promovemos el crecimiento
                económico inclusivo apoyando a pequeños emprendedores y empresas locales.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <h3 className="text-2xl font-semibold mb-3">ODS 12</h3>
              <p className="text-lg">
                Producción y consumo responsables: Fomentamos el consumo responsable
                conectando directamente consumidores con proveedores locales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

