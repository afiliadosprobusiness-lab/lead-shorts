import { Router } from "express";
import { generationStore } from "../services/generationStore";

const router = Router();

router.get("/", (_req, res) => {
  return res.json({
    success: true,
    data: generationStore.listPlans()
  });
});

export { router as planRouter };

