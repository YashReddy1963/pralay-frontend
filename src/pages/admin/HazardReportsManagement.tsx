import { useState } from "react";
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
import { useAdminLanguage } from "@/contexts/LanguageContext";

const HazardReportsManagement = () => {
  const { t } = useAdminLanguage();
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const reports = [
    {
      id: "HR001",
      type: "Cyclone Warning",
      description: "Strong winds and heavy rainfall expected in coastal areas",
      location: "Chennai, Tamil Nadu",
      coordinates: "13.0827° N, 80.2707° E",
      reporter: "Ravi Kumar",
      reporterType: "Citizen",
      date: "2024-01-15",
      time: "14:30",
      status: "Verified",
      aiClassification: "High Risk",
      hasImage: true,
      hasVideo: false
    },
    {
      id: "HR002", 
      type: "High Tide",
      description: "Unusual high tide causing flooding in low-lying areas",
      location: "Mumbai, Maharashtra",
      coordinates: "19.0760° N, 72.8777° E",
      reporter: "Priya Sharma",
      reporterType: "Official",
      date: "2024-01-15",
      time: "12:15",
      status: "Under Review",
      aiClassification: "Medium Risk",
      hasImage: true,
      hasVideo: true
    },
    {
      id: "HR003",
      type: "Tsunami Alert",
      description: "Earthquake-triggered tsunami warning for coastal regions",
      location: "Visakhapatnam, Andhra Pradesh",
      coordinates: "17.6868° N, 83.2185° E",
      reporter: "AI Detection System",
      reporterType: "AI",
      date: "2024-01-15",
      time: "09:45",
      status: "Escalated",
      aiClassification: "Critical",
      hasImage: false,
      hasVideo: false
    },
    {
      id: "HR004",
      type: "Oil Spill",
      description: "Suspected oil spill observed near fishing area",
      location: "Kochi, Kerala",
      coordinates: "9.9312° N, 76.2673° E",
      reporter: "Suresh Nair",
      reporterType: "Citizen",
      date: "2024-01-14",
      time: "16:20",
      status: "Suspicious",
      aiClassification: "Low Risk",
      hasImage: true,
      hasVideo: false
    }
  ];

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
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
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
    </div>
  );
};

export default HazardReportsManagement;