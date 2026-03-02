import { NextFunction, Router } from "express";
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

router.post("/", async (req, res, next: NextFunction) => {
  try {
    const parsed = generationInputSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(toValidationError(parsed.error));
    }

    const generation = await generationStore.create({
      ...parsed.data,
      city: parsed.data.city || undefined
    });

    return res.status(201).json({
      success: true,
      data: generation
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/:id", async (req, res, next: NextFunction) => {
  try {
    const generation = await generationStore.getById(req.params.id);

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
  } catch (error) {
    return next(error);
  }
});

router.post("/:id/regenerate", async (req, res, next: NextFunction) => {
  try {
    const parsed = regenerateSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json(toValidationError(parsed.error));
    }

    const generation = await generationStore.regenerate(
      req.params.id,
      parsed.data.tone
    );

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
  } catch (error) {
    return next(error);
  }
});

export { router as generationRouter };
