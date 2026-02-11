import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, History, Settings, ArrowLeft, LogOut } from "lucide-react";
import { useCitizenLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const CitizenLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useCitizenLanguage();
  const { logout, isLoading } = useAuth();
  
  const navigationItems = [
    { path: "/citizen", icon: FileText, label: t("citizen.reportHazard.title"), exact: true },
    { path: "/citizen/history", icon: History, label: t("nav.history") },
    { path: "/citizen/settings", icon: Settings, label: t("nav.settings") },
  ];

  const isActive = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout(navigate);
    toast.success("Logged out successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-ocean shadow-ocean sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="text-white hover:text-accent transition-smooth">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-xl font-semibold text-white">{t("citizen.title")}</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            disabled={isLoading}
            className="text-white hover:text-accent hover:bg-white/10"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto min-h-[calc(100vh-8rem)]">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <div className="max-w-md mx-auto">
          <div className="flex justify-around py-2">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex-1"
              >
                <Button
                  variant="ghost"
                  className={`w-full h-16 flex flex-col items-center justify-center space-y-1 rounded-none ${
                    isActive(item.path, item.exact)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-primary"
                  } transition-smooth`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default CitizenLayout;