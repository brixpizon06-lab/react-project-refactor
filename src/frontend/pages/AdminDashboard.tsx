import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BarChart3,
  LogOut,
  Plus,
  Search,
  Edit,
  Trash2,
} from "lucide-react";
import StatCard from "@/frontend/components/StatCard";
import ThemeToggle from "@/frontend/components/ThemeToggle";

type View = "dashboard" | "students" | "attendance" | "reports";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [students, setStudents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: studentsData } = await supabase.from("students").select("*");
    const { data: attendanceData } = await supabase
      .from("attendance")
      .select("*")
      .eq("date", new Date().toISOString().split("T")[0]);

    if (studentsData) {
      setStudents(studentsData);
      const presentCount = attendanceData?.filter((a) => a.status === "Present").length || 0;
      const absentCount = attendanceData?.filter((a) => a.status === "Absent").length || 0;
      
      setStats({
        totalStudents: studentsData.length,
        presentToday: presentCount,
        absentToday: absentCount,
        attendanceRate: studentsData.length > 0 ? (presentCount / studentsData.length) * 100 : 0,
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    navigate("/");
  };

  const handleDeleteStudent = async (id: string) => {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete student", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Student deleted successfully" });
      fetchData();
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-60 bg-card border-r border-border flex flex-col">
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
            onClick={() => setCurrentView("students")}
            className={`flex items-center gap-3 px-5 py-4 text-left transition-colors ${
              currentView === "students"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary hover:font-semibold"
            }`}
          >
            <Users className="w-5 h-5" />
            Students
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
            Attendance
          </button>

          <button
            onClick={() => setCurrentView("reports")}
            className={`flex items-center gap-3 px-5 py-4 text-left transition-colors ${
              currentView === "reports"
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-foreground hover:bg-secondary hover:text-primary hover:font-semibold"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Reports
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-auto">
        {/* Topbar */}
        <div className="flex justify-between items-center px-6 py-4 bg-card border-b border-border">
          <h2 className="text-lg font-semibold text-primary">Admin Panel</h2>
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
              <h3 className="text-2xl font-bold mb-6 text-foreground">Dashboard Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={Users}
                  trend="↑ 12% from last month"
                />
                <StatCard
                  title="Present Today"
                  value={stats.presentToday}
                  icon={ClipboardList}
                  trend="↑ 5% from yesterday"
                  variant="success"
                />
                <StatCard
                  title="Absent Today"
                  value={stats.absentToday}
                  icon={ClipboardList}
                  trend="↓ 3% from yesterday"
                  variant="destructive"
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${stats.attendanceRate.toFixed(1)}%`}
                  icon={BarChart3}
                  trend="↑ 2% from last week"
                  variant="success"
                />
              </div>
            </>
          )}

          {currentView === "students" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">Student Management</h3>
                <Button
                  onClick={() => navigate("/students")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Student
                </Button>
              </div>

              <div className="bg-card rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      placeholder="Search students..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Student ID</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Name</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Grade</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Section</th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student, index) => (
                        <tr key={student.id} className={index % 2 === 0 ? "bg-card" : "bg-secondary/30"}>
                          <td className="px-4 py-3 text-sm text-foreground">{student.student_id}</td>
                          <td className="px-4 py-3 text-sm text-foreground">
                            {student.first_name} {student.last_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.grade || "N/A"}</td>
                          <td className="px-4 py-3 text-sm text-foreground">{student.section || "N/A"}</td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-info border-info hover:bg-info hover:text-info-foreground">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {currentView === "attendance" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">Attendance Tracking</h3>
                <Button
                  onClick={() => navigate("/attendance")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Mark Attendance
                </Button>
              </div>
              <p className="text-muted-foreground">Use the attendance page to mark daily attendance.</p>
            </>
          )}

          {currentView === "reports" && (
            <>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-foreground">Reports & Analytics</h3>
                <Button
                  onClick={() => navigate("/reports")}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  View Reports
                </Button>
              </div>
              <p className="text-muted-foreground">Generate and view detailed attendance reports.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
