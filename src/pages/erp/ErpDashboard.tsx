import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Users, Wallet, ClipboardCheck, Building2, GraduationCap, FileText } from "lucide-react";
import { Link } from "react-router-dom";

type Stats = { students: number; applications: number; feesTotal: number; results: number };

export default function ErpDashboard() {
  const [stats, setStats] = useState<Stats>({ students: 0, applications: 0, feesTotal: 0, results: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [s, a, f, r] = await Promise.all([
        supabase.from("students").select("*", { count: "exact", head: true }),
        supabase.from("admission_applications").select("*", { count: "exact", head: true }),
        supabase.from("fee_payments").select("amount"),
        supabase.from("student_results").select("*", { count: "exact", head: true }),
      ]);
      const feesTotal = (f.data || []).reduce((sum, r: any) => sum + Number(r.amount || 0), 0);
      setStats({
        students: s.count || 0,
        applications: a.count || 0,
        feesTotal,
        results: r.count || 0,
      });
      setLoading(false);
    })();
  }, []);

  const kpis = [
    { label: "Total Students", value: stats.students, icon: Users, color: "text-blue-600", to: "/erp/students" },
    { label: "Admission Applications", value: stats.applications, icon: GraduationCap, color: "text-emerald-600", to: "/erp/admissions" },
    { label: "Fees Collected (₹)", value: stats.feesTotal.toLocaleString("en-IN"), icon: Wallet, color: "text-amber-600", to: "/erp/fees" },
    { label: "Result Records", value: stats.results, icon: FileText, color: "text-purple-600", to: "/erp/exams" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">School Dashboard</h2>
        <p className="text-sm text-muted-foreground">Real-time overview of your institution</p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Link key={k.label} to={k.to}>
            <Card className="p-4 hover:shadow-md transition cursor-pointer">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{k.label}</p>
                  <p className="text-2xl font-bold mt-1">{loading ? "—" : k.value}</p>
                </div>
                <k.icon className={`h-8 w-8 ${k.color} opacity-70`} />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><ClipboardCheck className="h-4 w-4" /> Today's Quick Actions</h3>
          <div className="space-y-2 text-sm">
            <Link to="/erp/attendance" className="block p-2 rounded hover:bg-muted">→ Mark today's attendance</Link>
            <Link to="/erp/fees" className="block p-2 rounded hover:bg-muted">→ Record fee payment</Link>
            <Link to="/erp/admissions" className="block p-2 rounded hover:bg-muted">→ Review admission applications</Link>
            <Link to="/erp/notifications" className="block p-2 rounded hover:bg-muted">→ Send notification to parents</Link>
          </div>
        </Card>
        <Card className="p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" /> System Modules</h3>
          <p className="text-sm text-muted-foreground mb-3">15 modules available. Use the sidebar to navigate.</p>
          <ul className="text-sm grid grid-cols-2 gap-1 text-muted-foreground">
            <li>• Student Management</li><li>• Admissions</li>
            <li>• Attendance</li><li>• Exams & Results</li>
            <li>• Fees & Payments</li><li>• Staff & Payroll</li>
            <li>• Hostel</li><li>• Transport</li>
            <li>• Library</li><li>• Parent Portal</li>
            <li>• Notifications</li><li>• Reports</li>
            <li>• Security & Audit</li><li>• Settings</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
