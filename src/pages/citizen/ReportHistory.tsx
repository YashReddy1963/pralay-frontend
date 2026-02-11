import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Eye,
  Camera,
  RefreshCw
} from "lucide-react";
import { useCitizenLanguage } from "@/contexts/LanguageContext";
import { EnhancedReportDetailsModal } from "@/components/modals/EnhancedReportDetailsModal";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Report {
  id: string;
  report_id: string;
  hazard_type: string;
  hazard_type_display: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
    country: string;
    state: string;
    district: string;
    city: string;
    address: string;
    full_location: string;
  };
  status: "pending" | "verified" | "discarded" | "under_investigation" | "resolved";
  status_display: string;
  is_verified: boolean;
  emergency_level: "low" | "medium" | "high" | "critical";
  reported_by: {
    name: string;
    email: string;
  };
  reviewed_by?: {
    name: string;
    email: string;
  };
  reported_at: string;
  reviewed_at?: string;
  ai_verification_score?: number;
  images_count: number;
  images: Array<{
    id: string;
    image_type: string;
    caption?: string;
    is_verified_by_ai: boolean;
    ai_confidence_score: number;
    uploaded_at: string;
    image_url?: string;
  }>;
}

const ReportHistory = () => {
  const { t } = useCitizenLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Fetch user's reports
  const fetchReports = async () => {
    if (!user) {
      console.log("No user found, cannot fetch reports");
      return;
    }
    
    try {
      setIsLoading(true);
      console.log("Fetching reports for user:", user.email, user.id);
      
      const response = await apiService.getUserReports();
      console.log("API response:", response);
      
      if (response.success) {
        console.log("Reports fetched successfully:", response.reports?.length || 0, "reports");
        setReports(response.reports || []);
        
        if (response.reports?.length === 0) {
          console.log("No reports found for user:", user.email);
        }
      } else {
        console.error("API returned error:", response.message);
        toast.error(response.message || "Failed to fetch your reports");
      }
    } catch (error: any) {
      console.error("Error fetching user reports:", error);
      toast.error(error.message || "Failed to fetch reports");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  // Test email notification
  const testEmailNotification = async () => {
    if (!user?.email) {
      toast.error("User email not available");
      return;
    }

    setIsTestingEmail(true);
    try {
      const response = await apiService.testEmailNotification(user.email);
      if (response.success) {
        toast.success(`Test email sent successfully to ${user.email}`);
      } else {
        toast.error(response.message || "Failed to send test email");
      }
    } catch (error: any) {
      console.error("Error testing email:", error);
      toast.error(error.message || "Failed to send test email");
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Filter reports based on search query
  const filteredReports = reports.filter(report =>
    report.hazard_type_display.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.location.full_location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.report_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case "discarded":
        return <XCircle className="h-3 w-3 text-red-500" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "discarded":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="p-4 pb-20 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{t("citizen.history.title")}</h1>
        <p className="text-muted-foreground">
          {filteredReports.length === 0 ? t("citizen.history.noReports") : `Viewing ${filteredReports.length} reports`}
        </p>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t("citizen.history.searchPlaceholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="shrink-0" onClick={fetchReports} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("citizen.history.totalReports")}</p>
                <p className="text-2xl font-bold">{reports.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("citizen.history.verified")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {reports.filter(r => r.status === "verified").length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("citizen.history.pendingSync")}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {reports.filter(r => r.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold mb-2">Loading your reports...</h3>
              <p className="text-muted-foreground">
                Please wait while we fetch your report history.
              </p>
            </CardContent>
          </Card>
        ) : filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("citizen.history.noReports")}</h3>
              <p className="text-muted-foreground">
                Start by creating your first report to help keep our oceans safe.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.report_id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1">{t(`status.${report.status}`)}</span>
                    </Badge>
                    <span className="text-sm text-muted-foreground">{report.report_id}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedReport(report);
                      setIsModalOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    {t("citizen.history.viewDetails")}
                  </Button>
                </div>

                <div className="space-y-2 mb-3">
                  <h3 className="font-semibold text-lg">{report.hazard_type_display}</h3>
                  <p className="text-muted-foreground text-sm">{report.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{report.location.full_location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(report.reported_at).toLocaleDateString()} at {new Date(report.reported_at).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  {report.images_count > 0 && (
                    <div className="flex items-center space-x-1">
                      <Camera className="h-4 w-4" />
                      <span>{report.images_count} {report.images_count === 1 ? 'image' : 'images'}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Enhanced Report Details Modal */}
      <EnhancedReportDetailsModal
        report={selectedReport}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedReport(null);
        }}
      />
    </div>
  );
};

export default ReportHistory;