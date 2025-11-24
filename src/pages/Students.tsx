import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
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
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade: string;
  section: string;
  contact_number: string;
  guardian_name: string;
  guardian_contact: string;
  email: string;
}

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    student_id: "",
    first_name: "",
    last_name: "",
    grade: "",
    section: "",
    contact_number: "",
    guardian_name: "",
    guardian_contact: "",
    email: "",
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("last_name", { ascending: true });

    if (error) {
      toast.error("Failed to fetch students");
      return;
    }

    setStudents(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingStudent) {
      const { error } = await supabase
        .from("students")
        .update(formData)
        .eq("id", editingStudent.id);

      if (error) {
        toast.error("Failed to update student");
        return;
      }
      toast.success("Student updated successfully");
    } else {
      const { error } = await supabase.from("students").insert([formData]);

      if (error) {
        toast.error("Failed to add student");
        return;
      }
      toast.success("Student added successfully");
    }

    setIsDialogOpen(false);
    resetForm();
    fetchStudents();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    const { error } = await supabase.from("students").delete().eq("id", id);

    if (error) {
      toast.error("Failed to delete student");
      return;
    }

    toast.success("Student deleted successfully");
    fetchStudents();
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      student_id: student.student_id,
      first_name: student.first_name,
      last_name: student.last_name,
      grade: student.grade || "",
      section: student.section || "",
      contact_number: student.contact_number || "",
      guardian_name: student.guardian_name || "",
      guardian_contact: student.guardian_contact || "",
      email: student.email || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingStudent(null);
    setFormData({
      student_id: "",
      first_name: "",
      last_name: "",
      grade: "",
      section: "",
      contact_number: "",
      guardian_name: "",
      guardian_contact: "",
      email: "",
    });
  };

  const filteredStudents = students.filter(
    (student) =>
      student.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-8 mb-20 md:mb-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Students</h2>
            <p className="text-muted-foreground">Manage your student roster</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingStudent ? "Edit Student" : "Add New Student"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student ID *</Label>
                    <Input
                      id="student_id"
                      required
                      value={formData.student_id}
                      onChange={(e) =>
                        setFormData({ ...formData, student_id: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="first_name">First Name *</Label>
                    <Input
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name">Last Name *</Label>
                    <Input
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Grade</Label>
                    <Input
                      id="grade"
                      value={formData.grade}
                      onChange={(e) =>
                        setFormData({ ...formData, grade: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) =>
                        setFormData({ ...formData, section: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number">Contact Number</Label>
                    <Input
                      id="contact_number"
                      value={formData.contact_number}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_number: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_name">Guardian Name</Label>
                    <Input
                      id="guardian_name"
                      value={formData.guardian_name}
                      onChange={(e) =>
                        setFormData({ ...formData, guardian_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="guardian_contact">Guardian Contact</Label>
                    <Input
                      id="guardian_contact"
                      value={formData.guardian_contact}
                      onChange={(e) =>
                        setFormData({ ...formData, guardian_contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStudent ? "Update" : "Add"} Student
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">
                      {student.first_name} {student.last_name}
                    </h3>
                    <p className="text-sm text-muted-foreground">{student.student_id}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEdit(student)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(student.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {student.grade && (
                    <p>
                      <span className="text-muted-foreground">Grade:</span>{" "}
                      <span className="text-foreground">{student.grade}</span>
                      {student.section && ` - ${student.section}`}
                    </p>
                  )}
                  {student.guardian_name && (
                    <p>
                      <span className="text-muted-foreground">Guardian:</span>{" "}
                      <span className="text-foreground">{student.guardian_name}</span>
                    </p>
                  )}
                  {student.guardian_contact && (
                    <p>
                      <span className="text-muted-foreground">Contact:</span>{" "}
                      <span className="text-foreground">{student.guardian_contact}</span>
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredStudents.length === 0 && (
          <Card className="p-12">
            <div className="text-center text-muted-foreground">
              <p className="text-lg">No students found</p>
              <p className="text-sm mt-2">Add your first student to get started</p>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Students;
