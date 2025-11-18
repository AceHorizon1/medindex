'use client';

import { useState, useEffect, useTransition } from 'react';
import { SchoolFilters } from '@/components/SchoolFilters';
import { SchoolCard } from '@/components/SchoolCard';
import { getSchools, SchoolFilters as FilterType } from '@/lib/supabase/queries';
import { Card, CardContent } from '@/components/ui/card';
import { Database } from '@/lib/supabase/database.types';
import { useSearchParams } from 'next/navigation';

type School = Database['public']['Tables']['schools']['Row'];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterType>({
    search: searchParams.get('q') || undefined,
    type: (searchParams.get('type') as 'MD' | 'DO') || undefined,
    minGpa: searchParams.get('minGpa') ? parseFloat(searchParams.get('minGpa')!) : undefined,
    maxGpa: searchParams.get('maxGpa') ? parseFloat(searchParams.get('maxGpa')!) : undefined,
    minMcat: searchParams.get('minMcat') ? parseInt(searchParams.get('minMcat')!) : undefined,
    maxMcat: searchParams.get('maxMcat') ? parseInt(searchParams.get('maxMcat')!) : undefined,
    minTuition: searchParams.get('minTuition') ? parseInt(searchParams.get('minTuition')!) : undefined,
    maxTuition: searchParams.get('maxTuition') ? parseInt(searchParams.get('maxTuition')!) : undefined
  });
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setLoading(true);
    startTransition(async () => {
      try {
        const results = await getSchools(filters);
        setSchools(results);
      } catch (error) {
        console.error('Error fetching schools:', error);
      } finally {
        setLoading(false);
      }
    });
  }, [filters]);

  const handleFiltersChange = (newFilters: FilterType) => {
    setFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Search Medical Schools</h1>
        <p className="text-muted-foreground">
          Use filters to find schools that match your criteria
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[300px_1fr]">
        <div className="lg:sticky lg:top-20 lg:h-fit">
          <SchoolFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleReset}
          />
        </div>

        <div>
          {loading || isPending ? (
            <Card>
              <CardContent className="py-12 text-center">Loading schools...</CardContent>
            </Card>
          ) : schools.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No schools found matching your criteria. Try adjusting your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {schools.map((school) => (
                <SchoolCard key={school.id} school={school} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
