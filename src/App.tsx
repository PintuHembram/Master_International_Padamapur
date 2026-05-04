import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { StudentProtectedRoute } from "@/components/StudentProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import About from "./pages/About";
import AdmitCards from "./pages/AdmitCards";
import Academics from "./pages/Academics";
import AdminAdmissionsDashboard from "./pages/AdminAdmissionsDashboard";
import AdminLogin from "./pages/AdminLogin";
import Admissions from "./pages/Admissions";
import Contact from "./pages/Contact";
import FeePayment from "./pages/FeePayment";
import Events from "./pages/Events";
import Faculty from "./pages/Faculty";
import Gallery from "./pages/Gallery";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentResults from "./pages/StudentResults";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import AdmissionStart from "./pages/admission/AdmissionStart";
import AdmissionApply from "./pages/admission/AdmissionApply";
import { ApplicationProtectedRoute } from "./components/admission/ApplicationProtectedRoute";
import MockTestsAdmin from "./pages/admin/MockTestsAdmin";
import MockTestsList from "./pages/student/MockTestsList";
import MockTestAttempt from "./pages/student/MockTestAttempt";
import MockTestResult from "./pages/student/MockTestResult";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <ThemeProvider>
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
              <Route path="/fee-payment" element={<FeePayment />} />
              <Route path="/results" element={<StudentResults />} />
              <Route path="/admit-cards" element={<AdmitCards />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/student/login" element={<StudentLogin />} />
              <Route path="/student/dashboard" element={<StudentProtectedRoute><StudentDashboard /></StudentProtectedRoute>} />
              <Route path="/admission/start" element={<AdmissionStart />} />
              <Route path="/admission/apply" element={<ApplicationProtectedRoute><AdmissionApply /></ApplicationProtectedRoute>} />
              <Route path="/admin/admissions" element={<ProtectedRoute><AdminAdmissionsDashboard /></ProtectedRoute>} />
              <Route path="/admin/mock-tests" element={<ProtectedRoute><MockTestsAdmin /></ProtectedRoute>} />
              <Route path="/student/mock-tests" element={<StudentProtectedRoute><MockTestsList /></StudentProtectedRoute>} />
              <Route path="/student/mock-tests/:testId/attempt" element={<StudentProtectedRoute><MockTestAttempt /></StudentProtectedRoute>} />
              <Route path="/student/mock-tests/result/:attemptId" element={<StudentProtectedRoute><MockTestResult /></StudentProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </HelmetProvider>
);

export default App;
