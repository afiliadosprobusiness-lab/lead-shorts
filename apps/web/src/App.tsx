import { FormEvent, useEffect, useState } from "react";

type Tone = "directo" | "cercano" | "premium" | "urgente";

type Generation = {
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

type Plan = {
  id: string;
  name: string;
  pricePen: number;
  monthlyGenerations: number;
  highlight: boolean;
  description: string;
};

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
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

type FormState = {
  businessCategory: string;
  offer: string;
  city: string;
  whatsapp: string;
  tone: Tone;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const initialForm: FormState = {
  businessCategory: "",
  offer: "",
  city: "",
  whatsapp: "",
  tone: "directo"
};

const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "directo", label: "Directo" },
  { value: "cercano", label: "Cercano" },
  { value: "premium", label: "Premium" },
  { value: "urgente", label: "Urgente" }
];

const fallbackPlans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePen: 39,
    monthlyGenerations: 12,
    highlight: false,
    description: "Ideal para validar contenido constante."
  },
  {
    id: "pro",
    name: "Pro",
    pricePen: 79,
    monthlyGenerations: 40,
    highlight: true,
    description: "Pensado para negocios que quieren crecer mas rapido."
  }
];

const trustPoints = [
  "Hook llamativo en segundos",
  "CTA listo para WhatsApp",
  "Formato vertical 9:16",
  "Pensado para vender sin editar"
];

const steps = [
  "Escribes rubro, oferta y WhatsApp.",
  "La IA arma hook, voz, subtitulos y CTA.",
  "Descargas el video y lo publicas hoy."
];

const buildLocalGeneration = (form: FormState, tone: Tone): Generation => {
  const hookByTone: Record<Tone, string> = {
    directo: "Deten el scroll: hoy puedes vender mas por WhatsApp",
    cercano: "Convierte tu oferta en un video que conecta de inmediato",
    premium: "Haz que tu negocio se vea confiable y listo para vender",
    urgente: "Muestra tu oferta ahora antes de que el cliente siga de largo"
  };

  const timestamp = new Date().toISOString();
  const citySuffix = form.city.trim() ? ` en ${form.city.trim()}` : "";
  const cleanOffer = form.offer.trim();
  const cleanCategory = form.businessCategory.trim().toLowerCase();
  const cleanWhatsapp = form.whatsapp.trim();
  const hook = hookByTone[tone];

  return {
    id: `demo_${Date.now()}`,
    status: "ready",
    ratio: "9:16",
    durationSec: 18,
    hook,
    script: `${hook} Si tienes un ${cleanCategory}${citySuffix}, esta oferta puede traer mas mensajes: ${cleanOffer}. Publica este formato vertical y cierra conversaciones por WhatsApp sin editar.`,
    subtitles: [
      hook,
      cleanOffer,
      `Disponible${citySuffix || " para tu negocio"}`,
      `WhatsApp: ${cleanWhatsapp}`
    ],
    cta: `Escribenos por WhatsApp al ${cleanWhatsapp}`,
    musicTrack:
      tone === "premium"
        ? "Clean Luxe Beat"
        : tone === "urgente"
          ? "Fast Conversion"
          : tone === "cercano"
            ? "Warm Pulse"
            : "Momentum Pop",
    previewUrl: "#demo-preview",
    downloadUrl: "#demo-download",
    createdAt: timestamp,
    updatedAt: timestamp
  };
};

