import Link from 'next/link';

async function fetchSchools(state?: string, designation?: string) {
  const url = new URL(`${process.env.MEDINDEX_API_URL ?? 'http://localhost:4000'}/schools`);
  if (state) url.searchParams.set('state', state);
  if (designation) url.searchParams.set('designation', designation);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch schools');
  const data = await res.json();
  return data.items as Array<{ id: string; name: string; city: string; state: string; avgMcat?: number; avgGpa?: number }>;
}

export default async function SchoolsPage({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  const schools = await fetchSchools(searchParams.state, searchParams.designation);
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Browse schools</h1>
        <p className="text-slate-600">Lightweight filters keep the page snappy on Netlify.</p>
      </header>
      <div className="grid gap-4">
        {schools.map((school) => (
          <Link
            key={school.id}
            className="rounded-xl border border-slate-200 bg-white p-4 hover:border-brand-500"
            href={`/schools/${school.id}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold">{school.name}</p>
                <p className="text-sm text-slate-500">
                  {school.city}, {school.state}
                </p>
              </div>
              <div className="text-sm text-slate-500">
                <p>MCAT {school.avgMcat ?? '—'}</p>
                <p>GPA {school.avgGpa ?? '—'}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
