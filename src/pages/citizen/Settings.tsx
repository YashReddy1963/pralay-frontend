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
  const [isPremium, setIsPremium] = useState(false);
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
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("authToken");

        const res = await fetch(
          "https://pralay-backend-1.onrender.com/api/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        setIsPremium(data.is_premium);
      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  const handleBuyPremium = async () => {
    try {
      const token = localStorage.getItem("authToken");

      // STEP 1: Create Order
      const res = await fetch(
        "https://pralay-backend-1.onrender.com/api/create-order/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Pralay Premium",
        description: "Unlock Offline Features",
        order_id: data.order_id,

        handler: async function (response: any) {
          // STEP 2: VERIFY PAYMENT
          const verifyRes = await fetch(
            "https://pralay-backend-1.onrender.com/api/verify-payment/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                order_id: response.razorpay_order_id,
                payment_id: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            }
          );

          const verifyData = await verifyRes.json();

          if (verifyData.status === "success") {
            // 🔥 REFETCH PROFILE FROM BACKEND
            const res = await fetch("/api/profile/", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          
            const data = await res.json();
            setIsPremium(Boolean(data.is_premium));
          
            toast({
              title: "Payment Successful 🎉",
              description: "Premium unlocked!",
            });
          }
        },

        theme: {
          color: "#1e40af",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error(err);
    }
  };

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

      {/* Premium Features */}
      <Card className="border-2 border-yellow-400">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🚀 Premium Features</span>
            {isPremium && <span className="text-green-500 text-sm">Active</span>}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>✅ Offline Report Submission</li>
            <li>✅ Auto Sync when online</li>
            <li>✅ Priority Processing</li>
          </ul>

          {!isPremium && (
            <Button onClick={handleBuyPremium} className="w-full bg-yellow-500 text-white">
              Unlock Premium (₹20)
            </Button>
          )}
        </CardContent>
      </Card>

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