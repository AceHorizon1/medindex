import { notFound } from 'next/navigation';
import { StatGrid } from '@medindex/ui';
import { ExplainerClient } from './ExplainerClient';

async function fetchSchool(id: string) {
  const url = `${process.env.MEDINDEX_API_URL ?? 'http://localhost:4000'}/schools/${id}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Failed to load school');
  return res.json();
}

export default async function SchoolDetail({ params }: { params: { id: string } }) {
  const school = await fetchSchool(params.id);
  if (!school) return notFound();
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase text-brand-600">{school.designation}</p>
        <h1 className="text-3xl font-bold text-slate-900">{school.name}</h1>
        <p className="text-slate-600">{school.city}, {school.state}</p>
      </header>
      <StatGrid
        stats={[
          { label: 'Avg GPA', value: school.avgGpa ?? '—' },
          { label: 'Avg MCAT', value: school.avgMcat ?? '—' },
          { label: 'In-state tuition', value: school.tuitionInState ? `$${school.tuitionInState}` : '—' }
        ]}
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Mission</h2>
        <p className="mt-2 text-slate-600">{school.mission ?? 'Mission statement coming soon.'}</p>
        <div className="mt-4">
          <ExplainerClient
            schoolName={school.name}
            facts={[
              school.mission ?? '',
              `Average GPA ${school.avgGpa ?? 'n/a'}`,
              `Average MCAT ${school.avgMcat ?? 'n/a'}`
            ]}
          />
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Prerequisites</h2>
        <ul className="mt-4 list-disc space-y-1 pl-6 text-slate-600">
          {school.prerequisites?.map((req: any) => (
            <li key={req.id}>{req.subject} • {req.credits ?? '—'} credits</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
