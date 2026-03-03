# Project Context

## Resumen

Proyecto para validar un MVP SaaS que genera previews de videos tipo influencer con avatar IA para negocios pequenos de Latam, enfocados en captar atencion y publicar rapido en redes sociales.

## Estado Actual

- Landing de alta conversion en `apps/web`, ahora en modo oscuro y con el formulario mas arriba que pricing.
- API REST en `apps/api`, preparada para deploy serverless en Vercel.
- Contrato base definido en `docs/contract.md`.
- Fallback demo en frontend cuando la API no responde, util para deploy estatico en Vercel.
- Persistencia opcional con Firebase; si no hay credenciales, el backend usa memoria.
- La landing comunica posicionamiento mas amplio para redes (vertical o cuadrado), aunque el contrato actual del MVP sigue fijo en `9:16`.

## Rutas Principales

- Frontend: `/`
- API: `/api/v1/health`, `/api/v1/plans`, `/api/v1/generations`, `/api/v1/generations/:id`, `/api/v1/generations/:id/regenerate`

## Flujo MVP

1. El usuario llega a la landing en modo oscuro.
2. Ve el formulario arriba, genera su primera muestra y revisa la vista previa.
3. Despues del preview, la landing presenta pricing para empujar conversion a plan.
4. Puede regenerar otra version con un tono distinto.
5. Si la API no responde, la web usa un preview demo local.

## Dependencias Clave

- React 18
- Vite
- TailwindCSS
- Express
- Zod
- firebase-admin

## Variables de Entorno

- `PORT`
- `CLIENT_ORIGIN`
- `VITE_API_URL` (base completa con prefijo versionado)
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`
- `FIREBASE_GENERATIONS_COLLECTION`

## Alineacion

Este archivo resume `docs/context.md` y debe mantenerse sincronizado con ese documento.
