# Context

## Producto

Plataforma SaaS para negocios de Latam que necesitan generar videos tipo influencer con avatar IA, listos para publicar en Reels, TikTok, Shorts y Feed sin grabar ni editar manualmente.

## Propuesta de Valor

- Mensaje principal: `Crea videos tipo influencer que captan atencion desde el primer segundo.`
- Resultado esperado: el usuario completa un formulario corto y recibe una muestra con avatar IA, voz y texto lista para revisar antes de descargar.
- Restriccion de producto: no existe editor manual en el MVP.
- Nota de producto: la landing posiciona el producto como vertical o cuadrado, pero el contrato/API vigente del MVP sigue devolviendo `ratio: 9:16`.

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

- Hero en modo oscuro con foco en beneficios numericos y el formulario visible arriba.
- Despues del hero se muestran beneficios de negocio, una seccion de dolor, un bloque de 3 pasos, la vista previa y luego pricing.
- No se muestra pricing antes del formulario.

### Generacion

1. Usuario ingresa `businessCategory`, `offer`, `city`, `whatsapp` y `tone`.
2. Frontend valida campos minimos.
3. Frontend llama `POST /api/v1/generations`.
4. API devuelve un objeto `Generation` listo para vista previa.
5. La landing renderiza una muestra funcional dentro de la pagina con el contenido generado, incluso si el enlace externo aun es temporal.
6. La landing presenta pricing despues del preview, sin cambiar la logica actual de descarga o regeneracion.
7. Si la API no esta disponible, el frontend genera un preview demo local y mantiene la landing operativa.

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
- Landing en modo oscuro con alto contraste.
- La muestra se actualiza con lo que el usuario escribe y hace scroll automatico al generarla.
- Feedback claro para `loading`, `error` y `empty`.
- Focus visible en todos los elementos interactivos.
