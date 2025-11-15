# DEPLOY EN RAILWAY

## Pasos para desplegar el backend en Railway:

### 1. Crear cuenta en Railway
- Ve a https://railway.app
- Regístrate con GitHub (recomendado)

### 2. Conectar tu repositorio
- En el Dashboard de Railway, haz clic en "New Project"
- Selecciona "Deploy from GitHub"
- Conecta tu repositorio `Gerenciamento-Croche`

### 3. Configurar variables de entorno (si es necesario)
En Railway → Project Settings → Variables:
- `NODE_ENV=production` (opcional, es el default)
- Si usas base de datos MySQL, agrega `DATABASE_URL` (Railway puede crear una automáticamente)

### 4. Railway detectará el Dockerfile automáticamente
- Verá el `Dockerfile` en la raíz del proyecto
- Hará el build y deploy automáticamente

### 5. Obtener la URL del backend
- Después del deploy, Railway te dará una URL como:
  `https://gerenciamento-croche-production.up.railway.app`

### 6. Actualizar el frontend en Vercel
Una vez que tengas la URL del backend:
1. En tu repo, crea/actualiza el archivo `.env.production`:
   ```
   VITE_API_BASE_URL=https://gerenciamento-croche-production.up.railway.app
   ```

2. O configúralo directamente en Vercel → Project Settings → Environment Variables:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://tu-backend-url.up.railway.app`

3. Redepliega el frontend en Vercel

### 7. Probar
- Abre tu frontend en Vercel
- Debería conectar con el backend en Railway
- El CRUD debería funcionar correctamente

---

## Alternativa: Sin Dockerfile (Railway detecta Node.js automáticamente)

Si no quieres usar Dockerfile:
1. Simplemente sube el código a GitHub
2. Railway detectará `package.json` y `pnpm-lock.yaml`
3. Ejecutará automáticamente `pnpm install` y el build

---

## Notas
- Railway te da 5 USD/mes gratis para empezar
- El Dockerfile en este proyecto está optimizado para Node.js 20 Alpine
- La persistencia usará JSON local (`croche_items.json`) a menos que configures una base de datos
