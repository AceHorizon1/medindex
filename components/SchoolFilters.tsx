'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select } from './ui/select';
import { Button } from './ui/button';
import { SchoolFilters as FilterType } from '@/lib/supabase/queries';
import { useState, useEffect } from 'react';

interface SchoolFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  onReset: () => void;
}

const COURSES = [
  'Biology',
  'Chemistry',
  'Organic Chemistry',
  'Physics',
  'Mathematics',
  'English',
  'Biochemistry',
  'Psychology',
  'Sociology'
];

export function SchoolFilters({ filters, onFiltersChange, onReset }: SchoolFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateFilter = (key: keyof FilterType, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFiltersChange(updated);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Search</label>
          <Input
            placeholder="School name or location..."
            value={localFilters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
          />
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Type</label>
          <Select
            value={localFilters.type || ''}
            onChange={(e) => updateFilter('type', e.target.value || undefined)}
          >
            <option value="">All</option>
            <option value="MD">MD</option>
            <option value="DO">DO</option>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Min GPA</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="4"
              placeholder="0.0"
              value={localFilters.minGpa || ''}
              onChange={(e) =>
                updateFilter('minGpa', e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max GPA</label>
            <Input
              type="number"
              step="0.1"
              min="0"
              max="4"
              placeholder="4.0"
              value={localFilters.maxGpa || ''}
              onChange={(e) =>
                updateFilter('maxGpa', e.target.value ? parseFloat(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Min MCAT</label>
            <Input
              type="number"
              min="472"
              max="528"
              placeholder="472"
              value={localFilters.minMcat || ''}
              onChange={(e) =>
                updateFilter('minMcat', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max MCAT</label>
            <Input
              type="number"
              min="472"
              max="528"
              placeholder="528"
              value={localFilters.maxMcat || ''}
              onChange={(e) =>
                updateFilter('maxMcat', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Min Tuition</label>
            <Input
              type="number"
              min="0"
              placeholder="$0"
              value={localFilters.minTuition || ''}
              onChange={(e) =>
                updateFilter('minTuition', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Max Tuition</label>
            <Input
              type="number"
              min="0"
              placeholder="$200,000"
              value={localFilters.maxTuition || ''}
              onChange={(e) =>
                updateFilter('maxTuition', e.target.value ? parseInt(e.target.value) : undefined)
              }
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Required Courses</label>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {COURSES.map((course) => (
              <label key={course} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={localFilters.requiredCourses?.includes(course) || false}
                  onChange={(e) => {
                    const current = localFilters.requiredCourses || [];
                    const updated = e.target.checked
                      ? [...current, course]
                      : current.filter((c) => c !== course);
                    updateFilter('requiredCourses', updated.length > 0 ? updated : undefined);
                  }}
                />
                <span>{course}</span>
              </label>
            ))}
          </div>
        </div>

        <Button variant="outline" onClick={onReset} className="w-full">
          Reset Filters
        </Button>
      </CardContent>
    </Card>
  );
}

