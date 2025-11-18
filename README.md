# Event Planner Platform - Plataforma de Planificación de Eventos

## 📋 Descripción del Proyecto

Plataforma web que unifica servicios formales e informales para que usuarios puedan organizar distintos tipos de eventos (cumpleaños, juntas de amigos, eventos empresariales, matrimonios). La plataforma conecta usuarios que necesitan organizar eventos con proveedores (pequeñas/medianas empresas y emprendimientos) y utiliza inteligencia artificial para ofrecer alternativas de planificación y costos estimados.

## 🎯 Objetivos de Desarrollo Sostenible (ODS)

Este proyecto está alineado con el **ODS 8: Trabajo decente y crecimiento económico** y **ODS 12: Producción y consumo responsables**.

- **ODS 8**: Promueve el crecimiento económico inclusivo y sostenible, el empleo pleno y productivo y el trabajo decente para todos, apoyando a pequeños emprendedores y empresas locales.
- **ODS 12**: Fomenta el consumo responsable mediante la conexión directa entre consumidores y proveedores locales, reduciendo intermediarios y promoviendo la economía circular.

## 🚀 Características Principales

- ✅ Sistema de autenticación con cifrado de contraseñas (bcrypt)
- ✅ SSO con Google (NextAuth.js)
- ✅ CRUD completo para eventos, servicios y productos
- ✅ Multilenguaje (Español/Inglés) con archivos JSON
- ✅ Diseño responsive (móvil, tablet, desktop)
- ✅ Integración con API de IA (Google Gemini) para planificación inteligente
- ✅ Web scraping para comparación de precios
- ✅ Estimación de costos basada en parámetros del evento

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Autenticación**: NextAuth.js (SSO Google + autenticación básica)
- **IA**: Google Gemini API
- **Web Scraping**: Cheerio + Axios
- **Hosting**: Vercel (recomendado)

## 📦 Instalación

1. Clonar el repositorio:
```bash
git clone <repository-url>
cd Proyecto
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
- MongoDB URI
- Google OAuth credentials
- Gemini API Key
- NextAuth Secret

4. Ejecutar en desarrollo:
```bash
npm run dev
```

5. Abrir en el navegador:
```
http://localhost:3000
```

## 🔐 Configuración de Servicios

### Google OAuth (SSO)
1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Crear un nuevo proyecto
3. Habilitar Google+ API
4. Crear credenciales OAuth 2.0
5. Agregar URL de autorización: `http://localhost:3000/api/auth/callback/google`
6. Copiar Client ID y Client Secret al `.env`

### Google Gemini API
1. Ir a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Crear una cuenta (gratuita para estudiantes por 1 año)
3. Generar API Key
4. Copiar al `.env` como `GEMINI_API_KEY`

### MongoDB
- Opción 1: MongoDB local
- Opción 2: MongoDB Atlas (gratuito): https://www.mongodb.com/cloud/atlas

## 📱 Responsive Design

El diseño está optimizado para:
- 📱 **Móvil**: < 768px
- 📱 **Tablet**: 768px - 1024px
- 💻 **Desktop**: > 1024px

## 🌐 Idiomas Soportados

- Español (es)
- Inglés (en)

## 📝 Estructura del Proyecto

```
Proyecto/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── (auth)/            # Rutas de autenticación
│   └── (main)/            # Rutas principales
├── components/            # Componentes React
├── lib/                   # Utilidades y configuraciones
├── models/                # Modelos de MongoDB
├── public/                # Archivos estáticos
├── locales/               # Archivos de traducción JSON
└── types/                 # Tipos TypeScript
```

## 👥 Contribuidores

- Integrante 1
- Integrante 2

## 📄 Licencia

Este proyecto es parte de un trabajo académico.

## 🚀 Despliegue en Vercel

1. Conectar repositorio a Vercel
2. Configurar variables de entorno en Vercel Dashboard
3. Deploy automático en cada push a main

