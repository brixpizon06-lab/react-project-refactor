import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  User,
  BookOpen,
} from "lucide-react";
import ThemeToggle from "@/frontend/components/ThemeToggle";
import { 
  fetchStudentById, 
  Student 
} from "@/backend/studentService";
import { 
  fetchGradesByStudent, 
  getGradeStats,
  Grade 
} from "@/backend/gradeService";
import {
  fetchAttendanceByStudent,
  getAttendanceStats,
  AttendanceRecord
} from "@/backend/attendanceService";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"dashboard" | "attendance" | "grades">("dashboard");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [studentInfo, setStudentInfo] = useState<Student | null>(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0,
  });
  const [gradeStats, setGradeStats] = useState({ 
    average: 0, 
    total: 0, 
    bySubject: {} as Record<string, { average: number }> 
  });

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    const studentId = localStorage.getItem("studentId");
    
    if (!studentId) {
      navigate("/");
      return;
    }

    try {
      const [student, attendanceData, gradesData, attendanceStatsData, gradeStatsData] = await Promise.all([
        fetchStudentById(studentId),
        fetchAttendanceByStudent(studentId),
        fetchGradesByStudent(studentId),
        getAttendanceStats(studentId),
        getGradeStats(studentId),
      ]);

      if (student) {
        setStudentInfo(student);
      }

      setAttendanceRecords(attendanceData);
      setGrades(gradesData);
      setGradeStats(gradeStatsData);
      setStats({
        totalDays: attendanceStatsData.total,
        present: attendanceStatsData.present,
        absent: attendanceStatsData.absent,
        late: attendanceStatsData.late,
        attendanceRate: attendanceStatsData.rate,
      });
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("studentId");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "present":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "absent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "late":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "excused":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getGradeColor = (value: number) => {
    if (value >= 90) return "text-green-600 dark:text-green-400";
    if (value >= 80) return "text-blue-600 dark:text-blue-400";
    if (value >= 75) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-56 bg-card border-r border-border flex flex-col">
        <div className="p-5 text-center border-b border-border">
          <h1 className="text-lg font-bold text-foreground">
            Attendance <span className="text-primary">Tracker</span>
          </h1>
        </div>

        <div className="flex-1 flex flex-col">
          <button
            onClick={() => setCurrentView("dashboard")}
            className={`flex items-center gap-3 px-5 py-4 text-left transition-colors ${
              currentView === "dashboard"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary hover:font-semibold"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>

          <button
            onClick={() => setCurrentView("attendance")}
            className={`flex items-center gap-3 px-5 py-4 text-left transition-colors ${
              currentView === "attendance"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary hover:font-semibold"
            }`}
          >
            <ClipboardList className="w-5 h-5" />
            My Attendance
          </button>

          <button
            onClick={() => setCurrentView("grades")}
            className={`flex items-center gap-3 px-5 py-4 text-left transition-colors ${
              currentView === "grades"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary hover:font-semibold"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            My Grades
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Topbar */}
        <div className="flex justify-between items-center px-6 py-4 bg-card border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Student Dashboard</h2>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button
              onClick={handleLogout}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6">
          {currentView === "dashboard" && (
            <>
              {/* Profile Card */}
              <Card className="p-6 mb-6">
                <div className="flex items-center gap-5 mb-4">
                  <div className="w-[70px] h-[70px] rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">
                      {studentInfo ? `${studentInfo.first_name} ${studentInfo.last_name}` : "Loading..."}
                    </h3>
                    <p className="text-muted-foreground">
                      Student ID: {studentInfo?.student_id || "N/A"}
                    </p>
                    <p className="text-muted-foreground">
                      {studentInfo?.grade && studentInfo?.section 
                        ? `Grade ${studentInfo.grade} - Section ${studentInfo.section}`
                        : "No grade/section assigned"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-5 mb-6">
                <Card className="p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalDays}</p>
                </Card>

                <Card className="p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Present</p>
                  <p className="text-2xl font-bold text-foreground">{stats.present}</p>
                </Card>

                <Card className="p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Absent</p>
                  <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                </Card>

                <Card className="p-5 text-center">
                  <BarChart3 className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.attendanceRate.toFixed(1)}%</p>
                </Card>

                <Card className="p-5 text-center">
                  <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Grade Average</p>
                  <p className={`text-2xl font-bold ${getGradeColor(gradeStats.average)}`}>
                    {gradeStats.average.toFixed(1)}%
                  </p>
                </Card>
              </div>
            </>
          )}

          {currentView === "attendance" && (
            <>
              <h3 className="text-2xl font-bold mb-6 text-foreground">My Attendance History</h3>
              {attendanceRecords.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No attendance records yet</p>
                </Card>
              ) : (
                <Card className="overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Time In</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map((record, index) => (
                        <tr key={record.id} className={index % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {new Date(record.date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{record.time_in || "N/A"}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(record.status)}`}>
                              {record.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}
            </>
          )}

          {currentView === "grades" && (
            <>
              <h3 className="text-2xl font-bold mb-6 text-foreground">My Grades</h3>
              
              {/* Grade Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className={`text-3xl font-bold ${getGradeColor(gradeStats.average)}`}>
                    {gradeStats.average.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Grades</p>
                  <p className="text-3xl font-bold text-foreground">{gradeStats.total}</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Subjects</p>
                  <p className="text-3xl font-bold text-foreground">
                    {Object.keys(gradeStats.bySubject).length}
                  </p>
                </Card>
              </div>

              {grades.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No grades recorded yet</p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {grades.map((grade) => (
                    <Card key={grade.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-foreground">{grade.subject}</span>
                            <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground capitalize">
                              {grade.grade_type}
                            </span>
                            {grade.quarter && (
                              <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {grade.quarter}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(grade.date).toLocaleDateString()}
                            {grade.description && ` • ${grade.description}`}
                          </p>
                        </div>
                        <span className={`text-2xl font-bold ${getGradeColor(Number(grade.grade_value))}`}>
                          {Number(grade.grade_value).toFixed(1)}%
                        </span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
