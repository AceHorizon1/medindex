import { notFound } from 'next/navigation';
import { getSchoolById } from '@/lib/supabase/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Calendar, BookOpen, Target } from 'lucide-react';
import Link from 'next/link';

export default async function SchoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const school = await getSchoolById(id);

  if (!school) {
    notFound();
  }

  const deadlines = school.deadlines as
    | { primary?: string; secondary?: string; interview?: string }
    | null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6 space-y-4">
        <Link href="/search">
          <Button variant="ghost" className="mb-2">
            ← Back to Search
          </Button>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">{school.name}</h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              {school.type} • {school.location}
            </p>
          </div>
          {school.link && (
            <Button asChild className="w-full sm:w-auto">
              <a href={school.link} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Visit Website
              </a>
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average GPA:</span>
              <span className="font-medium">{school.avg_gpa?.toFixed(2) ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Average MCAT:</span>
              <span className="font-medium">{school.avg_mcat ?? 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tuition:</span>
              <span className="font-medium">
                {school.tuition ? `$${school.tuition.toLocaleString()}` : 'N/A'}
              </span>
            </div>
          </CardContent>
        </Card>

        {deadlines && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5" />
                Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {deadlines.primary && (
                <div>
                  <span className="text-sm text-muted-foreground">Primary:</span>{' '}
                  <span className="font-medium">{deadlines.primary}</span>
                </div>
              )}
              {deadlines.secondary && (
                <div>
                  <span className="text-sm text-muted-foreground">Secondary:</span>{' '}
                  <span className="font-medium">{deadlines.secondary}</span>
                </div>
              )}
              {deadlines.interview && (
                <div>
                  <span className="text-sm text-muted-foreground">Interview:</span>{' '}
                  <span className="font-medium">{deadlines.interview}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {school.mission && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mission Statement</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">{school.mission}</p>
          </CardContent>
        </Card>
      )}

      {school.required_courses && school.required_courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Required Courses
            </CardTitle>
            <CardDescription>
              Prerequisites and course requirements for admission
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              {school.required_courses.map((course, idx) => (
                <li key={idx} className="text-muted-foreground">
                  {course}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
