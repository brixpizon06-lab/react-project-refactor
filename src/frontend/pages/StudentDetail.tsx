import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/frontend/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Plus, Edit, Trash2, User, BookOpen, Calendar } from "lucide-react";
import { toast } from "sonner";
import { 
  fetchStudentById, 
  Student 
} from "@/backend/studentService";
import { 
  fetchGradesByStudent, 
  createGrade, 
  deleteGrade,
  Grade,
  getGradeStats 
} from "@/backend/gradeService";
import {
  fetchAttendanceByStudent,
  AttendanceRecord,
  getAttendanceStats
} from "@/backend/attendanceService";

const StudentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [gradeStats, setGradeStats] = useState({ average: 0, total: 0, bySubject: {} as Record<string, { average: number }> });
  const [attendanceStats, setAttendanceStats] = useState({ total: 0, present: 0, absent: 0, late: 0, rate: 0 });
  const [isGradeDialogOpen, setIsGradeDialogOpen] = useState(false);
  const [gradeForm, setGradeForm] = useState({
    subject: "",
    grade_value: "",
    grade_type: "quiz",
    description: "",
    date: new Date().toISOString().split("T")[0],
    quarter: "Q1",
  });

  useEffect(() => {
    if (id) {
      loadStudentData();
    }
  }, [id]);

  const loadStudentData = async () => {
    if (!id) return;
    
    try {
      const [studentData, gradesData, attendanceData, gradeStatsData, attendanceStatsData] = await Promise.all([
        fetchStudentById(id),
        fetchGradesByStudent(id),
        fetchAttendanceByStudent(id),
        getGradeStats(id),
        getAttendanceStats(id),
      ]);
      
      setStudent(studentData);
      setGrades(gradesData);
      setAttendance(attendanceData);
      setGradeStats(gradeStatsData);
      setAttendanceStats(attendanceStatsData);
    } catch (error) {
      toast.error("Failed to load student data");
    }
  };

  const handleAddGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      await createGrade({
        student_id: id,
        subject: gradeForm.subject,
        grade_value: parseFloat(gradeForm.grade_value),
        grade_type: gradeForm.grade_type,
        description: gradeForm.description || null,
        date: gradeForm.date,
        quarter: gradeForm.quarter,
      });
      
      toast.success("Grade added successfully");
      setIsGradeDialogOpen(false);
      resetGradeForm();
      loadStudentData();
    } catch (error) {
      toast.error("Failed to add grade");
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm("Are you sure you want to delete this grade?")) return;
    
    try {
      await deleteGrade(gradeId);
      toast.success("Grade deleted");
      loadStudentData();
    } catch (error) {
      toast.error("Failed to delete grade");
    }
  };

  const resetGradeForm = () => {
    setGradeForm({
      subject: "",
      grade_value: "",
      grade_type: "quiz",
      description: "",
      date: new Date().toISOString().split("T")[0],
      quarter: "Q1",
    });
  };

  const getGradeColor = (value: number) => {
    if (value >= 90) return "text-green-600 dark:text-green-400";
    if (value >= 80) return "text-blue-600 dark:text-blue-400";
    if (value >= 75) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "absent": return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "late": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "excused": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default: return "bg-muted text-muted-foreground";
    }
  };

  if (!student) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading student data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 mb-20 md:mb-0">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/students")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h2 className="text-3xl font-bold text-foreground">
              {student.first_name} {student.last_name}
            </h2>
            <p className="text-muted-foreground">{student.student_id}</p>
          </div>
        </div>

        {/* Student Info Card */}
        <Card className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
              <div>
                <p className="text-sm text-muted-foreground">Grade Level</p>
                <p className="font-medium text-foreground">{student.grade || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Section</p>
                <p className="font-medium text-foreground">{student.section || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{student.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guardian</p>
                <p className="font-medium text-foreground">{student.guardian_name || "N/A"}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Grade Average</p>
            <p className={`text-2xl font-bold ${getGradeColor(gradeStats.average)}`}>
              {gradeStats.average.toFixed(1)}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total Grades</p>
            <p className="text-2xl font-bold text-foreground">{gradeStats.total}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Attendance Rate</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {attendanceStats.rate.toFixed(1)}%
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Days Present</p>
            <p className="text-2xl font-bold text-foreground">{attendanceStats.present}</p>
          </Card>
        </div>

        {/* Tabs for Grades and Attendance */}
        <Tabs defaultValue="grades" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grades" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Grades
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <Calendar className="w-4 h-4" />
              Attendance
            </TabsTrigger>
          </TabsList>

          <TabsContent value="grades" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-foreground">Grade Records</h3>
              <Dialog open={isGradeDialogOpen} onOpenChange={setIsGradeDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Grade
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Grade</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddGrade} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject *</Label>
                      <Input
                        id="subject"
                        required
                        value={gradeForm.subject}
                        onChange={(e) => setGradeForm({ ...gradeForm, subject: e.target.value })}
                        placeholder="e.g., Mathematics, Science"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grade_value">Grade (%) *</Label>
                        <Input
                          id="grade_value"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          required
                          value={gradeForm.grade_value}
                          onChange={(e) => setGradeForm({ ...gradeForm, grade_value: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="grade_type">Type</Label>
                        <Select
                          value={gradeForm.grade_type}
                          onValueChange={(value) => setGradeForm({ ...gradeForm, grade_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="quiz">Quiz</SelectItem>
                            <SelectItem value="exam">Exam</SelectItem>
                            <SelectItem value="assignment">Assignment</SelectItem>
                            <SelectItem value="project">Project</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Date</Label>
                        <Input
                          id="date"
                          type="date"
                          value={gradeForm.date}
                          onChange={(e) => setGradeForm({ ...gradeForm, date: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="quarter">Quarter</Label>
                        <Select
                          value={gradeForm.quarter}
                          onValueChange={(value) => setGradeForm({ ...gradeForm, quarter: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Q1">Q1</SelectItem>
                            <SelectItem value="Q2">Q2</SelectItem>
                            <SelectItem value="Q3">Q3</SelectItem>
                            <SelectItem value="Q4">Q4</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={gradeForm.description}
                        onChange={(e) => setGradeForm({ ...gradeForm, description: e.target.value })}
                        placeholder="Optional description"
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsGradeDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Grade</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {grades.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No grades recorded yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
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
                      <div className="flex items-center gap-4">
                        <span className={`text-2xl font-bold ${getGradeColor(Number(grade.grade_value))}`}>
                          {Number(grade.grade_value).toFixed(1)}%
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDeleteGrade(grade.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="attendance" className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Attendance History</h3>
            
            {attendance.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No attendance records yet</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {attendance.map((record) => (
                  <Card key={record.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">
                          {new Date(record.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                        {record.time_in && (
                          <p className="text-sm text-muted-foreground">
                            Time in: {record.time_in}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-muted-foreground">{record.notes}</p>
                        )}
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default StudentDetail;
