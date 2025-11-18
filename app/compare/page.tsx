'use client';

import { useState } from 'react';
import { SchoolTable } from '@/components/SchoolTable';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { getSchoolById } from '@/lib/supabase/queries';
import { Database } from '@/lib/supabase/database.types';
import { Loader2 } from 'lucide-react';

type School = Database['public']['Tables']['schools']['Row'];

export default function ComparePage() {
  const [school1Id, setSchool1Id] = useState('');
  const [school2Id, setSchool2Id] = useState('');
  const [school1, setSchool1] = useState<School | null>(null);
  const [school2, setSchool2] = useState<School | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCompare = async () => {
    if (!school1Id || !school2Id) {
      setError('Please enter both school IDs');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [s1, s2] = await Promise.all([
        getSchoolById(school1Id),
        getSchoolById(school2Id)
      ]);

      if (!s1 || !s2) {
        setError('One or both schools not found');
        setLoading(false);
        return;
      }

      setSchool1(s1);
      setSchool2(s2);
    } catch (err) {
      setError('Failed to load schools');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (school1 && school2) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => {
              setSchool1(null);
              setSchool2(null);
              setSchool1Id('');
              setSchool2Id('');
            }}
          >
            Compare Different Schools
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>{school1.name}</CardTitle>
              <CardDescription>
                {school1.type} • {school1.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg GPA:</span>
                  <div className="font-medium">{school1.avg_gpa?.toFixed(2) ?? 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg MCAT:</span>
                  <div className="font-medium">{school1.avg_mcat ?? 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tuition:</span>
                  <div className="font-medium">
                    {school1.tuition ? `$${school1.tuition.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Required Courses:</span>
                  <div className="font-medium">{school1.required_courses?.length ?? 0}</div>
                </div>
              </div>
              {school1.mission && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Mission:</span>
                  <p className="text-sm text-muted-foreground line-clamp-4">{school1.mission}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{school2.name}</CardTitle>
              <CardDescription>
                {school2.type} • {school2.location}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Avg GPA:</span>
                  <div className="font-medium">{school2.avg_gpa?.toFixed(2) ?? 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Avg MCAT:</span>
                  <div className="font-medium">{school2.avg_mcat ?? 'N/A'}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Tuition:</span>
                  <div className="font-medium">
                    {school2.tuition ? `$${school2.tuition.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Required Courses:</span>
                  <div className="font-medium">{school2.required_courses?.length ?? 0}</div>
                </div>
              </div>
              {school2.mission && (
                <div>
                  <span className="text-sm font-medium mb-2 block">Mission:</span>
                  <p className="text-sm text-muted-foreground line-clamp-4">{school2.mission}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Side-by-Side Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <SchoolTable schools={[school1, school2]} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Compare Schools</h1>
        <p className="text-muted-foreground">
          Enter the IDs of two schools to see a detailed side-by-side comparison. You can find
          school IDs on the school profile pages.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select Schools</CardTitle>
          <CardDescription>Enter school IDs from the school profile pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">School 1 ID</label>
            <Input
              value={school1Id}
              onChange={(e) => setSchool1Id(e.target.value)}
              placeholder="Enter school ID..."
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">School 2 ID</label>
            <Input
              value={school2Id}
              onChange={(e) => setSchool2Id(e.target.value)}
              placeholder="Enter school ID..."
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button onClick={handleCompare} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Compare Schools'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
