import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CitizenLanguageProvider, OfficialLanguageProvider, AdminLanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AdminRoute, DashboardRoute, CitizenRoute, AuthorityRoute } from "@/components/RoleRoutes";
import { AuthRoute } from "@/components/AuthRoute";
import QRConnectionHandler from "@/components/QRConnectionHandler";
import "./i18n"; // Initialize i18n

// Pages
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

// Authentication
import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";

// Citizen App
import CitizenLayout from "./pages/citizen/CitizenLayout";
import ReportHazard from "./pages/citizen/ReportHazard";
import ReportHistory from "./pages/citizen/ReportHistory";
import CitizenSettings from "./pages/citizen/Settings";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import HazardMap from "./pages/dashboard/HazardMap";
import ReportsPage from "./pages/dashboard/ReportsPage";
import Analytics from "./pages/dashboard/Analytics";
import SocialFeed from "./pages/dashboard/SocialFeed";
import AuthorityDashboard from "./pages/dashboard/AuthorityDashboard";
import OfficialSettings from "./pages/dashboard/Settings";

// Admin Panel
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import OfficialsManagement from "./pages/admin/OfficialsManagement";
import HazardReportsManagement from "./pages/admin/HazardReportsManagement";
import AdminSettings from "./pages/admin/AdminSettings";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <QRConnectionHandler />
        <BrowserRouter>
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Landing />} />
            
            {/* Authentication Routes */}
            <Route path="/signup" element={<AuthRoute><SignUp /></AuthRoute>} />
            <Route path="/signin" element={<AuthRoute><SignIn /></AuthRoute>} />
            
            {/* Citizen App Routes */}
            <Route path="/citizen" element={
              <CitizenRoute>
                <CitizenLanguageProvider>
                  <CitizenLayout />
                </CitizenLanguageProvider>
              </CitizenRoute>
            }>
              <Route index element={<ReportHazard />} />
              <Route path="history" element={<ReportHistory />} />
              <Route path="settings" element={<CitizenSettings />} />
            </Route>
            
            {/* Official Dashboard Routes */}
            <Route path="/dashboard" element={
              <DashboardRoute>
                <OfficialLanguageProvider>
                  <DashboardLayout />
                </OfficialLanguageProvider>
              </DashboardRoute>
            }>
              <Route index element={<HazardMap />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="social" element={<SocialFeed />} />
              <Route path="authority" element={
                <AuthorityRoute>
                  <AuthorityDashboard />
                </AuthorityRoute>
              } />
              <Route path="settings" element={<OfficialSettings />} />
            </Route>
            
            {/* Admin Panel Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminLanguageProvider>
                  <AdminLayout />
                </AdminLanguageProvider>
              </AdminRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="officials" element={<OfficialsManagement />} />
              <Route path="reports" element={<HazardReportsManagement />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;