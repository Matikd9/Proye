import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedService {
  name: string;
  price: number;
  provider: string;
  url: string;
  category: string;
}

// Ejemplo de web scraping para servicios de eventos
// Nota: En producción, esto debería ser más robusto y respetar robots.txt
export async function scrapeEventServices(
  category: string,
  location: string = 'Chile'
): Promise<ScrapedService[]> {
  try {
    // Ejemplo: Scraping de sitios de servicios de eventos
    // En un caso real, aquí harías scraping de sitios como:
    // - MercadoLibre
    // - Sitios de catering locales
    // - Plataformas de servicios
    
    // Por ahora, retornamos datos de ejemplo estructurados
    // En producción, implementarías el scraping real aquí
    
    const exampleServices: ScrapedService[] = [
      {
        name: 'Servicio de Catering Básico',
        price: 15000,
        provider: 'Catering Local',
        url: 'https://example.com/catering',
        category: 'catering',
      },
      {
        name: 'Decoración de Eventos',
        price: 8000,
        provider: 'Decoraciones XYZ',
        url: 'https://example.com/decoracion',
        category: 'decoracion',
      },
      {
        name: 'Fotografía Profesional',
        price: 50000,
        provider: 'Fotógrafos Pro',
        url: 'https://example.com/fotografia',
        category: 'fotografia',
      },
    ];

    const normalizedCategory = category.toLowerCase();
    const normalizedLocation = location.trim();

    return exampleServices
      .filter((service) => service.category.toLowerCase().includes(normalizedCategory))
      .map((service) => ({
        ...service,
        provider: `${service.provider} · ${normalizedLocation}`,
      }));
  } catch (error: unknown) {
    console.error('Error scraping services:', error);
    return [];
  }
}

// Función para obtener precios de productos desde una URL
export async function scrapeProductPrices(url: string): Promise<number | null> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 5000,
    });

    const $ = cheerio.load(response.data);
    
    // Intentar encontrar el precio en diferentes formatos comunes
    const priceSelectors = [
      '[itemprop="price"]',
      '.price',
      '.precio',
      '[data-price]',
      '.product-price',
    ];

    for (const selector of priceSelectors) {
      const priceText = $(selector).first().text();
      const priceMatch = priceText.match(/[\d.,]+/);
      if (priceMatch) {
        const price = parseFloat(priceMatch[0].replace(/[.,]/g, ''));
        if (!isNaN(price)) {
          return price;
        }
      }
    }

    return null;
  } catch (error: unknown) {
    console.error('Error scraping product price:', error);
    return null;
  }
}

