import { useState } from "react";
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

const ReportsTable = () => {
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

  // Mock data
  const reports = [
    {
      id: "R001",
      type: "High Waves",
      location: "Santa Monica Beach, CA",
      reportedBy: "Sarah Johnson",
      source: "Citizen",
      date: "2024-01-15",
      time: "14:30",
      status: "verified" as const,
      severity: "High",
      images: 2,
      description: "Dangerous waves hitting the shoreline, estimated 4-5 meters high",
      assignedTo: "Officer Martinez",
    },
    {
      id: "R002",
      type: "Marine Debris",
      location: "Malibu Coast, CA",
      reportedBy: "Mike Chen",
      source: "Citizen",
      date: "2024-01-14",
      time: "09:15",
      status: "pending" as const,
      severity: "Medium",
      images: 3,
      description: "Large plastic debris washing ashore, potential navigation hazard",
      assignedTo: "Officer Smith",
    },
    {
      id: "R003",
      type: "Storm Surge",
      location: "Venice Beach, CA",
      reportedBy: "@OceanWatch",
      source: "Social Media",
      date: "2024-01-13",
      time: "16:45",
      status: "verified" as const,
      severity: "High",
      images: 1,
      description: "Storm surge affecting coastal infrastructure",
      assignedTo: "Officer Johnson",
    },
    {
      id: "R004",
      type: "Water Pollution",
      location: "Redondo Beach, CA",
      reportedBy: "Lisa Martinez",
      source: "Citizen",
      date: "2024-01-12",
      time: "11:20",
      status: "discarded" as const,
      severity: "Low",
      images: 4,
      description: "Discolored water observed near pier - determined to be algae bloom",
      assignedTo: "Officer Davis",
    },
    {
      id: "R005",
      type: "Coastal Flooding",
      location: "Manhattan Beach, CA",
      reportedBy: "Tom Wilson",
      source: "Citizen",
      date: "2024-01-11",
      time: "08:00",
      status: "pending" as const,
      severity: "Medium",
      images: 5,
      description: "Parking lot flooded during high tide, affecting beach access",
      assignedTo: "Officer Brown",
    },
  ];

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
                        <span className="text-sm">{report.images}</span>
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
                          <DropdownMenuItem onClick={() => handleEditReport(report)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Report
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <MapPin className="h-4 w-4 mr-2" />
                            View on Map
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
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
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
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