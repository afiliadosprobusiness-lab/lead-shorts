import { FormEvent, useEffect, useState } from "react";

type Tone = "directo" | "cercano" | "premium" | "urgente";
type Generation = { id: string; status: "ready"; ratio: "9:16"; durationSec: number; hook: string; script: string; subtitles: string[]; cta: string; musicTrack: string; previewUrl: string; downloadUrl: string; createdAt: string; updatedAt: string };
type Plan = { id: string; name: string; pricePen: number; monthlyGenerations: number; highlight: boolean; description: string };
type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string; details?: Array<{ field: string; message: string }> } };
type FormState = { businessCategory: string; offer: string; city: string; whatsapp: string; tone: Tone };

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
const benefits = ["Video listo para publicar", "Sin grabar", "Sin editar", "Optimizado para captar atencion"];
const pains = ["No tienes tiempo para grabar.", "No sabes editar.", "No sabes que decir.", "Publicar se vuelve complicado."];
const steps = ["Escribes tu negocio.", "La IA crea un video estilo influencer.", "Descargas y publicas hoy."];

const buildLocalGeneration = (form: FormState, tone: Tone): Generation => {
  const hooks: Record<Tone, string> = {
    directo: "Tu oferta puede verse asi en redes hoy mismo",
    cercano: "Un video simple que hace que te miren y te recuerden",
    premium: "Haz que tu marca se vea firme y lista para vender",
    urgente: "Publica hoy antes de que tu cliente siga de largo"
  };
  const stamp = new Date().toISOString();
  const city = form.city.trim() ? ` en ${form.city.trim()}` : "";
  return {
    id: `demo_${Date.now()}`,
    status: "ready",
    ratio: "9:16",
    durationSec: 28,
    hook: hooks[tone],
    script: `${hooks[tone]}. Si tienes un ${form.businessCategory.trim().toLowerCase()}${city}, esta oferta puede llamar mas atencion: ${form.offer.trim()}. La IA arma un video con avatar y voz para que publiques sin grabar ni editar.`,
    subtitles: [hooks[tone], form.offer.trim(), `Disponible${city || " hoy"}`, "Listo para publicar"],
    cta: `Tu numero de contacto queda listo para recibir mensajes: ${form.whatsapp.trim()}`,
    musicTrack: tone === "premium" ? "Clean Luxe Beat" : tone === "urgente" ? "Fast Conversion" : tone === "cercano" ? "Warm Pulse" : "Momentum Pop",
    previewUrl: "#demo-preview",
    downloadUrl: "#demo-download",
    createdAt: stamp,
    updatedAt: stamp
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
  const [statusMessage, setStatusMessage] = useState("Completa tus datos y crea tu primer video.");

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    if (form.businessCategory.trim().length < 2 || form.offer.trim().length < 5) return setFormError("Completa tu negocio y tu oferta con informacion clara.");
    if (!/^[1-9]\d{8,14}$/.test(form.whatsapp.trim())) return setFormError("Ingresa tu numero de contacto en formato internacional, por ejemplo 51999999999.");
    setIsSubmitting(true);
    setStatusMessage("Creando tu video...");
    try {
      const response = await fetch(`${API_BASE_URL}/generations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessCategory: form.businessCategory.trim(), offer: form.offer.trim(), city: form.city.trim(), whatsapp: form.whatsapp.trim(), tone: form.tone })
      });
      const payload = (await response.json()) as ApiSuccess<Generation> | ApiFailure;
      if (!response.ok || !payload.success) throw new Error(payload.success ? "No se pudo generar el video" : payload.error.message);
      setGeneration(payload.data);
      setStatusMessage("Tu video esta listo para revisar y descargar.");
    } catch (error) {
      setGeneration(buildLocalGeneration(form, form.tone));
      setIsDemoMode(true);
      setStatusMessage(error instanceof Error ? `${error.message}. Mostrando una muestra demo.` : "Mostrando una muestra demo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!generation) return;
    setIsRegenerating(true);
    setFormError("");
    setStatusMessage("Creando otra version...");
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
      setStatusMessage("Tu nueva version ya esta lista.");
    } catch (error) {
      setGeneration(buildLocalGeneration(form, nextTone));
      setIsDemoMode(true);
      setForm((current) => ({ ...current, tone: nextTone }));
      setStatusMessage(error instanceof Error ? `${error.message}. Mostrando una variante demo.` : "Mostrando una variante demo.");
    } finally {
      setIsRegenerating(false);
    }
  };

  const orderedPlans = [...plans].sort((a, b) => Number(a.highlight) - Number(b.highlight));

  return (
    <div className="overflow-x-hidden bg-ink text-slate-100">
      <header className="mx-auto max-w-7xl px-4 pb-8 pt-6 sm:px-6 lg:px-8">
        <nav className="glass-panel flex items-center justify-between rounded-full border border-white/10 px-4 py-3 shadow-soft">
          <a href="#inicio" className="font-display text-sm font-bold tracking-[0.18em] text-white">SHORTS AI</a>
          <a href="#generador" className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-ink">Crear gratis</a>
        </nav>
      </header>

      <main id="inicio" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-7">
            <div className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">Videos para negocios que quieren vender en redes</div>
            <div className="space-y-4">
              <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">Crea videos tipo influencer que captan atencion desde el primer segundo.</h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">Escribes tu oferta. La IA crea el video. Tu lo publicas hoy.</p>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Vertical o cuadrado. Listo para redes sociales.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">{benefits.map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-slate-900/80 px-4 py-4 text-sm font-semibold text-slate-100">{item}</div>)}</div>
          </div>

          <section id="generador" className="glass-panel rounded-[2rem] border border-white/10 p-5 shadow-soft sm:p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Listo en segundos</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Genera tu primer video ahora.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">Completa el formulario y en segundos veras una muestra lista para revisar.</p>
            <form onSubmit={handleSubmit} className="mt-6 grid gap-5" noValidate>
              <label className="grid gap-2 text-sm font-semibold text-slate-200">Tu negocio
                <input id="businessCategory" name="businessCategory" value={form.businessCategory} onChange={(event) => setForm((current) => ({ ...current, businessCategory: event.target.value }))} placeholder="Ej. restaurante, inmobiliaria, clinica" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/20" required />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-200">Que quieres promocionar
                <input id="offer" name="offer" value={form.offer} onChange={(event) => setForm((current) => ({ ...current, offer: event.target.value }))} placeholder="Ej. 2x1, descuento, cita gratis, demo" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/20" required />
              </label>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-semibold text-slate-200">Ciudad (opcional)
                  <input id="city" name="city" value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} placeholder="Ej. Lima" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/20" />
                </label>
                <label className="grid gap-2 text-sm font-semibold text-slate-200">Numero de contacto
                  <input id="whatsapp" name="whatsapp" value={form.whatsapp} onChange={(event) => setForm((current) => ({ ...current, whatsapp: event.target.value }))} inputMode="numeric" placeholder="51999999999" className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/20" required />
                </label>
              </div>
              <label className="grid gap-2 text-sm font-semibold text-slate-200">Estilo del video
                <select id="tone" name="tone" value={form.tone} onChange={(event) => setForm((current) => ({ ...current, tone: event.target.value as Tone }))} className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus-visible:border-orange-300 focus-visible:ring-2 focus-visible:ring-orange-300/20">
                  {toneOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </label>
              <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-slate-600 disabled:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">{isSubmitting ? "Creando video..." : "Crear mi primer video gratis"}</button>
              <p className="text-sm text-slate-400" aria-live="polite">{statusMessage}</p>
              {isDemoMode ? <div className="rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">No pudimos conectar con la API. Estas viendo una demo local.</div> : null}
              {formError ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200" role="alert">{formError}</div> : null}
            </form>
          </section>
        </section>

        <section className="mt-14 grid gap-8 rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="mx-auto w-full max-w-[320px] rounded-[2.4rem] border border-white/10 bg-slate-950 p-3 shadow-soft">
            <div className="rounded-[2rem] border border-white/5 bg-slate-900 p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />Reproduciendo</span><span>00:28</span></div>
              <div className="mt-4 space-y-3 rounded-[1.5rem] bg-slate-800/80 p-4">
                <div className="ml-auto rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold text-slate-200">Avatar IA</div>
                <div className="h-40 rounded-[1.25rem] bg-slate-700/60" />
                <div className="rounded-2xl bg-black/55 px-4 py-3 text-base font-bold text-white">Tu oferta en video listo para publicar hoy.</div>
                <div className="rounded-2xl bg-amber-300 px-4 py-3 text-base font-bold text-slate-950">Hecho para captar atencion desde el primer segundo.</div>
              </div>
            </div>
            <p className="mt-4 text-center text-sm font-medium text-slate-400">Este video fue generado en menos de 1 minuto.</p>
          </div>
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Muestra estilo UGC</p>
            <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">Se siente como contenido real para redes.</h2>
            <p className="text-base leading-7 text-slate-300">El avatar habla a camara, el texto aparece grande y el formato se ve listo para Reels, TikTok, Shorts y Feed.</p>
            <div className="grid gap-3 sm:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white">Video listo para llamar la atencion.</div><div className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-semibold text-white">Tu oferta queda clara desde el inicio.</div></div>
          </div>
        </section>

        <section className="mt-14 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-red-200">El problema</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Si no publicas contenido, tu negocio desaparece.</h2>
            <div className="mt-6 space-y-3">{pains.map((item) => <div key={item} className="rounded-3xl border border-white/10 bg-slate-950/60 px-4 py-4 text-sm text-slate-200">{item}</div>)}</div>
            <p className="mt-5 text-lg font-semibold text-emerald-300">Nosotros lo hacemos por ti.</p>
          </div>
          <div id="como-funciona" className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Asi funciona</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">Tres pasos para publicar hoy.</h2>
            <div className="mt-6 grid gap-4">{steps.map((item, index) => <article key={item} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5"><div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-sm font-bold text-emerald-300">{index + 1}</div><h3 className="mt-4 text-xl font-bold text-white">{item}</h3></article>)}</div>
          </div>
        </section>

        <section className="mt-14 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="glass-panel rounded-[2rem] border border-white/10 p-5 shadow-soft sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-orange-200">Vista previa</p><h2 className="mt-2 font-display text-3xl font-bold text-white">Tu video listo para publicar</h2></div>
              {generation ? <button type="button" onClick={handleRegenerate} disabled={isRegenerating} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">{isRegenerating ? "Creando otra..." : "Crear otra version"}</button> : null}
            </div>
            {generation ? (
              <div className="mt-5 space-y-5">
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/80 p-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400"><span className="inline-flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400" />En reproduccion</span><span>00:{String(generation.durationSec).padStart(2, "0")}</span></div>
                  <div className="mt-4 space-y-3 rounded-[1.25rem] bg-slate-900 p-4">
                    <div className="rounded-2xl bg-black/50 px-4 py-3 text-base font-bold text-white">{generation.hook}</div>
                    <div className="rounded-2xl bg-amber-300 px-4 py-3 text-base font-bold text-slate-950">{generation.subtitles[1] || "Video listo para publicar"}</div>
                    <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-300">{generation.subtitles[2] || "Publicalo hoy mismo"}</div>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/60 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Guion listo</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{generation.script}</p>
                  <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">{generation.cta}</div>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <a href={generation.downloadUrl} className="inline-flex items-center justify-center rounded-full bg-ember px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Descargar video</a>
                    <a href={generation.previewUrl} className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">Abrir muestra</a>
                  </div>
                </div>
              </div>
            ) : <div className="mt-5 rounded-[1.5rem] border border-dashed border-white/15 bg-slate-950/50 p-8 text-center"><p className="font-display text-2xl font-bold text-white">Aqui veras tu primer video.</p><p className="mt-3 text-sm leading-7 text-slate-300">Cuando completes el formulario, esta area mostrara una muestra lista para revisar.</p></div>}
          </section>

          <div className="space-y-5">
            <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">Despues de ver tu muestra</p>
              <h2 className="mt-3 font-display text-3xl font-bold text-white">Elige tu plan para publicar mas seguido.</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">Primero generas tu muestra. Luego eliges el plan que mejor acompana tu ritmo de publicacion.</p>
            </section>
            {loadError ? <div className="rounded-[1.5rem] border border-red-400/30 bg-red-500/10 p-5 text-sm text-red-200" role="alert">{loadError}</div> : null}
            <section className="grid gap-4">
              {orderedPlans.map((plan) => {
                const isGrowth = plan.highlight || plan.id === "pro" || plan.pricePen >= 79;
                return (
                  <article key={plan.id} className={`rounded-[1.75rem] border p-5 ${isGrowth ? "border-emerald-400/40 bg-emerald-500/10" : "border-white/10 bg-slate-900/80"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-lg font-semibold text-white">{isGrowth ? "Plan Crecimiento" : "Plan Basico"}</p>
                      {isGrowth ? <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-950">Mas elegido</span> : null}
                    </div>
                    <p className="mt-3 font-display text-4xl font-bold text-white">S/{plan.pricePen}</p>
                    <p className="mt-2 text-sm text-slate-300">{isGrowth ? "Para publicar varias veces por semana" : "Ideal para empezar a publicar"}</p>
                    <p className="mt-4 text-sm text-slate-400">{plan.monthlyGenerations} videos al mes</p>
                  </article>
                );
              })}
              {!plans.length && !loadError ? <div className="rounded-[1.5rem] border border-white/10 bg-slate-900/80 p-5 text-sm text-slate-300">Cargando planes...</div> : null}
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
