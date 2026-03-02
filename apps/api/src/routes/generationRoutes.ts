import { Router } from "express";
import { ZodError } from "zod";
import {
  generationInputSchema,
  regenerateSchema
} from "../schemas/videoGeneration";
import { generationStore } from "../services/generationStore";
import { ApiError } from "../types";

const router = Router();

const toValidationError = (error: ZodError): ApiError => ({
  success: false,
  error: {
    code: "VALIDATION_ERROR",
    message: "Payload invalido",
    details: error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message
    }))
  }
});

router.post("/", (req, res) => {
  const parsed = generationInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(toValidationError(parsed.error));
  }

  const generation = generationStore.create({
    ...parsed.data,
    city: parsed.data.city || undefined
  });

  return res.status(201).json({
    success: true,
    data: generation
  });
});

router.get("/:id", (req, res) => {
  const generation = generationStore.getById(req.params.id);

  if (!generation) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Generacion no encontrada"
      }
    });
  }

  return res.json({
    success: true,
    data: generation
  });
});

router.post("/:id/regenerate", (req, res) => {
  const parsed = regenerateSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json(toValidationError(parsed.error));
  }

  const generation = generationStore.regenerate(req.params.id, parsed.data.tone);

  if (!generation) {
    return res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: "Generacion no encontrada"
      }
    });
  }

  return res.json({
    success: true,
    data: generation
  });
});

export { router as generationRouter };

