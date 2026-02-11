import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Bell, 
  Wifi, 
  Trash2, 
  Download,
  Info,
  Shield,
  Sun,
  Moon
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useOfficialLanguage();
  const [settings, setSettings] = useState({
    language: language || "en",
    notifications: true,
    autoSync: true,
    theme: (localStorage.getItem("theme:official") as "light" | "dark") || "light",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    localStorage.setItem("theme:official", settings.theme);
  }, [settings.theme]);

  const languages = [
    { value: "en", label: "English" },
    { value: "hi", label: "हिंदी (Hindi)" },
    { value: "mr", label: "मराठी (Marathi)" },
    { value: "gu", label: "ગુજરાતી (Gujarati)" },
    { value: "ta", label: "தமிழ் (Tamil)" },
    { value: "te", label: "తెలుగు (Telugu)" },
    { value: "be", label: "বাংলা (Bengali)" },
  ];

  const handleSettingChange = (key: string, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    if (key === "language" && typeof value === "string") {
      setLanguage(value);
    }
    toast({
      title: t("common.success"),
      description: "Your preferences have been saved.",
    });
  };

  const exportData = () => {
    toast({
      title: "Data exported",
      description: "Your dashboard data has been downloaded.",
    });
  };

  const clearLocal = () => {
    toast({
      title: "Cleared",
      description: "Local dashboard cache cleared.",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {settings.theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span>{t("official.settings.appearance")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("official.settings.darkMode")}</Label>
              <p className="text-sm text-muted-foreground">{t("official.settings.darkModeDesc")}</p>
            </div>
            <Switch
              checked={settings.theme === "dark"}
              onCheckedChange={(value) => handleSettingChange("theme", value ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{t("official.settings.title")}</h1>
        <p className="text-muted-foreground">{t("official.settings.subtitle")}</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>{t("official.settings.language")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t("official.settings.displayLanguage")}</Label>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                handleSettingChange("language", value);
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>{t("official.settings.notifications")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("official.settings.emailPushNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("official.settings.emailPushNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(value) => handleSettingChange("notifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-primary" />
            <span>{t("official.settings.dataSync")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("official.settings.autoSync")}</Label>
              <p className="text-sm text-muted-foreground">{t("official.settings.autoSyncDesc")}</p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(value) => handleSettingChange("autoSync", value)}
            />
          </div>

          <Separator />

          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              {t("official.settings.exportData")}
            </Button>
            <Button variant="destructive" onClick={clearLocal}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t("official.settings.clearLocalCache")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <span>{t("official.settings.about")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("official.settings.version")}</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("official.settings.role")}</span>
            <span>Official</span>
          </div>
          <Separator className="my-2" />
          <Button variant="ghost" className="w-full justify-start p-0 h-auto">
            <Shield className="h-4 w-4 mr-2" />
            Privacy Policy
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;