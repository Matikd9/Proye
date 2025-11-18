# 🚀 Guía Rápida de Configuración

## Paso 1: Crear archivo .env

1. Copia el archivo `.env.example` y renómbralo a `.env`
2. O crea un archivo nuevo llamado `.env` en la raíz del proyecto

## Paso 2: Configurar MongoDB (Elige una opción)

### ✅ Opción Recomendada: MongoDB Atlas (Gratis)

1. Ve a: https://www.mongodb.com/cloud/atlas
2. Crea cuenta gratuita
3. Crea un cluster (gratis)
4. Ve a "Database Access" → Crea usuario
5. Ve a "Network Access" → Agrega IP 0.0.0.0/0
6. Ve a "Database" → "Connect" → "Connect your application"
7. Copia la connection string
8. Reemplaza `<password>` con tu contraseña
9. Agrega `/eventplanner` antes del `?`
10. Pega en `.env` como `MONGODB_URI`

**Ejemplo:**
```
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority
```

### Opción Alternativa: MongoDB Local

1. Instala MongoDB: https://www.mongodb.com/try/download/community
2. O usa Docker: `docker run -d -p 27017:27017 --name mongodb mongo`
3. En `.env`: `MONGODB_URI=mongodb://localhost:27017/eventplanner`

## Paso 3: Configurar Google OAuth

1. Ve a: https://console.cloud.google.com/
2. Crea un proyecto nuevo
3. Ve a "APIs & Services" → "Library"
4. Busca y habilita "Google+ API"
5. Ve a "APIs & Services" → "Credentials"
6. Clic en "Create Credentials" → "OAuth client ID"
7. Configura:
   - Type: Web application
   - Name: Event Planner
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
8. Copia Client ID y Client Secret
9. Pega en `.env`:
   ```
   GOOGLE_CLIENT_ID=tu-client-id
   GOOGLE_CLIENT_SECRET=tu-client-secret
   ```

## Paso 4: Configurar Gemini API

1. Ve a: https://makersuite.google.com/app/apikey
2. Inicia sesión con Google
3. Clic en "Get API Key"
4. Crea API key
5. Copia la key (empieza con `AIza...`)
6. Pega en `.env`:
   ```
   GEMINI_API_KEY=tu-api-key
   ```

## Paso 5: Generar Secrets

Ejecuta este comando **DOS VECES** para generar dos secrets diferentes:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

O usa este generador online: https://generate-secret.vercel.app/32

Pega los resultados en `.env`:
```
NEXTAUTH_SECRET=primer-secreto-generado
JWT_SECRET=segundo-secreto-generado
```

## Paso 6: Verificar

Tu archivo `.env` debería verse así:

```env
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz...
GOOGLE_CLIENT_ID=123456789-xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxx
GEMINI_API_KEY=AIzaSyC-xxxxx
JWT_SECRET=xyz789abc...
```

## Paso 7: Probar

```bash
npm install
npm run dev
```

Abre: http://localhost:3000

## 📖 Guía Detallada

Para más detalles, consulta: `SETUP_GUIDE.md`

