import { FormEvent, useEffect, useRef, useState } from "react";

type Tone = "directo" | "cercano" | "premium" | "urgente";
type Generation = { id: string; status: "ready"; ratio: "9:16"; durationSec: number; hook: string; script: string; subtitles: string[]; cta: string; musicTrack: string; previewUrl: string; downloadUrl: string; createdAt: string; updatedAt: string };
type Plan = { id: string; name: string; pricePen: number; monthlyGenerations: number; highlight: boolean; description: string };
type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string; details?: Array<{ field: string; message: string }> } };
type FormState = { businessCategory: string; offer: string; city: string; whatsapp: string; tone: Tone };
type PreviewView = Pick<Generation, "durationSec" | "hook" | "script" | "subtitles" | "cta" | "musicTrack">;

const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1").trim();
const initialForm: FormState = { businessCategory: "", offer: "", city: "", whatsapp: "", tone: "directo" };
const toneOptions: Array<{ value: Tone; label: string }> = [
  { value: "directo", label: "Directo" },
  { value: "cercano", label: "Cercano" },
  { value: "premium", label: "Premium" },
  { value: "urgente", label: "Urgente" }
];
const fallbackPlans: Plan[] = [
  { id: "starter", name: "Starter", pricePen: 39, monthlyGenerations: 12, highlight: false, description: "Ideal para empezar a publicar." },
  { id: "pro", name: "Pro", pricePen: 79, monthlyGenerations: 40, highlight: true, description: "Para publicar varias veces por semana." }
];
const headlineStats = [
  { value: "1", label: "minuto para tener tu muestra" },
  { value: "3", label: "videos por semana para empezar" },
  { value: "4", label: "redes donde te pueden ver" }
];
const quickBenefits = [
  "Mas personas recuerdan tu negocio.",
  "Ahorras horas de grabacion.",
  "Tu oferta se entiende en segundos.",
  "Publicas mas veces cada semana."
];
const impactTimeline = [
  { value: "7 dias", label: "para aparecer 3 veces sin grabarte" },
  { value: "30 dias", label: "para mantener tu negocio presente" }
];
const painPoints = [
  "Pasas dias sin publicar nada.",
  "Te falta tiempo para grabarte.",
  "No sabes que decir en camara.",
  "Terminas postergando tu contenido."
];
const steps = ["Cuentanos que vendes.", "Armamos tu video.", "Publicas y empiezas a moverte."];
const previewMessages: Record<Tone, string> = {
  directo: "Muestra tu oferta y consigue mas mensajes hoy",
  cercano: "Haz que mas personas te escriban con un video simple",
  premium: "Haz que tu negocio se vea mas serio y confiable",
  urgente: "Haz que te escriban hoy antes de que sigan de largo"
};

const isPlaceholderUrl = (value: string) => !/^https?:\/\//.test(value) || value.includes("demo.shortwhatsapp.app");

const getPreviewView = (form: FormState, tone: Tone): PreviewView => {
  const cleanCategory = form.businessCategory.trim() || "negocio";
  const cleanOffer = form.offer.trim() || "Tu oferta lista para publicar";
  const cleanCity = form.city.trim();
  const cleanWhatsapp = form.whatsapp.trim() || "51999999999";
  const cityLabel = cleanCity ? ` en ${cleanCity}` : "";
  const mainLine = previewMessages[tone];

  return {
    durationSec: 28,
    hook: mainLine,
    script: `${mainLine}. Si tienes un ${cleanCategory.toLowerCase()}${cityLabel}, esta oferta puede ayudarte a vender mas: ${cleanOffer}. Tu video queda listo para que publiques hoy, sin grabar y sin editar.`,
    subtitles: [mainLine, cleanOffer, `Disponible${cityLabel || " hoy mismo"}`, `Contacto: ${cleanWhatsapp}`],
    cta: `Tu numero de contacto queda visible: ${cleanWhatsapp}`,
    musicTrack: tone === "premium" ? "Clean Luxe Beat" : tone === "urgente" ? "Fast Conversion" : tone === "cercano" ? "Warm Pulse" : "Momentum Pop"
  };
};

