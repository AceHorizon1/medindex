export type SeedSchool = {
  name: string;
  designation: 'MD' | 'DO';
  state: string;
  city: string;
  avgGpa: number;
  avgMcat: number;
  mission: string;
  interests: string[];
};

export const seedSchools: SeedSchool[] = [
  {
    name: 'Sample University School of Medicine',
    designation: 'MD',
    state: 'CA',
    city: 'San Francisco',
    avgGpa: 3.78,
    avgMcat: 515,
    mission: 'Advance health equity through research-driven care.',
    interests: ['health-equity', 'research']
  },
  {
    name: 'Coastal College of Osteopathic Medicine',
    designation: 'DO',
    state: 'FL',
    city: 'Tampa',
    avgGpa: 3.55,
    avgMcat: 505,
    mission: 'Train primary care physicians for coastal communities.',
    interests: ['primary-care', 'community']
  }
];
