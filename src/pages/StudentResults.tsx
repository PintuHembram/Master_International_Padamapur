import { Layout } from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { Award, Download, GraduationCap, Printer, Search, Trophy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";

interface SubjectResult {
  subject: string;
  maxMarks: number;
  obtained: number;
  grade: string;
}

interface StudentResult {
  id: string;
  roll_number: string;
  student_name: string;
  class: string;
  section: string;
  exam_type: string;
  academic_year: string;
  rank: number | null;
  subjects: SubjectResult[];
}

function getOverallGrade(percentage: number): string {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  if (percentage >= 40) return "D";
  return "F";
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A+": return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "A": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "B+": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    case "B": return "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400";
    case "C": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    case "D": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
    default: return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  }
}

export default function StudentResults() {
  const [allResults, setAllResults] = useState<StudentResult[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("all");
  const [selectedExam, setSelectedExam] = useState("all");
  const [foundResult, setFoundResult] = useState<StudentResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(true);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchResults();
  }, []);

  async function fetchResults() {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_results")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching results:", error);
    }
    setAllResults(
      (data as any[])?.map((r) => ({
        ...r,
        subjects: r.subjects || [],
      })) || []
    );
    setLoading(false);
  }

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setSearched(true);
    const query = searchQuery.toLowerCase().trim();
    const result = allResults.find((r) => {
      const matchQuery =
        r.roll_number.toLowerCase().includes(query) ||
        r.student_name.toLowerCase().includes(query);
      const matchClass = selectedClass === "all" || r.class === selectedClass;
      const matchExam = selectedExam === "all" || r.exam_type === selectedExam;
      return matchQuery && matchClass && matchExam;
    });
    setFoundResult(result || null);
  };

  const handlePrint = () => {
    window.print();
  };

  const totalMarks = foundResult
    ? foundResult.subjects.reduce((sum, s) => sum + s.maxMarks, 0)
    : 0;
  const obtainedMarks = foundResult
    ? foundResult.subjects.reduce((sum, s) => sum + s.obtained, 0)
    : 0;
  const percentage = totalMarks > 0 ? ((obtainedMarks / totalMarks) * 100).toFixed(1) : "0";
  const overallGrade = getOverallGrade(Number(percentage));
  const passed = Number(percentage) >= 33;

  return (
    <Layout>
      <Helmet>
        <title>Student Results | Master International School</title>
        <meta
          name="description"
          content="Check student examination results at Master International School, Padamapur. Search by roll number or student name."
        />
      </Helmet>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg')] opacity-5 bg-repeat" />
        <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center">
          <Badge className="bg-secondary/20 text-secondary-foreground border-secondary/30 mb-4">
            <GraduationCap className="w-4 h-4 mr-1" /> Examination Results
          </Badge>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            Student Results
          </h1>
          <p className="text-primary-foreground/80 max-w-2xl mx-auto text-lg">
            Look up examination results by roll number or student name. View subject-wise marks, grades, and overall performance.
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 lg:px-8">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Search className="w-5 h-5 text-primary" />
                Search Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Enter Roll Number or Student Name"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="h-11"
                  />
                </div>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Classes</SelectItem>
                    {["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"].map((c) => (
                      <SelectItem key={c} value={c}>Class {c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedExam} onValueChange={setSelectedExam}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Exam Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    <SelectItem value="Unit Test">Unit Test</SelectItem>
                    <SelectItem value="Mid-Term">Mid-Term</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Semester 1">Semester 1</SelectItem>
                    <SelectItem value="Semester 2">Semester 2</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch} className="h-11" disabled={loading}>
                  <Search className="w-4 h-4 mr-2" />
                  {loading ? "Loading..." : "Search"}
                </Button>
              </div>
              {allResults.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3">
                  {allResults.length} results available in database. Search by name or roll number.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Result Card */}
      {searched && (
        <section className="py-12">
          <div className="container mx-auto px-4 lg:px-8">
            {foundResult ? (
              <div ref={resultRef} className="print:shadow-none space-y-6">
                {/* Student Info Card */}
                <Card className="shadow-lg border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-bold font-display">{foundResult.student_name}</h2>
                        <p className="text-primary-foreground/80 mt-1">
                          Roll No: {foundResult.roll_number} • Class {foundResult.class}-{foundResult.section} • {foundResult.exam_type} Exam • {foundResult.academic_year}
                        </p>
                      </div>
                      <div className="flex gap-2 print:hidden">
                        <Button variant="secondary" size="sm" onClick={handlePrint}>
                          <Printer className="w-4 h-4 mr-1" /> Print
                        </Button>
                        <Button variant="secondary" size="sm" onClick={handlePrint}>
                          <Download className="w-4 h-4 mr-1" /> Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="text-center p-4 shadow-md border-0">
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-2xl font-bold text-foreground">{obtainedMarks}/{totalMarks}</p>
                  </Card>
                  <Card className="text-center p-4 shadow-md border-0">
                    <p className="text-sm text-muted-foreground">Percentage</p>
                    <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                  </Card>
                  <Card className="text-center p-4 shadow-md border-0">
                    <p className="text-sm text-muted-foreground">Grade</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Award className="w-5 h-5 text-secondary" />
                      <span className="text-2xl font-bold text-foreground">{overallGrade}</span>
                    </div>
                  </Card>
                  <Card className="text-center p-4 shadow-md border-0">
                    <p className="text-sm text-muted-foreground">Class Rank</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <Trophy className="w-5 h-5 text-secondary" />
                      <span className="text-2xl font-bold text-foreground">#{foundResult.rank || '—'}</span>
                    </div>
                  </Card>
                </div>

                {/* Subject-wise Table */}
                <Card className="shadow-lg border-0">
                  <CardHeader>
                    <CardTitle className="text-lg">Subject-wise Marks</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 md:p-6 md:pt-0">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="font-semibold">Subject</TableHead>
                          <TableHead className="text-center font-semibold">Max Marks</TableHead>
                          <TableHead className="text-center font-semibold">Obtained</TableHead>
                          <TableHead className="text-center font-semibold">Percentage</TableHead>
                          <TableHead className="text-center font-semibold">Grade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {foundResult.subjects.map((sub) => (
                          <TableRow key={sub.subject}>
                            <TableCell className="font-medium">{sub.subject}</TableCell>
                            <TableCell className="text-center">{sub.maxMarks}</TableCell>
                            <TableCell className="text-center font-semibold">{sub.obtained}</TableCell>
                            <TableCell className="text-center">
                              {((sub.obtained / sub.maxMarks) * 100).toFixed(1)}%
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge className={`${getGradeColor(sub.grade)} border-0 font-semibold`}>
                                {sub.grade}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-muted/50 font-bold">
                          <TableCell className="font-bold">Total</TableCell>
                          <TableCell className="text-center font-bold">{totalMarks}</TableCell>
                          <TableCell className="text-center font-bold">{obtainedMarks}</TableCell>
                          <TableCell className="text-center font-bold">{percentage}%</TableCell>
                          <TableCell className="text-center">
                            <Badge className={`${getGradeColor(overallGrade)} border-0 font-bold`}>
                              {overallGrade}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Status */}
                <Card className={`text-center p-6 shadow-lg border-0 ${passed ? "bg-emerald-50 dark:bg-emerald-950/20" : "bg-red-50 dark:bg-red-950/20"}`}>
                  <p className={`text-2xl font-bold font-display ${passed ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"}`}>
                    {passed ? "🎉 PASSED" : "❌ NOT PASSED"}
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Overall Result for {foundResult.exam_type} Examination {foundResult.academic_year}
                  </p>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-16 shadow-lg border-0">
                <CardContent>
                  <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Results Found</h3>
                  <p className="text-muted-foreground">
                    We couldn't find any results matching "<span className="font-medium">{searchQuery}</span>". Please check the roll number or name and try again.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      )}

      {/* Info Section when not searched */}
      {!searched && (
        <section className="py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Quick Lookup</h3>
                <p className="text-muted-foreground text-sm">
                  Enter your roll number or name to instantly find your examination results.
                </p>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Detailed Report</h3>
                <p className="text-muted-foreground text-sm">
                  View subject-wise marks, grades, percentage, and overall rank in class.
                </p>
              </div>
              <div className="p-6">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Printer className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">Print & Download</h3>
                <p className="text-muted-foreground text-sm">
                  Print or download your result card for official records and reference.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
