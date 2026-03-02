# Project Context

## Resumen

Proyecto nuevo para validar un MVP SaaS que genera previews de videos cortos verticales enfocados en conversion por WhatsApp para negocios pequenos de Latam.

## Estado Actual

- Landing de alta conversion en `apps/web`.
- API REST mockeada en `apps/api`.
- Contrato base definido en `docs/contract.md`.
- Fallback demo en frontend cuando la API no responde, util para deploy estatico en Vercel.

## Rutas Principales

- Frontend: `/`
- API: `/api/v1/health`, `/api/v1/plans`, `/api/v1/generations`, `/api/v1/generations/:id`, `/api/v1/generations/:id/regenerate`

## Flujo MVP

1. El usuario llega a la landing.
2. Completa el formulario corto.
3. Obtiene una previsualizacion lista para descargar.
4. Puede regenerar otra version con un tono distinto.
5. Si la API no responde, la web usa un preview demo local.

## Dependencias Clave

- React 18
- Vite
- TailwindCSS
- Express
- Zod

## Variables de Entorno

- `PORT`
- `CLIENT_ORIGIN`
- `VITE_API_URL`

## Alineacion

Este archivo resume `docs/context.md` y debe mantenerse sincronizado con ese documento.
