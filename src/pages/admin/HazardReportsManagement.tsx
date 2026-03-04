import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  MapPin,
  Calendar,
  User,
  Camera
} from "lucide-react";
import { ReportDetailsModal } from "@/components/modals/ReportDetailsModal";
import { useAdminLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";

const HazardReportsManagement = () => {
  const { t } = useAdminLanguage();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const { user } = useAuth();
  const [reports, setReports] = useState<any[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [modalReport, setModalReport] = useState<any | null>(null);

  // Fetch verified, high/critical reports for current month
  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Compute start and end dates for current month (YYYY-MM-DD)
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0,10);
        const end = new Date().toISOString().slice(0,10);

    // Request backend for recent medium emergency_level reports
    // Limit to 10 most recent; we'll also defensively sort on the frontend
    const response = await apiService.getHazardReports({ emergency_level: 'medium', limit: 10, start_date: start, end_date: end, status: 'verified' } as any);

        if (response && response.success) {
          const serverReports = response.reports || [];

          // Normalize images on each server report so UI code can rely on `url`
          const normalizedServerReports = serverReports.map((r: any) => {
            const imgs = r.images || [];
            const normalizedImages = imgs.map((img: any) => ({
              ...img,
              url: img.url || img.image_url || img.image || (img.image_file && (img.image_file.url || img.image_file)) || null,
            }));
            return { ...r, images: normalizedImages, images_count: r.images_count || normalizedImages.length || 0 };
          });

          const mapped = normalizedServerReports.map((r: any) => {
            // Map backend fields to the UI shape expected by this component
            const reportedAt = r.reported_at || r.created_at || r.reportedAt || r.reportedAt;
            const dateObj = reportedAt ? new Date(reportedAt) : null;
            const date = dateObj ? dateObj.toISOString().slice(0,10) : (r.date || '');
            const time = dateObj ? dateObj.toISOString().slice(11,16) : (r.time || '');

            // Determine AI classification / risk label
            let aiClass = '';
            if (r.ai_classification) aiClass = r.ai_classification;
            else if (r.ai_verification_details && r.ai_verification_details.classification) aiClass = r.ai_verification_details.classification;
            else if (r.emergency_level) {
              switch(r.emergency_level.toLowerCase()) {
                case 'critical': aiClass = 'Critical'; break;
                case 'high': aiClass = 'High Risk'; break;
                case 'medium': aiClass = 'Medium Risk'; break;
                case 'low': aiClass = 'Low Risk'; break;
                default: aiClass = r.emergency_level;
              }
            }

            const hasImage = (r.images_count && r.images_count > 0) || (r.images && r.images.length > 0) || false;
            const hasVideo = (r.videos_count && r.videos_count > 0) || (r.videos && r.videos.length > 0) || false;

            const state = r.location?.state || r.state || r.state_name || '';
            const district = r.location?.district || r.district || '';
            const city = r.location?.city || r.city || '';
            const locationStr = [city, district, state].filter(Boolean).join(', ');

            const coords = (r.location && r.location.latitude && r.location.longitude)
              ? `${r.location.latitude}° N, ${r.location.longitude}° E`
              : (r.latitude && r.longitude ? `${r.latitude}°, ${r.longitude}°` : (r.coordinates || ''));

            return {
              id: r.report_id || r.id || r.reportId || r.reportID,
              type: r.hazard_type_display || r.hazard_type || r.type || 'Unknown',
              description: r.description || '',
              location: locationStr,
              coordinates: coords,
              reporter: (r.reported_by && (r.reported_by.name || `${r.reported_by.first_name || ''} ${r.reported_by.last_name || ''}`)) || r.reporter || r.reported_by || 'Unknown',
              reporterType: (r.reported_by && r.reported_by.role) || r.reporter_role || r.reporterType || '',
              date,
              time,
              status: (r.status || 'verified').charAt(0).toUpperCase() + (r.status || 'verified').slice(1),
              aiClassification: aiClass,
              hasImage,
              hasVideo,
              raw: r,
            };
          })
          // Ensure these are medium-level (defensive) and sort by latest reported date
          .filter((rep: any) => {
            const risk = (rep.aiClassification || rep.raw.emergency_level || '').toLowerCase();
            return risk === 'medium' || risk === 'medium risk';
          })
          .sort((a: any, b: any) => {
            const da = new Date(a.raw.reported_at || a.raw.created_at || a.date).getTime() || 0;
            const db = new Date(b.raw.reported_at || b.raw.created_at || b.date).getTime() || 0;
            return db - da; // latest first
          });

          setReports(mapped.slice(0, 10));
        } else {
          console.warn('Failed to fetch hazard reports', response);
          setReports([]);
        }
      } catch (err) {
        console.error('Error fetching hazard reports', err);
        setReports([]);
      }
    };

    fetchReports();
  }, []);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "Verified": return "bg-success/20 text-success";
      case "Under Review": return "bg-warning/20 text-warning";
      case "Escalated": return "bg-destructive/20 text-destructive";
      case "Suspicious": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case "Critical": return "text-destructive";
      case "High Risk": return "text-warning";
      case "Medium Risk": return "text-info";
      case "Low Risk": return "text-success";
      default: return "text-muted-foreground";
    }
  };

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === "all" || report.status.toLowerCase().replace(" ", "-") === filterStatus;
    const typeMatch = filterType === "all" || report.type.toLowerCase().includes(filterType.toLowerCase());
    return statusMatch && typeMatch;
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.reports.title")}</h1>
          <p className="text-muted-foreground">{t("admin.reports.subtitle")}</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search reports by location, type, or reporter..." className="pl-10" />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">{t("admin.reports.verified")}</SelectItem>
                <SelectItem value="under-review">{t("admin.reports.pendingReview")}</SelectItem>
                <SelectItem value="escalated">{t("admin.reports.highPriority")}</SelectItem>
                <SelectItem value="suspicious">Suspicious</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="cyclone">Cyclone</SelectItem>
                <SelectItem value="tsunami">Tsunami</SelectItem>
                <SelectItem value="tide">High Tide</SelectItem>
                <SelectItem value="oil">Oil Spill</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>All Reports ({filteredReports.length})</span>
            <div className="flex space-x-2">
              <Badge variant="outline" className="bg-success/10">
                {reports.filter(r => r.status === "Verified").length} {t("admin.reports.verified")}
              </Badge>
              <Badge variant="outline" className="bg-warning/10">
                {reports.filter(r => r.status === "Under Review").length} Pending
              </Badge>
              <Badge variant="outline" className="bg-destructive/10">
                {reports.filter(r => r.status === "Escalated").length} Escalated
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="bg-muted/30 border-l-4 border-l-primary-glow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold text-foreground text-lg">{report.type}</h3>
                          <Badge className={getStatusColor(report.status)}>
                            {report.status}
                          </Badge>
                          <Badge variant="outline" className={getRiskColor(report.aiClassification)}>
                            {report.aiClassification}
                          </Badge>
                        </div>
                        <span className="text-sm text-muted-foreground font-mono">#{report.id}</span>
                      </div>

                      {/* Description */}
                      <p className="text-foreground">{report.description}</p>

                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{report.location}</p>
                            <p className="text-muted-foreground text-xs">{report.coordinates}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{report.date}</p>
                            <p className="text-muted-foreground text-xs">{report.time}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{report.reporter}</p>
                            <p className="text-muted-foreground text-xs">{report.reporterType}</p>
                          </div>
                        </div>
                      </div>

                      {/* Media Indicators */}
                      <div className="flex items-center space-x-4">
                        {report.hasImage && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <Camera className="h-3 w-3" />
                            <span>Image Available</span>
                          </div>
                        )}
                        {report.hasVideo && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <div className="w-3 h-3 bg-muted-foreground rounded-sm"></div>
                            <span>Video Available</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => { setModalReport(report); setDetailsOpen(true); }}>
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                      {user?.role !== 'admin' && (
                        <>
                          <Button variant="outline" size="sm" className="text-success">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Verify
                          </Button>
                          <Button variant="outline" size="sm" className="text-warning">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            Flag
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No Reports Found</h3>
              <p className="text-muted-foreground">
                No hazard reports match your current filters.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
        {modalReport && (
          <ReportDetailsModal
            report={{
              id: modalReport.id,
              type: modalReport.type,
              location: modalReport.location,
              date: modalReport.date,
              time: modalReport.time,
              status: (modalReport.status || '').toString().toLowerCase(),
              description: modalReport.description,
              images: modalReport.raw?.images || [],
            }}
            isOpen={detailsOpen}
            onClose={() => setDetailsOpen(false)}
          />
        )}
    </div>
  );
};

export default HazardReportsManagement;