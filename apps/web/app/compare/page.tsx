'use client';

import { useState } from 'react';
import { Button, Card } from '@medindex/ui';

const API_URL = process.env.NEXT_PUBLIC_MEDINDEX_API_URL ?? '/api';

type ComparisonResponse = {
  schools: Array<{
    id: string;
    name: string;
    avgGpa?: number;
    avgMcat?: number;
    tuitionInState?: number;
  }>;
  narrative: string;
};

export default function ComparePage() {
  const [ids, setIds] = useState(['', '']);
  const [result, setResult] = useState<ComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function compare() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: ids.filter(Boolean) })
      });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Compare schools</h1>
        <p className="text-slate-600">Paste 2-4 school IDs to align their key stats.</p>
      </header>
      <div className="space-y-3">
        {ids.map((value, idx) => (
          <input
            key={idx}
            value={value}
            onChange={(e) => {
              const next = [...ids];
              next[idx] = e.target.value;
              setIds(next);
            }}
            placeholder={`School ID ${idx + 1}`}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        ))}
        <button
          className="text-sm text-brand-600"
          onClick={() => setIds((prev) => (prev.length < 4 ? [...prev, ''] : prev))}
        >
          + add school
        </button>
        <Button onClick={compare} disabled={loading || ids.filter(Boolean).length < 2}>
          {loading ? 'Comparing…' : 'Compare'}
        </Button>
      </div>

      {result && (
        <Card title="Results">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {result.schools.map((school) => (
                <div key={school.id} className="rounded-xl border border-slate-200 p-4">
                  <h3 className="text-lg font-semibold">{school.name}</h3>
                  <p className="text-sm text-slate-500">GPA {school.avgGpa ?? '—'} / MCAT {school.avgMcat ?? '—'}</p>
                  <p className="text-sm text-slate-500">Tuition ${school.tuitionInState ?? '—'}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-600 whitespace-pre-line">{result.narrative}</p>
          </div>
        </Card>
      )}
    </div>
  );
}
