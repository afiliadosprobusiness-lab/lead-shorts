# Context

## Producto

Plataforma SaaS para negocios de Latam que venden por WhatsApp y necesitan generar videos verticales listos para publicar en Reels, TikTok y Shorts sin editar manualmente.

## Propuesta de Valor

- Mensaje principal: `Crea videos que atraen clientes en menos de 1 minuto.`
- Resultado esperado: el usuario completa un formulario corto, recibe un video con hook, subtitulos, CTA a WhatsApp y un enlace de descarga.
- Restriccion de producto: no existe editor manual en el MVP.

## Stack Tecnologico

- Monorepo npm workspaces.
- Frontend: React 18 + TypeScript + Vite + TailwindCSS.
- Backend: Node.js + Express + TypeScript + Zod.
- Deploy principal: Vercel para `apps/web` y `apps/api`.
- Persistencia y auth: Firebase solo cuando sea necesario (Firestore/Auth), con fallback en memoria mientras no haya credenciales.
- Render real de video: fuera del alcance del MVP actual; se simula con metadata y URLs placeholder.

## Arquitectura

- `apps/web`: landing principal y formulario de generacion.
- `apps/api`: API REST versionada en `/api/v1`, preparada para Vercel como serverless function.
- `docs`: contrato y contexto operativo.
- El frontend tiene modo demo local si la API no responde, para permitir despliegue estatico en Vercel sin bloquear la experiencia.
- La API usa Firestore solo si existen credenciales; si no, mantiene persistencia temporal en memoria.

## Flujos Principales

### Landing

- Hero con promesa clara, beneficios, pricing y formulario embebido.
- CTA principal: generar preview.
- CTA secundaria: ver como funciona.

### Generacion

1. Usuario ingresa `businessCategory`, `offer`, `city`, `whatsapp` y `tone`.
2. Frontend valida campos minimos.
3. Frontend llama `POST /api/v1/generations`.
4. API devuelve un objeto `Generation` listo para preview.
5. Usuario puede descargar o regenerar variando el tono.
6. Si la API no esta disponible, el frontend genera un preview demo local y mantiene la landing operativa.

## Integraciones Externas

- Vercel para despliegue de frontend y backend.
- Firebase opcional para Firestore/Auth.
- Futuras integraciones previstas: LLM para guiones, TTS, FFmpeg, storage.

## Variables de Entorno

- `PORT`: puerto del backend.
- `CLIENT_ORIGIN`: origen permitido por CORS.
- `VITE_API_URL`: base URL completa consumida por el frontend, incluyendo el prefijo versionado del entorno.
- `FIREBASE_PROJECT_ID`: proyecto Firebase.
- `FIREBASE_CLIENT_EMAIL`: service account email para Admin SDK.
- `FIREBASE_PRIVATE_KEY`: private key para Admin SDK.
- `FIREBASE_GENERATIONS_COLLECTION`: coleccion usada para generaciones.

## Seguridad

- Validacion de payload con Zod en el borde.
- CORS limitado a `CLIENT_ORIGIN`.
- Headers basicos de seguridad en respuestas API.
- Errores estructurados sin stack traces.

## Decisiones de UX

- Mobile-first.
- Sin scroll horizontal.
- Feedback claro para `loading`, `error` y `empty`.
- Focus visible en todos los elementos interactivos.
