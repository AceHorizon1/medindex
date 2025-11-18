import { Button, Card } from '@medindex/ui';

const features = [
  {
    title: 'Nationwide coverage',
    copy: 'Every accredited MD/DO program with prerequisites, missions, stats, and deadlines.'
  },
  {
    title: 'Decision-ready comparison',
    copy: 'Line up tuition, MCAT, GPA, and missions side-by-side in seconds.'
  },
  {
    title: 'AI guidance',
    copy: 'Explain any school, get tailored match suggestions, and polish statements.'
  }
];

export default function LandingPage() {
  return (
    <div className="mx-auto grid max-w-6xl gap-10">
      <section className="text-center">
        <p className="text-sm uppercase tracking-wide text-brand-600">MedIndex</p>
        <h1 className="mt-2 text-4xl font-extrabold text-slate-900">
          Smarter med school research for future physicians
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Search every U.S. MD and DO program, compare your shortlist, and let AI surface the best
          fits—all in one distraction-free workspace deployed on Netlify with Render-backed APIs.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <Button asChild size="lg">
            <a href="/match">Try Match Me</a>
          </Button>
          <Button variant="ghost" asChild>
            <a href="/schools">Browse schools</a>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Card key={feature.title} title={feature.title} description={feature.copy}>
            <p className="text-sm text-slate-600">
              Data stays lightweight—no heavy dashboards, just the essentials to decide quickly.
            </p>
          </Card>
        ))}
      </section>
    </div>
  );
}
