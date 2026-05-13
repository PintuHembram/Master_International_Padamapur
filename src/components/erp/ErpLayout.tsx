import { ReactNode, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ErpSidebar } from "./ErpSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut, Bell, Calendar } from "lucide-react";
import { DarkModeToggle } from "@/components/DarkModeToggle";
import { Badge } from "@/components/ui/badge";

export function ErpLayout({ children }: { children?: ReactNode }) {
  const { user, isAdmin, isTeacher, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/admin/login");
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading ERP...</div>;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-GB");
  const timeStr = today.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

  return (
    <SidebarProvider>
      <Helmet><title>School ERP — Master International</title></Helmet>
      <div className="min-h-screen flex w-full bg-muted/30">
        <ErpSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          {/* Government-style blue header */}
          <header className="bg-[hsl(var(--navy))] text-white">
            <div className="px-4 py-3 flex items-center gap-4">
              <SidebarTrigger className="text-white hover:bg-white/10" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold text-secondary">MIS</div>
                <div>
                  <h1 className="text-lg font-bold leading-tight">Master International School</h1>
                  <p className="text-xs text-white/70">Student Database Management System</p>
                </div>
              </div>
              <div className="ml-auto flex items-center gap-4 text-sm">
                <div className="hidden md:flex items-center gap-2 bg-white/10 rounded px-3 py-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{dateStr} • {timeStr}</span>
                </div>
                <button className="hover:bg-white/10 p-2 rounded" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </button>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium leading-tight">{user?.email}</p>
                  <p className="text-xs text-white/70">{isAdmin ? "Admin" : isTeacher ? "Teacher" : "User"}</p>
                </div>
                <DarkModeToggle />
                <Button size="sm" variant="secondary" onClick={async () => { await signOut(); navigate("/admin/login"); }}>
                  <LogOut className="h-4 w-4 mr-1" /> Logout
                </Button>
              </div>
            </div>
            {/* Sub-banner with school meta */}
            <div className="bg-[hsl(var(--navy-dark))] px-4 py-2 text-xs flex flex-wrap items-center gap-x-6 gap-y-1">
              <span><span className="text-white/60">UDISE Code:</span> 21061400252</span>
              <span><span className="text-white/60">Category:</span> Primary with Upper Primary</span>
              <span><span className="text-white/60">Type:</span> Co-educational</span>
              <span className="ml-auto flex items-center gap-2">
                <Badge variant="secondary" className="font-normal">Academic Year 2025-26</Badge>
              </span>
            </div>
          </header>

          <main className="flex-1 p-4 lg:p-6 overflow-x-hidden">
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