function App() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [statusMessage, setStatusMessage] = useState(
    "Completa tus datos y genera tu primer video."
  );

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch(`${API_URL}/api/v1/plans`);
        const payload = (await response.json()) as ApiSuccess<Plan[]> | ApiFailure;

        if (!response.ok || !payload.success) {
          throw new Error(
            payload.success ? "No se pudo cargar planes" : payload.error.message
          );
        }

        setPlans(payload.data);
      } catch (error) {
        setPlans(fallbackPlans);
        setIsDemoMode(true);
        setLoadError(
          error instanceof Error
            ? `${error.message}. Mostrando planes demo.`
            : "No se pudo cargar la oferta. Mostrando planes demo."
        );
      }
    };

    void loadPlans();
  }, []);

  const activePlan = plans.find((plan) => plan.highlight) ?? plans[0] ?? null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (form.businessCategory.trim().length < 2 || form.offer.trim().length < 5) {
      setFormError("Completa rubro y oferta con informacion clara.");
      return;
    }

    if (!/^[1-9]\d{8,14}$/.test(form.whatsapp.trim())) {
      setFormError(
        "Ingresa tu WhatsApp en formato internacional, por ejemplo 51999999999."
      );
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Generando hook, guion y preview...");

    try {
      const response = await fetch(`${API_URL}/api/v1/generations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          businessCategory: form.businessCategory.trim(),
          offer: form.offer.trim(),
          city: form.city.trim(),
          whatsapp: form.whatsapp.trim(),
          tone: form.tone
        })
      });
      const payload = (await response.json()) as ApiSuccess<Generation> | ApiFailure;

      if (!response.ok || !payload.success) {
        throw new Error(
          payload.success ? "No se pudo generar el video" : payload.error.message
        );
      }

      setGeneration(payload.data);
      setStatusMessage("Preview listo para descargar o regenerar.");
    } catch (error) {
      setGeneration(buildLocalGeneration(form, form.tone));
      setIsDemoMode(true);
      setFormError("");
      setStatusMessage(
        error instanceof Error
          ? `${error.message}. Se genero un preview demo local.`
          : "Se genero un preview demo local."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generation) {
      return;
    }

    setIsRegenerating(true);
    setFormError("");
    setStatusMessage("Regenerando una nueva variante...");
    const nextTone =
      toneOptions.find((option) => option.value !== form.tone)?.value || "cercano";

    try {
      const response = await fetch(
        `${API_URL}/api/v1/generations/${generation.id}/regenerate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            tone: nextTone
          })
        }
      );
      const payload = (await response.json()) as ApiSuccess<Generation> | ApiFailure;

      if (!response.ok || !payload.success) {
        throw new Error(payload.success ? "No se pudo regenerar" : payload.error.message);
      }

      setGeneration(payload.data);
      setForm((current) => ({
        ...current,
        tone: nextTone
      }));
      setStatusMessage("Nueva version lista.");
    } catch (error) {
      setGeneration(buildLocalGeneration(form, nextTone));
      setIsDemoMode(true);
      setFormError("");
      setForm((current) => ({
        ...current,
        tone: nextTone
      }));
      setStatusMessage(
        error instanceof Error
          ? `${error.message}. Se genero una variante demo local.`
          : "Se genero una variante demo local."
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="overflow-x-hidden bg-sand text-ink">
      <header className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
        <nav className="glass-panel flex items-center justify-between rounded-full border border-white/70 px-4 py-3 shadow-soft">
          <a
            href="#inicio"
            className="font-display text-sm font-bold tracking-[0.18em] text-teal"
          >
            SHORTS WHATSAPP
          </a>
          <a
            href="#generador"
            className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2"
          >
            Generar ahora
          </a>
        </nav>
      </header>

      <main id="inicio" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          <div className="space-y-8">
            <div className="inline-flex rounded-full border border-teal/20 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-teal">
              Video marketing para negocios que venden por WhatsApp
            </div>

            <div className="space-y-5">
              <p className="max-w-xl font-display text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                Crea videos que atraen clientes en menos de 1 minuto.
              </p>
              <p className="max-w-xl text-base leading-7 text-slate-700 sm:text-lg">
                Genera reels, shorts y tiktoks con hook, subtitulos y CTA listo para
                WhatsApp. Sin editar, sin aprender herramientas complejas, sin perder
                tiempo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {trustPoints.map((point) => (
                <div
                  key={point}
                  className="glass-panel rounded-3xl border border-white/70 px-4 py-4 shadow-soft"
                >
                  <p className="text-sm font-semibold text-slate-800">{point}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href="#generador"
                className="inline-flex items-center justify-center rounded-full bg-ember px-6 py-3 text-sm font-bold text-white transition duration-200 ease-out hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
              >
                Crear mi primer video
              </a>
              <a
                href="#como-funciona"
                className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold text-ink transition duration-200 ease-out hover:border-ink/30 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
              >
                Ver como funciona
              </a>
            </div>
          </div>

          <div className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-soft sm:p-6">
            <div className="rounded-[1.75rem] bg-ink p-5 text-white">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                  Resultado del MVP
                </p>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
                  9:16
                </span>
              </div>
              <div className="mt-5 rounded-[1.5rem] bg-gradient-to-br from-teal via-teal to-ink p-5">
                <p className="max-w-[14rem] font-display text-2xl font-bold leading-tight">
                  Hook + voz + subtitulos + CTA, listo para publicar hoy.
                </p>
                <div className="mt-6 space-y-3 rounded-3xl bg-white/10 p-4">
                  {steps.map((step, index) => (
                    <div key={step} className="flex gap-3">
                      <span className="mt-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-ink">
                        {index + 1}
                      </span>
                      <p className="text-sm text-white/90">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">60s</p>
                  <p className="text-xs text-white/75">para tu primer video</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-white/75">canales en un mismo formato</p>
                </div>
                <div className="rounded-3xl bg-white/10 p-4">
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-white/75">edicion manual requerida</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="como-funciona"
          className="mt-20 grid gap-6 rounded-[2rem] bg-white/85 p-6 shadow-soft sm:p-8 lg:grid-cols-3"
        >
          {steps.map((step, index) => (
            <article
              key={step}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-5"
            >
              <p className="text-sm font-semibold text-teal">Paso {index + 1}</p>
              <h2 className="mt-3 font-display text-2xl font-bold">Simple y rapido</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{step}</p>
            </article>
          ))}
        </section>

        <section
          id="generador"
          className="mt-20 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start"
        >
          <div className="space-y-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">
                Genera tu preview
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Tu primer video vertical empieza aqui.
              </h2>
              <p className="mt-3 max-w-xl text-base leading-7 text-slate-600">
                Completa el formulario y obtendras una version lista para previsualizar,
                descargar o regenerar con otro tono.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-soft sm:p-6"
              noValidate
            >
              <div className="grid gap-5">
                <div>
                  <label
                    htmlFor="businessCategory"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Rubro
                  </label>
                  <input
                    id="businessCategory"
                    name="businessCategory"
                    value={form.businessCategory}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        businessCategory: event.target.value
                      }))
                    }
                    placeholder="Ej. restaurante, inmobiliaria, clinica"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition duration-200 ease-out placeholder:text-slate-400 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/20"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="offer"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Oferta
                  </label>
                  <input
                    id="offer"
                    name="offer"
                    value={form.offer}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        offer: event.target.value
                      }))
                    }
                    placeholder="Ej. 2x1, descuento, cita gratis, demo"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition duration-200 ease-out placeholder:text-slate-400 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/20"
                    required
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Ciudad (opcional)
                    </label>
                    <input
                      id="city"
                      name="city"
                      value={form.city}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          city: event.target.value
                        }))
                      }
                      placeholder="Ej. Lima"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition duration-200 ease-out placeholder:text-slate-400 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/20"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      WhatsApp
                    </label>
                    <input
                      id="whatsapp"
                      name="whatsapp"
                      value={form.whatsapp}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          whatsapp: event.target.value
                        }))
                      }
                      inputMode="numeric"
                      placeholder="51999999999"
                      className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition duration-200 ease-out placeholder:text-slate-400 focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/20"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="tone"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Tono del video
                  </label>
                  <select
                    id="tone"
                    name="tone"
                    value={form.tone}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        tone: event.target.value as Tone
                      }))
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-ink outline-none transition duration-200 ease-out focus-visible:border-teal focus-visible:ring-2 focus-visible:ring-teal/20"
                  >
                    {toneOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-bold text-white transition duration-200 ease-out hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2"
                >
                  {isSubmitting ? "Generando..." : "Generar mi video"}
                </button>

                <p className="text-sm text-slate-500" aria-live="polite">
                  {statusMessage}
                </p>

                {isDemoMode ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    API no disponible: estas viendo una demo local para la landing desplegada.
                  </div>
                ) : null}

                {formError ? (
                  <div
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    {formError}
                  </div>
                ) : null}
              </div>
            </form>
          </div>

          <div className="space-y-6">
            <section className="glass-panel rounded-[2rem] border border-white/70 p-5 shadow-soft sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal">
                    Preview instantaneo
                  </p>
                  <h3 className="mt-2 font-display text-2xl font-bold">
                    Lo que recibira tu cliente
                  </h3>
                </div>
                {generation ? (
                  <button
                    type="button"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-5 py-2 text-sm font-semibold text-ink transition duration-200 ease-out hover:border-ink/30 hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                  >
                    {isRegenerating ? "Regenerando..." : "Regenerar"}
                  </button>
                ) : null}
              </div>

              {generation ? (
                <div className="mt-5 space-y-5">
                  <div className="rounded-[1.75rem] bg-ink p-5 text-white">
                    <div className="rounded-[1.5rem] bg-gradient-to-br from-ember via-orange-500 to-ink p-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">
                        Hook
                      </p>
                      <p className="mt-3 font-display text-2xl font-bold leading-tight">
                        {generation.hook}
                      </p>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-3xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                          Duracion
                        </p>
                        <p className="mt-2 text-xl font-bold">{generation.durationSec}s</p>
                      </div>
                      <div className="rounded-3xl bg-white/10 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/65">
                          Musica
                        </p>
                        <p className="mt-2 text-base font-semibold">
                          {generation.musicTrack}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                      Guion generado
                    </p>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      {generation.script}
                    </p>
                    <div className="mt-5">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal">
                        Subtitulos
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {generation.subtitles.map((line) => (
                          <span
                            key={line}
                            className="rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700"
                          >
                            {line}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl bg-teal/5 px-4 py-3 text-sm font-semibold text-teal">
                      {generation.cta}
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                      <a
                        href={generation.downloadUrl}
                        className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-bold text-white transition duration-200 ease-out hover:bg-orange-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2"
                      >
                        Descargar video
                      </a>
                      <a
                        href={generation.previewUrl}
                        className="inline-flex items-center justify-center rounded-full border border-ink/15 bg-white px-5 py-3 text-sm font-semibold text-ink transition duration-200 ease-out hover:border-ink/30 hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
                      >
                        Abrir preview
                      </a>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
                  <p className="font-display text-2xl font-bold">Sin editor, sin friccion.</p>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Tu preview aparecera aqui con guion, subtitulos y CTA listos para
                    validar el mensaje antes de publicar.
                  </p>
                </div>
              )}
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              {loadError ? (
                <div
                  className="rounded-[1.5rem] border border-red-200 bg-red-50 p-5 text-sm text-red-700 sm:col-span-2"
                  role="alert"
                >
                  {loadError}
                </div>
              ) : null}

              {plans.map((plan) => (
                <article
                  key={plan.id}
                  className={`rounded-[1.5rem] border p-5 shadow-soft ${
                    plan.highlight
                      ? "border-teal bg-teal text-white"
                      : "border-white/80 bg-white/85 text-ink"
                  }`}
                >
                  <p className="text-sm font-semibold uppercase tracking-[0.2em]">
                    {plan.name}
                  </p>
                  <p className="mt-3 font-display text-4xl font-bold">S/{plan.pricePen}</p>
                  <p
                    className={`mt-2 text-sm ${
                      plan.highlight ? "text-white/85" : "text-slate-600"
                    }`}
                  >
                    {plan.description}
                  </p>
                  <p
                    className={`mt-4 text-sm font-semibold ${
                      plan.highlight ? "text-white" : "text-teal"
                    }`}
                  >
                    {plan.monthlyGenerations} videos por mes
                  </p>
                </article>
              ))}

              {!plans.length && !loadError ? (
                <div className="rounded-[1.5rem] border border-white/80 bg-white/85 p-5 text-sm text-slate-600 sm:col-span-2">
                  Cargando planes...
                </div>
              ) : null}
            </section>

            {activePlan ? (
              <section className="rounded-[2rem] bg-ink p-6 text-white shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70">
                  Oferta recomendada
                </p>
                <p className="mt-3 font-display text-3xl font-bold">
                  Empieza con {activePlan.name} y valida rapido.
                </p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/80">
                  El objetivo del MVP es simple: generar tu primer video en menos de 60
                  segundos y medir si empiezas a recibir mas mensajes.
                </p>
              </section>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
