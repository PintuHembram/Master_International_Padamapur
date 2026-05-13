import {
  LayoutDashboard, Users, GraduationCap, ClipboardCheck, Wallet, FileText,
  UserCog, Bus, BookOpen, Building2, Heart, Bell, BarChart3, Shield, Settings,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";

const groups: { label: string; items: { title: string; url: string; icon: any }[] }[] = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/erp", icon: LayoutDashboard },
    ],
  },
  {
    label: "Academics",
    items: [
      { title: "Students", url: "/erp/students", icon: Users },
      { title: "Admissions", url: "/erp/admissions", icon: GraduationCap },
      { title: "Attendance", url: "/erp/attendance", icon: ClipboardCheck },
      { title: "Exams & Results", url: "/erp/exams", icon: FileText },
    ],
  },
  {
    label: "Finance",
    items: [
      { title: "Fees & Payments", url: "/erp/fees", icon: Wallet },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Staff & Payroll", url: "/erp/staff", icon: UserCog },
      { title: "Hostel", url: "/erp/hostel", icon: Building2 },
      { title: "Transport", url: "/erp/transport", icon: Bus },
      { title: "Library", url: "/erp/library", icon: BookOpen },
    ],
  },
  {
    label: "Engagement",
    items: [
      { title: "Parent Portal", url: "/erp/parents", icon: Heart },
      { title: "Notifications", url: "/erp/notifications", icon: Bell },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Reports & Analytics", url: "/erp/reports", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Security & Audit", url: "/erp/security", icon: Shield },
      { title: "Settings", url: "/erp/settings", icon: Settings },
    ],
  },
];

export function ErpSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { pathname } = useLocation();
  const isActive = (url: string) =>
    url === "/erp" ? pathname === "/erp" : pathname === url || pathname.startsWith(url + "/");

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarContent className="bg-card">
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            {!collapsed && <SidebarGroupLabel className="text-[11px] uppercase tracking-wider text-muted-foreground">{g.label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((item) => (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive(item.url)}>
                      <NavLink to={item.url} end={item.url === "/erp"} className="flex items-center gap-2">
                        <item.icon className="h-4 w-4 shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
