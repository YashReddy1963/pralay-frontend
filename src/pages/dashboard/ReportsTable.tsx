import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  Camera,
  MapPin,
  Clock,
  ArrowUpDown,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDetailsModal } from "@/components/modals/ReportDetailsModal";
import EditReportModal from "@/components/modals/EditReportModal";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { useNavigate } from "react-router-dom";
import { map } from "leaflet"; // Assuming you have a map utility for handling map interactions

const ReportsTable = () => {
  const navigate = useNavigate();
  const { t } = useOfficialLanguage();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<any | null>(null);

  // Reports fetched from backend (or mock fallback)
  const [reports, setReports] = useState<any[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        // Always fetch reports from the backend and rely on server-side
        // role/jurisdiction enforcement. Do not pass client-side state
        // filters or attempt defensive filtering here.
        const resp = await apiService.getHazardReports({ limit: 1000 } as any);
        if (resp && resp.success) {
          const server = resp.reports || [];

          // Normalize image objects on each report so downstream modals/components
          // can rely on `image.url` and accurate images_count.
          const normalizedServer = server.map((r: any) => {
            const imgs = r.images || [];
            const normalizedImages = imgs.map((img: any) => ({
              ...img,
              url: img.url || img.image_url || img.image || (img.image_file && (img.image_file.url || img.image_file)) || null,
            }));
            return {
              ...r,
              images: normalizedImages,
              images_count: r.images_count || normalizedImages.length || 0,
            };
          });

          setReports(normalizedServer.map((r: any) => mapServerToRow(r)));
        } else {
          // fallback: leave reports empty
          setReports([]);
        }
      } catch (err) {
        console.error('Failed to fetch reports', err);
        setReports([]);
      }
    };

    fetchReports();
  }, [user]);

const mapServerToRow = (r: any) => {
  const reportedAt = r.reported_at || r.created_at;
  const dateObj = reportedAt ? new Date(reportedAt) : null;

  const date = dateObj ? dateObj.toISOString().slice(0,10) : '';
  const time = dateObj ? dateObj.toISOString().slice(11,16) : '';

  const locationString =
    r.location?.full_location ||
    [r.location?.city, r.location?.district, r.location?.state]
      .filter(Boolean)
      .join(', ') ||
    '';

  const severity = r.emergency_level
      ? r.emergency_level.charAt(0).toUpperCase() + r.emergency_level.slice(1)
      : '';

    return {
      id: r.report_id || r.id,
      type: r.hazard_type_display || r.hazard_type || 'Unknown',
      location: locationString,
      latitude: r.location?.latitude,
      longitude: r.location?.longitude,
      reportedBy:
        (r.reported_by && r.reported_by.name) || 'Unknown',
      source: r.source || '',
      date,
      time,
      status: r.status || 'pending',
      severity,
      // pass the actual image objects (normalized earlier) so modals can render them
      images: r.images || [],
      images_count: r.images_count || (r.images ? r.images.length : 0),
      description: r.description || '',
      assignedTo:
        (r.reviewed_by && r.reviewed_by.name) || '',
    };
  };

  const handleViewOnMap = (report: any) => {
    if (!report.latitude || !report.longitude) {
      alert("Location coordinates not available for this report.");
      return;
    }

    navigate('/dashboard', {
      state: {
        showLocation: {
          lat: report.latitude,
          lng: report.longitude,
          title: report.type,
          description: report.description,
        }
      }
    });
  };

  useEffect(() => {
    if (location.state?.showLocation) {
      const { lat, lng } = location.state.showLocation;
      map.setView([lat, lng], 14);
    }
  }, [location.state]);


  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="status-verified text-xs flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Verified</span>
          </Badge>
        );
      case "pending":
        return (
          <Badge className="status-pending text-xs flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case "discarded":
        return (
          <Badge className="status-discarded text-xs flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Discarded</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "High":
        return "text-destructive font-semibold";
      case "Medium":
        return "text-warning font-medium";
      case "Low":
        return "text-muted-foreground";
      default:
        return "text-muted-foreground";
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.id));
    } else {
      setSelectedReports([]);
    }
  };

  const handleSelectReport = (reportId: string, checked: boolean) => {
    if (checked) {
      setSelectedReports(prev => [...prev, reportId]);
    } else {
      setSelectedReports(prev => prev.filter(id => id !== reportId));
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Bulk action: ${action} on reports:`, selectedReports);
    setSelectedReports([]);
  };

  const handleViewDetails = (report: any) => {
    setActiveReport({
      id: report.id,
      type: report.type,
      description: report.description,
      location: report.location,
      date: report.date,
      time: report.time,
      status: report.status,
      severity: report.severity,
      reportedBy: report.reportedBy,
      source: report.source,
      images: report.images,
      assignedTo: report.assignedTo,
    });
    setDetailsOpen(true);
  };

  const handleEditReport = (report: any) => {
    setActiveReport({ ...report });
    setEditOpen(true);
  };

  const handleSaveEdit = (updated: any) => {
    // In a real app, persist changes. For now, just reflect in console.
    console.log("Updated report:", updated);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">{t("nav.reports")} {t("common.management")}</h1>
          <p className="text-muted-foreground">
            Review, verify, and manage hazard reports from citizens and social media
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
{t("common.export")}
          </Button>
          <Button size="sm">
            <Filter className="h-4 w-4 mr-2" />
{t("official.reports.advancedFilters")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{reports.length}</div>
            <div className="text-sm text-muted-foreground">{t("official.hazardMap.totalReports")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-success">
              {reports.filter(r => r.status === "verified").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.hazardMap.verified")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-warning">
              {reports.filter(r => r.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.reports.pendingReview")}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-destructive">
              {reports.filter(r => r.severity === "High").length}
            </div>
            <div className="text-sm text-muted-foreground">{t("official.hazardMap.highPriority")}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reports by ID, type, location, or reporter..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="discarded">Discarded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="waves">High Waves</SelectItem>
                <SelectItem value="debris">Marine Debris</SelectItem>
                <SelectItem value="storm">Storm Surge</SelectItem>
                <SelectItem value="water_disaster">Water Disaster</SelectItem>
                <SelectItem value="oil_spill">Oil Spill</SelectItem>
                <SelectItem value="coral_bleaching">Coral Bleaching</SelectItem>
                <SelectItem value="normal">Normal Condition</SelectItem>
                <SelectItem value="pollution">Water Pollution</SelectItem>
                <SelectItem value="flooding">Coastal Flooding</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedReports.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {selectedReports.length} report{selectedReports.length !== 1 ? 's' : ''} selected
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('verify')}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Verify Selected
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkAction('discard')}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Discard Selected
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedReports.length === filteredReports.length && filteredReports.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Reporter</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Media</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
                        onCheckedChange={(checked) => handleSelectReport(report.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">{report.id}</TableCell>
                    <TableCell className="font-medium">{report.type}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{report.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium text-sm">{report.reportedBy}</div>
                        <div className="text-xs text-muted-foreground">{report.source}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <div className="text-sm">
                          <div>{report.date}</div>
                          <div className="text-xs text-muted-foreground">{report.time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>
                      <span className={getSeverityColor(report.severity)}>
                        {report.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Camera className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{report.images?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{report.assignedTo}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewDetails(report)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewOnMap(report)}>
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination would go here */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {filteredReports.length} of {reports.length} reports
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
      <ReportDetailsModal
        report={activeReport}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />
      <EditReportModal
        report={activeReport}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ReportsTable;