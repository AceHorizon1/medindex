import { turso } from './client';

export interface School {
  id: string;
  name: string;
  type: 'MD' | 'DO';
  location: string;
  tuition: number | null;
  avg_gpa: number | null;
  avg_mcat: number | null;
  required_courses: string[];
  mission: string | null;
  deadlines: Record<string, string> | null;
  link: string | null;
  created_at: string;
  updated_at: string;
}

export type SchoolInsert = Omit<School, 'id' | 'created_at' | 'updated_at'> & {
  id?: string;
};

export type SchoolUpdate = Partial<SchoolInsert>;

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

function mapRowToSchool(row: any): School {
  return {
    id: String(row.id),
    name: String(row.name),
    type: row.type as 'MD' | 'DO',
    location: String(row.location),
    tuition: row.tuition != null ? Number(row.tuition) : null,
    avg_gpa: row.avg_gpa != null ? Number(row.avg_gpa) : null,
    avg_mcat: row.avg_mcat != null ? Number(row.avg_mcat) : null,
    required_courses: row.required_courses ? JSON.parse(String(row.required_courses)) : [],
    mission: row.mission ? String(row.mission) : null,
    deadlines: row.deadlines ? JSON.parse(String(row.deadlines)) : null,
    link: row.link ? String(row.link) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

// READ
export async function getSchools(filters?: SchoolFilters): Promise<School[]> {
  let sql = 'SELECT * FROM schools WHERE 1=1';
  const args: any[] = [];

  if (filters?.type) {
    sql += ' AND type = ?';
    args.push(filters.type);
  }

  if (filters?.minGpa !== undefined) {
    sql += ' AND avg_gpa >= ?';
    args.push(filters.minGpa);
  }

  if (filters?.maxGpa !== undefined) {
    sql += ' AND avg_gpa <= ?';
    args.push(filters.maxGpa);
  }

  if (filters?.minMcat !== undefined) {
    sql += ' AND avg_mcat >= ?';
    args.push(filters.minMcat);
  }

  if (filters?.maxMcat !== undefined) {
    sql += ' AND avg_mcat <= ?';
    args.push(filters.maxMcat);
  }

  if (filters?.minTuition !== undefined) {
    sql += ' AND tuition >= ?';
    args.push(filters.minTuition);
  }

  if (filters?.maxTuition !== undefined) {
    sql += ' AND tuition <= ?';
    args.push(filters.maxTuition);
  }

  if (filters?.search) {
    sql += ' AND (name LIKE ? OR location LIKE ?)';
    args.push(`%${filters.search}%`, `%${filters.search}%`);
  }

  sql += ' ORDER BY name ASC';

  const result = await turso.execute({ sql, args });
  let list = result.rows.map(mapRowToSchool);

  if (filters?.requiredCourses && filters.requiredCourses.length > 0) {
    list = list.filter((school) =>
      filters.requiredCourses!.some((course) => school.required_courses.includes(course))
    );
  }

  return list;
}

export async function getSchoolById(id: string): Promise<School | null> {
  const result = await turso.execute({
    sql: 'SELECT * FROM schools WHERE id = ? LIMIT 1',
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return mapRowToSchool(result.rows[0]);
}

// CREATE
export async function createSchool(school: SchoolInsert): Promise<School> {
  const id = school.id || crypto.randomUUID();
  await turso.execute({
    sql: `
      INSERT INTO schools (
        id, name, type, location, tuition, avg_gpa, avg_mcat,
        required_courses, mission, deadlines, link
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      id,
      school.name,
      school.type,
      school.location,
      school.tuition ?? null,
      school.avg_gpa ?? null,
      school.avg_mcat ?? null,
      JSON.stringify(school.required_courses || []),
      school.mission ?? null,
      school.deadlines ? JSON.stringify(school.deadlines) : null,
      school.link ?? null,
    ],
  });

  const created = await getSchoolById(id);
  return created!;
}

// UPDATE
export async function updateSchool(id: string, updates: SchoolUpdate): Promise<School | null> {
  const fields: string[] = [];
  const args: any[] = [];

  if (updates.name !== undefined) { fields.push('name = ?'); args.push(updates.name); }
  if (updates.type !== undefined) { fields.push('type = ?'); args.push(updates.type); }
  if (updates.location !== undefined) { fields.push('location = ?'); args.push(updates.location); }
  if (updates.tuition !== undefined) { fields.push('tuition = ?'); args.push(updates.tuition); }
  if (updates.avg_gpa !== undefined) { fields.push('avg_gpa = ?'); args.push(updates.avg_gpa); }
  if (updates.avg_mcat !== undefined) { fields.push('avg_mcat = ?'); args.push(updates.avg_mcat); }
  if (updates.required_courses !== undefined) {
    fields.push('required_courses = ?');
    args.push(JSON.stringify(updates.required_courses));
  }
  if (updates.mission !== undefined) { fields.push('mission = ?'); args.push(updates.mission); }
  if (updates.deadlines !== undefined) {
    fields.push('deadlines = ?');
    args.push(JSON.stringify(updates.deadlines));
  }
  if (updates.link !== undefined) { fields.push('link = ?'); args.push(updates.link); }

  fields.push('updated_at = CURRENT_TIMESTAMP');
  args.push(id);

  await turso.execute({
    sql: `UPDATE schools SET ${fields.join(', ')} WHERE id = ?`,
    args,
  });

  return getSchoolById(id);
}

// DELETE
export async function deleteSchool(id: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM schools WHERE id = ?',
    args: [id],
  });
}

// FAVORITES
export async function getFavorites(userId: string): Promise<School[]> {
  const result = await turso.execute({
    sql: `
      SELECT s.* FROM schools s
      INNER JOIN favorites f ON f.school_id = s.id
      WHERE f.user_id = ?
      ORDER BY f.created_at DESC
    `,
    args: [userId],
  });

  return result.rows.map(mapRowToSchool);
}

export async function addFavorite(userId: string, schoolId: string): Promise<void> {
  const id = crypto.randomUUID();
  await turso.execute({
    sql: `INSERT OR IGNORE INTO favorites (id, user_id, school_id) VALUES (?, ?, ?)`,
    args: [id, userId, schoolId],
  });
}

export async function removeFavorite(userId: string, schoolId: string): Promise<void> {
  await turso.execute({
    sql: 'DELETE FROM favorites WHERE user_id = ? AND school_id = ?',
    args: [userId, schoolId],
  });
}

export async function isFavorite(userId: string, schoolId: string): Promise<boolean> {
  const result = await turso.execute({
    sql: 'SELECT 1 FROM favorites WHERE user_id = ? AND school_id = ? LIMIT 1',
    args: [userId, schoolId],
  });

  return result.rows.length > 0;
}
