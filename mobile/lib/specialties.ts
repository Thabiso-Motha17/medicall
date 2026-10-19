export type Specialty = "general" | "pediatric" | "cardio" | "derm" | "neuro";
export const SPECIALTIES: { value: Specialty; label: string }[] = [
  { value: "general",  label: "General Practitioner" },
  { value: "pediatric", label: "Pediatrics" },
  { value: "cardio",   label: "Cardiology" },
  { value: "derm",     label: "Dermatology" },
  { value: "neuro",    label: "Neurology" },
];
