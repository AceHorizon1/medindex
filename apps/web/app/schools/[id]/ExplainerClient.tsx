'use client';

import { useState } from 'react';
import { Button } from '@medindex/ui';

const API_URL = process.env.NEXT_PUBLIC_MEDINDEX_API_URL ?? '/api';

export function ExplainerClient({ schoolName, facts }: { schoolName: string; facts: string[] }) {
  const [answer, setAnswer] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function explain() {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/explainer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: `Explain ${schoolName}`, schoolName, facts })
      });
      const data = await res.json();
      setAnswer(data.summary ?? 'No response');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <Button onClick={explain} disabled={loading}>
        {loading ? 'Summarizing…' : 'Explain this school'}
      </Button>
      {answer && <p className="text-sm text-slate-600" data-testid="ai-explainer">{answer}</p>}
    </div>
  );
}
