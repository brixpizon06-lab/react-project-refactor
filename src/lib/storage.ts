// Local Storage utilities for temporary data storage
// Replace this with Laravel API calls later

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  grade: string;
  section: string;
  contact_number: string;
  guardian_name: string;
  guardian_contact: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  date: string;
  time_in: string;
  status: string;
  notes: string;
}

// Initialize with sample data
const initializeData = () => {
  if (!localStorage.getItem('students')) {
    const sampleStudents: Student[] = [
      {
        id: '1',
        student_id: 'STU001',
        first_name: 'Juan',
        last_name: 'Dela Cruz',
        email: 'juan@student.com',
        password: 'student123',
        grade: 'Grade 10',
        section: 'Section A',
        contact_number: '09123456789',
        guardian_name: 'Maria Dela Cruz',
        guardian_contact: '09987654321'
      },
      {
        id: '2',
        student_id: 'STU002',
        first_name: 'Maria',
        last_name: 'Santos',
        email: 'maria@student.com',
        password: 'student123',
        grade: 'Grade 10',
        section: 'Section A',
        contact_number: '09123456788',
        guardian_name: 'Jose Santos',
        guardian_contact: '09987654322'
      }
    ];
    localStorage.setItem('students', JSON.stringify(sampleStudents));
  }

  if (!localStorage.getItem('attendance')) {
    const today = new Date().toISOString().split('T')[0];
    const sampleAttendance: AttendanceRecord[] = [
      {
        id: '1',
        student_id: '1',
        date: today,
        time_in: '08:00',
        status: 'present',
        notes: ''
      },
      {
        id: '2',
        student_id: '2',
        date: today,
        time_in: '08:15',
        status: 'late',
        notes: 'Traffic'
      }
    ];
    localStorage.setItem('attendance', JSON.stringify(sampleAttendance));
  }
};

// Student operations
export const getStudents = (): Student[] => {
  initializeData();
  const data = localStorage.getItem('students');
  return data ? JSON.parse(data) : [];
};

export const getStudentById = (id: string): Student | undefined => {
  const students = getStudents();
  return students.find(s => s.id === id);
};

export const addStudent = (student: Omit<Student, 'id'>): Student => {
  const students = getStudents();
  const newStudent = {
    ...student,
    id: Date.now().toString()
  };
  students.push(newStudent);
  localStorage.setItem('students', JSON.stringify(students));
  return newStudent;
};

export const updateStudent = (id: string, updates: Partial<Student>): void => {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index] = { ...students[index], ...updates };
    localStorage.setItem('students', JSON.stringify(students));
  }
};

export const deleteStudent = (id: string): void => {
  let students = getStudents();
  students = students.filter(s => s.id !== id);
  localStorage.setItem('students', JSON.stringify(students));
  
  // Also delete related attendance
  let attendance = getAttendance();
  attendance = attendance.filter(a => a.student_id !== id);
  localStorage.setItem('attendance', JSON.stringify(attendance));
};

export const authenticateStudent = (email: string, password: string): Student | null => {
  const students = getStudents();
  const student = students.find(s => s.email === email && s.password === password);
  return student || null;
};

// Attendance operations
export const getAttendance = (): AttendanceRecord[] => {
  initializeData();
  const data = localStorage.getItem('attendance');
  return data ? JSON.parse(data) : [];
};

export const getAttendanceByDate = (date: string): AttendanceRecord[] => {
  const attendance = getAttendance();
  return attendance.filter(a => a.date === date);
};

export const getAttendanceByStudent = (studentId: string): AttendanceRecord[] => {
  const attendance = getAttendance();
  return attendance.filter(a => a.student_id === studentId);
};

export const saveAttendance = (date: string, records: Omit<AttendanceRecord, 'id'>[]): void => {
  let attendance = getAttendance();
  
  // Remove existing records for this date
  attendance = attendance.filter(a => a.date !== date);
  
  // Add new records
  const newRecords = records.map(r => ({
    ...r,
    id: Date.now().toString() + Math.random()
  }));
  
  attendance.push(...newRecords);
  localStorage.setItem('attendance', JSON.stringify(attendance));
};
