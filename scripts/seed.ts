import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schools = [
  {
    name: 'Harvard Medical School',
    type: 'MD' as const,
    location: 'Boston, MA',
    tuition: 65000,
    avg_gpa: 3.93,
    avg_mcat: 520,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To create and nurture a diverse community of the best people committed to leadership in alleviating human suffering caused by disease.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://hms.harvard.edu'
  },
  {
    name: 'Johns Hopkins School of Medicine',
    type: 'MD' as const,
    location: 'Baltimore, MD',
    tuition: 58000,
    avg_gpa: 3.91,
    avg_mcat: 519,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To improve the health of the community and the world by setting the standard of excellence in medical education, research and clinical care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://www.hopkinsmedicine.org/som'
  },
  {
    name: 'Perelman School of Medicine',
    type: 'MD' as const,
    location: 'Philadelphia, PA',
    tuition: 61000,
    avg_gpa: 3.89,
    avg_mcat: 521,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To advance knowledge and improve health through research, patient care, and the education of trainees.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://www.med.upenn.edu'
  },
  {
    name: 'Stanford School of Medicine',
    type: 'MD' as const,
    location: 'Stanford, CA',
    tuition: 62000,
    avg_gpa: 3.90,
    avg_mcat: 518,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To be a premier research-intensive medical school that improves health through leadership, diversity and collaborative discoveries.',
    deadlines: {
      primary: 'October 1',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://med.stanford.edu'
  },
  {
    name: 'Mayo Clinic Alix School of Medicine',
    type: 'MD' as const,
    location: 'Rochester, MN',
    tuition: 55000,
    avg_gpa: 3.88,
    avg_mcat: 516,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To educate physicians and scientists who will transform medical practice and improve patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 15',
      interview: 'September - March'
    },
    link: 'https://www.mayo.edu/mayo-clinic-school-of-medicine'
  },
  {
    name: 'Yale School of Medicine',
    type: 'MD' as const,
    location: 'New Haven, CT',
    tuition: 64000,
    avg_gpa: 3.90,
    avg_mcat: 519,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To educate and inspire scholars and future leaders who will advance the practice of medicine and the biomedical sciences.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://medicine.yale.edu'
  },
  {
    name: 'Columbia University Vagelos College of Physicians and Surgeons',
    type: 'MD' as const,
    location: 'New York, NY',
    tuition: 63000,
    avg_gpa: 3.87,
    avg_mcat: 520,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To educate the next generation of leaders in medicine and science.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://www.ps.columbia.edu'
  },
  {
    name: 'Duke University School of Medicine',
    type: 'MD' as const,
    location: 'Durham, NC',
    tuition: 60000,
    avg_gpa: 3.88,
    avg_mcat: 519,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To advance health together through innovative education, discovery and patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://medschool.duke.edu'
  },
  {
    name: 'University of California San Francisco School of Medicine',
    type: 'MD' as const,
    location: 'San Francisco, CA',
    tuition: 42000,
    avg_gpa: 3.85,
    avg_mcat: 517,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To advance health worldwide through innovative education, discovery and patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://medschool.ucsf.edu'
  },
  {
    name: 'Washington University School of Medicine',
    type: 'MD' as const,
    location: 'St. Louis, MO',
    tuition: 65000,
    avg_gpa: 3.92,
    avg_mcat: 521,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To advance human health through the best clinical care, innovative research and the education of tomorrow\'s physician leaders.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://medicine.wustl.edu'
  },
  {
    name: 'University of Michigan Medical School',
    type: 'MD' as const,
    location: 'Ann Arbor, MI',
    tuition: 48000,
    avg_gpa: 3.84,
    avg_mcat: 515,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To transform health through bold and innovative education, discovery and service.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://medicine.umich.edu'
  },
  {
    name: 'Northwestern University Feinberg School of Medicine',
    type: 'MD' as const,
    location: 'Chicago, IL',
    tuition: 62000,
    avg_gpa: 3.86,
    avg_mcat: 518,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To transform the practice of medicine and improve human health.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://www.feinberg.northwestern.edu'
  },
  {
    name: 'Vanderbilt University School of Medicine',
    type: 'MD' as const,
    location: 'Nashville, TN',
    tuition: 58000,
    avg_gpa: 3.87,
    avg_mcat: 519,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To improve human health through innovative research, education and patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://medschool.vanderbilt.edu'
  },
  {
    name: 'University of Pennsylvania Perelman School of Medicine',
    type: 'MD' as const,
    location: 'Philadelphia, PA',
    tuition: 61000,
    avg_gpa: 3.89,
    avg_mcat: 521,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To advance knowledge and improve health through research, patient care, and education.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://www.med.upenn.edu'
  },
  {
    name: 'University of Chicago Pritzker School of Medicine',
    type: 'MD' as const,
    location: 'Chicago, IL',
    tuition: 60000,
    avg_gpa: 3.88,
    avg_mcat: 519,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To inspire diverse leaders in medicine and science who will transform health care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://pritzker.uchicago.edu'
  },
  {
    name: 'Icahn School of Medicine at Mount Sinai',
    type: 'MD' as const,
    location: 'New York, NY',
    tuition: 58000,
    avg_gpa: 3.85,
    avg_mcat: 517,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To advance the practice of medicine and science through education, research and patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://icahn.mssm.edu'
  },
  {
    name: 'University of California Los Angeles David Geffen School of Medicine',
    type: 'MD' as const,
    location: 'Los Angeles, CA',
    tuition: 41000,
    avg_gpa: 3.83,
    avg_mcat: 516,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To improve health and healthcare through discovery, education and patient care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://medschool.ucla.edu'
  },
  {
    name: 'Cornell University Weill Cornell Medicine',
    type: 'MD' as const,
    location: 'New York, NY',
    tuition: 61000,
    avg_gpa: 3.88,
    avg_mcat: 520,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To educate the next generation of physician-scientists and leaders in medicine.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://weill.cornell.edu'
  },
  {
    name: 'University of Washington School of Medicine',
    type: 'MD' as const,
    location: 'Seattle, WA',
    tuition: 40000,
    avg_gpa: 3.82,
    avg_mcat: 514,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To improve the health of the public by advancing medical knowledge, providing outstanding primary and specialty care.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - March'
    },
    link: 'https://www.uwmedicine.org/school-of-medicine'
  },
  {
    name: 'New York University Grossman School of Medicine',
    type: 'MD' as const,
    location: 'New York, NY',
    tuition: 0,
    avg_gpa: 3.90,
    avg_mcat: 522,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English', 'Biochemistry'],
    mission: 'To educate the next generation of physician-scientists and leaders in medicine.',
    deadlines: {
      primary: 'October 15',
      secondary: 'November 1',
      interview: 'September - February'
    },
    link: 'https://med.nyu.edu'
  },
  {
    name: 'A.T. Still University School of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Kirksville, MO',
    tuition: 55000,
    avg_gpa: 3.65,
    avg_mcat: 505,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To serve humanity through innovative health education, research and clinical care.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://www.atsu.edu'
  },
  {
    name: 'Lake Erie College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Erie, PA',
    tuition: 35000,
    avg_gpa: 3.55,
    avg_mcat: 502,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To prepare students to become osteopathic physicians through excellence in education, research and clinical care.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://lecom.edu'
  },
  {
    name: 'Midwestern University Chicago College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Downers Grove, IL',
    tuition: 58000,
    avg_gpa: 3.60,
    avg_mcat: 504,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To educate students in the art and science of osteopathic medicine.',
    deadlines: {
      primary: 'February 1',
      secondary: 'Varies',
      interview: 'September - April'
    },
    link: 'https://www.midwestern.edu'
  },
  {
    name: 'Touro College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'New York, NY',
    tuition: 52000,
    avg_gpa: 3.58,
    avg_mcat: 503,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To prepare students to become caring, competent osteopathic physicians.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://tourocom.touro.edu'
  },
  {
    name: 'Des Moines University College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Des Moines, IA',
    tuition: 54000,
    avg_gpa: 3.62,
    avg_mcat: 505,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To improve lives in our global community by educating diverse groups of highly competent health professionals.',
    deadlines: {
      primary: 'February 1',
      secondary: 'Varies',
      interview: 'September - April'
    },
    link: 'https://www.dmu.edu'
  },
  {
    name: 'Kansas City University College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Kansas City, MO',
    tuition: 48000,
    avg_gpa: 3.60,
    avg_mcat: 504,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To improve the well-being of the communities we serve.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://www.kansascity.edu'
  },
  {
    name: 'Philadelphia College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Philadelphia, PA',
    tuition: 55000,
    avg_gpa: 3.58,
    avg_mcat: 503,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To prepare students to become osteopathic physicians who are lifelong learners and leaders.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://www.pcom.edu'
  },
  {
    name: 'Western University of Health Sciences College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Pomona, CA',
    tuition: 58000,
    avg_gpa: 3.60,
    avg_mcat: 504,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To produce, in a humanistic tradition, health care professionals and biomedical knowledge that enhance and extend the quality of life.',
    deadlines: {
      primary: 'February 1',
      secondary: 'Varies',
      interview: 'September - April'
    },
    link: 'https://www.westernu.edu'
  },
  {
    name: 'Arizona College of Osteopathic Medicine',
    type: 'DO' as const,
    location: 'Glendale, AZ',
    tuition: 56000,
    avg_gpa: 3.59,
    avg_mcat: 504,
    required_courses: ['Biology', 'Chemistry', 'Organic Chemistry', 'Physics', 'Mathematics', 'English'],
    mission: 'To prepare students to become osteopathic physicians who provide compassionate, quality care.',
    deadlines: {
      primary: 'March 1',
      secondary: 'Varies',
      interview: 'September - May'
    },
    link: 'https://www.midwestern.edu'
  }
];

async function seed() {
  console.log('Starting seed...');

  // First, create the tables if they don't exist
  // Note: You'll need to create these in Supabase dashboard or via SQL migration
  // This script assumes the tables already exist

  for (const school of schools) {
    const { data, error } = await supabase
      .from('schools')
      .upsert(school, { onConflict: 'name' })
      .select();

    if (error) {
      console.error(`Error seeding ${school.name}:`, error);
    } else {
      console.log(`✓ Seeded ${school.name}`);
    }
  }

  console.log(`\nSeeded ${schools.length} schools!`);
}

seed()
  .then(() => {
    console.log('Seed completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  });

