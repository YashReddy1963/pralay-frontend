import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Globe, 
  Palette, 
  Shield, 
  Bell, 
  Database,
  Mail,
  Save,
  RefreshCw,
  AlertTriangle,
  Users,
  Share2,
  Moon,
  Sun
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/LanguageContext";

const AdminSettings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useAdminLanguage();
  const [settings, setSettings] = useState({
    defaultLanguage: "en",
    theme: (localStorage.getItem("theme:admin") as string) || "light",
    verificationStrictness: "medium",
    autoEscalation: true,
    emailNotifications: true,
    smsAlerts: false,
    socialMediaIntegration: true,
    autoBackup: true,
    dataRetentionDays: "90",
    maxReportsPerUser: "10",
  });

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
  };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    localStorage.setItem("theme:admin", settings.theme);
  }, [settings.theme]);

  const saveSettings = () => {
    toast({
      title: t("admin.settings.settingsSaved"),
      description: t("admin.settings.settingsSavedDesc"),
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.settings.title")}</h1>
          <p className="text-muted-foreground">{t("admin.settings.subtitle")}</p>
        </div>
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
{t("common.save")} {t("common.all")} {t("common.changes")}
        </Button>
      </div>

      {/* Language & Localization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.language")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.settings.defaultLanguage")}</Label>
            <Select
              value={language}
              onValueChange={(value) => {
                setLanguage(value);
                handleSettingChange("defaultLanguage", value);
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
            <p className="text-sm text-muted-foreground">
              Sets the default language for new users and system messages
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.appearance")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.settings.defaultTheme")}</Label>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {settings.theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span>{settings.theme === "dark" ? t("admin.settings.darkTheme") : t("admin.settings.lightTheme")}</span>
              </div>
              <Switch
                checked={settings.theme === "dark"}
                onCheckedChange={(v) => handleSettingChange("theme", v ? "dark" : "light")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification & Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.verificationSecurity")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.settings.verificationStrictness")}</Label>
            <Select
              value={settings.verificationStrictness}
              onValueChange={(value) => handleSettingChange("verificationStrictness", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">{t("admin.settings.verificationLow")}</SelectItem>
                <SelectItem value="medium">{t("admin.settings.verificationMedium")}</SelectItem>
                <SelectItem value="high">{t("admin.settings.verificationHigh")}</SelectItem>
                <SelectItem value="strict">{t("admin.settings.verificationStrict")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.autoEscalation")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.autoEscalationDesc")}
              </p>
            </div>
            <Switch
              checked={settings.autoEscalation}
              onCheckedChange={(value) => handleSettingChange("autoEscalation", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.notifications")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.emailNotifications")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.emailNotificationsDesc")}
              </p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(value) => handleSettingChange("emailNotifications", value)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.smsAlerts")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.smsAlertsDesc")}
              </p>
            </div>
            <Switch
              checked={settings.smsAlerts}
              onCheckedChange={(value) => handleSettingChange("smsAlerts", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Integrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Share2 className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.integrations")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.socialMediaIntegration")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.socialMediaIntegrationDesc")}
              </p>
            </div>
            <Switch
              checked={settings.socialMediaIntegration}
              onCheckedChange={(value) => handleSettingChange("socialMediaIntegration", value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.dataManagement")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.autoBackup")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.autoBackupDesc")}
              </p>
            </div>
            <Switch
              checked={settings.autoBackup}
              onCheckedChange={(value) => handleSettingChange("autoBackup", value)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>{t("admin.settings.dataRetentionPeriod")}</Label>
            <Input
              type="number"
              value={settings.dataRetentionDays}
              onChange={(e) => handleSettingChange("dataRetentionDays", e.target.value)}
              placeholder="90"
            />
            <p className="text-sm text-muted-foreground">
              {t("admin.settings.dataRetentionPeriodDesc")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Limits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-primary" />
            <span>{t("admin.settings.userLimits")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("admin.settings.maxReportsPerUser")}</Label>
            <Input
              type="number"
              value={settings.maxReportsPerUser}
              onChange={(e) => handleSettingChange("maxReportsPerUser", e.target.value)}
              placeholder="10"
            />
            <p className="text-sm text-muted-foreground">
              Prevent spam by limiting daily report submissions per user
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span>{t("admin.settings.dangerZone")}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.resetSettings")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.resetSettingsDesc")}
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              {t("admin.settings.reset")}
            </Button>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>{t("admin.settings.clearAnalyticsData")}</Label>
              <p className="text-sm text-muted-foreground">
                {t("admin.settings.clearAnalyticsDataDesc")}
              </p>
            </div>
            <Button variant="destructive" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              {t("admin.settings.clearData")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