const buildLocalGeneration = (form: FormState, tone: Tone): Generation => {
  const preview = getPreviewView(form, tone);
  const stamp = new Date().toISOString();
  return { id: `demo_${Date.now()}`, status: "ready", ratio: "9:16", ...preview, previewUrl: "#preview-real", downloadUrl: "#demo-download", createdAt: stamp, updatedAt: stamp };
};

const getPlanLabel = (plan: Plan) => {
  const isGrowth = plan.highlight || plan.id === "pro" || plan.pricePen >= 79 || plan.monthlyGenerations > 20;
  return {
    title: isGrowth ? "Plan Crecimiento" : "Plan Basico",
    badge: isGrowth ? "Mas elegido" : null,
    subtitle: isGrowth ? "Publica 5 a 6 veces por semana" : "Publica 3 veces por semana"
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
  const [statusMessage, setStatusMessage] = useState("Completa tus datos y mira tu muestra abajo.");
  const previewRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const loadPlans = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/plans`);
        const payload = (await response.json()) as ApiSuccess<Plan[]> | ApiFailure;
        if (!response.ok || !payload.success) throw new Error(payload.success ? "No se pudo cargar planes" : payload.error.message);
        setPlans(payload.data);
      } catch (error) {
        setPlans(fallbackPlans);
        setIsDemoMode(true);
        setLoadError(error instanceof Error ? `${error.message}. Mostrando planes demo.` : "No se pudo cargar la oferta. Mostrando planes demo.");
      }
    };
    void loadPlans();
  }, []);

  const focusPreview = () => previewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (form.businessCategory.trim().length < 2 || form.offer.trim().length < 5) return setFormError("Completa tu negocio y tu oferta con informacion clara.");
    if (!/^[1-9]\d{8,14}$/.test(form.whatsapp.trim())) return setFormError("Ingresa tu numero de contacto en formato internacional, por ejemplo 51999999999.");
    setIsSubmitting(true);
    setStatusMessage("Estamos armando tu video...");
    try {
      const response = await fetch(`${API_BASE_URL}/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessCategory: form.businessCategory.trim(), offer: form.offer.trim(), city: form.city.trim(), whatsapp: form.whatsapp.trim(), tone: form.tone })
      });
      const payload = (await response.json()) as ApiSuccess<Generation> | ApiFailure;
      if (!response.ok || !payload.success) throw new Error(payload.success ? "No se pudo generar el video" : payload.error.message);
      setGeneration(payload.data);
      setStatusMessage("Tu muestra ya esta lista. Baja y mira como quedaria.");
      focusPreview();
    } catch (error) {
      setGeneration(buildLocalGeneration(form, form.tone));
      setIsDemoMode(true);
      setStatusMessage(error instanceof Error ? `${error.message}. Te mostramos una muestra funcional aqui mismo.` : "Te mostramos una muestra funcional aqui mismo.");
      focusPreview();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generation) return;
    setIsRegenerating(true);
    setFormError("");
    setStatusMessage("Estamos armando otra version...");
    const nextTone = toneOptions.find((option) => option.value !== form.tone)?.value || "cercano";
    try {
      const response = await fetch(`${API_BASE_URL}/generations/${generation.id}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tone: nextTone })
      });
      const payload = (await response.json()) as ApiSuccess<Generation> | ApiFailure;
      if (!response.ok || !payload.success) throw new Error(payload.success ? "No se pudo regenerar" : payload.error.message);
      setGeneration(payload.data);
      setForm((current) => ({ ...current, tone: nextTone }));
      setStatusMessage("Tu nueva muestra ya esta lista. Baja y comparala.");
      focusPreview();
    } catch (error) {
      setGeneration(buildLocalGeneration(form, nextTone));
      setIsDemoMode(true);
      setForm((current) => ({ ...current, tone: nextTone }));
      setStatusMessage(error instanceof Error ? `${error.message}. Te mostramos una nueva muestra aqui mismo.` : "Te mostramos una nueva muestra aqui mismo.");
      focusPreview();
    } finally {
      setIsRegenerating(false);
    }
  };

  const orderedPlans = [...plans].sort((a, b) => Number(a.highlight) - Number(b.highlight));
  const preview = generation ?? getPreviewView(form, form.tone);
  const hasExternalPreview = generation ? !isPlaceholderUrl(generation.previewUrl) : false;
  const hasDownloadLink = generation ? !isPlaceholderUrl(generation.downloadUrl) : false;

  return (
    <div className="relative overflow-x-hidden bg-ink text-slate-100">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[720px] bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.10),transparent_34%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.12),transparent_38%)]" />
      <div className="relative">
        <main id="inicio" className="mx-auto max-w-7xl px-4 pb-20 pt-5 sm:px-6 lg:px-8">
          <section className="relative overflow-hidden rounded-[2.3rem] border border-white/10 bg-[linear-gradient(180deg,rgba(3,7,18,0.96),rgba(2,6,23,0.92))] p-4 shadow-[0_30px_80px_rgba(2,6,23,0.45)] sm:rounded-[2.7rem] sm:p-6 lg:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(148,163,184,0.08),transparent_28%),radial-gradient(circle_at_72%_30%,rgba(250,204,21,0.14),transparent_18%),radial-gradient(circle_at_76%_56%,rgba(59,130,246,0.12),transparent_16%),radial-gradient(circle_at_50%_10%,rgba(16,185,129,0.08),transparent_24%)]" />
            <div className="pointer-events-none absolute -right-20 top-28 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
            <div className="pointer-events-none absolute left-12 top-20 hidden h-1 w-1 rounded-full bg-white/40 shadow-[120px_40px_0_rgba(255,255,255,0.3),280px_22px_0_rgba(255,255,255,0.26),420px_76px_0_rgba(255,255,255,0.22),640px_34px_0_rgba(255,255,255,0.2)] sm:block" />

            <div className="relative">
              <div className="flex items-center justify-between rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                <a href="#inicio" className="font-display text-sm font-bold tracking-[0.24em] text-white">LEAD SHORTS</a>
                <div className="hidden items-center gap-6 text-sm text-slate-400 lg:flex">
                  <span>Contenido</span>
                  <span>Resultado</span>
                  <span>Planes</span>
                </div>
                <a href="#generador" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition duration-200 ease-out hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Crear gratis</a>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                <div className="space-y-6">
                  <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">1 video hoy. Mas consultas esta semana.</div>
                  <div className="space-y-5">
                    <h1 className="max-w-3xl font-display text-[2.65rem] font-bold leading-[0.95] text-white sm:text-[4.5rem] lg:text-[5.2rem]">Haz que tu negocio se vea imposible de ignorar.</h1>
                    <p className="max-w-2xl text-lg leading-8 text-slate-300">Escribes tu oferta. Nosotros armamos el video. Tu vuelves a aparecer frente a tus clientes hoy.</p>
                    <p className="max-w-2xl text-base leading-7 text-slate-400">Hecho para que tu negocio se vea activo, serio y presente en Reels, TikTok, Shorts y Feed.</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <a href="#generador" className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 shadow-[0_16px_32px_rgba(16,185,129,0.18)] transition duration-200 ease-out hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950">Crear mi primer video</a>
                    <span className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-slate-300">Tu muestra aparece en menos de 1 minuto</span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    {headlineStats.map((stat) => (
                      <article key={stat.label} className="rounded-[1.35rem] border border-white/10 bg-white/[0.03] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                        <p className="font-display text-3xl font-bold text-white sm:text-4xl">{stat.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-300">{stat.label}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="relative min-h-[360px] sm:min-h-[430px]">
                  <div className="absolute inset-x-8 top-10 h-56 rounded-full bg-[radial-gradient(circle,rgba(250,204,21,0.36),rgba(59,130,246,0.16)_35%,rgba(15,23,42,0)_70%)] blur-2xl" />
                  <div className="absolute left-1/2 top-20 h-64 w-64 -translate-x-1/2 rounded-full border border-white/10 bg-[radial-gradient(circle_at_35%_30%,rgba(255,255,255,0.92),rgba(250,204,21,0.42)_18%,rgba(15,23,42,0.02)_38%,rgba(15,23,42,0.95)_72%),radial-gradient(circle_at_70%_78%,rgba(59,130,246,0.52),transparent_28%),radial-gradient(circle_at_62%_22%,rgba(251,191,36,0.36),transparent_24%),#020617] shadow-[0_0_120px_rgba(250,204,21,0.1)] sm:h-80 sm:w-80" />
                  <div className="absolute left-0 top-28 w-44 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Visibilidad</p>
                    <p className="mt-2 text-3xl font-bold text-white">3x</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">Más oportunidades de aparecer cada semana.</p>
                  </div>
                  <div className="absolute right-0 top-12 w-44 rounded-[1.25rem] border border-white/10 bg-slate-950/70 p-4 backdrop-blur-xl shadow-[0_18px_40px_rgba(2,6,23,0.28)]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Atencion</p>
                    <p className="mt-2 text-3xl font-bold text-white">96%</p>
                    <div className="mt-3 h-1.5 rounded-full bg-white/5"><div className="h-full w-[96%] rounded-full bg-white" /></div>
                  </div>
                  <div className="absolute bottom-0 right-2 w-[15.5rem] rounded-[1.6rem] border border-white/10 bg-slate-950/80 p-4 backdrop-blur-xl shadow-[0_20px_50px_rgba(2,6,23,0.32)] sm:w-[17rem] sm:p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Vista del video</p>
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300">9:16</span>
                    </div>
                    <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-900/90 p-3">
                      <div className="h-28 rounded-[1rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(2,6,23,0.7)),radial-gradient(circle_at_40%_25%,rgba(250,204,21,0.42),transparent_20%),radial-gradient(circle_at_70%_70%,rgba(59,130,246,0.26),transparent_18%),#111827]" />
                      <div className="mt-3 rounded-2xl bg-black/55 px-3 py-2 text-sm font-bold leading-5 text-white">Tu oferta se ve clara desde el primer segundo.</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
                <div className="grid gap-4">
                  <section className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-6">
                    <div className="flex items-center justify-between">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">Impacto rapido</span>
                      <span className="text-xs font-medium text-slate-400">Sin grabar</span>
                    </div>
                    <h3 className="mt-5 max-w-lg font-display text-2xl font-bold leading-tight text-white sm:text-3xl">En una semana puedes volver a aparecer frente a tus clientes varias veces.</h3>
                    <p className="mt-3 max-w-xl text-sm leading-7 text-slate-300">Este formato te ayuda a mantenerte visible con menos esfuerzo y con un mensaje claro cada vez que publiques.</p>
                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {impactTimeline.map((item) => (
                        <div key={item.value} className="rounded-[1.2rem] border border-white/10 bg-slate-950/55 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                          <p className="font-display text-2xl font-bold text-white">{item.value}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-300">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                  <div className="grid gap-3 sm:grid-cols-2">{quickBenefits.map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/55 px-4 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:py-4"><p className="text-sm font-medium text-slate-200">{item}</p></div>)}</div>
                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-900/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:rounded-[1.75rem] sm:p-5"><p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-200">Lo que ganas</p><p className="mt-3 text-base leading-7 text-slate-300">Si publicas 3 o mas veces por semana, mas personas te recuerdan. Eso te trae mas preguntas, mas mensajes y mas oportunidades de venta.</p></div>
                </div>

                <section id="generador" className="glass-panel rounded-[1.8rem] border border-white/10 p-4 shadow-soft lg:sticky lg:top-6 sm:p-6" aria-labelledby="form-title">
                  <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/55 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:p-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Paso 1</p>
                    <div className="mt-3 h-px w-16 bg-gradient-to-r from-emerald-300/70 to-transparent" />
                    <h2 id="form-title" className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Genera tu primer video ahora.</h2>
                    <p className="mt-3 text-sm leading-7 text-slate-300">Llena este formulario y tu muestra aparecera abajo en segundos.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">1 minuto</span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">Listo para redes</span>
                    </div>
                  </div>
                  <form onSubmit={handleSubmit} className="mt-5 grid gap-4 sm:mt-6 sm:gap-5" noValidate>
                <label className="grid gap-2 text-sm font-semibold text-slate-200">Que tipo de negocio tienes?
                  <input id="businessCategory" name="businessCategory" value={form.businessCategory} onChange={(event) => setForm((current) => ({ ...current, businessCategory: event.target.value }))} placeholder="Ej. restaurante, inmobiliaria, clinica" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 ease-out placeholder:text-slate-500 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300/20" required />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-200">Que quieres vender hoy?
                  <input id="offer" name="offer" value={form.offer} onChange={(event) => setForm((current) => ({ ...current, offer: event.target.value }))} placeholder="Ej. 2x1, descuento, cita gratis, demo" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 ease-out placeholder:text-slate-500 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300/20" required />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="grid gap-2 text-sm font-semibold text-slate-200">Ciudad (opcional)
                    <input id="city" name="city" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Ej. Lima" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 ease-out placeholder:text-slate-500 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300/20" />
                  </label>
                  <label className="grid gap-2 text-sm font-semibold text-slate-200">Numero de contacto
                    <input id="whatsapp" name="whatsapp" value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} inputMode="numeric" placeholder="51999999999" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 ease-out placeholder:text-slate-500 focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300/20" required />
                  </label>
                </div>
                <label className="grid gap-2 text-sm font-semibold text-slate-200">Como quieres que suene?
                  <select id="tone" name="tone" value={form.tone} onChange={(event) => setForm((current) => ({ ...current, tone: event.target.value as Tone }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none transition duration-200 ease-out focus-visible:border-emerald-300 focus-visible:ring-2 focus-visible:ring-emerald-300/20">
                    {toneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
                <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3.5 text-sm font-bold text-slate-950 shadow-[0_14px_28px_rgba(16,185,129,0.18)] transition duration-200 ease-out hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">{isSubmitting ? "Creando tu video..." : "Crear mi primer video gratis"}</button>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{statusMessage}</div>
                {isDemoMode ? <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">Si la conexion falla, igual te mostramos una muestra funcional aqui mismo.</div> : null}
                {formError ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">{formError}</div> : null}
                  </form>
                </section>
              </div>
            </div>
          </section>

          <section className="relative mt-10 overflow-hidden rounded-[1.8rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.9),rgba(2,6,23,0.92))] p-4 sm:mt-14 sm:rounded-[2.3rem] sm:p-8">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(249,115,22,0.1),transparent_28%)]" />
            <div className="relative grid gap-6 lg:grid-cols-[0.96fr_1.04fr] lg:items-center">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:rounded-[2rem] sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-200">Tu presencia</p>
                <div className="mt-3 h-px w-20 bg-gradient-to-r from-orange-300/80 to-transparent" />
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Cuando publicas seguido, tu negocio deja de verse quieto.</h2>
                <p className="mt-4 max-w-xl text-base leading-8 text-slate-300">No necesitas grabarte todos los dias. Necesitas aparecer con frecuencia, con un mensaje claro y con una imagen que se vea seria.</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  {impactTimeline.map((item) => (
                    <article key={item.value} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="font-display text-2xl font-bold text-white">{item.value}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.label}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[0.7fr_1fr]">
                <div className="grid gap-4">
                  <article className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Tiempo</p>
                    <p className="mt-3 font-display text-5xl font-bold text-white">1 min</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">para ver una muestra que ya se entiende.</p>
                  </article>
                  <article className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ritmo</p>
                    <p className="mt-3 font-display text-5xl font-bold text-white">3x</p>
                    <p className="mt-2 text-sm leading-6 text-slate-300">mas oportunidades de aparecer en la semana.</p>
                  </article>
                </div>

                <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/72 p-5 shadow-[0_24px_60px_rgba(2,6,23,0.28)] sm:p-6">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lo que gana tu negocio</p>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">mensual</span>
                  </div>
                  <div className="mt-5 space-y-4">
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="font-display text-4xl font-bold text-white">12</p>
                          <p className="mt-2 text-sm text-slate-300">veces al mes para volver a estar frente a tus clientes</p>
                        </div>
                        <div className="h-16 w-16 rounded-3xl bg-[radial-gradient(circle_at_35%_30%,rgba(16,185,129,0.45),transparent_35%),rgba(16,185,129,0.08)]" />
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4">
                      <div className="flex items-center justify-between text-sm text-slate-300">
                        <span>Presencia en redes</span>
                        <span className="font-semibold text-white">4 canales</span>
                      </div>
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {["Reels", "TikTok", "Shorts", "Feed"].map((item) => (
                          <div key={item} className="rounded-2xl border border-white/10 bg-slate-900/80 px-2 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-300">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[1.2rem] border border-emerald-400/20 bg-emerald-500/10 p-4">
                      <p className="text-sm font-medium leading-7 text-emerald-100">Mas frecuencia significa mas recuerdo. Mas recuerdo significa mas mensajes y mas oportunidades de cerrar ventas.</p>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section className="relative mt-10 overflow-hidden rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-4 sm:mt-14 sm:rounded-[2.3rem] sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            <div className="grid gap-5 lg:grid-cols-[1.02fr_0.98fr]">
              <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/65 p-5 sm:rounded-[2rem] sm:p-7">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-red-200">El costo de no publicar</p>
                <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-white sm:text-4xl">Si tu negocio deja de aparecer, el cliente sigue de largo y le compra a otro.</h2>
                <div className="mt-6 space-y-3">
                  {painPoints.map((item) => (
                    <div key={item} className="rounded-[1.15rem] border border-white/10 bg-white/[0.03] px-4 py-4">
                      <p className="text-sm font-medium text-slate-200">{item}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.25rem] border border-emerald-400/20 bg-emerald-500/10 px-4 py-4">
                  <p className="text-base font-semibold leading-7 text-emerald-100">La solucion no es trabajar mas horas. Es tener una forma simple de publicar con constancia.</p>
                </div>
              </div>

              <div id="como-funciona" className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.84),rgba(15,23,42,0.92))] p-5 sm:rounded-[2rem] sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">3 pasos</p>
                    <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">Asi sales hoy mismo con una pieza lista para publicar.</h2>
                  </div>
                  <div className="hidden h-14 w-14 rounded-3xl border border-white/10 bg-white/[0.03] lg:block" />
                </div>
                <div className="mt-6 space-y-3">
                  {steps.map((item, index) => (
                    <article key={item} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-emerald-300/20 bg-emerald-500/10 text-sm font-bold text-emerald-300">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Paso {index + 1}</p>
                          <h3 className="mt-2 text-xl font-bold text-white">{item}</h3>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-slate-950/70 px-4 py-4">
                  <p className="text-sm leading-7 text-slate-300">Sin grabar, sin editar y sin aprender herramientas. Solo llenas el formulario y revisas la muestra.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="preview-real" ref={previewRef} className="mt-10 grid gap-6 sm:mt-14 sm:gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <section className="glass-panel relative overflow-hidden rounded-[1.6rem] border border-white/10 p-4 shadow-soft sm:rounded-[2rem] sm:p-6">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-200/30 to-transparent" />
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Tu muestra</p><div className="mt-3 h-px w-16 bg-gradient-to-r from-orange-300/70 to-transparent" /><h2 className="mt-3 font-display text-3xl font-bold text-white">Asi se veria tu negocio en pantalla.</h2></div>
                {generation ? <button type="button" onClick={handleRegenerate} disabled={isRegenerating} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">{isRegenerating ? "Creando otra..." : "Probar otra version"}</button> : null}
              </div>

              <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-6 xl:grid-cols-[0.72fr_1fr]">
                <div className="mx-auto w-full max-w-[300px] sm:max-w-[340px]">
                  <div className="rounded-[2.2rem] border border-white/10 bg-slate-950 p-2.5 shadow-soft sm:rounded-[2.5rem] sm:p-3">
                    <div className="rounded-[1.8rem] border border-white/5 bg-slate-900 p-3 sm:rounded-[2rem] sm:p-4">
                      <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Reproduciendo</span><span>00:{String(preview.durationSec).padStart(2, "0")}</span></div>
                      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/5"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-300" /></div>
                      <div className="mt-4 space-y-3 rounded-[1.3rem] bg-slate-800/80 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:rounded-[1.5rem] sm:p-4">
                        <div className="flex items-center justify-between"><span className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">Negocio</span><span className="text-[11px] font-medium text-slate-400">{form.businessCategory.trim() || "Tu rubro"}</span></div>
                        <div className="h-36 rounded-[1.1rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.2),rgba(15,23,42,0.85)),radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_45%),#334155] sm:h-40 sm:rounded-[1.25rem]" />
                        <div className="rounded-2xl bg-black/60 px-4 py-3 text-base font-bold leading-6 text-white">{preview.hook}</div>
                        <div className="rounded-2xl bg-amber-300 px-4 py-3 text-base font-bold leading-6 text-slate-950">{preview.subtitles[1]}</div>
                        <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm font-medium text-slate-200">{preview.subtitles[2]}</div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{preview.subtitles[3]}</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4 sm:rounded-[1.5rem] sm:p-5"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lo que dira tu video</p><p className="mt-3 text-sm leading-7 text-slate-200">{preview.script}</p></div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4 sm:rounded-[1.5rem] sm:p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Lo que vera tu cliente</p>
                    <div className="mt-3 flex flex-wrap gap-2">{preview.subtitles.slice(0, 4).map((line) => <span key={line} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200">{line}</span>)}</div>
                    <div className="mt-4 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm font-medium text-emerald-200">{preview.cta}</div>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/55 p-4 sm:rounded-[1.5rem] sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {generation && hasDownloadLink ? <a href={generation.downloadUrl} className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 transition duration-200 ease-out hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Descargar video</a> : null}
                      {generation && hasExternalPreview ? <a href={generation.previewUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition duration-200 ease-out hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Abrir enlace</a> : null}
                    </div>
                    <p className="mt-4 text-sm leading-6 text-slate-400">{generation && !hasDownloadLink ? "Tu muestra ya funciona aqui mismo. La descarga se activa cuando tu video final este listo." : "Aqui puedes revisar tu mensaje antes de pagar y antes de publicar."}</p>
                  </div>
                </div>
              </div>
            </section>

            <div className="space-y-5 lg:sticky lg:top-6">
              <section className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(2,6,23,0.92))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] sm:rounded-[2rem] sm:p-6">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Despues de ver tu muestra</p>
                <div className="mt-3 h-px w-16 bg-gradient-to-r from-white/30 to-transparent" />
                <h2 className="mt-3 font-display text-3xl font-bold text-white">Elige cuantas veces quieres aparecer al mes.</h2>
                <p className="mt-3 text-sm leading-7 text-slate-300">Cuanto mas publicas, mas veces te ven. Aqui eliges el ritmo que mejor se ajusta a tu negocio y a tu meta de ventas.</p>
              </section>
              {loadError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200" role="alert">{loadError}</div> : null}
              <section className="grid gap-4">
                {orderedPlans.map((plan) => {
                  const planCopy = getPlanLabel(plan);
                  return (
                    <article key={plan.id} className={`rounded-[1.4rem] border p-4 sm:rounded-[1.75rem] sm:p-5 ${planCopy.badge ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-slate-900/80"}`}>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-semibold text-white">{planCopy.title}</p>
                        {planCopy.badge ? <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-950">{planCopy.badge}</span> : null}
                      </div>
                      <p className="mt-3 font-display text-4xl font-bold text-white">S/{plan.pricePen}</p>
                      <p className="mt-2 text-sm text-slate-300">{planCopy.subtitle}</p>
                      <p className="mt-4 text-sm font-medium text-slate-400">{plan.monthlyGenerations} videos al mes</p>
                    </article>
                  );
                })}
                {!plans.length && !loadError ? <div className="rounded-[1.25rem] border border-white/10 bg-slate-900/80 p-4 text-sm text-slate-300 sm:rounded-[1.5rem] sm:p-5">Cargando planes...</div> : null}
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
