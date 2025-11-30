import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  ClipboardList,
  BarChart3,
  LogOut,
  User,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"dashboard" | "attendance" | "grades">("dashboard");
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDays: 0,
    present: 0,
    absent: 0,
    late: 0,
    attendanceRate: 0,
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

    // Fetch student info
    const { data: student } = await supabase
      .from("students")
      .select("*")
      .eq("id", studentId)
      .single();

    if (student) {
      setStudentInfo(student);
    }

    // Fetch attendance records for this specific student
    const { data } = await supabase
      .from("attendance")
      .select("*")
      .eq("student_id", studentId)
      .order("date", { ascending: false });

    if (data) {
      setAttendanceRecords(data);
      const present = data.filter((a) => a.status === "Present").length;
      const absent = data.filter((a) => a.status === "Absent").length;
      const late = data.filter((a) => a.status === "Late").length;
      const total = data.length;

      setStats({
        totalDays: total,
        present,
        absent,
        late,
        attendanceRate: total > 0 ? (present / total) * 100 : 0,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present":
        return "bg-success text-success-foreground";
      case "Absent":
        return "bg-destructive text-destructive-foreground";
      case "Late":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
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
            <BarChart3 className="w-5 h-5" />
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
              <div className="bg-card rounded-xl shadow-md p-6 mb-6">
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
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                <div className="bg-card rounded-xl shadow-md p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-info mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Total Days</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalDays}</p>
                </div>

                <div className="bg-card rounded-xl shadow-md p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-success mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Present</p>
                  <p className="text-2xl font-bold text-foreground">{stats.present}</p>
                </div>

                <div className="bg-card rounded-xl shadow-md p-5 text-center">
                  <ClipboardList className="w-6 h-6 text-destructive mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Absent</p>
                  <p className="text-2xl font-bold text-foreground">{stats.absent}</p>
                </div>

                <div className="bg-card rounded-xl shadow-md p-5 text-center">
                  <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
                  <p className="text-2xl font-bold text-foreground">{stats.attendanceRate.toFixed(1)}%</p>
                </div>
              </div>
            </>
          )}

          {currentView === "attendance" && (
            <>
              <h3 className="text-2xl font-bold mb-6 text-foreground">My Attendance History</h3>
              <div className="bg-card rounded-xl shadow-md overflow-hidden">
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
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(record.status)}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{record.notes || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {currentView === "grades" && (
            <>
              <h3 className="text-2xl font-bold mb-6 text-foreground">My Grades</h3>
              <div className="bg-card rounded-xl shadow-md p-6">
                <p className="text-muted-foreground">Grade tracking feature coming soon...</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
