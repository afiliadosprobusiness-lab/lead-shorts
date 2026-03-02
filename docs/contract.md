# Contract

## Version

- API: `v1`
- Fecha base: `2026-03-02`

## Objetivo

Definir el contrato inicial del MVP para la landing, el formulario de generacion y la experiencia de previsualizacion/descarga.

## Modelos Compartidos

### `GenerationInput`

```json
{
  "businessCategory": "string",
  "offer": "string",
  "city": "string | optional",
  "whatsapp": "string",
  "tone": "directo | cercano | premium | urgente | optional"
}
```

### `Generation`

```json
{
  "id": "string",
  "status": "ready",
  "ratio": "9:16",
  "durationSec": 18,
  "hook": "string",
  "script": "string",
  "subtitles": ["string"],
  "cta": "string",
  "musicTrack": "string",
  "previewUrl": "string",
  "downloadUrl": "string",
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

### `Plan`

```json
{
  "id": "starter",
  "name": "Starter",
  "pricePen": 39,
  "monthlyGenerations": 12,
  "highlight": false,
  "description": "string"
}
```

## Endpoints

### `GET /api/v1/health`

Response `200`

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

### `GET /api/v1/plans`

Response `200`

```json
{
  "success": true,
  "data": [
    {
      "id": "starter",
      "name": "Starter",
      "pricePen": 39,
      "monthlyGenerations": 12,
      "highlight": false,
      "description": "Ideal para validar contenido constante"
    }
  ]
}
```

### `POST /api/v1/generations`

Request body

```json
{
  "businessCategory": "restaurante",
  "offer": "2x1 en hamburguesas artesanales",
  "city": "Lima",
  "whatsapp": "51999999999",
  "tone": "directo"
}
```

Response `201`

```json
{
  "success": true,
  "data": {
    "id": "gen_123",
    "status": "ready",
    "ratio": "9:16",
    "durationSec": 18,
    "hook": "Deten el scroll: tu proxima compra esta aqui",
    "script": "string",
    "subtitles": ["string"],
    "cta": "Escribenos al WhatsApp ahora",
    "musicTrack": "Momentum Pop",
    "previewUrl": "https://example.com/preview/gen_123.mp4",
    "downloadUrl": "https://example.com/download/gen_123.mp4",
    "createdAt": "2026-03-02T00:00:00.000Z",
    "updatedAt": "2026-03-02T00:00:00.000Z"
  }
}
```

### `POST /api/v1/generations/:id/regenerate`

Request body

```json
{
  "tone": "premium"
}
```

Response `200`

```json
{
  "success": true,
  "data": {
    "id": "gen_123",
    "status": "ready",
    "hook": "string",
    "script": "string"
  }
}
```

### `GET /api/v1/generations/:id`

Response `200`

```json
{
  "success": true,
  "data": {
    "id": "gen_123",
    "status": "ready"
  }
}
```

## Formato de Error

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payload invalido",
    "details": [
      {
        "field": "whatsapp",
        "message": "Ingresa un numero valido"
      }
    ]
  }
}
```

## Reglas de Compatibilidad

- No renombrar campos existentes sin versionar a `v2`.
- `success`, `data` y `error` son obligatorios segun el tipo de respuesta.
- `ratio` se mantiene fijo en `9:16` para el MVP.

## Changelog del Contrato

- 2026-03-02 | Creacion del contrato base del MVP | non-breaking | Define endpoints iniciales, modelos y errores para frontend y backend.

