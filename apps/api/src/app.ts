import express, { NextFunction, Request, Response } from "express";
import { generationRouter } from "./routes/generationRoutes";
import { planRouter } from "./routes/planRoutes";
import { ApiError } from "./types";

const app = express();
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.disable("x-powered-by");
app.use(express.json({ limit: "200kb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", clientOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "same-origin");
  res.setHeader("X-Frame-Options", "DENY");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  return next();
});

const sendHealth = (_req: Request, res: Response) => {
  return res.json({
    success: true,
    data: {
      status: "ok"
    }
  });
};

app.get("/api/v1/health", sendHealth);
app.get("/v1/health", sendHealth);

app.use("/api/v1/plans", planRouter);
app.use("/v1/plans", planRouter);
app.use("/api/v1/generations", generationRouter);
app.use("/v1/generations", generationRouter);

app.use((_req, res) => {
  const error: ApiError = {
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Ruta no encontrada"
    }
  };

  return res.status(404).json(error);
});

app.use(
  (
    _error: Error,
    _req: Request,
    res: Response<ApiError>,
    _next: NextFunction
  ) => {
    return res.status(500).json({
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Ocurrio un error interno"
      }
    });
  }
);

export { app };
export default app;
