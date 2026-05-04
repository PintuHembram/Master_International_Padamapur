import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Student {
  id: string;
  name: string;
  roll_number?: string;
  admission_number?: string;
  class: string;
  section?: string;
  date_of_birth?: string;
  father_name?: string;
  mobile?: string;
  previous_class?: string;
  last_academic_year?: string;
  status?: "active" | "inactive";
  academic_year?: string;
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

export function OldStudentAdmission() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showReEnrollModal, setShowReEnrollModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [filters, setFilters] = useState({
    academicYear: "",
    class: "",
  });

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
    try {
      const response = await fetch(
        `/api/students/search?query=${encodeURIComponent(searchQuery)}&class=${encodeURIComponent(
          filters.class
        )}&academic_year=${encodeURIComponent(filters.academicYear)}`
      );

      if (!response.ok) throw new Error("Search failed");

      const data = await response.json();
      setSearchResults(data);

      if (data.length === 0) {
        toast.info("No students found");
      }
    } catch (error) {
      toast.error("Failed to search students");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReEnrollClick = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      student_name: student.name,
      father_name: student.father_name || "",
      mobile: student.mobile || "",
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
      const response = await fetch("/api/students/reenroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_id: selectedStudent.id,
          ...formData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Re-enrollment failed");
      }

      toast.success("Student successfully re-enrolled");
      setShowReEnrollModal(false);
      setSearchResults([]);
      setSearchQuery("");
      setSelectedStudent(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to re-enroll student");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const classOptions = ["Nursery", "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => (currentYear - 2 + i).toString());

  return (
    <div className="space-y-6">
      {/* === Search Section === */}
      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <UserCheck className="w-5 h-5" />
          <h3 className="text-lg font-semibold">Search Old Students</h3>
        </div>

        <div className="space-y-4">
          {/* Search Query */}
          <div>
            <Label htmlFor="search-query" className="text-sm font-medium">
              Search Query
            </Label>
            <p className="text-xs text-muted-foreground mb-2">Search by student name, admission number, or mobile</p>
            <Input
              id="search-query"
              placeholder="Enter student name, ID, or mobile number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="filter-year" className="text-sm font-medium">
                Academic Year
              </Label>
              <Select value={filters.academicYear} onValueChange={(value) => setFilters({ ...filters, academicYear: value })}>
                <SelectTrigger id="filter-year">
                  <SelectValue placeholder="All years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All years</SelectItem>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filter-class" className="text-sm font-medium">
                Class
              </Label>
              <Select value={filters.class} onValueChange={(value) => setFilters({ ...filters, class: value })}>
                <SelectTrigger id="filter-class">
                  <SelectValue placeholder="All classes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All classes</SelectItem>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Search Button */}
          <Button onClick={handleSearch} disabled={loading} className="w-full md:w-auto">
            {loading ? "Searching..." : "Search Students"}
          </Button>
        </div>
      </Card>

      {/* === Search Results === */}
      {searchResults.length > 0 && (
        <Card className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="p-4 text-left text-sm font-semibold">Student ID</th>
                <th className="p-4 text-left text-sm font-semibold">Name</th>
                <th className="p-4 text-left text-sm font-semibold">Previous Class</th>
                <th className="p-4 text-left text-sm font-semibold">Last Academic Year</th>
                <th className="p-4 text-left text-sm font-semibold">Status</th>
                <th className="p-4 text-left text-sm font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.map((student) => (
                <tr key={student.id} className="border-b hover:bg-muted/30 transition">
                  <td className="p-4 text-sm font-mono">{student.admission_number || student.roll_number || student.id}</td>
                  <td className="p-4 text-sm font-medium">{student.name}</td>
                  <td className="p-4 text-sm">{student.previous_class || student.class}</td>
                  <td className="p-4 text-sm text-muted-foreground">{student.last_academic_year || "—"}</td>
                  <td className="p-4 text-sm">
                    <Badge variant={student.status === "active" ? "default" : "secondary"}>
                      {student.status || "Active"}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm">
                    <Button size="sm" onClick={() => handleReEnrollClick(student)}>
                      Re-Enroll
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {searchResults.length === 0 && searchQuery && (
        <Card className="p-8 text-center text-muted-foreground">
          {loading ? "Searching..." : "No students found. Try a different search."}
        </Card>
      )}

      {/* === Re-Enroll Modal === */}
      <Dialog open={showReEnrollModal} onOpenChange={setShowReEnrollModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Re-Enroll Student: {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleReEnrollSubmit} className="space-y-4">
            {/* Student Name (readonly) */}
            <div>
              <Label htmlFor="form-student-name" className="text-sm font-medium">
                Student Name
              </Label>
              <Input
                id="form-student-name"
                value={formData.student_name}
                disabled
                className="bg-muted"
              />
            </div>

            {/* Father Name */}
            <div>
              <Label htmlFor="form-father-name" className="text-sm font-medium">
                Father Name
              </Label>
              <Input
                id="form-father-name"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                placeholder="Enter father's name"
              />
            </div>

            {/* Mobile */}
            <div>
              <Label htmlFor="form-mobile" className="text-sm font-medium">
                Mobile
              </Label>
              <Input
                id="form-mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                placeholder="Enter mobile number"
              />
            </div>

            {/* Previous Class */}
            <div>
              <Label htmlFor="form-prev-class" className="text-sm font-medium">
                Previous Class
              </Label>
              <Input
                id="form-prev-class"
                value={formData.previous_class}
                disabled
                className="bg-muted"
              />
            </div>

            {/* New Class (dropdown) */}
            <div>
              <Label htmlFor="form-new-class" className="text-sm font-medium">
                New Class <span className="text-red-500">*</span>
              </Label>
              <Select value={formData.new_class} onValueChange={(value) => setFormData({ ...formData, new_class: value })}>
                <SelectTrigger id="form-new-class">
                  <SelectValue placeholder="Select new class" />
                </SelectTrigger>
                <SelectContent>
                  {classOptions.map((cls) => (
                    <SelectItem key={cls} value={cls}>
                      {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div>
              <Label htmlFor="form-academic-year" className="text-sm font-medium">
                Academic Year
              </Label>
              <Select value={formData.academic_year} onValueChange={(value) => setFormData({ ...formData, academic_year: value })}>
                <SelectTrigger id="form-academic-year">
                  <SelectValue placeholder="Select academic year" />
                </SelectTrigger>
                <SelectContent>
                  {yearOptions.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Section */}
            <div>
              <Label htmlFor="form-section" className="text-sm font-medium">
                Section
              </Label>
              <Input
                id="form-section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                placeholder="Enter section (e.g., A, B, C)"
              />
            </div>

            {/* Fee Status */}
            <div>
              <Label htmlFor="form-fee-status" className="text-sm font-medium">
                Fee Status
              </Label>
              <Select value={formData.fee_status} onValueChange={(value) => setFormData({ ...formData, fee_status: value as any })}>
                <SelectTrigger id="form-fee-status">
                  <SelectValue placeholder="Select fee status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="form-notes" className="text-sm font-medium">
                Notes (Optional)
              </Label>
              <Textarea
                id="form-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes..."
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setShowReEnrollModal(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Processing..." : "Promote & Enroll"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
