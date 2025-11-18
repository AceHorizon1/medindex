import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type SchoolFilter = {
  state?: string;
  designation?: 'MD' | 'DO';
  interests?: string[];
  minGpa?: number;
  minMcat?: number;
};

export async function listSchools(filter: SchoolFilter = {}) {
  return prisma.medicalSchool.findMany({
    where: {
      state: filter.state,
      designation: filter.designation,
      avgGpa: filter.minGpa ? { gte: filter.minGpa } : undefined,
      avgMcat: filter.minMcat ? { gte: filter.minMcat } : undefined
    },
    include: {
      stats: true,
      prerequisites: true
    }
  });
}

export async function getSchool(id: string) {
  return prisma.medicalSchool.findUnique({
    where: { id },
    include: { stats: true, prerequisites: true, windows: true }
  });
}

export type MatchInput = {
  gpa: number;
  mcat: number;
  state?: string;
  interests?: string[];
};

export async function matchSchools(input: MatchInput) {
  const schools = await prisma.medicalSchool.findMany({ include: { matchProfiles: true } });
  return schools
    .map((school) => {
      const profile = school.matchProfiles[0];
      const distance =
        Math.abs((school.avgGpa ?? input.gpa) - input.gpa) +
        Math.abs((school.avgMcat ?? input.mcat) - input.mcat) / 10;
      return {
        school,
        score: Math.max(0, 100 - distance * 10),
        rationale: profile?.emphasis ?? 'Alignment based on published ranges.'
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}
