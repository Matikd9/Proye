'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { t } from '@/lib/i18n';
import { Search, Filter } from 'lucide-react';

interface Service {
  _id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  provider: string;
}

export default function ServicesPage() {
  const { locale } = useLanguage();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    filterServices();
  }, [services, searchTerm, selectedCategory]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
        setFilteredServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    let filtered = services;

    if (searchTerm) {
      filtered = filtered.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          service.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter((service) => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">{t('common.loading', locale)}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('services.title', locale)}</h1>

        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('common.search', locale)}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">{t('services.category', locale)}</option>
                <option value="catering">{t('services.categories.catering', locale)}</option>
                <option value="decoration">{t('services.categories.decoration', locale)}</option>
                <option value="photography">{t('services.categories.photography', locale)}</option>
                <option value="music">{t('services.categories.music', locale)}</option>
                <option value="venue">{t('services.categories.venue', locale)}</option>
                <option value="other">{t('services.categories.other', locale)}</option>
              </select>
            </div>
          </div>
        </div>

        {filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No se encontraron servicios</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service) => (
              <div key={service._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-primary-600 font-bold">${service.price.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{service.provider}</p>
                <p className="text-sm text-gray-600 mb-4">{service.description}</p>
                <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                  {t(`services.categories.${service.category}`, locale) || service.category}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

