export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      schools: {
        Row: {
          id: string;
          name: string;
          type: 'MD' | 'DO';
          location: string;
          tuition: number | null;
          avg_gpa: number | null;
          avg_mcat: number | null;
          required_courses: string[] | null;
          mission: string | null;
          deadlines: Json | null;
          link: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'MD' | 'DO';
          location: string;
          tuition?: number | null;
          avg_gpa?: number | null;
          avg_mcat?: number | null;
          required_courses?: string[] | null;
          mission?: string | null;
          deadlines?: Json | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'MD' | 'DO';
          location?: string;
          tuition?: number | null;
          avg_gpa?: number | null;
          avg_mcat?: number | null;
          required_courses?: string[] | null;
          mission?: string | null;
          deadlines?: Json | null;
          link?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          school_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          school_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          school_id?: string;
        };
      };
    };
  };
}

