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
  MapPin, 
  Bell, 
  Camera, 
  Wifi, 
  Trash2, 
  Download,
  Info,
  Shield,
  Sun,
  Moon
} from "lucide-react";
import { useCitizenLanguage } from "@/contexts/LanguageContext";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useCitizenLanguage();
  const [settings, setSettings] = useState({
    language: "en",
    autoLocation: true,
    notifications: true,
    autoSync: true,
    highQualityImages: false,
    offlineReports: true,
    theme: (localStorage.getItem("theme:citizen") as "light" | "dark") || "light",
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    localStorage.setItem("theme:citizen", settings.theme);
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
      description: t("citizen.settings.preferencesSaved"),
    });
  };

  const clearOfflineData = () => {
    // Mock clearing offline data
    toast({
      title: t("citizen.settings.offlineDataCleared"),
      description: t("citizen.settings.offlineDataClearedDesc"),
    });
  };

  const exportData = () => {
    // Mock data export
    toast({
      title: t("citizen.settings.dataExported"),
      description: t("citizen.settings.dataExportedDesc"),
    });
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {settings.theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-primary" />}
            <span>{t("citizen.settings.appearance")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.darkMode")}</Label>
              <p className="text-sm text-muted-foreground">{t("citizen.settings.darkModeDesc")}</p>
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
        <h1 className="text-2xl font-bold text-foreground">{t("citizen.settings.title")}</h1>
        <p className="text-muted-foreground">{t("citizen.settings.subtitle")}</p>
      </div>

      {/* Language Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.language")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t("citizen.settings.displayLanguage")}</Label>
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

      {/* Location Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.location")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.autoLocation")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("citizen.settings.autoLocationDesc")}
              </p>
            </div>
            <Switch
              checked={settings.autoLocation}
              onCheckedChange={(value) => handleSettingChange("autoLocation", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.notifications")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.pushNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("citizen.settings.pushNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={settings.notifications}
              onCheckedChange={(value) => handleSettingChange("notifications", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data & Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Wifi className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.dataSync")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.autoSync")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("citizen.settings.autoSyncDesc")}
              </p>
            </div>
            <Switch
              checked={settings.autoSync}
              onCheckedChange={(value) => handleSettingChange("autoSync", value)}
            />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.highQualityImages")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("citizen.settings.highQualityImagesDesc")}
              </p>
            </div>
            <Switch
              checked={settings.highQualityImages}
              onCheckedChange={(value) => handleSettingChange("highQualityImages", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Media Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Camera className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.media")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("citizen.settings.storePhotosOffline")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("citizen.settings.storePhotosOfflineDesc")}
              </p>
            </div>
            <Switch
              checked={settings.offlineReports}
              onCheckedChange={(value) => handleSettingChange("offlineReports", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trash2 className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.dataManagement")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            variant="outline"
            onClick={exportData}
            className="w-full justify-start"
          >
            <Download className="h-4 w-4 mr-2" />
            {t("citizen.settings.exportData")}
          </Button>
          
          <Button
            variant="destructive"
            onClick={clearOfflineData}
            className="w-full justify-start"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t("citizen.settings.clearOfflineData")}
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-primary" />
            <span>{t("citizen.settings.about")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("citizen.settings.version")}</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("citizen.settings.build")}</span>
            <span>2024.01.15</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("citizen.settings.storageUsed")}</span>
            <span>12.3 MB</span>
          </div>
          
          <Separator className="my-4" />
          
          <Button variant="ghost" className="w-full justify-start p-0 h-auto">
            <Shield className="h-4 w-4 mr-2" />
            {t("citizen.settings.privacyPolicy")}
          </Button>
          
          <Button variant="ghost" className="w-full justify-start p-0 h-auto">
            <Info className="h-4 w-4 mr-2" />
            {t("citizen.settings.termsOfService")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;