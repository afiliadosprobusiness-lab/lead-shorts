export type Tone = "directo" | "cercano" | "premium" | "urgente";

export type GenerationInput = {
  businessCategory: string;
  offer: string;
  city?: string;
  whatsapp: string;
  tone?: Tone;
};

export type Generation = {
  id: string;
  status: "ready";
  ratio: "9:16";
  durationSec: number;
  hook: string;
  script: string;
  subtitles: string[];
  cta: string;
  musicTrack: string;
  previewUrl: string;
  downloadUrl: string;
  createdAt: string;
  updatedAt: string;
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Array<{
      field: string;
      message: string;
    }>;
  };
};

export type Plan = {
  id: "starter" | "pro";
  name: string;
  pricePen: number;
  monthlyGenerations: number;
  highlight: boolean;
  description: string;
};

