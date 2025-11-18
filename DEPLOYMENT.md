# Guía de Despliegue

## Despliegue en Vercel

### Pasos para desplegar:

1. **Preparar el repositorio**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <tu-repositorio-git>
   git push -u origin main
   ```

2. **Conectar con Vercel**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub
   - Haz clic en "New Project"
   - Importa tu repositorio

3. **Configurar Variables de Entorno en Vercel**
   En el dashboard de Vercel, ve a Settings > Environment Variables y agrega:
   ```
   MONGODB_URI=tu-mongodb-uri
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=tu-secret-key-generada
   GOOGLE_CLIENT_ID=tu-google-client-id
   GOOGLE_CLIENT_SECRET=tu-google-client-secret
   GEMINI_API_KEY=tu-gemini-api-key
   JWT_SECRET=tu-jwt-secret
   ```

4. **Configurar Google OAuth**
   - En Google Cloud Console, agrega la URL de autorización:
     `https://tu-dominio.vercel.app/api/auth/callback/google`

5. **Desplegar**
   - Vercel desplegará automáticamente en cada push a main
   - O haz clic en "Deploy" manualmente

## Despliegue en MongoDB Atlas

1. Ve a [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Crea una cuenta gratuita
3. Crea un nuevo cluster
4. Crea un usuario de base de datos
5. Configura el acceso de red (0.0.0.0/0 para desarrollo)
6. Obtén la connection string y úsala como MONGODB_URI

## Configuración de Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Ve a "Credentials" > "Create Credentials" > "OAuth 2.0 Client ID"
5. Configura:
   - Application type: Web application
   - Authorized redirect URIs: 
     - `http://localhost:3000/api/auth/callback/google` (desarrollo)
     - `https://tu-dominio.vercel.app/api/auth/callback/google` (producción)
6. Copia el Client ID y Client Secret

## Configuración de Gemini API

1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con tu cuenta de Google
3. Haz clic en "Get API Key"
4. Crea una nueva API key o usa una existente
5. Copia la API key

## Verificación Post-Despliegue

1. Verifica que todas las rutas funcionen
2. Prueba el registro y login
3. Prueba el SSO con Google
4. Verifica que la IA funcione correctamente
5. Prueba el cambio de idioma
6. Verifica el diseño responsive en diferentes dispositivos

