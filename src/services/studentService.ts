import { supabase } from "@/integrations/supabase/client";

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade: string | null;
  section: string | null;
  contact_number: string | null;
  guardian_name: string | null;
  guardian_contact: string | null;
  email: string | null;
  password?: string | null;
}

export interface Grade {
  id: string;
  student_id: string;
  subject: string;
  grade_value: number;
  grade_type: string;
  description: string | null;
  date: string;
  quarter: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  time_in: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

// Student CRUD operations
export const fetchAllStudents = async () => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .order("last_name", { ascending: true });
  
  if (error) throw error;
  return data as Student[];
};

export const fetchStudentById = async (id: string) => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  
  if (error) throw error;
  return data as Student | null;
};

export const createStudent = async (student: Omit<Student, "id">) => {
  const { data, error } = await supabase
    .from("students")
    .insert([student])
    .select()
    .single();
  
  if (error) throw error;
  return data as Student;
};

export const updateStudent = async (id: string, student: Partial<Student>) => {
  const { data, error } = await supabase
    .from("students")
    .update(student)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Student;
};

export const deleteStudent = async (id: string) => {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Authentication
export const authenticateStudent = async (email: string, password: string) => {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", email)
    .eq("password", password)
    .maybeSingle();
  
  if (error) throw error;
  return data as Student | null;
};
