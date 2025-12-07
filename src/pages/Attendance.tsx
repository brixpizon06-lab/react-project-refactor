import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Check } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { studentApi, attendanceApi, Student, AttendanceRecord } from "@/lib/api";

const Attendance = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (students.length > 0) {
      fetchAttendance();
    }
  }, [selectedDate, students]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentApi.getAll();
      setStudents(data || []);
    } catch (error) {
      toast.error("Failed to fetch students");
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    if (students.length === 0) return;

    const dateStr = format(selectedDate, "yyyy-MM-dd");
    try {
      const data = await attendanceApi.getByDate(dateStr);
      
      const attendanceMap: Record<string, AttendanceRecord> = {};
      data?.forEach((record) => {
        attendanceMap[record.student_id] = {
          student_id: record.student_id,
          date: record.date,
          status: record.status,
          time_in: record.time_in,
          notes: record.notes,
        };
      });

      setAttendance(attendanceMap);
    } catch (error) {
      // No attendance records for this date yet
      setAttendance({});
    }
  };

  const handleStatusChange = (studentId: string, status: AttendanceRecord["status"]) => {
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    setAttendance((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        student_id: studentId,
        date: dateStr,
        status,
        time_in: status === "present" || status === "late" ? format(new Date(), "HH:mm") : undefined,
      },
    }));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    const dateStr = format(selectedDate, "yyyy-MM-dd");

    try {
      const records = Object.values(attendance).map((record) => ({
        student_id: record.student_id,
        date: dateStr,
        status: record.status,
        time_in: record.time_in,
        notes: record.notes || undefined,
      }));

      await attendanceApi.save(records);
      toast.success("Attendance saved successfully");
    } catch (error) {
      toast.error("Failed to save attendance");
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "present":
        return "bg-success text-success-foreground";
      case "absent":
        return "bg-destructive text-destructive-foreground";
      case "late":
        return "bg-warning text-warning-foreground";
      case "excused":
        return "bg-primary text-primary-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const stats = students.reduce(
    (acc, student) => {
      const status = attendance[student.id]?.status;
      if (status === "present") acc.present++;
      else if (status === "absent") acc.absent++;
      else if (status === "late") acc.late++;
      else if (status === "excused") acc.excused++;
      return acc;
    },
    { present: 0, absent: 0, late: 0, excused: 0 }
  );

  return (
    <Layout>
      <div className="space-y-8 mb-20 md:mb-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Mark Attendance</h2>
            <p className="text-muted-foreground">Track student attendance for the day</p>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={handleSaveAttendance} disabled={saving} className="gap-2">
              <Check className="w-4 h-4" />
              {saving ? "Saving..." : "Save Attendance"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Present</p>
              <p className="text-3xl font-bold text-success">{stats.present}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Absent</p>
              <p className="text-3xl font-bold text-destructive">{stats.absent}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Late</p>
              <p className="text-3xl font-bold text-warning">{stats.late}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Excused</p>
              <p className="text-3xl font-bold text-primary">{stats.excused}</p>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Loading students...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {student.student_id} {student.grade && `• ${student.grade}`}
                      {student.section && ` - ${student.section}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {(["present", "absent", "late", "excused"] as const).map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={attendance[student.id]?.status === status ? "default" : "outline"}
                        className={cn(
                          "capitalize min-w-20",
                          attendance[student.id]?.status === status && getStatusColor(status)
                        )}
                        onClick={() => handleStatusChange(student.id, status)}
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!loading && students.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">No students found</p>
              <p className="text-sm mt-2">Add students first to mark attendance</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default Attendance;
