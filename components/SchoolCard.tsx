'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Database } from '@/lib/supabase/database.types';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { isFavorite, addFavorite, removeFavorite } from '@/lib/supabase/queries';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolCardProps {
  school: School;
}

export function SchoolCard({ school }: SchoolCardProps) {
  const [favorited, setFavorited] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        isFavorite(user.id, school.id).then(setFavorited);
      }
    });
  }, [school.id, supabase]);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) return;

    if (favorited) {
      await removeFavorite(userId, school.id);
      setFavorited(false);
    } else {
      await addFavorite(userId, school.id);
      setFavorited(true);
    }
  };

  return (
    <Link href={`/school/${school.id}`}>
      <Card className="hover:shadow-md transition-shadow h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{school.name}</CardTitle>
              <CardDescription className="mt-1">
                {school.type} • {school.location}
              </CardDescription>
            </div>
            {userId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFavorite}
                aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={`h-4 w-4 ${favorited ? 'fill-red-500 text-red-500' : ''}`}
                />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Avg GPA:</span>{' '}
              <span className="font-medium">{school.avg_gpa?.toFixed(2) ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Avg MCAT:</span>{' '}
              <span className="font-medium">{school.avg_mcat ?? 'N/A'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tuition:</span>{' '}
              <span className="font-medium">
                {school.tuition ? `$${school.tuition.toLocaleString()}` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Courses:</span>{' '}
              <span className="font-medium">
                {school.required_courses?.length ?? 0} required
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

