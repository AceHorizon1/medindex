import { prisma } from './index.js';
import { seedSchools } from './data/seed-data.js';

async function main() {
  for (const school of seedSchools) {
    await prisma.medicalSchool.upsert({
      where: { name: school.name },
      update: school,
      create: {
        ...school,
        tuitionInState: 45000,
        tuitionOutState: 62000,
        acceptanceRate: 0.05,
        classSize: 120
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Seeded schools');
  })
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
