'use client';

import { useState } from 'react';
import { Button, Card } from '@medindex/ui';

const API_URL = process.env.NEXT_PUBLIC_MEDINDEX_API_URL ?? '/api';

type Turn = { role: 'user' | 'assistant'; content: string };

export default function AdvisorPage() {
  const [history, setHistory] = useState<Turn[]>([{ role: 'assistant', content: 'Hi! Ask me about medical schools.' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input) return;
    const nextHistory = [...history, { role: 'user', content: input }];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/ai/advisor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: nextHistory })
      });
      const data = await res.json();
      setHistory([...nextHistory, { role: 'assistant', content: data.message }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">AI Advisor</h1>
        <p className="text-slate-600">Powered by a Hugging Face free model with our RAG facts.</p>
      </header>
      <Card>
        <div className="space-y-3">
          {history.map((turn, idx) => (
            <div key={idx} className="rounded-lg bg-slate-50 p-3 text-sm">
              <span className="font-semibold text-slate-700">{turn.role === 'user' ? 'You' : 'Advisor'}: </span>
              {turn.content}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about admissions, fit, or tips"
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2"
          />
          <Button onClick={send} disabled={loading}>
            {loading ? 'Thinking…' : 'Send'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
