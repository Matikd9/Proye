# Guía de Configuración - Variables de Entorno

Esta guía te ayudará a configurar todas las variables de entorno necesarias para el proyecto.

## Paso 1: Crear el archivo .env

1. En la raíz del proyecto, crea un archivo llamado `.env` (sin extensión)
2. Copia el siguiente contenido en el archivo:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/eventplanner

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu-secret-key-aqui-genera-uno-aleatorio

# Google OAuth
GOOGLE_CLIENT_ID=tu-google-client-id
GOOGLE_CLIENT_SECRET=tu-google-client-secret

# Gemini AI
GEMINI_API_KEY=tu-gemini-api-key

# JWT Secret
JWT_SECRET=tu-jwt-secret-aqui-genera-uno-aleatorio
```

## Paso 2: Configurar MongoDB

### Opción A: MongoDB Local

1. **Instalar MongoDB:**
   - Windows: Descarga desde [mongodb.com/download](https://www.mongodb.com/try/download/community)
   - O usa MongoDB con Docker:
     ```bash
     docker run -d -p 27017:27017 --name mongodb mongo
     ```

2. **Configurar en .env:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/eventplanner
   ```

### Opción B: MongoDB Atlas (Recomendado - Gratis)

1. **Crear cuenta:**
   - Ve a [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Crea una cuenta gratuita

2. **Crear un cluster:**
   - Haz clic en "Build a Database"
   - Selecciona el plan "FREE" (M0)
   - Elige una región cercana (ej: AWS / us-east-1)
   - Haz clic en "Create"

3. **Configurar acceso de red:**
   - En el menú lateral, ve a "Network Access"
   - Haz clic en "Add IP Address"
   - Selecciona "Allow Access from Anywhere" (0.0.0.0/0) para desarrollo
   - Haz clic en "Confirm"

4. **Crear usuario de base de datos:**
   - Ve a "Database Access"
   - Haz clic en "Add New Database User"
   - Elige "Password" como método de autenticación
   - Username: `eventplanner` (o el que prefieras)
   - Password: Genera una contraseña segura (guárdala)
   - Database User Privileges: "Read and write to any database"
   - Haz clic en "Add User"

5. **Obtener connection string:**
   - Ve a "Database" > "Connect"
   - Selecciona "Connect your application"
   - Copia la connection string (se ve así):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```
   - Reemplaza `<username>` y `<password>` con tus credenciales
   - Agrega el nombre de la base de datos al final:
     ```
     mongodb+srv://eventplanner:tu-password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority
     ```

6. **Configurar en .env:**
   ```env
   MONGODB_URI=mongodb+srv://eventplanner:tu-password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority
   ```

## Paso 3: Configurar Google OAuth

1. **Ir a Google Cloud Console:**
   - Ve a [console.cloud.google.com](https://console.cloud.google.com/)
   - Inicia sesión con tu cuenta de Google

2. **Crear un proyecto:**
   - Haz clic en el selector de proyectos (arriba)
   - Haz clic en "New Project"
   - Nombre: `Event Planner Platform` (o el que prefieras)
   - Haz clic en "Create"

3. **Habilitar Google+ API:**
   - En el menú lateral, ve a "APIs & Services" > "Library"
   - Busca "Google+ API"
   - Haz clic en "Enable"

4. **Crear credenciales OAuth:**
   - Ve a "APIs & Services" > "Credentials"
   - Haz clic en "Create Credentials" > "OAuth client ID"
   - Si te pide configurar la pantalla de consentimiento:
     - Tipo de usuario: "External"
     - Nombre de la app: "Event Planner Platform"
     - Email de soporte: tu email
     - Haz clic en "Save and Continue"
     - En "Scopes", haz clic en "Save and Continue"
     - En "Test users", agrega tu email y haz clic en "Save and Continue"
     - Revisa y haz clic en "Back to Dashboard"

5. **Configurar OAuth Client:**
   - Application type: "Web application"
   - Name: "Event Planner Platform"
   - Authorized JavaScript origins:
     - `http://localhost:3000`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
   - Haz clic en "Create"

6. **Copiar credenciales:**
   - Se mostrará un popup con tu Client ID y Client Secret
   - **IMPORTANTE:** Copia estos valores ahora (no podrás ver el secret después)

7. **Configurar en .env:**
   ```env
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
   ```

## Paso 4: Configurar Gemini API

1. **Ir a Google AI Studio:**
   - Ve a [makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - O busca "Google AI Studio" en Google
   - Inicia sesión con tu cuenta de Google

2. **Obtener API Key:**
   - Haz clic en "Get API Key" (botón en la parte superior)
   - Si te pide crear un proyecto, selecciona uno existente o crea uno nuevo
   - Haz clic en "Create API Key"
   - Se generará una API key (empieza con `AIza...`)
   - **IMPORTANTE:** Copia esta key ahora

3. **Configurar en .env:**
   ```env
   GEMINI_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

## Paso 5: Generar Secrets Aleatorios

Necesitas generar dos secretos aleatorios para `NEXTAUTH_SECRET` y `JWT_SECRET`.

### Opción A: Usando Node.js
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
Ejecuta este comando dos veces y copia cada resultado.

### Opción B: Usando OpenSSL (si lo tienes instalado)
```bash
openssl rand -base64 32
```
Ejecuta dos veces.

### Opción C: Generador online
- Ve a [generate-secret.vercel.app/32](https://generate-secret.vercel.app/32)
- Genera dos secretos diferentes

### Configurar en .env:
```env
NEXTAUTH_SECRET=tu-primer-secreto-generado-aqui
JWT_SECRET=tu-segundo-secreto-generado-aqui
```

## Paso 6: Verificar tu archivo .env

Tu archivo `.env` final debería verse así (con tus valores reales):

```env
# Database
MONGODB_URI=mongodb+srv://usuario:password@cluster0.xxxxx.mongodb.net/eventplanner?retryWrites=true&w=majority

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=abc123xyz456...tu-secreto-generado

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Gemini AI
GEMINI_API_KEY=AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# JWT Secret
JWT_SECRET=xyz789abc123...tu-secreto-generado
```

## Paso 7: Verificar que funciona

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Ejecutar el proyecto:**
   ```bash
   npm run dev
   ```

3. **Abrir en el navegador:**
   - Ve a `http://localhost:3000`
   - Deberías ver la página de inicio

4. **Probar autenticación:**
   - Haz clic en "Iniciar Sesión"
   - Prueba el login con Google
   - O crea una cuenta nueva

## ⚠️ Importante

- **NUNCA** subas el archivo `.env` a Git (ya está en `.gitignore`)
- **NUNCA** compartas tus API keys o secrets
- En producción, configura estas variables en el panel de Vercel/Azure/GCP

## 🆘 Solución de Problemas

### Error: "MongoServerError: Authentication failed"
- Verifica que el usuario y contraseña en MONGODB_URI sean correctos
- Asegúrate de que el usuario tenga permisos de lectura/escritura

### Error: "Invalid Google OAuth credentials"
- Verifica que GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET sean correctos
- Asegúrate de que la redirect URI esté configurada correctamente

### Error: "API key not valid"
- Verifica que GEMINI_API_KEY sea correcta
- Asegúrate de que la API key no tenga espacios extra

### Error: "NEXTAUTH_SECRET is missing"
- Asegúrate de haber generado y configurado NEXTAUTH_SECRET
- Verifica que no haya espacios extra en el archivo .env

