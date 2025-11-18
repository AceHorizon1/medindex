'use client';

import { Database } from '@/lib/supabase/database.types';
import Link from 'next/link';

type School = Database['public']['Tables']['schools']['Row'];

interface SchoolTableProps {
  schools: School[];
}

export function SchoolTable({ schools }: SchoolTableProps) {
  if (schools.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No schools found matching your criteria.
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="h-12 px-4 text-left align-middle font-medium">School</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Type</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Location</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Avg GPA</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Avg MCAT</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Tuition</th>
          </tr>
        </thead>
        <tbody>
          {schools.map((school) => (
            <tr key={school.id} className="border-b transition-colors hover:bg-muted/50">
              <td className="p-4 align-middle">
                <Link href={`/school/${school.id}`} className="font-medium hover:underline">
                  {school.name}
                </Link>
              </td>
              <td className="p-4 align-middle">{school.type}</td>
              <td className="p-4 align-middle">{school.location}</td>
              <td className="p-4 align-middle">{school.avg_gpa?.toFixed(2) ?? 'N/A'}</td>
              <td className="p-4 align-middle">{school.avg_mcat ?? 'N/A'}</td>
              <td className="p-4 align-middle">
                {school.tuition ? `$${school.tuition.toLocaleString()}` : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

