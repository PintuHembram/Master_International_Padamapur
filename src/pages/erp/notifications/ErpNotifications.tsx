import { useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  Bell, Mail, MessageSquare, Smartphone, Send, Plus, Download, Upload,
  TrendingUp, TrendingDown, Clock, CheckCircle2, XCircle, AlertTriangle,
  Calendar, Users, Eye, Edit, RefreshCw, Trash2, Search, Filter, FileText,
  Megaphone, PartyPopper, Trophy, FlaskConical, Sparkles, ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { toast } from "sonner";

// ============== Mock data (UI-only phase) ==============
const sparkSms = [12, 19, 14, 22, 30, 26, 34].map((v, i) => ({ d: i, v }));
const sparkEmail = [20, 25, 30, 28, 35, 40, 38].map((v, i) => ({ d: i, v }));
const sparkWa = [5, 12, 18, 22, 30, 28, 35].map((v, i) => ({ d: i, v }));
const sparkPush = [8, 14, 10, 18, 24, 22, 28].map((v, i) => ({ d: i, v }));
const sparkPending = [10, 8, 12, 6, 9, 7, 5].map((v, i) => ({ d: i, v }));
const sparkTotal = [50, 70, 80, 95, 120, 140, 165].map((v, i) => ({ d: i, v }));

const deliveryTrend = [
  { day: "Mon", sms: 120, email: 230, wa: 90, push: 60 },
  { day: "Tue", sms: 140, email: 260, wa: 110, push: 75 },
  { day: "Wed", sms: 95, email: 200, wa: 130, push: 80 },
  { day: "Thu", sms: 165, email: 280, wa: 150, push: 95 },
  { day: "Fri", sms: 190, email: 310, wa: 175, push: 120 },
  { day: "Sat", sms: 70, email: 150, wa: 90, push: 55 },
  { day: "Sun", sms: 40, email: 90, wa: 55, push: 30 },
];

const channelMix = [
  { name: "SMS", value: 820, color: "hsl(var(--primary))" },
  { name: "Email", value: 1520, color: "hsl(217 91% 60%)" },
  { name: "WhatsApp", value: 800, color: "hsl(142 76% 45%)" },
  { name: "Push", value: 515, color: "hsl(38 92% 55%)" },
];

const announcements = [
  { id: 1, title: "Winter Vacation Notice", category: "Holiday", date: "2026-06-12", priority: "Important", author: "Principal", icon: Calendar, color: "text-blue-600" },
  { id: 2, title: "Half-Yearly Exam Schedule Released", category: "Exam", date: "2026-06-10", priority: "High Priority", author: "Exam Cell", icon: FileText, color: "text-violet-600" },
  { id: 3, title: "Class X Results Published", category: "Result", date: "2026-06-09", priority: "Important", author: "Exam Cell", icon: Trophy, color: "text-emerald-600" },
  { id: 4, title: "Parent-Teacher Meeting on 22nd", category: "PTM", date: "2026-06-08", priority: "Normal", author: "Admin", icon: Users, color: "text-amber-600" },
  { id: 5, title: "Heavy Rain — Early Dispersal Today", category: "Emergency", date: "2026-06-07", priority: "Emergency", author: "Principal", icon: AlertTriangle, color: "text-rose-600" },
  { id: 6, title: "Annual Day Celebration Invitation", category: "Event", date: "2026-06-05", priority: "Normal", author: "Events Cell", icon: PartyPopper, color: "text-pink-600" },
];

const events = [
  { id: 1, title: "Annual Function 2026", date: "2026-07-20", desc: "Grand celebration with cultural performances by students across all grades." },
  { id: 2, title: "Inter-School Sports Day", date: "2026-07-05", desc: "Athletics, kabaddi, kho-kho, football & cricket tournaments." },
  { id: 3, title: "Science Exhibition", date: "2026-06-28", desc: "Working models, robotics demos and innovation showcase by Class VI–XII." },
  { id: 4, title: "Parent Teacher Meeting", date: "2026-06-22", desc: "Term-1 progress review across all sections. Slot booking via Parent Portal." },
  { id: 5, title: "Holiday Calendar 2026-27", date: "2026-06-15", desc: "Full year calendar with gazetted, restricted and school holidays." },
];

const scheduled = [
  { id: "SCH-101", title: "Fee Reminder — June Cycle", when: "2026-06-18 09:00", recipients: 482, channel: "SMS + WhatsApp" },
  { id: "SCH-102", title: "PTM Slot Confirmation", when: "2026-06-21 17:30", recipients: 1240, channel: "Email + Push" },
  { id: "SCH-103", title: "Exam Hall Ticket Reminder", when: "2026-06-25 08:00", recipients: 856, channel: "SMS + Email" },
];

type HistoryRow = {
  id: string; title: string; category: string; audience: string;
  method: string; date: string; status: "Delivered" | "Scheduled" | "Failed" | "Draft";
};
const seedHistory: HistoryRow[] = [
  { id: "NTF-2041", title: "Half-Yearly Exam Schedule", category: "Exam", audience: "All Students", method: "SMS, Email", date: "2026-06-12 10:24", status: "Delivered" },
  { id: "NTF-2040", title: "Fee Due Reminder — May", category: "Fees", audience: "Parents", method: "WhatsApp", date: "2026-06-11 18:02", status: "Delivered" },
  { id: "NTF-2039", title: "Early Dispersal Notice", category: "Emergency", audience: "All Students, Parents", method: "SMS, Push", date: "2026-06-11 12:45", status: "Delivered" },
  { id: "NTF-2038", title: "PTM Reschedule (Class VIII)", category: "PTM", audience: "Specific Class — VIII", method: "Email", date: "2026-06-10 16:10", status: "Failed" },
  { id: "NTF-2037", title: "Library Book Return Reminder", category: "Library", audience: "Hostel Students", method: "Push", date: "2026-06-10 09:00", status: "Delivered" },
  { id: "NTF-2036", title: "Sports Day Registration Open", category: "Event", audience: "All Students", method: "Email, WhatsApp", date: "2026-06-09 11:30", status: "Delivered" },
  { id: "NTF-2035", title: "Bus Route Change — Route 7", category: "Transport", audience: "Parents", method: "SMS", date: "2026-06-09 07:50", status: "Delivered" },
  { id: "NTF-2034", title: "Result Publication Notice", category: "Result", audience: "Parents, Students", method: "Email, Push", date: "2026-06-15 08:00", status: "Scheduled" },
  { id: "NTF-2033", title: "Holiday Calendar 2026-27", category: "Holiday", audience: "Staff", method: "Email", date: "2026-06-08 14:00", status: "Draft" },
];

const activity = [
  { icon: MessageSquare, color: "text-emerald-600", text: "SMS delivered to 482 parents — Fee Reminder", time: "2m ago" },
  { icon: Mail, color: "text-blue-600", text: "Email blast sent — Half-Yearly Exam Schedule", time: "18m ago" },
  { icon: MessageSquare, color: "text-green-600", text: "WhatsApp template approved & dispatched (1,240)", time: "1h ago" },
  { icon: AlertTriangle, color: "text-rose-600", text: "Emergency alert generated by Principal", time: "3h ago" },
  { icon: Megaphone, color: "text-violet-600", text: "Annual Function announcement published", time: "5h ago" },
];

const priorityClass = (p: string) => {
  switch (p) {
    case "Emergency": return "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300";
    case "High Priority": return "bg-amber-500/15 text-amber-700 border-amber-500/30 dark:text-amber-300";
    case "Important": return "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300";
    default: return "bg-muted text-muted-foreground border-border";
  }
};
const statusClass = (s: string) => {
  switch (s) {
    case "Delivered": return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-300";
    case "Scheduled": return "bg-blue-500/15 text-blue-700 border-blue-500/30 dark:text-blue-300";
    case "Failed": return "bg-rose-500/15 text-rose-700 border-rose-500/30 dark:text-rose-300";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

// ============== Reusable Stat Card ==============
function StatCard({
  title, value, growth, up, accent, icon: Icon, spark,
}: { title: string; value: string; growth: string; up: boolean; accent: string; icon: any; spark: { d: number; v: number }[] }) {
  return (
    <Card className={`relative overflow-hidden border-l-4 ${accent} transition-all hover:shadow-lg hover:-translate-y-0.5`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>
            <div className="mt-1 flex items-center gap-1 text-xs">
              {up ? <TrendingUp className="h-3.5 w-3.5 text-emerald-600" /> : <TrendingDown className="h-3.5 w-3.5 text-rose-600" />}
              <span className={up ? "text-emerald-600" : "text-rose-600"}>{growth}</span>
              <span className="text-muted-foreground">vs last week</span>
            </div>
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
        </div>
        <div className="mt-3 h-12">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={spark}>
              <defs>
                <linearGradient id={`g-${title}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" fill={`url(#g-${title})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// ============== Main Page ==============
export default function ErpNotifications() {
  const [history, setHistory] = useState<HistoryRow[]>(seedHistory);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [methodFilter, setMethodFilter] = useState<string>("all");
  const [composerOpen, setComposerOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [viewing, setViewing] = useState<HistoryRow | null>(null);

  const filtered = useMemo(() => {
    return history.filter((r) => {
      const matchesQ = !search || `${r.id} ${r.title} ${r.audience}`.toLowerCase().includes(search.toLowerCase());
      const matchesS = statusFilter === "all" || r.status === statusFilter;
      const matchesM = methodFilter === "all" || r.method.toLowerCase().includes(methodFilter.toLowerCase());
      return matchesQ && matchesS && matchesM;
    });
  }, [history, search, statusFilter, methodFilter]);

  const exportCsv = () => {
    const header = "ID,Title,Category,Audience,Method,Date,Status\n";
    const body = filtered.map((r) => [r.id, r.title, r.category, r.audience, r.method, r.date, r.status].map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `notifications-${Date.now()}.csv`;
    a.click();
    toast.success("Logs exported");
  };

  const handleSend = (mode: "now" | "draft" | "schedule") => {
    const id = `NTF-${2042 + history.length}`;
    const row: HistoryRow = {
      id, title: "New Notification", category: "General", audience: "All Students",
      method: "SMS, Email", date: new Date().toISOString().slice(0, 16).replace("T", " "),
      status: mode === "now" ? "Delivered" : mode === "schedule" ? "Scheduled" : "Draft",
    };
    setHistory([row, ...history]);
    setComposerOpen(false);
    toast.success(mode === "now" ? "Notification sent" : mode === "schedule" ? "Scheduled" : "Saved as draft");
  };

  return (
    <div className="space-y-6 p-1">
      <Helmet>
        <title>Notifications & Announcements — School ERP</title>
        <meta name="description" content="Send SMS, Email, WhatsApp and Push notifications. Manage school announcements, events and delivery analytics." />
      </Helmet>

      {/* Header */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>ERP</span><span>/</span><span className="text-foreground">Notifications</span>
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight md:text-3xl">Notifications</h1>
          <p className="text-sm text-muted-foreground">Latest Updates, News & Events — SMS · Email · WhatsApp · Push</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />Export Logs</Button>
          <Button variant="outline" onClick={() => setBulkOpen(true)}><Send className="mr-2 h-4 w-4" />Send Bulk Message</Button>
          <Button onClick={() => setComposerOpen(true)}><Plus className="mr-2 h-4 w-4" />Create Notification</Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard title="Total Notifications" value="3,655" growth="+18.2%" up accent="border-l-primary" icon={Bell} spark={sparkTotal} />
        <StatCard title="SMS Sent" value="820" growth="+12.4%" up accent="border-l-violet-500" icon={MessageSquare} spark={sparkSms} />
        <StatCard title="Email Delivered" value="1,520" growth="+9.7%" up accent="border-l-blue-500" icon={Mail} spark={sparkEmail} />
        <StatCard title="WhatsApp Messages" value="800" growth="+24.0%" up accent="border-l-emerald-500" icon={MessageSquare} spark={sparkWa} />
        <StatCard title="Push Notifications" value="515" growth="+6.1%" up accent="border-l-amber-500" icon={Smartphone} spark={sparkPush} />
        <StatCard title="Pending Messages" value="42" growth="-15.3%" up={false} accent="border-l-rose-500" icon={Clock} spark={sparkPending} />
      </div>

      {/* Communication Channels */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { name: "SMS Gateway", icon: MessageSquare, color: "from-violet-500/15 to-violet-500/0 text-violet-600", stats: [["Delivery Status", "98.2%"], ["Failed", "14"], ["Credits", "12,480"]] },
          { name: "Email Service", icon: Mail, color: "from-blue-500/15 to-blue-500/0 text-blue-600", stats: [["Sent", "1,520"], ["Delivery", "99.1%"], ["Open Rate", "62%"]] },
          { name: "WhatsApp API", icon: MessageSquare, color: "from-emerald-500/15 to-emerald-500/0 text-emerald-600", stats: [["Sent", "800"], ["Read", "78%"], ["Templates", "12 active"]] },
          { name: "Push Notifications", icon: Smartphone, color: "from-amber-500/15 to-amber-500/0 text-amber-600", stats: [["Devices", "2,140"], ["Delivery", "96.4%"], ["Click Rate", "31%"]] },
        ].map((c) => (
          <Card key={c.name} className="overflow-hidden transition-all hover:shadow-md">
            <div className={`bg-gradient-to-br ${c.color} p-4 flex items-center justify-between`}>
              <div className="flex items-center gap-2 font-semibold"><c.icon className="h-5 w-5" />{c.name}</div>
              <Badge variant="outline" className="bg-background/60">Live</Badge>
            </div>
            <CardContent className="grid grid-cols-3 gap-2 p-4">
              {c.stats.map(([k, v]) => (
                <div key={k} className="rounded-md border p-2 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</p>
                  <p className="mt-1 text-sm font-semibold">{v}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Two-column: announcements + composer-trigger card */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Latest Announcements</CardTitle>
              <CardDescription>Holiday, exam, results, PTM, events & emergency alerts</CardDescription>
            </div>
            <Button variant="ghost" size="sm">View all</Button>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            {announcements.map((a) => (
              <div key={a.id} className="group rounded-xl border bg-card p-4 transition-all hover:shadow-md hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div className={`rounded-lg bg-muted p-2 ${a.color}`}><a.icon className="h-4 w-4" /></div>
                  <Badge variant="outline" className={priorityClass(a.priority)}>{a.priority}</Badge>
                </div>
                <h3 className="mt-3 font-semibold leading-tight">{a.title}</h3>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                  <span>•</span><span>{a.date}</span><span>•</span><span>{a.author}</span>
                </div>
                <div className="mt-3 flex justify-end">
                  <Button variant="ghost" size="sm">View details <Eye className="ml-1 h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Quick Composer</CardTitle>
            <CardDescription>Send across channels in seconds</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input placeholder="Notification title" />
            <Textarea placeholder="Write your message…" rows={4} />
            <div className="grid grid-cols-2 gap-2 text-sm">
              {["SMS", "Email", "WhatsApp", "Push"].map((m) => (
                <label key={m} className="flex items-center gap-2 rounded-md border p-2">
                  <Checkbox defaultChecked={m !== "Push"} /> {m}
                </label>
              ))}
            </div>
            <Select defaultValue="all">
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Students</SelectItem>
                <SelectItem value="parents">Parents</SelectItem>
                <SelectItem value="teachers">Teachers</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="hostel">Hostel Students</SelectItem>
                <SelectItem value="class">Specific Class</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => handleSend("draft")}>Draft</Button>
              <Button className="flex-1" onClick={() => handleSend("now")}><Send className="mr-1 h-3.5 w-3.5" />Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Delivery Analytics (Last 7 days)</CardTitle>
            <CardDescription>Cross-channel volume trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={deliveryTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                  <Legend />
                  <Area type="monotone" dataKey="sms" stackId="1" stroke="hsl(262 83% 58%)" fill="hsl(262 83% 58% / 0.35)" />
                  <Area type="monotone" dataKey="email" stackId="1" stroke="hsl(217 91% 60%)" fill="hsl(217 91% 60% / 0.35)" />
                  <Area type="monotone" dataKey="wa" stackId="1" stroke="hsl(142 76% 45%)" fill="hsl(142 76% 45% / 0.35)" />
                  <Area type="monotone" dataKey="push" stackId="1" stroke="hsl(38 92% 55%)" fill="hsl(38 92% 55% / 0.35)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Total Reach</p><p className="text-lg font-bold">42,180</p></div>
              <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Delivery Success</p><p className="text-lg font-bold text-emerald-600">98.4%</p></div>
              <div className="rounded-md border p-3"><p className="text-xs text-muted-foreground">Failed Deliveries</p><p className="text-lg font-bold text-rose-600">142</p></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Channel Mix</CardTitle>
            <CardDescription>Distribution this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-60">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={channelMix} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={3}>
                    {channelMix.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5">
              {channelMix.map((c) => (
                <div key={c.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />{c.name}</span>
                  <span className="font-semibold">{c.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timeline + Scheduled */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Live communication log</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="relative space-y-5 border-l border-border pl-6">
              {activity.map((a, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[34px] grid h-7 w-7 place-items-center rounded-full border bg-card ${a.color}`}>
                    <a.icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="rounded-md border bg-card p-3">
                    <p className="text-sm">{a.text}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{a.time}</p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Scheduled</CardTitle>
              <CardDescription>Upcoming dispatches</CardDescription>
            </div>
            <Badge variant="outline"><Clock className="mr-1 h-3 w-3" />{scheduled.length}</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {scheduled.map((s) => (
              <div key={s.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{s.title}</p>
                  <Badge variant="secondary" className="text-[10px]">{s.id}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.when} • {s.recipients.toLocaleString()} recipients</p>
                <p className="mt-1 text-xs">{s.channel}</p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs"><Edit className="mr-1 h-3 w-3" />Edit</Button>
                  <Button size="sm" variant="ghost" className="h-7 px-2 text-xs text-rose-600 hover:text-rose-700"><XCircle className="mr-1 h-3 w-3" />Cancel</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Message History</CardTitle>
              <CardDescription>All sent, scheduled, drafted and failed notifications</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search…" className="w-56 pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36"><Filter className="mr-1 h-3.5 w-3.5" /><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
              <Select value={methodFilter} onValueChange={setMethodFilter}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Channel" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All channels</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="push">Push</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={exportCsv}><Download className="mr-2 h-4 w-4" />CSV</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Channels</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="h-32 text-center text-muted-foreground">No notifications match your filters.</TableCell></TableRow>
                ) : filtered.map((r) => (
                  <TableRow key={r.id} className="hover:bg-muted/40">
                    <TableCell className="font-mono text-xs">{r.id}</TableCell>
                    <TableCell className="font-medium">{r.title}</TableCell>
                    <TableCell><Badge variant="secondary" className="text-[10px]">{r.category}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.audience}</TableCell>
                    <TableCell className="text-xs">{r.method}</TableCell>
                    <TableCell className="text-xs">{r.date}</TableCell>
                    <TableCell><Badge variant="outline" className={statusClass(r.status)}>{r.status}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setViewing(r)}><Eye className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7"><Edit className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => toast.success("Resent")}><RefreshCw className="h-3.5 w-3.5" /></Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-rose-600 hover:text-rose-700" onClick={() => { setHistory(history.filter((x) => x.id !== r.id)); toast.success("Deleted"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Showing {filtered.length} of {history.length}</span>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="h-7">Previous</Button>
              <Button size="sm" variant="outline" className="h-7">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News & Events */}
      <Card>
        <CardHeader>
          <CardTitle>News & Events</CardTitle>
          <CardDescription>Upcoming school activities and celebrations</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((e) => (
            <div key={e.id} className="group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md hover:-translate-y-0.5">
              <div className="relative h-32 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent">
                <div className="absolute inset-0 grid place-items-center text-primary/40"><ImageIcon className="h-10 w-10" /></div>
                <Badge className="absolute left-3 top-3 bg-background/80 text-foreground backdrop-blur">{e.date}</Badge>
              </div>
              <div className="p-4">
                <h4 className="font-semibold leading-tight">{e.title}</h4>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.desc}</p>
                <Button variant="ghost" size="sm" className="mt-2 px-0 text-primary">Read more →</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Advanced features placeholders */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" />Upcoming Integrations</CardTitle>
          <CardDescription>Phase-2 wiring — UI scaffolding only</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            "Twilio SMS", "WhatsApp Business API", "Firebase Push", "Email Templates",
            "AI Notification Suggestions", "Multi-language Messages", "Read Receipts", "Auto Reminder System",
          ].map((f) => (
            <div key={f} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span>{f}</span>
              <Badge variant="outline" className="text-[10px]">Coming soon</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex flex-col items-center justify-between gap-2 border-t pt-4 text-xs text-muted-foreground md:flex-row">
        <span>School ERP v1.0 — Notifications Module</span>
        <div className="flex gap-4">
          <a href="/contact" className="hover:text-foreground">Support</a>
          <a href="#" className="hover:text-foreground">Privacy Policy</a>
          <span>© {new Date().getFullYear()} Master International School</span>
        </div>
      </div>

      {/* Composer dialog */}
      <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Notification</DialogTitle>
            <DialogDescription>Compose and dispatch across selected channels</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2"><Label>Title</Label><Input placeholder="e.g. Half-Yearly Exam Schedule" /></div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Category</Label>
                <Select defaultValue="general">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="fees">Fees</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="holiday">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Audience</Label>
                <Select defaultValue="all">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Students</SelectItem>
                    <SelectItem value="parents">Parents</SelectItem>
                    <SelectItem value="teachers">Teachers</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="hostel">Hostel Students</SelectItem>
                    <SelectItem value="class">Specific Class</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2"><Label>Message</Label><Textarea rows={5} placeholder="Type your message…" /></div>
            <div className="grid gap-2">
              <Label>Attachment</Label>
              <div className="flex items-center gap-2 rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <Upload className="h-4 w-4" /> Drop file here or <button className="text-primary hover:underline">browse</button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Communication Methods</Label>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {["SMS", "Email", "WhatsApp", "Push"].map((m) => (
                  <label key={m} className="flex items-center gap-2 rounded-md border p-2 text-sm">
                    <Checkbox defaultChecked /> {m}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button variant="ghost" onClick={() => handleSend("draft")}>Save Draft</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="outline" onClick={() => handleSend("schedule")}><Calendar className="mr-1 h-4 w-4" />Schedule Later</Button>
            <Button onClick={() => handleSend("now")}><Send className="mr-1 h-4 w-4" />Send Now</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Message</DialogTitle>
            <DialogDescription>Upload a CSV of recipients or pick a saved segment</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-center gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" /> Upload CSV (name, phone, email)
            </div>
            <Textarea rows={4} placeholder="Bulk message body…" />
            <div className="grid grid-cols-4 gap-2">
              {["SMS", "Email", "WhatsApp", "Push"].map((m) => (
                <label key={m} className="flex items-center gap-2 rounded-md border p-2 text-xs"><Checkbox defaultChecked={m !== "Push"} />{m}</label>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Cancel</Button>
            <Button onClick={() => { setBulkOpen(false); toast.success("Bulk message queued"); }}><Send className="mr-1 h-4 w-4" />Dispatch</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View dialog */}
      <Dialog open={!!viewing} onOpenChange={() => setViewing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{viewing?.title}</DialogTitle>
            <DialogDescription>{viewing?.id} · {viewing?.date}</DialogDescription>
          </DialogHeader>
          {viewing && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Category</span><span>{viewing.category}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Audience</span><span>{viewing.audience}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Channels</span><span>{viewing.method}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="outline" className={statusClass(viewing.status)}>{viewing.status}</Badge></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewing(null)}>Close</Button>
            <Button onClick={() => { toast.success("Resent"); setViewing(null); }}><RefreshCw className="mr-1 h-4 w-4" />Resend</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
