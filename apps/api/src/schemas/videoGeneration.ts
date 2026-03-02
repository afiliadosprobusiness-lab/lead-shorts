import { z } from "zod";

const phonePattern = /^[1-9]\d{8,14}$/;

export const generationInputSchema = z.object({
  businessCategory: z
    .string()
    .trim()
    .min(2, "Ingresa al menos 2 caracteres"),
  offer: z
    .string()
    .trim()
    .min(5, "Describe la oferta con al menos 5 caracteres"),
  city: z
    .string()
    .trim()
    .min(2, "Ingresa una ciudad valida")
    .optional()
    .or(z.literal("")),
  whatsapp: z
    .string()
    .trim()
    .regex(phonePattern, "Ingresa un numero valido en formato internacional"),
  tone: z
    .enum(["directo", "cercano", "premium", "urgente"])
    .optional()
});

export const regenerateSchema = z.object({
  tone: z.enum(["directo", "cercano", "premium", "urgente"])
});

