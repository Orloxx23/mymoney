# Configuración de Google OAuth y APIs

## Pasos para configurar:

1. **Ir a Google Cloud Console**: https://console.cloud.google.com/

2. **Crear un nuevo proyecto** (o seleccionar uno existente)

3. **Habilitar APIs necesarias**:
   - Ve a "APIs & Services" > "Library"
   - Busca y habilita:
     - Google Sheets API
     - Google Drive API

4. **Crear credenciales OAuth 2.0**:
   - Ve a "APIs & Services" > "Credentials"
   - Click en "Create Credentials" > "OAuth client ID"
   - Tipo de aplicación: "Web application"
   - Nombre: "My Money App"
   - Authorized JavaScript origins:
     - http://localhost:3000
   - Authorized redirect URIs:
     - http://localhost:3000/api/auth/callback/google
   - Click "Create"

5. **Copiar credenciales**:
   - Copia el "Client ID" y "Client Secret"
   - Pégalos en el archivo `.env.local`:
     ```
     GOOGLE_CLIENT_ID=tu_client_id_aqui
     GOOGLE_CLIENT_SECRET=tu_client_secret_aqui
     ```

6. **Generar NEXTAUTH_SECRET**:
   - Ejecuta en terminal: `openssl rand -base64 32`
   - Copia el resultado en `.env.local`:
     ```
     NEXTAUTH_SECRET=resultado_del_comando_aqui
     ```

7. **Configurar pantalla de consentimiento OAuth**:
   - Ve a "APIs & Services" > "OAuth consent screen"
   - Tipo de usuario: "External"
   - Completa la información básica
   - En "Scopes", agrega:
     - .../auth/userinfo.email
     - .../auth/userinfo.profile
     - .../auth/drive.file
     - .../auth/spreadsheets
   - Agrega usuarios de prueba (tu email)

## Archivo .env.local debe verse así:

```
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
NEXTAUTH_SECRET=tu_secret_generado_aqui
NEXTAUTH_URL=http://localhost:3000
```

## Ejecutar la aplicación:

```bash
npm run dev
```

Visita http://localhost:3000 y haz click en "Iniciar sesión con Google"
