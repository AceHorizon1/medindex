import type { ReactNode } from 'react';

export type Stat = {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function StatGrid({ stats }: { stats: Stat[] }) {
  return (
    <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-slate-900"
        >
          <dt className="text-sm text-slate-500">{stat.label}</dt>
          <dd className="text-2xl font-semibold">
            {stat.value}
            {stat.hint && <span className="block text-xs text-slate-400">{stat.hint}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
