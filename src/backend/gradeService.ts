import { supabase } from "@/integrations/supabase/client";

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

export interface GradeInput {
  student_id: string;
  subject: string;
  grade_value: number;
  grade_type: string;
  description?: string | null;
  date?: string;
  quarter?: string | null;
}

// Grade CRUD operations
export const fetchGradesByStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from("grades")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });
  
  if (error) throw error;
  return data as Grade[];
};

export const createGrade = async (grade: GradeInput) => {
  const { data, error } = await supabase
    .from("grades")
    .insert([grade])
    .select()
    .single();
  
  if (error) throw error;
  return data as Grade;
};

export const updateGrade = async (id: string, grade: Partial<GradeInput>) => {
  const { data, error } = await supabase
    .from("grades")
    .update(grade)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as Grade;
};

export const deleteGrade = async (id: string) => {
  const { error } = await supabase
    .from("grades")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Get grade statistics for a student
export const getGradeStats = async (studentId: string) => {
  const grades = await fetchGradesByStudent(studentId);
  
  if (grades.length === 0) {
    return { average: 0, total: 0, bySubject: {} };
  }
  
  const total = grades.length;
  const sum = grades.reduce((acc, g) => acc + Number(g.grade_value), 0);
  const average = sum / total;
  
  const bySubject: Record<string, { sum: number; count: number; average: number }> = {};
  grades.forEach((g) => {
    if (!bySubject[g.subject]) {
      bySubject[g.subject] = { sum: 0, count: 0, average: 0 };
    }
    bySubject[g.subject].sum += Number(g.grade_value);
    bySubject[g.subject].count += 1;
  });
  
  Object.keys(bySubject).forEach((subject) => {
    bySubject[subject].average = bySubject[subject].sum / bySubject[subject].count;
  });
  
  return { average, total, bySubject };
};
