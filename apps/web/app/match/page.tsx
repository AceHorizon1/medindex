'use client';

import { useState } from 'react';
import { Button, Card } from '@medindex/ui';

const API_URL = process.env.NEXT_PUBLIC_MEDINDEX_API_URL ?? '/api';

type MatchResult = {
  school: {
    id: string;
    name: string;
    state: string;
    avgGpa?: number;
    avgMcat?: number;
  };
  score: number;
  rationale: string;
};

export default function MatchPage() {
  const [gpa, setGpa] = useState(3.5);
  const [mcat, setMcat] = useState(505);
  const [state, setState] = useState('CA');
  const [interests, setInterests] = useState('primary-care,research');
  const [results, setResults] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);

  async function runMatch() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gpa,
          mcat,
          state,
          interests: interests.split(',').map((s) => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      setResults(data.results);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Match Me</h1>
        <p className="text-slate-600">Lightweight recommender that explains why each school fits.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          GPA
          <input
            type="number"
            step="0.01"
            min="0"
            max="4"
            value={gpa}
            onChange={(e) => setGpa(parseFloat(e.target.value))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          MCAT
          <input
            type="number"
            min="480"
            max="528"
            value={mcat}
            onChange={(e) => setMcat(parseInt(e.target.value, 10))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Home state
          <input
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Interests (comma separated)
          <input
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2"
          />
        </label>
      </div>
      <Button onClick={runMatch} disabled={loading}>{loading ? 'Matching…' : 'Get recommendations'}</Button>
      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result) => (
            <Card key={result.school.id} title={result.school.name} description={`${result.school.state} • Score ${result.score.toFixed(1)}`}>
              <p className="text-sm text-slate-600">{result.rationale}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
