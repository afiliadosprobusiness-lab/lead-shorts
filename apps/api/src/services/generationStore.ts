import { firestoreDb } from "../lib/firebaseAdmin";
import { Generation, GenerationInput, Plan, Tone } from "../types";

const HOOK_BY_TONE: Record<Tone, string> = {
  directo: "Deten el scroll: tu proxima venta puede entrar hoy",
  cercano: "Tu negocio merece videos que conecten y vendan",
  premium: "Haz que tu marca se vea confiable en segundos",
  urgente: "Aprovecha esta oportunidad antes que pase hoy"
};

const MUSIC_BY_TONE: Record<Tone, string> = {
  directo: "Momentum Pop",
  cercano: "Warm Pulse",
  premium: "Clean Luxe Beat",
  urgente: "Fast Conversion"
};

const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePen: 39,
    monthlyGenerations: 12,
    highlight: false,
    description: "Ideal para validar contenido constante sin complicarte."
  },
  {
    id: "pro",
    name: "Pro",
    pricePen: 79,
    monthlyGenerations: 40,
    highlight: true,
    description: "Pensado para negocios que publican varias veces por semana."
  }
];

const buildScript = (
  input: GenerationInput,
  tone: Tone,
  variant: number
): Pick<Generation, "hook" | "script" | "subtitles" | "cta" | "musicTrack"> => {
  const hook = HOOK_BY_TONE[tone];
  const citySuffix = input.city ? ` en ${input.city}` : "";
  const businessLabel = input.businessCategory.toLowerCase();
  const variantLabel = variant % 2 === 0 ? "hoy" : "esta semana";
  const script = [
    hook,
    `Si tienes un ${businessLabel}${citySuffix}, esta oferta puede ayudarte a vender mas: ${input.offer}.`,
    "Muestra tu propuesta en vertical, con subtitulos y CTA listo para WhatsApp.",
    `Escribenos ahora y recibe clientes ${variantLabel}.`
  ].join(" ");

  return {
    hook,
    script,
    subtitles: [
      hook,
      `${input.offer}`,
      `Disponible${citySuffix || " para tu negocio"}`,
      `WhatsApp: ${input.whatsapp}`
    ],
    cta: `Escribenos por WhatsApp al ${input.whatsapp}`,
    musicTrack: MUSIC_BY_TONE[tone]
  };
};

class GenerationStore {
  private readonly collectionName =
    process.env.FIREBASE_GENERATIONS_COLLECTION || "generations";

  private readonly items = new Map<
    string,
    {
      generation: Generation;
      input: GenerationInput;
    }
  >();

  listPlans(): Plan[] {
    return plans;
  }

  async create(input: GenerationInput): Promise<Generation> {
    const tone = input.tone ?? "directo";
    const id = `gen_${Date.now()}`;
    const now = new Date().toISOString();
    const draft = buildScript(input, tone, 1);

    const generation: Generation = {
      id,
      status: "ready",
      ratio: "9:16",
      durationSec: 18,
      ...draft,
      previewUrl: `https://demo.shortwhatsapp.app/preview/${id}.mp4`,
      downloadUrl: `https://demo.shortwhatsapp.app/download/${id}.mp4`,
      createdAt: now,
      updatedAt: now
    };

    if (firestoreDb) {
      await firestoreDb.collection(this.collectionName).doc(id).set({
        generation,
        input
      });
    } else {
      this.items.set(id, {
        generation,
        input
      });
    }

    return generation;
  }

  async getById(id: string): Promise<Generation | undefined> {
    if (firestoreDb) {
      const snapshot = await firestoreDb.collection(this.collectionName).doc(id).get();

      if (!snapshot.exists) {
        return undefined;
      }

      return (snapshot.data() as { generation: Generation }).generation;
    }

    return this.items.get(id)?.generation;
  }

  async regenerate(id: string, tone: Tone): Promise<Generation | undefined> {
    const current = firestoreDb
      ? await firestoreDb.collection(this.collectionName).doc(id).get()
      : null;
    const currentValue = firestoreDb
      ? current?.exists
        ? (current.data() as { generation: Generation; input: GenerationInput })
        : undefined
      : this.items.get(id);

    if (!currentValue) {
      return undefined;
    }

    const nextDraft = buildScript(currentValue.input, tone, Date.now());

    const next: Generation = {
      ...currentValue.generation,
      ...nextDraft,
      updatedAt: new Date().toISOString()
    };

    const nextValue = {
      generation: next,
      input: {
        ...currentValue.input,
        tone
      }
    };

    if (firestoreDb) {
      await firestoreDb.collection(this.collectionName).doc(id).set(nextValue);
    } else {
      this.items.set(id, nextValue);
    }

    return next;
  }
}

export const generationStore = new GenerationStore();
