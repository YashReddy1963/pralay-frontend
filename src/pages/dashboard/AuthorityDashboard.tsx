import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  Shield,
  UserPlus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  MapPin,
  Upload,
  EyeOff
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { apiService } from "@/services/api";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthorityDashboard = () => {
  const { t } = useOfficialLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Role helpers
  const isStateChairman = user?.role === 'state_chairman';
  const isDistrictChairman = user?.role === 'district_chairman';

  // Role-based access control
  const canManageAuthorities = isStateChairman;
  const canManageTeam = isStateChairman || isDistrictChairman; // state or district can manage team
  const isTeamMember = false; // Team members can't access this page

  // Allow only state or district chairman to view this page
  if (!user || (user.role !== 'state_chairman' && user.role !== 'district_chairman')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">This page is only available for State or District Chairman.</p>
        </div>
      </div>
    );
  }

  // Mock data for team members
  const teamMembers = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Assistant Coordinator",
      email: "sarah.johnson@gov.in",
      status: "Active",
      lastActive: "2 hours ago",
      avatar: null
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Field Officer",
      email: "michael.chen@gov.in",
      status: "Active",
      lastActive: "1 day ago",
      avatar: null
    },
    {
      id: 3,
      name: "Priya Sharma",
      role: "Data Analyst",
      email: "priya.sharma@gov.in",
      status: "Away",
      lastActive: "3 days ago",
      avatar: null
    }
  ];

  // Note: subordinate authorities are fetched from backend for state chairmen and stored in `subAuthoritiesData`.

  const [teamMemberForm, setTeamMemberForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    designation: "",
    state: "",
    district: "",
    nagar_panchayat: "",
    village: "",
    address: "",
    government_service_id: "",
    can_view_reports: false,
    can_approve_reports: false,
    can_manage_teams: false,
    password1: "",
    password2: ""
  });

  const [authorityForm, setAuthorityForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    designation: "",
    role: "",
    state: "",
    district: "",
    nagar_panchayat: "",
    village: "",
    address: "",
    government_service_id: "",
    can_view_reports: false,
    can_approve_reports: false,
    can_manage_teams: false,
    password1: "",
    password2: ""
  });

  // State for API data
  const [teamDocumentFile, setTeamDocumentFile] = useState<File | null>(null);
  const [editDocumentFile, setEditDocumentFile] = useState<File | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null);
  const [isEditingSubmitting, setIsEditingSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    designation: '',
    phone_number: '',
    address: '',
    government_service_id: '',
    can_view_reports: false,
    can_approve_reports: false,
    can_manage_teams: false
  });
  const [teamMembersData, setTeamMembersData] = useState<any[]>([]);
  const [subAuthorityTeamMembersData, setSubAuthorityTeamMembersData] = useState<any[]>([]);
  const [subAuthoritiesData, setSubAuthoritiesData] = useState<any[]>([]);
  const [isLoadingTeamMembers, setIsLoadingTeamMembers] = useState(false);
  const [isLoadingSubAuthorityTeamMembers, setIsLoadingSubAuthorityTeamMembers] = useState(false);
  const [isSubmittingTeam, setIsSubmittingTeam] = useState(false);
  const [isSubmittingAuthority, setIsSubmittingAuthority] = useState(false);

  // Modal states
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isAuthorityModalOpen, setIsAuthorityModalOpen] = useState(false);
  // Type-safe selected items
  interface TeamMember {
    id?: number;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    designation?: string | null;
    state?: string | null;
    district?: string | null;
    nagar_panchayat?: string | null;
    village?: string | null;
    address?: string | null;
    government_service_id?: string | null;
  document_proof?: string | null;
    can_view_reports?: boolean | null;
    can_approve_reports?: boolean | null;
    can_manage_teams?: boolean | null;
    assigned_date?: string | null;
    is_active?: boolean | null;
    [key: string]: any;
  }

  interface SubAuthority {
    id?: number;
    first_name?: string | null;
    middle_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone_number?: string | null;
    designation?: string | null;
    role?: string | null;
    state?: string | null;
    district?: string | null;
    nagar_panchayat?: string | null;
    village?: string | null;
    address?: string | null;
    government_service_id?: string | null;
    created_date?: string | null;
    status?: string | null;
    reportsCount?: number | null;
    location?: {
      state?: string | null;
      district?: string | null;
      village?: string | null;
      nagar_panchayat?: string | null;
      [key: string]: any;
    } | null;
    [key: string]: any;
  }

  const [selectedTeamMember, setSelectedTeamMember] = useState<TeamMember | null>(null);
  const [selectedSubAuthority, setSelectedSubAuthority] = useState<SubAuthority | null>(null);
  const [isTeamMemberDetailOpen, setIsTeamMemberDetailOpen] = useState(false);
  const [isSubAuthorityDetailOpen, setIsSubAuthorityDetailOpen] = useState(false);

  // Dynamic metrics based on user role and actual data
  const metrics = {
    activeReports: 24,
    resolved: 156,
    teamMembers: teamMembersData.length,
    responseTime: "2.3h"
  };

  // Fetch team members data. For state chairman use authority endpoint, for district use sub-authority endpoint.
  const fetchTeamMembers = async () => {
    if (!canManageTeam) return;

    try {
      setIsLoadingTeamMembers(true);
      if (isStateChairman) {
        const response = await apiService.getAuthorityTeamMembers();
        if (response.success) {
          // Store API response directly; do not mutate fields
          setTeamMembersData(response.team_members || []);
        }
      } else if (isDistrictChairman) {
        const response = await apiService.getSubAuthorityTeamMembers();
        if (response.success) {
          // Store sub-authority team members in the same UI list for district chairmen
          setTeamMembersData(response.team_members);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch team members");
      console.error("Fetch team members error:", error);
    } finally {
      setIsLoadingTeamMembers(false);
    }
  };

  // Fetch sub-authority team members (kept for compatibility but not called on mount)
  const fetchSubAuthorityTeamMembers = async () => {
    try {
      setIsLoadingSubAuthorityTeamMembers(true);
      const response = await apiService.getSubAuthorityTeamMembers();
      if (response.success) {
        setSubAuthorityTeamMembersData(response.team_members);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch sub-authority team members");
      console.error("Fetch sub-authority team members error:", error);
    } finally {
      setIsLoadingSubAuthorityTeamMembers(false);
    }
  };

  // Fetch subordinate authorities (state-chairman only)
  const fetchSubAuthorities = async () => {
    if (!isStateChairman) return;
    try {
      const response = await apiService.getSubAuthorities();
      if (response.success) {
         setSubAuthoritiesData(
            response.sub_authorities.sort(
               (a, b) =>
                  new Date(b.created_date).getTime() -
                  new Date(a.created_date).getTime()
            )
         );
      }
    } catch (error: any) {
      console.error('Failed to fetch subordinate authorities', error);
      toast.error(error.message || 'Failed to fetch subordinate authorities');
    }
  };

  // Handle team member creation
  const handleTeamSubmit = async () => {
    try {
      setIsSubmittingTeam(true);
      
      const formData = new FormData();
  formData.append('first_name', teamMemberForm.first_name);
  formData.append('middle_name', teamMemberForm.middle_name);
  formData.append('last_name', teamMemberForm.last_name);
      formData.append('email', teamMemberForm.email);
      formData.append('phone_number', teamMemberForm.phone_number);
      formData.append('designation', teamMemberForm.designation);
  formData.append('nagar_panchayat', teamMemberForm.nagar_panchayat);
  formData.append('village', teamMemberForm.village);
  formData.append('address', teamMemberForm.address);
  formData.append('government_service_id', teamMemberForm.government_service_id);
  formData.append('can_view_reports', String(teamMemberForm.can_view_reports));
  formData.append('can_approve_reports', String(teamMemberForm.can_approve_reports));
  formData.append('can_manage_teams', String(teamMemberForm.can_manage_teams));
      formData.append('state', teamMemberForm.state);
      formData.append('district', teamMemberForm.district);
      formData.append('password1', teamMemberForm.password1);
      formData.append('password2', teamMemberForm.password2);
      if (teamDocumentFile) {
        formData.append('document_proof', teamDocumentFile);
      }
      
      // Choose API endpoint depending on role
      let response: any = { success: false };
      if (isStateChairman) {
        // State chairman creates top-level team members
        response = await apiService.createTeamMember(formData);
      } else if (isDistrictChairman) {
        // District chairman creates sub-authority team members under themselves
        response = await apiService.createSubAuthorityTeamMember(formData);
      }
      if (response.success) {
        toast.success(response.message);
        setIsTeamModalOpen(false);
        setTeamMemberForm({
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          designation: "",
          state: "",
          district: "",
          nagar_panchayat: "",
          village: "",
          address: "",
          government_service_id: "",
          can_view_reports: false,
          can_approve_reports: false,
          can_manage_teams: false,
          password1: "",
          password2: ""
        });
        fetchTeamMembers(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || "Team member creation failed");
      console.error("Team member creation error:", error);
    } finally {
      setIsSubmittingTeam(false);
    }
  };

  // Handle authority creation
  const handleAuthoritySubmit = async () => {
    if (!isStateChairman) {
      toast.error('Only state chairman can create sub-authorities');
      return;
    }

    try {
      setIsSubmittingAuthority(true);
      const formData = new FormData();
      formData.append('first_name', authorityForm.first_name);
      formData.append('last_name', authorityForm.last_name);
      formData.append('email', authorityForm.email);
      formData.append('phone_number', authorityForm.phone_number);
      formData.append('designation', authorityForm.designation);
      formData.append('role', authorityForm.role);
      formData.append('state', authorityForm.state);
      formData.append('district', authorityForm.district);
      formData.append('nagar_panchayat', authorityForm.nagar_panchayat);
      formData.append('village', authorityForm.village);
      formData.append('address', authorityForm.address);
      formData.append('government_service_id', authorityForm.government_service_id);
      formData.append('password1', authorityForm.password1);
      formData.append('password2', authorityForm.password2);

      const resp = await apiService.createSubAuthority(formData);
      if (resp.success) {
        toast.success(resp.message || 'Sub-authority created');
        setIsAuthorityModalOpen(false);
        setAuthorityForm({
          first_name: "",
          middle_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          designation: "",
          role: "",
          state: "",
          district: "",
          nagar_panchayat: "",
          village: "",
          address: "",
          government_service_id: "",
          can_view_reports: false,
          can_approve_reports: false,
          can_manage_teams: false,
          password1: "",
          password2: ""
        });
        // Refresh subordinate list
        fetchSubAuthorities();
      } else {
        toast.error(resp?.message || 'Failed to create sub-authority');
      }
    } catch (error: any) {
      console.error('Create sub-authority error', error);
      toast.error(error.message || 'Failed to create sub-authority');
    } finally {
      setIsSubmittingAuthority(false);
    }
  };

  // Handle team member removal
  const handleRemoveTeamMember = async (memberId: number) => {
    try {
      const response = await apiService.removeTeamMember(memberId);
      if (response.success) {
        toast.success(response.message);
        fetchTeamMembers(); // Refresh the list
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove team member");
      console.error("Remove team member error:", error);
    }
  };

  // Handle sub-authority team member removal
  const handleRemoveSubAuthorityTeamMember = async (memberId: number) => {
    try {
      const response = await apiService.removeSubAuthorityTeamMember(memberId);
      if (response.success) {
        toast.success(response.message);
        // Refresh the unified team list so UI stays consistent for district chairmen
        fetchTeamMembers();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to remove sub-authority team member");
      console.error("Remove sub-authority team member error:", error);
    }
  };

  // Handle viewing team member details
  const handleViewTeamMemberDetails = (member: any) => {
    setSelectedTeamMember(member);
    setIsTeamMemberDetailOpen(true);
  };

  // Handle clicking edit on a team member
  const handleEditClick = (member: any) => {
    setEditingMemberId(member.id ?? null);
    setEditForm({
      designation: member.designation ?? '',
      phone_number: member.phone_number ?? '',
      address: member.address ?? '',
      government_service_id: member.government_service_id ?? '',
      can_view_reports: !!member.can_view_reports,
      can_approve_reports: !!member.can_approve_reports,
      can_manage_teams: !!member.can_manage_teams
    });
    setEditDocumentFile(null);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    if (!editingMemberId) return;
    try {
      setIsEditingSubmitting(true);
      let response: any = { success: false };

      if (editDocumentFile) {
        const formData = new FormData();
        formData.append('designation', editForm.designation);
        formData.append('phone_number', editForm.phone_number);
        formData.append('address', editForm.address);
        formData.append('government_service_id', editForm.government_service_id);
        formData.append('can_view_reports', String(editForm.can_view_reports));
        formData.append('can_approve_reports', String(editForm.can_approve_reports));
        formData.append('can_manage_teams', String(editForm.can_manage_teams));
        formData.append('document_proof', editDocumentFile);

        if (isStateChairman) {
          response = await apiService.updateTeamMember(editingMemberId, formData);
        } else if (isDistrictChairman) {
          response = await apiService.updateSubAuthorityTeamMember(editingMemberId, formData);
        } else {
          response = { success: false, error: 'Unauthorized role' };
        }
      } else {
        const body = {
          designation: editForm.designation,
          phone_number: editForm.phone_number,
          address: editForm.address,
          government_service_id: editForm.government_service_id,
          can_view_reports: editForm.can_view_reports,
          can_approve_reports: editForm.can_approve_reports,
          can_manage_teams: editForm.can_manage_teams
        };
        if (isStateChairman) {
          response = await apiService.updateTeamMember(editingMemberId, body);
        } else if (isDistrictChairman) {
          response = await apiService.updateSubAuthorityTeamMember(editingMemberId, body);
        } else {
          response = { success: false, error: 'Unauthorized role' };
        }
      }

      if (response && response.success) {
        toast.success('Team member updated');
        setIsEditModalOpen(false);
        setEditingMemberId(null);
        fetchTeamMembers();
      } else {
        toast.error(response?.error || 'Failed to update team member');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update team member');
      console.error('Update team member error:', error);
    } finally {
      setIsEditingSubmitting(false);
    }
  };

  // Handle viewing sub-authority details
  const handleViewSubAuthorityDetails = (authority: any) => {
    setSelectedSubAuthority(authority);
    setIsSubAuthorityDetailOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    fetchTeamMembers();
    if (isStateChairman) {
      fetchSubAuthorities();
    }
  }, [user?.role]);

  // Helpers for rendering values
  const displayText = (val?: string | null) => {
    if (val === null || val === undefined) return "Not Provided";
    if (typeof val === "string" && val.trim() === "") return "Not Provided";
    return val;
  };

  const displayBool = (val?: boolean | null) => {
    if (val === true) return "Yes";
    if (val === false) return "No";
    return "Not Provided";
  };

  const formatFullName = (obj: any) => {
    if (!obj) return "Not Provided";
    
    const parts = [
      obj.first_name,
      obj.middle_name,
      obj.last_name
    ].filter(p => p && String(p).trim() !== "");
  
    return parts.length ? parts.join(" ") : "Not Provided";
  };

  const formatLocation = (obj: any) => {
    if (!obj) return "Not Provided";
    // Prefer nested location object if present
    const loc = obj.location || {};
    const village = loc.village ?? obj.village;
    const nagar = loc.nagar_panchayat ?? obj.nagar_panchayat;
    const district = loc.district ?? obj.district;
    const state = loc.state ?? obj.state;
    const parts = [village, nagar, district, state].filter((p) => p && String(p).trim() !== "");
    return parts.length ? parts.join(", ") : "Not Provided";
  };

  const formatDate = (val?: string | null) => {
    if (!val) return "Not Provided";
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleString();
    } catch (e) {
      return String(val);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Authority Dashboard</h1>
          <p className="text-muted-foreground">Manage your team and subordinate authorities</p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="text-green-600 border-green-600">
            {isStateChairman ? "State Chairman" : "District Chairman"}
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Reports</p>
                <p className="text-2xl font-bold">{metrics.activeReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved</p>
                <p className="text-2xl font-bold">{metrics.resolved}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Members</p>
                <p className="text-2xl font-bold">{metrics.teamMembers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BarChart3 className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{metrics.responseTime}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
          {isStateChairman && (
            <TabsTrigger value="authorities">Subordinate Authorities</TabsTrigger>
          )}
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recent Team Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembersData.slice(0, 3).map((member) => (
                    <div key={member.id} className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarFallback>
                          {member.first_name?.[0]}
                          {member.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">
                          {formatFullName(member)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.designation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {isStateChairman && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Authority Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {subAuthoritiesData.map((authority) => (
                      <div key={authority.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Avatar>
                            <AvatarFallback>
                              {String(formatFullName(authority)).split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {formatFullName(authority)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {displayText(authority.role ?? authority.level)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatLocation(authority)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Team Management Tab */}
        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Team Members</span>
              </CardTitle>
              <Dialog open={isTeamModalOpen} onOpenChange={setIsTeamModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Team Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Team Member</DialogTitle>
                  </DialogHeader>
                  
                  <Tabs defaultValue="personal" className="flex-1 flex flex-col min-h-0">
                    <TabsList className="flex-shrink-0 mb-4">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="location">Location</TabsTrigger>
                      <TabsTrigger value="permissions">Permissions</TabsTrigger>
                      <TabsTrigger value="credentials">Credentials</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="personal" className="flex-1 overflow-y-auto space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="first_name">First Name *</Label>
                            <Input
                              id="first_name"
                              value={teamMemberForm.first_name}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, first_name: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label>Middle Name</Label>
                            <Input
                              value={teamMemberForm.middle_name}
                              onChange={(e) =>
                                setTeamMemberForm(prev => ({...prev, middle_name: e.target.value}))
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="last_name">Last Name *</Label>
                            <Input
                              id="last_name"
                              value={teamMemberForm.last_name}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, last_name: e.target.value}))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="email">Email *</Label>
                            <Input
                              id="email"
                              type="email"
                              value={teamMemberForm.email}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, email: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="phone_number">Phone Number *</Label>
                            <Input
                              id="phone_number"
                              value={teamMemberForm.phone_number}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, phone_number: e.target.value}))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="designation">Designation *</Label>
                          <Input
                            id="designation"
                            value={teamMemberForm.designation}
                            onChange={(e) => setTeamMemberForm(prev => ({...prev, designation: e.target.value}))}
                          />
                        </div>
                        <Input
                          type="file"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setTeamDocumentFile(e.target.files[0]);
                            }
                          }}
                        />
                      </div>
                    </TabsContent>

                    <TabsContent value="location" className="flex-1 overflow-y-auto space-y-4">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              value={teamMemberForm.state}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, state: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="district">District *</Label>
                            <Input
                              id="district"
                              value={teamMemberForm.district}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, district: e.target.value}))}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nagar_panchayat">Nagar Panchayat</Label>
                            <Input
                              id="nagar_panchayat"
                              value={teamMemberForm.nagar_panchayat}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, nagar_panchayat: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="village">Village</Label>
                            <Input
                              id="village"
                              value={teamMemberForm.village}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, village: e.target.value}))}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={teamMemberForm.address}
                            onChange={(e) => setTeamMemberForm(prev => ({...prev, address: e.target.value}))}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="permissions" className="flex-1 overflow-y-auto space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Access Permissions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can_view_reports"
                              checked={teamMemberForm.can_view_reports}
                              onCheckedChange={(checked) => setTeamMemberForm(prev => ({...prev, can_view_reports: checked as boolean}))}
                            />
                            <Label htmlFor="can_view_reports">Can View Reports</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can_approve_reports"
                              checked={teamMemberForm.can_approve_reports}
                              onCheckedChange={(checked) => setTeamMemberForm(prev => ({...prev, can_approve_reports: checked as boolean}))}
                            />
                            <Label htmlFor="can_approve_reports">Can Approve Reports</Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="can_manage_teams"
                              checked={teamMemberForm.can_manage_teams}
                              onCheckedChange={(checked) => setTeamMemberForm(prev => ({...prev, can_manage_teams: checked as boolean}))}
                            />
                            <Label htmlFor="can_manage_teams">Can Manage Teams</Label>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="credentials" className="flex-1 overflow-y-auto space-y-4">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Login Credentials</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="password1">Password *</Label>
                            <Input
                              id="password1"
                              type="password"
                              value={teamMemberForm.password1}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, password1: e.target.value}))}
                            />
                          </div>
                          <div>
                            <Label htmlFor="password2">Confirm Password *</Label>
                            <Input
                              id="password2"
                              type="password"
                              value={teamMemberForm.password2}
                              onChange={(e) => setTeamMemberForm(prev => ({...prev, password2: e.target.value}))}
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsTeamModalOpen(false)} disabled={isSubmittingTeam}>Cancel</Button>
                    <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleTeamSubmit} disabled={isSubmittingTeam}>
                      {isSubmittingTeam ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Team Member
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingTeamMembers ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <span className="ml-2">Loading team members...</span>
                  </div>
                ) : teamMembersData.length > 0 ? (
                  teamMembersData.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarFallback>
                            {member.first_name?.[0]}{member.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{formatFullName(member)}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.designation} • Assigned: {new Date(member.assigned_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={member.is_active ? "default" : "secondary"}>
                          {member.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewTeamMemberDetails(member)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Edit Member" onClick={() => handleEditClick(member)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Remove Member" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => 
                          isStateChairman ? handleRemoveTeamMember(member.id) : handleRemoveSubAuthorityTeamMember(member.id)
                        }>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No team members found</p>
                    <p className="text-sm">Add team members to get started</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subordinate Authorities Tab */}
        {isStateChairman && (
          <TabsContent value="authorities" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Subordinate Authorities</span>
              </CardTitle>
              <Dialog open={isAuthorityModalOpen} onOpenChange={setIsAuthorityModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create Authority
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Create Subordinate Authority</DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Personal Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="auth_first_name">First Name *</Label>
                          <Input
                            id="auth_first_name"
                            value={authorityForm.first_name}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, first_name: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth_last_name">Last Name *</Label>
                          <Input
                            id="auth_last_name"
                            value={authorityForm.last_name}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, last_name: e.target.value}))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="auth_email">Email *</Label>
                          <Input
                            id="auth_email"
                            type="email"
                            value={authorityForm.email}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, email: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth_phone_number">Phone Number *</Label>
                          <Input
                            id="auth_phone_number"
                            value={authorityForm.phone_number}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, phone_number: e.target.value}))}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="auth_designation">Designation *</Label>
                          <Input
                            id="auth_designation"
                            value={authorityForm.designation}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, designation: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth_role">Role *</Label>
                          <Select value={authorityForm.role} onValueChange={(value) => setAuthorityForm(prev => ({...prev, role: value}))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="district_chairman">District Chairman</SelectItem>
                              <SelectItem value="nagar_panchayat_chairman">Nagar Panchayat Chairman</SelectItem>
                              <SelectItem value="village_sarpanch">Village Sarpanch</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Location Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Location Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="auth_state">State *</Label>
                          <Input
                            id="auth_state"
                            value={authorityForm.state}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, state: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth_district">District *</Label>
                          <Input
                            id="auth_district"
                            value={authorityForm.district}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, district: e.target.value}))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Login Credentials</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="auth_password1">Password *</Label>
                          <Input
                            id="auth_password1"
                            type="password"
                            value={authorityForm.password1}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, password1: e.target.value}))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="auth_password2">Confirm Password *</Label>
                          <Input
                            id="auth_password2"
                            type="password"
                            value={authorityForm.password2}
                            onChange={(e) => setAuthorityForm(prev => ({...prev, password2: e.target.value}))}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsAuthorityModalOpen(false)} disabled={isSubmittingAuthority}>Cancel</Button>
                    <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAuthoritySubmit} disabled={isSubmittingAuthority}>
                      {isSubmittingAuthority ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Create Authority
                        </>
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(subAuthoritiesData.length ? subAuthoritiesData : []).map((authority) => (
                  <div key={authority.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {String(formatFullName(authority)).split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{formatFullName(authority)}</p>
                        <p className="text-sm text-muted-foreground">{formatLocation(authority)}</p>
                        <p className="text-xs text-muted-foreground">
                          {displayText(authority.role ?? authority.level)} • Created: {formatDate(authority.created_date ?? authority.createdDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="default">{displayText(authority.status)}</Badge>
                      <span className="text-sm text-muted-foreground">{authority.reportsCount ?? authority.reports_count ?? "Not Provided"} reports</span>
                      <Button variant="ghost" size="icon" title="View Details" onClick={() => handleViewSubAuthorityDetails(authority)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        )}
      </Tabs>

      {/* Team Member Detail Modal */}
      {/* Team Member Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Designation</Label>
                <Input value={editForm.designation} onChange={(e) => setEditForm(prev => ({...prev, designation: e.target.value}))} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={editForm.phone_number} onChange={(e) => setEditForm(prev => ({...prev, phone_number: e.target.value}))} />
              </div>
            </div>

            <div>
              <Label>Address</Label>
              <Input value={editForm.address} onChange={(e) => setEditForm(prev => ({...prev, address: e.target.value}))} />
            </div>

            <div>
              <Label>Government Service ID</Label>
              <Input value={editForm.government_service_id} onChange={(e) => setEditForm(prev => ({...prev, government_service_id: e.target.value}))} />
            </div>

            <div>
              <Label>Document Proof (optional)</Label>
              <input type="file" onChange={(e: any) => setEditDocumentFile(e.target.files?.[0] || null)} />
            </div>

            <div>
              <h3 className="text-lg font-semibold">Access Permissions</h3>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox checked={editForm.can_view_reports} onCheckedChange={(v) => setEditForm(prev => ({...prev, can_view_reports: v as boolean}))} />
                  <Label>Can View Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={editForm.can_approve_reports} onCheckedChange={(v) => setEditForm(prev => ({...prev, can_approve_reports: v as boolean}))} />
                  <Label>Can Approve Reports</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox checked={editForm.can_manage_teams} onCheckedChange={(v) => setEditForm(prev => ({...prev, can_manage_teams: v as boolean}))} />
                  <Label>Can Manage Teams</Label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={isEditingSubmitting}>Cancel</Button>
            <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleEditSubmit} disabled={isEditingSubmitting}>
              {isEditingSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={isTeamMemberDetailOpen} onOpenChange={setIsTeamMemberDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team Member Details</DialogTitle>
          </DialogHeader>
            {selectedTeamMember && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{formatFullName(selectedTeamMember)}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.email)}</p>
                  </div>

                  <div>
                    <Label>Designation</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.designation)}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.phone_number)}</p>
                  </div>

                  <div>
                    <Label>State</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.state)}</p>
                  </div>
                  <div>
                    <Label>District</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.district)}</p>
                  </div>

                  <div>
                    <Label>Nagar Panchayat</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.nagar_panchayat)}</p>
                  </div>
                  <div>
                    <Label>Village</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.village)}</p>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.address)}</p>
                  </div>
                  <div>
                    <Label>Government Service ID</Label>
                    <p className="font-medium">{displayText(selectedTeamMember.government_service_id)}</p>
                  </div>

                  <div>
                    <Label>Document Proof</Label>
                    {selectedTeamMember.document_proof ? (
                      <a className="text-primary underline" href={selectedTeamMember.document_proof} target="_blank" rel="noreferrer">View Document</a>
                    ) : (
                      <p className="font-medium">Not Provided</p>
                    )}
                  </div>

                  <div>
                    <Label>Assigned Date</Label>
                    <p className="font-medium">{formatDate(selectedTeamMember.assigned_date)}</p>
                  </div>
                  <div>
                    <Label>Active</Label>
                    <p className="font-medium">{displayBool(selectedTeamMember.is_active)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Access Permissions</h3>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label>Can View Reports</Label>
                      <p className="font-medium">{displayBool(selectedTeamMember.can_view_reports)}</p>
                    </div>
                    <div>
                      <Label>Can Approve Reports</Label>
                      <p className="font-medium">{displayBool(selectedTeamMember.can_approve_reports)}</p>
                    </div>
                    <div>
                      <Label>Can Manage Teams</Label>
                      <p className="font-medium">{displayBool(selectedTeamMember.can_manage_teams)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>

      {/* Sub-Authority Detail Modal */}
      <Dialog open={isSubAuthorityDetailOpen} onOpenChange={setIsSubAuthorityDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sub-Authority Details</DialogTitle>
          </DialogHeader>
            {selectedSubAuthority && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Name</Label>
                    <p className="font-medium">{formatFullName(selectedSubAuthority)}</p>
                  </div>
                  <div>
                    <Label>Role / Level</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.role ?? selectedSubAuthority.level)}</p>
                  </div>

                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.email)}</p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.phone_number)}</p>
                  </div>

                  <div>
                    <Label>Designation</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.designation)}</p>
                  </div>
                  <div>
                    <Label>Government Service ID</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.government_service_id)}</p>
                  </div>

                  <div>
                    <Label>State</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.state ?? selectedSubAuthority.location?.state)}</p>
                  </div>
                  <div>
                    <Label>District</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.district ?? selectedSubAuthority.location?.district)}</p>
                  </div>

                  <div>
                    <Label>Nagar Panchayat</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.nagar_panchayat ?? selectedSubAuthority.location?.nagar_panchayat)}</p>
                  </div>
                  <div>
                    <Label>Village</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.village ?? selectedSubAuthority.location?.village)}</p>
                  </div>

                  <div>
                    <Label>Address</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.address)}</p>
                  </div>
                  <div>
                    <Label>Location (full)</Label>
                    <p className="font-medium">{formatLocation(selectedSubAuthority)}</p>
                  </div>

                  <div>
                    <Label>Created Date</Label>
                    <p className="font-medium">{formatDate(selectedSubAuthority.created_date)}</p>
                  </div>
                  <div>
                    <Label>Status</Label>
                    <p className="font-medium">{displayText(selectedSubAuthority.status)}</p>
                  </div>

                  <div>
                    <Label>Reports Count</Label>
                    <p className="font-medium">{selectedSubAuthority.reportsCount ?? "Not Provided"}</p>
                  </div>
                </div>
              </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorityDashboard;