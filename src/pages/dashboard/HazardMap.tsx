import { useState, useMemo, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Camera,
  Eye,
  X,
  RefreshCw
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import HazardMapComponent from "@/components/Map/HazardMapComponent";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface HazardImage {
  id: number;
  url: string;
  type: string;
  caption: string;
  is_verified_by_ai: boolean;
  ai_confidence_score?: number;
}

interface HazardReport {
  id: string;
  report_id: string;
  hazard_type: string;
  hazard_type_display: string;
  description: string;
  coordinates: [number, number];
  location: {
    latitude: number;
    longitude: number;
    country: string;
    state: string;
    district: string;
    city: string;
    address?: string;
  };
  status: "verified" | "pending" | "discarded" | "under_investigation" | "resolved";
  status_display: string;
  is_verified: boolean;
  reported_at: string;
  reported_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  images_count: number;
  has_images: boolean;
  images: HazardImage[];
  reviewed_by?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  review_notes?: string;
}

// Mock data for fallback (will be replaced by real data)
const mockReports: HazardReport[] = [];

const hazardTypes = [
  { value: "all", label: "All Hazards" },
  { value: "tsunami", label: "Tsunami Warning" },
  { value: "storm-surge", label: "Storm Surge" },
  { value: "high-waves", label: "High Waves" },
  { value: "flooding", label: "Coastal Flooding" },
  { value: "debris", label: "Marine Debris" },
  { value: "pollution", label: "Water Pollution" },
  { value: "erosion", label: "Coastal Erosion" },
  { value: "wildlife", label: "Marine Wildlife Issue" },
  { value: "other", label: "Other Hazard" },
];

const HazardMap = () => {
  const { t } = useOfficialLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHazardType, setSelectedHazardType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("7d");
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);
  const [locationIndicator, setLocationIndicator] = useState<{
    lat: number;
    lng: number;
    title: string;
    description: string;
  } | null>(null);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle location indicator from navigation state
  useEffect(() => {
    if (location.state?.showLocation) {
      setLocationIndicator(location.state.showLocation);
      // Clear the navigation state after setting the indicator
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Fetch hazard reports for map
  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const filters: any = {
        status: selectedStatus === "all" ? undefined : selectedStatus,
        hazard_type: selectedHazardType === "all" ? undefined : selectedHazardType,
        limit: 100
      };

      const response = await apiService.getMapHazardReports(filters);
      
      if (response.success) {
        setReports(response.reports || []);
        
        // Show district filtering info for district chairmen
        if (user?.role === 'district_chairman' && response.filters_applied?.district_filtered) {
          toast.success(`Showing reports for your district: ${response.user_district || 'Unknown'}`);
        }
      } else {
        setError(response.message || 'Failed to fetch reports');
        setReports([]);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch hazard reports');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports when filters change
  useEffect(() => {
    fetchReports();
  }, [selectedStatus, selectedHazardType, user]);

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch = 
        report.location.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.hazard_type_display.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [reports, searchQuery]);

  const handleReportClick = (report: HazardReport) => {
    setSelectedReport(report);
  };

  const handleRefresh = () => {
    fetchReports();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case "pending":
        return <Clock className="h-3 w-3 text-yellow-500" />;
      case "discarded":
        return <X className="h-3 w-3 text-red-500" />;
      default:
        return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-foreground">{t("official.hazardMap.title")}</h1>
        <p className="text-muted-foreground">{t("official.hazardMap.subtitle")}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("official.hazardMap.totalReports")}</p>
                <p className="text-2xl font-bold">{loading ? "..." : reports.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("official.hazardMap.verified")}</p>
                <p className="text-2xl font-bold text-green-600">
                  {loading ? "..." : reports.filter(r => r.status === "verified").length}
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
                <p className="text-sm font-medium text-muted-foreground">{t("official.hazardMap.pending")}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {loading ? "..." : reports.filter(r => r.status === "pending").length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("official.hazardMap.discarded")}</p>
                <p className="text-2xl font-bold text-red-600">
                  {loading ? "..." : reports.filter(r => r.status === "discarded").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Legend */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-sm font-medium text-muted-foreground">Map Legend:</span>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Verified</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Discarded</span>
            </div>
          </div>
        </CardContent>
      </Card>

      

      {/* Error Message */}
      {error && (
        <Card className="mb-4 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="ml-auto">
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-primary" />
              <span>{t("official.hazardMap.filters")}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleRefresh}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder={t("official.hazardMap.searchLocation")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedHazardType} onValueChange={setSelectedHazardType}>
              <SelectTrigger>
                <SelectValue placeholder={t("official.hazardMap.allHazards")} />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                {hazardTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.value === "all" ? t("official.hazardMap.allHazards") : t(`hazards.${type.value}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t("official.hazardMap.allStatus")} />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                <SelectItem value="all">{t("official.hazardMap.allStatus")}</SelectItem>
                <SelectItem value="verified">{t("status.verified")}</SelectItem>
                <SelectItem value="pending">{t("status.pending")}</SelectItem>
                <SelectItem value="discarded">{t("status.discarded")}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDateRange} onValueChange={setSelectedDateRange}>
              <SelectTrigger>
                <SelectValue placeholder={t("official.hazardMap.dateRange")} />
              </SelectTrigger>
              <SelectContent className="z-[2000]">
                <SelectItem value="1d">{t("official.hazardMap.last24Hours")}</SelectItem>
                <SelectItem value="7d">{t("official.hazardMap.last7Days")}</SelectItem>
                <SelectItem value="30d">{t("official.hazardMap.last30Days")}</SelectItem>
                <SelectItem value="90d">{t("official.hazardMap.last90Days")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Location Indicator Alert */}
      {locationIndicator && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-900">{locationIndicator.title}</h3>
                  <p className="text-sm text-blue-700">{locationIndicator.description}</p>
                  <p className="text-xs text-blue-600">
                    Coordinates: {locationIndicator.lat.toFixed(6)}, {locationIndicator.lng.toFixed(6)}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLocationIndicator(null)}
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Map */}
      <Card className="h-[600px]">
        <CardContent className="p-0 h-full relative">
          <HazardMapComponent 
            reports={filteredReports} 
            onReportClick={handleReportClick}
            locationIndicator={locationIndicator}
          />
        </CardContent>
      </Card>

      {/* Selected Report Details */}
      {selectedReport && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{selectedReport.hazard_type_display}</span>
              <div className="flex items-center space-x-2">
                <Badge variant={selectedReport.status === "verified" ? "default" : selectedReport.status === "pending" ? "secondary" : "destructive"}>
                  {getStatusIcon(selectedReport.status)}
                  <span className="ml-1">{selectedReport.status_display}</span>
                </Badge>
                {selectedReport.has_images && (
                  <Badge variant="outline" className="text-green-600">
                    <Camera className="h-3 w-3 mr-1" />
                    Has Images
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{selectedReport.description}</p>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary" />
                <span>{selectedReport.location.city}, {selectedReport.location.district}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>{new Date(selectedReport.reported_at).toLocaleDateString()} at {new Date(selectedReport.reported_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-primary" />
                <span>Reported by: {selectedReport.reported_by.first_name} {selectedReport.reported_by.last_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                <span>Report ID: {selectedReport.report_id}</span>
              </div>
            </div>
            {selectedReport.has_images && selectedReport.images && selectedReport.images.length > 0 && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Images ({selectedReport.images_count})</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedReport.images.slice(0, 6).map((image) => (
                      <div key={image.id} className="relative group">
                        <img
                          src={image.url}
                          alt={image.caption || `Hazard image ${image.id}`}
                          className="w-full aspect-square object-cover rounded-lg border border-gray-200 hover:border-blue-300 transition-colors cursor-pointer"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                  <div class="text-center">
                                    <Camera class="h-6 w-6 mx-auto mb-1" />
                                    <p class="text-xs">Image unavailable</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                          onClick={() => {
                            // Open image in new tab
                            window.open(image.url, '_blank');
                          }}
                        />
                        {image.caption && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            {image.caption}
                          </div>
                        )}
                        {image.is_verified_by_ai && (
                          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                            AI Verified
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  {selectedReport.images.length > 6 && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Showing first 6 images. Click on any image to view full size.
                    </p>
                  )}
                </div>
              </>
            )}
            {selectedReport.review_notes && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Review Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.review_notes}</p>
                </div>
              </>
            )}
            <Button variant="outline" onClick={() => setSelectedReport(null)}>
              {t("common.close")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HazardMap;