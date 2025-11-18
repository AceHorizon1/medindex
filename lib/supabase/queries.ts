import { createClient } from './client';
import { Database } from './database.types';

type School = Database['public']['Tables']['schools']['Row'];
type SchoolInsert = Database['public']['Tables']['schools']['Insert'];
type SchoolUpdate = Database['public']['Tables']['schools']['Update'];

export interface SchoolFilters {
  type?: 'MD' | 'DO';
  minGpa?: number;
  maxGpa?: number;
  minMcat?: number;
  maxMcat?: number;
  minTuition?: number;
  maxTuition?: number;
  requiredCourses?: string[];
  search?: string;
}

// READ
export async function getSchools(filters?: SchoolFilters) {
  const supabase = createClient();
  let query = supabase.from('schools').select('*');

  if (filters?.type) {
    query = query.eq('type', filters.type);
  }

  if (filters?.minGpa !== undefined) {
    query = query.gte('avg_gpa', filters.minGpa);
  }

  if (filters?.maxGpa !== undefined) {
    query = query.lte('avg_gpa', filters.maxGpa);
  }

  if (filters?.minMcat !== undefined) {
    query = query.gte('avg_mcat', filters.minMcat);
  }

  if (filters?.maxMcat !== undefined) {
    query = query.lte('avg_mcat', filters.maxMcat);
  }

  if (filters?.minTuition !== undefined) {
    query = query.gte('tuition', filters.minTuition);
  }

  if (filters?.maxTuition !== undefined) {
    query = query.lte('tuition', filters.maxTuition);
  }

  if (filters?.search) {
    query = query.or(`name.ilike.%${filters.search}%,location.ilike.%${filters.search}%`);
  }

  const { data, error } = await query.order('name');

  if (error) throw error;

  // Filter by required courses in memory (Supabase array filtering is limited)
  if (filters?.requiredCourses && filters.requiredCourses.length > 0) {
    return (
      data?.filter((school) =>
        filters.requiredCourses!.some((course) => school.required_courses?.includes(course))
      ) || []
    );
  }

  return data || [];
}

export async function getSchoolById(id: string): Promise<School | null> {
  const supabase = createClient();
  const { data, error } = await supabase.from('schools').select('*').eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return data;
}

// CREATE
export async function createSchool(school: SchoolInsert) {
  const supabase = createClient();
  const { data, error } = await supabase.from('schools').insert(school).select().single();

  if (error) throw error;
  return data;
}

// UPDATE
export async function updateSchool(id: string, updates: SchoolUpdate) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('schools')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// DELETE
export async function deleteSchool(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from('schools').delete().eq('id', id);

  if (error) throw error;
}

// FAVORITES
export async function getFavorites(userId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('*, schools(*)')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

export async function addFavorite(userId: string, schoolId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, school_id: schoolId })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function removeFavorite(userId: string, schoolId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('school_id', schoolId);

  if (error) throw error;
}

export async function isFavorite(userId: string, schoolId: string): Promise<boolean> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('school_id', schoolId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}

