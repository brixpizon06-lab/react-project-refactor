import { useEffect, useState } from "react";
import Layout from "@/frontend/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceReport {
  student_id: string;
  first_name: string;
  last_name: string;
  student_number: string;
  total_days: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  attendance_rate: number;
}

const Reports = () => {
  const [reports, setReports] = useState<AttendanceReport[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [selectedMonth]);

  const fetchReports = async () => {
    setLoading(true);
    const startDate = format(startOfMonth(selectedMonth), "yyyy-MM-dd");
    const endDate = format(endOfMonth(selectedMonth), "yyyy-MM-dd");

    const { data: students } = await supabase
      .from("students")
      .select("*")
      .order("last_name", { ascending: true });

    if (!students) {
      setLoading(false);
      return;
    }

    const reportsData: AttendanceReport[] = [];

    for (const student of students) {
      const { data: attendance } = await supabase
        .from("attendance")
        .select("status")
        .eq("student_id", student.id)
        .gte("date", startDate)
        .lte("date", endDate);

      const present = attendance?.filter((a) => a.status === "present").length || 0;
      const absent = attendance?.filter((a) => a.status === "absent").length || 0;
      const late = attendance?.filter((a) => a.status === "late").length || 0;
      const excused = attendance?.filter((a) => a.status === "excused").length || 0;
      const total = attendance?.length || 0;

      reportsData.push({
        student_id: student.id,
        first_name: student.first_name,
        last_name: student.last_name,
        student_number: student.student_id,
        total_days: total,
        present,
        absent,
        late,
        excused,
        attendance_rate: total > 0 ? Math.round((present / total) * 100) : 0,
      });
    }

    setReports(reportsData);
    setLoading(false);
  };

  const exportToCSV = () => {
    const headers = [
      "Student ID",
      "First Name",
      "Last Name",
      "Total Days",
      "Present",
      "Absent",
      "Late",
      "Excused",
      "Attendance Rate",
    ];

    const rows = reports.map((report) => [
      report.student_number,
      report.first_name,
      report.last_name,
      report.total_days,
      report.present,
      report.absent,
      report.late,
      report.excused,
      `${report.attendance_rate}%`,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-report-${format(selectedMonth, "yyyy-MM")}.csv`;
    a.click();
  };

  return (
    <Layout>
      <div className="space-y-8 mb-20 md:mb-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Reports</h2>
            <p className="text-muted-foreground">View and analyze attendance data</p>
          </div>
          <div className="flex items-center gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedMonth, "MMMM yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => date && setSelectedMonth(date)}
                  defaultMonth={selectedMonth}
                />
              </PopoverContent>
            </Popover>
            <Button onClick={exportToCSV} className="gap-2">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Student
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Total Days
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Present
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Absent
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Late
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Excused
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      Loading reports...
                    </td>
                  </tr>
                ) : reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                      No attendance data for this period
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.student_id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-foreground">
                            {report.first_name} {report.last_name}
                          </p>
                          <p className="text-sm text-muted-foreground">{report.student_number}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-foreground">{report.total_days}</td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-success/10 text-success font-semibold">
                          {report.present}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive font-semibold">
                          {report.absent}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-warning/10 text-warning font-semibold">
                          {report.late}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                          {report.excused}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full transition-all duration-300",
                                report.attendance_rate >= 90
                                  ? "bg-success"
                                  : report.attendance_rate >= 75
                                  ? "bg-warning"
                                  : "bg-destructive"
                              )}
                              style={{ width: `${report.attendance_rate}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {report.attendance_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
