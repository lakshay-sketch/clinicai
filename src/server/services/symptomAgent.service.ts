// V1: rule-based keyword matching. Designed so a future LLM step can
// replace just this matching logic — the output contract (specializationId
// + confidence-ish reasoning) stays the same either way.

const SYMPTOM_MAP: { keywords: string[]; specializationId: string; specializationName: string }[] = [
  { keywords: ["fever", "cold", "flu", "cough", "sore throat", "body ache", "general checkup", "tired", "fatigue"], specializationId: "spec_gp", specializationName: "General Physician" },
  { keywords: ["chest pain", "heart", "breathless", "breathing", "palpitation", "blood pressure"], specializationId: "spec_cardio", specializationName: "Cardiologist" },
  { keywords: ["skin", "rash", "acne", "itching", "hair fall", "allergy"], specializationId: "spec_derm", specializationName: "Dermatologist" },
  { keywords: ["tooth", "teeth", "gum", "cavity", "dental"], specializationId: "spec_dent", specializationName: "Dentist" },
  { keywords: ["eye", "vision", "blurry", "eyesight"], specializationId: "spec_ophtho", specializationName: "Ophthalmologist" },
  { keywords: ["ear", "nose", "throat", "sinus", "hearing"], specializationId: "spec_ent", specializationName: "ENT Specialist" },
  { keywords: ["bone", "joint", "fracture", "back pain", "knee", "sprain"], specializationId: "spec_ortho", specializationName: "Orthopedic" },
  { keywords: ["child", "baby", "infant", "kid", "pediatric"], specializationId: "spec_ped", specializationName: "Pediatrician" },
  { keywords: ["pregnancy", "period", "menstrual", "gynecology", "women's health"], specializationId: "spec_gyn", specializationName: "Gynecologist" },
  { keywords: ["headache", "migraine", "seizure", "numbness", "dizziness"], specializationId: "spec_neuro", specializationName: "Neurologist" },
  { keywords: ["anxiety", "depression", "stress", "sleep", "mental health"], specializationId: "spec_psych", specializationName: "Psychiatrist" },
];

export const symptomAgentService = {
  matchSpecialization: (message: string) => {
    const lower = message.toLowerCase();
    for (const entry of SYMPTOM_MAP) {
      if (entry.keywords.some((kw) => lower.includes(kw))) {
        return { specializationId: entry.specializationId, specializationName: entry.specializationName };
      }
    }
    return null;
  },
};
