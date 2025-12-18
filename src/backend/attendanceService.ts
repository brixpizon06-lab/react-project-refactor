import { supabase } from "@/integrations/supabase/client";

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  time_in: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AttendanceInput {
  student_id: string;
  date?: string;
  time_in?: string | null;
  status: string;
  notes?: string | null;
}

// Attendance CRUD operations
export const fetchAttendanceByStudent = async (studentId: string) => {
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("student_id", studentId)
    .order("date", { ascending: false });
  
  if (error) throw error;
  return data as AttendanceRecord[];
};

export const fetchAllAttendance = async () => {
  const { data, error } = await supabase
    .from("attendance")
    .select("*, students(first_name, last_name, student_id)")
    .order("date", { ascending: false });
  
  if (error) throw error;
  return data;
};

export const createAttendance = async (attendance: AttendanceInput) => {
  const { data, error } = await supabase
    .from("attendance")
    .insert([attendance])
    .select()
    .single();
  
  if (error) throw error;
  return data as AttendanceRecord;
};

export const updateAttendance = async (id: string, attendance: Partial<AttendanceInput>) => {
  const { data, error } = await supabase
    .from("attendance")
    .update(attendance)
    .eq("id", id)
    .select()
    .single();
  
  if (error) throw error;
  return data as AttendanceRecord;
};

export const deleteAttendance = async (id: string) => {
  const { error } = await supabase
    .from("attendance")
    .delete()
    .eq("id", id);
  
  if (error) throw error;
};

// Get attendance statistics for a student
export const getAttendanceStats = async (studentId: string) => {
  const records = await fetchAttendanceByStudent(studentId);
  
  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const late = records.filter((r) => r.status === "late").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const rate = total > 0 ? ((present + late) / total) * 100 : 0;
  
  return { total, present, absent, late, excused, rate };
};
