// V1: rule-based keyword matching with scoring (counts matches across all
// categories, picks the strongest one) rather than first-match, so a message
// mentioning multiple symptom types still lands on the most relevant
// specialist. Designed so a future LLM step can replace just this matching
// logic — the output contract stays the same either way.

const SYMPTOM_MAP: { keywords: string[]; specializationId: string; specializationName: string }[] = [
  {
    specializationId: "spec_gp",
    specializationName: "General Physician",
    keywords: [
      "fever", "cold", "flu", "cough", "sore throat", "body ache", "general checkup",
      "tired", "fatigue", "weakness", "nausea", "vomiting", "diarrhea", "stomach upset",
      "loss of appetite", "chills", "sweating", "general pain", "not feeling well", "unwell",
    ],
  },
  {
    specializationId: "spec_cardio",
    specializationName: "Cardiologist",
    keywords: [
      "chest pain", "heart", "breathless", "breathing difficulty", "palpitation",
      "blood pressure", "hypertension", "irregular heartbeat", "chest tightness", "shortness of breath",
    ],
  },
  {
    specializationId: "spec_derm",
    specializationName: "Dermatologist",
    keywords: [
      "skin", "rash", "acne", "pimple", "itching", "hair fall", "allergy", "eczema",
      "dry skin", "hives", "mole", "scar", "dandruff",
    ],
  },
  {
    specializationId: "spec_dent",
    specializationName: "Dentist",
    keywords: [
      "tooth", "teeth", "gum", "cavity", "dental", "toothache", "braces", "root canal", "bad breath",
    ],
  },
  {
    specializationId: "spec_ophtho",
    specializationName: "Ophthalmologist",
    keywords: [
      "eye", "vision", "blurry", "eyesight", "eye pain", "red eye", "watery eyes", "glasses", "cataract",
    ],
  },
  {
    specializationId: "spec_ent",
    specializationName: "ENT Specialist",
    keywords: [
      "ear", "nose", "throat", "sinus", "hearing", "ear pain", "blocked nose", "tonsils", "snoring",
    ],
  },
  {
    specializationId: "spec_ortho",
    specializationName: "Orthopedic",
    keywords: [
      "bone", "joint", "fracture", "back pain", "knee", "sprain", "shoulder pain",
      "neck pain", "arthritis", "muscle pain", "swelling in joint",
    ],
  },
  {
    specializationId: "spec_ped",
    specializationName: "Pediatrician",
    keywords: [
      "child", "baby", "infant", "kid", "pediatric", "toddler", "newborn", "child fever", "vaccination",
    ],
  },
  {
    specializationId: "spec_gyn",
    specializationName: "Gynecologist",
    keywords: [
      "pregnancy", "period", "menstrual", "gynecology", "women's health", "pcos",
      "irregular periods", "pelvic pain", "prenatal",
    ],
  },
  {
    specializationId: "spec_neuro",
    specializationName: "Neurologist",
    keywords: [
      "headache", "migraine", "seizure", "numbness", "dizziness", "memory loss",
      "tremor", "fainting", "vertigo",
    ],
  },
  {
    specializationId: "spec_psych",
    specializationName: "Psychiatrist",
    keywords: [
      "anxiety", "depression", "stress", "sleep problem", "mental health", "panic attack",
      "mood swings", "insomnia", "overwhelmed",
    ],
  },
];

export const symptomAgentService = {
  matchSpecialization: (message: string) => {
    const lower = message.toLowerCase();

    let best: { specializationId: string; specializationName: string; score: number } | null = null;

    for (const entry of SYMPTOM_MAP) {
      const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
      if (score > 0 && (!best || score > best.score)) {
        best = { specializationId: entry.specializationId, specializationName: entry.specializationName, score };
      }
    }

    return best ? { specializationId: best.specializationId, specializationName: best.specializationName } : null;
  },
};
