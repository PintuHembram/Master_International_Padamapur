import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  roll_number?: string | null;
  student_id?: string | null;
  class: string;
  section?: string | null;
  date_of_birth?: string | null;
  father_name?: string | null;
  phone?: string | null;
  status?: string | null;
  session?: string | null;
}

interface ReEnrollFormData {
  student_name: string;
  father_name: string;
  mobile: string;
  previous_class: string;
  new_class: string;
  academic_year: string;
  section: string;
  fee_status: "pending" | "partial" | "paid";
  notes?: string;
}

const ALL = "__all__";

export function OldStudentAdmission() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReEnrollModal, setShowReEnrollModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({ academicYear: ALL, class: ALL });

  const [formData, setFormData] = useState<ReEnrollFormData>({
    student_name: "",
    father_name: "",
    mobile: "",
    previous_class: "",
    new_class: "",
    academic_year: new Date().getFullYear().toString(),
    section: "",
    fee_status: "pending",
    notes: "",
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setLoading(true);
    setHasSearched(true);
    try {
      const q = searchQuery.trim();
      let query = supabase
        .from("students")
        .select("id,name,roll_number,student_id,class,section,date_of_birth,father_name,phone,status,session")
        .or(`name.ilike.%${q}%,roll_number.ilike.%${q}%,student_id.ilike.%${q}%,phone.ilike.%${q}%,father_name.ilike.%${q}%`);

      if (filters.class !== ALL) query = query.eq("class", filters.class);
      if (filters.academicYear !== ALL) query = query.eq("session", filters.academicYear);

      const { data, error } = await query.limit(50);
      if (error) throw error;

      setSearchResults((data || []) as Student[]);
      if (!data || data.length === 0) toast.info("No students found");
    } catch (error: any) {
      toast.error(error?.message || "Failed to search students");
    } finally {
      setLoading(false);
    }
  };

  const handleReEnrollClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      student_name: student.name,
      father_name: student.father_name || "",
      mobile: student.phone || "",
      previous_class: student.class,
      new_class: "",
      academic_year: new Date().getFullYear().toString(),
      section: student.section || "",
      fee_status: "pending",
      notes: "",
    });
    setShowReEnrollModal(true);
  };

  const handleReEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    if (!formData.new_class) {
      toast.error("Please select a new class");
      return;
    }
    setSubmitting(true);
    try {
      const { error: updErr } = await supabase
        .from("students")
        .update({
          class: formData.new_class,
          section: formData.section || selectedStudent.section || "A",
          session: formData.academic_year,
          father_name: formData.father_name || null,
          phone: formData.mobile || null,
          status: "active",
        })
        .eq("id", selectedStudent.id);
      if (updErr) throw updErr;

      if (formData.fee_status) {
        const receiptNumber = `REC-${Date.now()}`;
        await supabase.from("fee_payments").insert({
          receipt_number: receiptNumber,
          student_name: formData.student_name,
          student_class: formData.new_class,
          roll_number: selectedStudent.roll_number || null,
          father_name: formData.father_name || null,
          fee_category: "Re-Enrollment",
          amount: 0,
          payment_mode: "cash",
          academic_year: formData.academic_year,
          remarks: `Re-enrollment status: ${formData.fee_status}. ${formData.notes || ""}`.trim(),
        });
      }

      toast.success("Student successfully re-enrolled");
      setShowReEnrollModal(false);
      setSearchResults([]);
      setSearchQuery("");
      setSelectedStudent(null);
      setHasSearched(false);
    } catch (error: any) {
      toast.error(error?.message || "Failed to re-enroll student");
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => `${currentYear - 2 + i}-${(currentYear - 1 + i).toString().slice(-2)}`);

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Search Old Students</h3>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="search-query" className="text-sm font-medium">Search Query</Label>
            <p className="text-xs text-muted-foreground mb-2">Search by name, roll number, student ID, mobile or father's name</p>
            <Input
              id="search-query"
              placeholder="Enter student name, ID, or mobile..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium">Academic Year (Session)</Label>
              <Select value={filters.academicYear} onValueChange={(v) => setFilters({ ...filters, academicYear: v })}>
                <SelectTrigger><SelectValue placeholder="All sessions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All sessions</SelectItem>
                  {yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Class</Label>
              <Select value={filters.class} onValueChange={(v) => setFilters({ ...filters, class: v })}>
                <SelectTrigger><SelectValue placeholder="All classes" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>All classes</SelectItem>
                  {classOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
            {loading ? "Searching..." : "Search Students"}
          </Button>
        </div>
      </Card>

      {searchResults.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Student ID</th>
                <th className="p-4 text-left text-sm font-semibold">Name</th>
                <th className="p-4 text-left text-sm font-semibold">Class</th>
                <th className="p-4 text-left text-sm font-semibold">Session</th>
                <th className="p-4 text-left text-sm font-semibold">Status</th>
                <th className="p-4 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((s) => (
                <tr key={s.id} className="border-b hover:bg-muted/30 transition">
                  <td className="p-4 text-sm font-mono">{s.student_id || s.roll_number || s.id.slice(0, 8)}</td>
                  <td className="p-4 text-sm font-medium">{s.name}</td>
                  <td className="p-4 text-sm">{s.class}{s.section ? `-${s.section}` : ""}</td>
                  <td className="p-4 text-sm text-muted-foreground">{s.session || "—"}</td>
                  <td className="p-4 text-sm">
                    <Badge variant={s.status === "active" ? "default" : "secondary"}>{s.status || "active"}</Badge>
                  </td>
                  <td className="p-4 text-sm">
                    <Button size="sm" onClick={() => handleReEnrollClick(s)}>Re-Enroll</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {hasSearched && !loading && searchResults.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">No students found. Try a different search.</Card>
      )}

      <Dialog open={showReEnrollModal} onOpenChange={setShowReEnrollModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Re-Enroll Student: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReEnrollSubmit} className="space-y-4">
            <div>
              <Label>Student Name</Label>
              <Input value={formData.student_name} disabled className="bg-muted" />
            </div>
            <div>
              <Label>Father Name</Label>
              <Input value={formData.father_name} onChange={(e) => setFormData({ ...formData, father_name: e.target.value })} placeholder="Enter father's name" />
            </div>
            <div>
              <Label>Mobile</Label>
              <Input type="tel" value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} placeholder="Enter mobile number" />
            </div>
            <div>
              <Label>Previous Class</Label>
              <Input value={formData.previous_class} disabled className="bg-muted" />
            </div>
            <div>
              <Label>New Class <span className="text-destructive">*</span></Label>
              <Select value={formData.new_class} onValueChange={(v) => setFormData({ ...formData, new_class: v })}>
                <SelectTrigger><SelectValue placeholder="Select new class" /></SelectTrigger>
                <SelectContent>
                  {classOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Academic Year</Label>
              <Select value={formData.academic_year} onValueChange={(v) => setFormData({ ...formData, academic_year: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {yearOptions.map((y) => <SelectItem key={y} value={y}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Section</Label>
              <Input value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} placeholder="A, B, C..." />
            </div>
            <div>
              <Label>Fee Status</Label>
              <Select value={formData.fee_status} onValueChange={(v) => setFormData({ ...formData, fee_status: v as any })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes (Optional)</Label>
              <Textarea value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowReEnrollModal(false)}>Cancel</Button>
              <Button type="submit" disabled={submitting}>{submitting ? "Processing..." : "Promote & Enroll"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
