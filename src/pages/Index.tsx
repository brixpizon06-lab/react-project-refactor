import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import StatCard from "@/components/StatCard";
import { Users, UserCheck, UserX, Clock, TrendingUp } from "lucide-react";
import { getStudents, getAttendanceByDate, getAttendance } from "@/lib/storage";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";

const Index = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    lateToday: 0,
    attendanceRate: 0,
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivity();
  }, []);

  const fetchStats = () => {
    const today = format(new Date(), "yyyy-MM-dd");
    const students = getStudents();
    const totalStudents = students.length;
    const todayAttendance = getAttendanceByDate(today);

    const presentToday = todayAttendance?.filter((a) => a.status === "present").length || 0;
    const absentToday = todayAttendance?.filter((a) => a.status === "absent").length || 0;
    const lateToday = todayAttendance?.filter((a) => a.status === "late").length || 0;
    
    const attendanceRate = totalStudents ? Math.round((presentToday / totalStudents) * 100) : 0;

    setStats({
      totalStudents: totalStudents || 0,
      presentToday,
      absentToday,
      lateToday,
      attendanceRate,
    });
  };

  const fetchRecentActivity = () => {
    const allAttendance = getAttendance();
    const students = getStudents();
    
    const recentData = allAttendance
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map(record => {
        const student = students.find(s => s.id === record.student_id);
        return {
          ...record,
          students: student ? {
            first_name: student.first_name,
            last_name: student.last_name,
            student_id: student.student_id
          } : null
        };
      });

    setRecentActivity(recentData);
  };

  return (
    <Layout>
      <div className="space-y-8 mb-20 md:mb-0">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here's your attendance overview.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            variant="default"
          />
          <StatCard
            title="Present Today"
            value={stats.presentToday}
            icon={UserCheck}
            variant="success"
          />
          <StatCard
            title="Absent Today"
            value={stats.absentToday}
            icon={UserX}
            variant="destructive"
          />
          <StatCard
            title="Late Today"
            value={stats.lateToday}
            icon={Clock}
            variant="warning"
          />
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-foreground">Attendance Rate</h3>
              <p className="text-sm text-muted-foreground">Today's attendance percentage</p>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-success" />
              <span className="text-3xl font-bold text-foreground">{stats.attendanceRate}%</span>
            </div>
          </div>
          <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${stats.attendanceRate}%` }}
            />
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-bold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No recent activity</p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.status === "present" ? "bg-success" :
                      activity.status === "absent" ? "bg-destructive" :
                      activity.status === "late" ? "bg-warning" :
                      "bg-primary"
                    }`} />
                    <div>
                      <p className="font-medium text-foreground">
                        {activity.students?.first_name} {activity.students?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {activity.students?.student_id}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium capitalize text-foreground">{activity.status}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(activity.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Index;
