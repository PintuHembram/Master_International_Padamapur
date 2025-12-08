import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import Academics from "./pages/Academics";
import AdminLogin from "./pages/AdminLogin";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import Events from "./pages/Events";
import Faculty from "./pages/Faculty";
import Gallery from "./pages/Gallery";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Admin pages
import AdminAdmissionsPage from "./pages/admin/AdminAdmissionsPage";
import AdminEventsPage from "./pages/admin/AdminEventsPage";
import AdminGalleryPage from "./pages/admin/AdminGalleryPage";
import AdminMessagesPage from "./pages/admin/AdminMessagesPage";
import AdminNewsPage from "./pages/admin/AdminNewsPage";
import AdminOverview from "./pages/admin/AdminOverview";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/admissions" element={<Admissions />} />
            <Route path="/academics" element={<Academics />} />
            <Route path="/faculty" element={<Faculty />} />
            <Route path="/gallery" element={<Gallery />} />
            <Route path="/events" element={<Events />} />
            <Route path="/contact" element={<Contact />} />
            
            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminOverview />} />
            <Route path="/admin/admissions" element={<AdminAdmissionsPage />} />
            <Route path="/admin/events" element={<AdminEventsPage />} />
            <Route path="/admin/news" element={<AdminNewsPage />} />
            <Route path="/admin/gallery" element={<AdminGalleryPage />} />
            <Route path="/admin/messages" element={<AdminMessagesPage />} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
