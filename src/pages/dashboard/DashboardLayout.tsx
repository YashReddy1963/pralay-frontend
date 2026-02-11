import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Map, 
  FileText, 
  BarChart3, 
  MessageCircle, 
  Settings, 
  Shield,
  Menu,
  X,
  ArrowLeft,
  Users,
  LogOut
} from "lucide-react";
import { useState } from "react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useOfficialLanguage();
  const { logout, isLoading, user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Filter navigation items based on user role
  const getNavigationItems = () => {
    const baseItems = [
      { path: "/dashboard", icon: Map, label: t("official.hazardMap.title"), exact: true },
      { path: "/dashboard/reports", icon: FileText, label: t("nav.reports"), exact: false },
      { path: "/dashboard/analytics", icon: BarChart3, label: t("nav.analytics"), exact: false },
      { path: "/dashboard/social", icon: MessageCircle, label: t("nav.socialFeed"), exact: false },
      { path: "/dashboard/settings", icon: Settings, label: t("nav.settings"), exact: false },
    ];
    
    // Only show Authority Dashboard for state chairman and above
    if (user?.role === 'state_chairman') {
      baseItems.splice(4, 0, { path: "/dashboard/authority", icon: Users, label: "Authority Dashboard", exact: false });
    }
    
    return baseItems;
  };
  
  const navigationItems = getNavigationItems();

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const handleLogout = () => {
    logout(navigate);
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50
        w-64 bg-gradient-depth transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Shield className="h-8 w-8 text-primary-glow" />
                <div>
                  <h1 className="text-lg font-semibold text-white">{t("official.title")}</h1>
                  <p className="text-xs text-white/70">{t("official.subtitle")}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden text-white hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth
                  ${
                    isActive(item.path, item.exact)
                      ? "bg-primary-glow/20 text-primary-glow border border-primary-glow/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-white/10 space-y-2">
            
            <Button
              variant="ghost"
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              <span className="text-sm">{isLoading ? "Signing Out..." : "Sign Out"}</span>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-foreground">
                  {navigationItems.find(item => isActive(item.path, item.exact))?.label || t("nav.dashboard")}
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage ocean hazard reports
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Card className="px-3 py-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Online</span>
                </div>
              </Card>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;