'use client';

import { useState } from 'react';
import { Button, Card } from '@medindex/ui';

const API_URL = process.env.NEXT_PUBLIC_MEDINDEX_API_URL ?? '/api';

type Feedback = {
  score: number;
  strengths?: string[];
  deltas?: string[];
};

export default function PersonalStatementPage() {
  const [statement, setStatement] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/statements/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statement })
      });
      const data = await res.json();
      setFeedback(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">Personal statement lab</h1>
        <p className="text-slate-600">Keep it simple—paste, score, and iterate with AI nudges.</p>
      </header>
      <textarea
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Paste your draft here..."
        rows={10}
        className="w-full rounded-2xl border border-slate-200 bg-white p-4"
      />
      <Button onClick={analyze} disabled={loading || statement.length < 100}>
        {loading ? 'Scoring…' : 'Get feedback'}
      </Button>
      {feedback && (
        <Card title={`Score ${feedback.score ?? '—'}/10`}>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Strengths
              </h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                {feedback.strengths?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Improve</h3>
              <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-slate-600">
                {feedback.deltas?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
