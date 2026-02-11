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
  MoreHorizontal,
  AlertTriangle,
  PhoneCall
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDetailsModal } from "@/components/modals/ReportDetailsModal";
import EditReportModal from "@/components/modals/EditReportModal";
import TakeActionModal from "@/components/modals/TakeActionModal";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { apiService } from "@/services/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface HazardReport {
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
  }>;
}

const DistrictReports = () => {
  const { t } = useOfficialLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const [reports, setReports] = useState<HazardReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [takeActionOpen, setTakeActionOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<HazardReport | null>(null);
  const [modalReport, setModalReport] = useState<{
    id: string;
    type: string;
    location: string;
    date: string;
    time: string;
    status: "verified" | "pending" | "discarded";
    description: string;
    images: number;
    severity: "low" | "medium" | "high";
    reporter: string;
    reportedBy?: string;
    source?: string;
    assignedTo?: string;
  } | null>(null);

  // Check if user is district chairman and refresh user data if needed
  useEffect(() => {
    if (!user || user.role !== 'district_chairman') {
      console.log("User role check failed:", { user: user?.role, district: user?.district });
      toast.error("Access denied. This page is only available for District Chairmen.");
      navigate('/dashboard');
      return;
    }
    
    // Log user information for debugging
    console.log("District Chairman logged in:", {
      role: user.role,
      district: user.district,
      state: user.state,
      fullName: `${user.first_name} ${user.last_name}`
    });

    // If district is not available, try to refresh user data
    if (!user.district) {
      console.log("District not found, attempting to refresh user data...");
      // This will be handled by the component - we'll show a warning but still allow access
    }
  }, [user, navigate]);

  // Fetch reports for the district chairman's district
  const fetchReports = async () => {
    if (!user || user.role !== 'district_chairman') return;
    
    try {
      setIsLoading(true);
      
      // If district is not available, fetch all reports and filter on frontend
      // This is a fallback for cases where district info might not be set
      const response = await apiService.getHazardReports({
        district: user.district || undefined, // Use district if available, otherwise fetch all
        limit: 100
      });
      
      if (response.success) {
        let reports = response.reports || [];
        
        // If no district filter was applied on backend, filter on frontend
        if (!user.district && reports.length > 0) {
          // Show a message that district filtering is not available
    
          console.log("No district filter applied, showing all reports");
        }
        
        setReports(reports);
      } else {
        toast.error("Failed to fetch reports");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch reports");
      console.error("Error fetching reports:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'district_chairman') {
      fetchReports();
    }
  }, [user]);

  // Filter reports based on search and filters
  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.report_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.hazard_type_display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.full_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reported_by.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.hazard_type.toLowerCase().includes(typeFilter.toLowerCase());
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Verified</span>
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs flex items-center space-x-1">
            <AlertCircle className="h-3 w-3" />
            <span>Pending</span>
          </Badge>
        );
      case "discarded":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200 text-xs flex items-center space-x-1">
            <XCircle className="h-3 w-3" />
            <span>Discarded</span>
          </Badge>
        );
      case "under_investigation":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs flex items-center space-x-1">
            <AlertTriangle className="h-3 w-3" />
            <span>Under Investigation</span>
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>Resolved</span>
          </Badge>
        );
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-600 font-bold";
      case "high":
        return "text-red-500 font-semibold";
      case "medium":
        return "text-yellow-600 font-medium";
      case "low":
        return "text-green-600";
      default:
        return "text-muted-foreground";
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedReports(filteredReports.map(r => r.report_id));
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

  const handleBulkAction = async (action: string) => {
    if (selectedReports.length === 0) {
      toast.error("No reports selected");
      return;
    }

    try {
      if (action === 'verify') {
        await apiService.bulkUpdateReports(selectedReports, 'verified', 'Bulk verified by district chairman');
        toast.success(`${selectedReports.length} reports verified successfully`);
      } else if (action === 'discard') {
        await apiService.bulkUpdateReports(selectedReports, 'discarded', 'Bulk discarded by district chairman');
        toast.success(`${selectedReports.length} reports discarded successfully`);
      } else if (action === 'delete') {
        if (confirm(`Are you sure you want to delete ${selectedReports.length} reports? This action cannot be undone.`)) {
          await apiService.bulkDeleteReports(selectedReports);
          toast.success(`${selectedReports.length} reports deleted successfully`);
        } else {
          return;
        }
      }
      
      setSelectedReports([]);
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || `Failed to ${action} reports`);
    }
  };

  const handleViewDetails = (report: HazardReport) => {
    setActiveReport(report);
    setModalReport({
      id: report.report_id,
      type: report.hazard_type_display,
      description: report.description,
      location: report.location.full_location,
      date: new Date(report.reported_at).toLocaleDateString(),
      time: new Date(report.reported_at).toLocaleTimeString(),
      status: report.status as "verified" | "pending" | "discarded",
      severity: report.emergency_level as "low" | "medium" | "high",
      reporter: report.reported_by.name,
      reportedBy: report.reported_by.name,
      source: "Citizen",
      images: report.images_count,
      assignedTo: report.reviewed_by?.name || "Unassigned",
    });
    setDetailsOpen(true);
  };

  const handleEditReport = (report: HazardReport) => {
    setActiveReport(report);
    setModalReport({
      id: report.report_id,
      type: report.hazard_type_display,
      description: report.description,
      location: report.location.full_location,
      date: new Date(report.reported_at).toLocaleDateString(),
      time: new Date(report.reported_at).toLocaleTimeString(),
      status: report.status as "verified" | "pending" | "discarded",
      severity: report.emergency_level as "low" | "medium" | "high",
      reporter: report.reported_by.name,
      reportedBy: report.reported_by.name,
      source: "Citizen",
      images: report.images_count,
      assignedTo: report.reviewed_by?.name || "Unassigned",
    });
    setEditOpen(true);
  };

  const handleTakeAction = (report: HazardReport) => {
    setActiveReport(report);
    setModalReport({
      id: report.report_id,
      type: report.hazard_type_display,
      description: report.description,
      location: report.location.full_location,
      date: new Date(report.reported_at).toLocaleDateString(),
      time: new Date(report.reported_at).toLocaleTimeString(),
      status: report.status as "verified" | "pending" | "discarded",
      severity: report.emergency_level as "low" | "medium" | "high",
      reporter: report.reported_by.name,
      reportedBy: report.reported_by.name,
      source: "Citizen",
      images: report.images_count,
      assignedTo: report.reviewed_by?.name || "Unassigned",
    });
    setTakeActionOpen(true);
  };

  const handleSaveEdit = async (updated: any) => {
    try {
      await apiService.updateReportStatus(
        updated.id,
        updated.status,
        `Updated by district chairman`,
        updated.severity
      );
      toast.success("Report updated successfully");
      fetchReports(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || "Failed to update report");
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    if (confirm("Are you sure you want to delete this report? This action cannot be undone.")) {
      try {
        await apiService.deleteHazardReport(reportId);
        toast.success("Report deleted successfully");
        fetchReports(); // Refresh the list
      } catch (error: any) {
        toast.error(error.message || "Failed to delete report");
      }
    }
  };

  const handleViewOnMap = (report: HazardReport) => {
    // Navigate to dashboard with coordinates to show on map
    navigate('/dashboard', { 
      state: { 
        showLocation: {
          lat: report.location.latitude,
          lng: report.location.longitude,
          title: report.hazard_type_display,
          description: report.description
        }
      }
    });
  };

  if (!user || user.role !== 'district_chairman') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">This page is only available for District Chairmen.</p>
        </div>
      </div>
    );
  }

  // If district is not available, show a warning but still allow access
  const showDistrictWarning = !user.district;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold">
            District Reports {user.district ? `- ${user.district}` : ''}
          </h1>
          <p className="text-muted-foreground">
            {user.district 
              ? `Manage hazard reports for ${user.district} district`
              : 'Manage hazard reports (District information not configured)'
            }
          </p>
          
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={fetchReports}>
            <Filter className="h-4 w-4 mr-2" />
            Refresh Reports
          </Button>
          <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
            Refresh Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{reports.length}</div>
            <div className="text-sm text-muted-foreground">Total Reports</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.status === "verified").length}
            </div>
            <div className="text-sm text-muted-foreground">Verified</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {reports.filter(r => r.status === "pending").length}
            </div>
            <div className="text-sm text-muted-foreground">Pending Review</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {reports.filter(r => r.emergency_level === "high" || r.emergency_level === "critical").length}
            </div>
            <div className="text-sm text-muted-foreground">High Priority</div>
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
                <SelectItem value="under_investigation">Under Investigation</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="tsunami">Tsunami Warning</SelectItem>
                <SelectItem value="storm-surge">Storm Surge</SelectItem>
                <SelectItem value="high-waves">High Waves</SelectItem>
                <SelectItem value="flooding">Coastal Flooding</SelectItem>
                <SelectItem value="debris">Marine Debris</SelectItem>
                <SelectItem value="pollution">Water Pollution</SelectItem>
                <SelectItem value="erosion">Coastal Erosion</SelectItem>
                <SelectItem value="wildlife">Marine Wildlife Issue</SelectItem>
                <SelectItem value="other">Other Hazard</SelectItem>
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
          <CardTitle>District Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading reports...</span>
            </div>
          ) : (
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
                    <TableHead>Report ID</TableHead>
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
                    <TableRow key={report.report_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedReports.includes(report.report_id)}
                          onCheckedChange={(checked) => handleSelectReport(report.report_id, checked as boolean)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{report.report_id}</TableCell>
                      <TableCell className="font-medium">{report.hazard_type_display}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{report.location.full_location}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{report.reported_by.name}</div>
                          <div className="text-xs text-muted-foreground">{report.reported_by.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <div className="text-sm">
                            <div>{new Date(report.reported_at).toLocaleDateString()}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(report.reported_at).toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <span className={getSeverityColor(report.emergency_level)}>
                          {report.emergency_level.charAt(0).toUpperCase() + report.emergency_level.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Camera className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{report.images_count}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {report.reviewed_by?.name || "Unassigned"}
                      </TableCell>
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
                            <DropdownMenuItem onClick={() => handleEditReport(report)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Report
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleViewOnMap(report)}>
                              <MapPin className="h-4 w-4 mr-2" />
                              View on Map
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTakeAction(report)}>
                              <PhoneCall className="h-4 w-4 mr-2" />
                              Take Action
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDeleteReport(report.report_id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Report
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
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

      {/* Modals */}
      {modalReport && (
        <>
          <ReportDetailsModal
            report={modalReport}
            isOpen={detailsOpen}
            onClose={() => setDetailsOpen(false)}
          />
          <EditReportModal
            report={modalReport}
            isOpen={editOpen}
            onClose={() => setEditOpen(false)}
            onSave={handleSaveEdit}
          />
          <TakeActionModal
            isOpen={takeActionOpen}
            onClose={() => setTakeActionOpen(false)}
            reportId={modalReport.id}
            reportTitle={`${modalReport.type} - Report #${modalReport.id}`}
            reportDescription={modalReport.description}
            reportLocation={modalReport.location}
          />
        </>
      )}
    </div>
  );
};

export default DistrictReports;
