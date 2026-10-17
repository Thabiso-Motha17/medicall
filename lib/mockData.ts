export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviews: number;
  experienceYears: number;
  distanceKm: number;
  priceUsd: number;
  availableIn: string;
  bio: string;
  languages: string[];
  verified: boolean;
};

export const DOCTORS: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Amelia Hart',
    specialty: 'General Practitioner',
    rating: 4.9,
    reviews: 1284,
    experienceYears: 12,
    distanceKm: 1.2,
    priceUsd: 89,
    availableIn: '30 min',
    bio: 'Family medicine specialist focused on geriatric care, chronic conditions, and same-day urgent visits.',
    languages: ['English', 'Spanish'],
    verified: true,
  },
  {
    id: 'd2',
    name: 'Dr. Marcus Chen',
    specialty: 'Pediatrician',
    rating: 4.8,
    reviews: 942,
    experienceYears: 9,
    distanceKm: 2.4,
    priceUsd: 99,
    availableIn: '45 min',
    bio: 'Board-certified pediatrician. House calls for newborns, fevers, and routine checkups.',
    languages: ['English', 'Mandarin'],
    verified: true,
  },
  {
    id: 'd3',
    name: 'Dr. Sofia Reyes',
    specialty: 'Cardiologist',
    rating: 4.95,
    reviews: 612,
    experienceYears: 18,
    distanceKm: 3.8,
    priceUsd: 149,
    availableIn: '1 hr',
    bio: 'Cardiology consultations at home — ECG, blood pressure assessments, post-op follow-ups.',
    languages: ['English', 'Portuguese'],
    verified: true,
  },
  {
    id: 'd4',
    name: "Dr. James O'Connor",
    specialty: 'Dermatologist',
    rating: 4.7,
    reviews: 488,
    experienceYears: 7,
    distanceKm: 4.1,
    priceUsd: 119,
    availableIn: '2 hr',
    bio: 'Skin conditions, mole checks, and minor procedures performed in the comfort of your home.',
    languages: ['English'],
    verified: true,
  },
];

export const SPECIALTIES = [
  { id: 'all', label: 'All', icon: '🩺' },
  { id: 'gp', label: 'General', icon: '🏥' },
  { id: 'ped', label: 'Pediatric', icon: '👶' },
  { id: 'card', label: 'Cardio', icon: '❤️' },
  { id: 'derm', label: 'Skin', icon: '🧴' },
  { id: 'neuro', label: 'Neuro', icon: '🧠' },
];
