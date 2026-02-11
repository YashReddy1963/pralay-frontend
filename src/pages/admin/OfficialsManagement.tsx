import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  UserX,
  Upload,
  RefreshCw,
  EyeOff,
  Shield,
  FileText,
  Settings,
  Users,
  UserCheck,
  Activity,
  TrendingUp,
  Save,
  X
} from "lucide-react";
import { useAdminLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { apiService } from "@/services/api";

const OfficialsManagement = () => {
  const { t } = useAdminLanguage();
  const [activeTab, setActiveTab] = useState("list");
  const [isLoading, setIsLoading] = useState(false);
  const [officials, setOfficials] = useState<any[]>([]);
  const [filteredOfficials, setFilteredOfficials] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedOfficial, setSelectedOfficial] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [officialDetails, setOfficialDetails] = useState<any>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [activityData, setActivityData] = useState<any>(null);
  const [isLoadingActivity, setIsLoadingActivity] = useState(false);
  const [permissionsData, setPermissionsData] = useState({
    can_view_reports: false,
    can_approve_reports: false,
    can_manage_teams: false
  });
  const [isUpdatingPermissions, setIsUpdatingPermissions] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    role: "",
    custom_role: "",
    state: "",
    district: "",
    village: "",
    nagar_panchayat: "",
    current_designation: "",
    government_service_id: "",
    can_view_reports: false,
    can_approve_reports: false,
    can_manage_teams: false,
    service_card_proof: null as File | null
  });

  const roleOptions = [
    { value: 'state_chairman', label: 'State Chairman' },
    { value: 'district_chairman', label: 'District Chairman' },
    { value: 'nagar_panchayat_chairman', label: 'Nagar Panchayat Chairman' },
    { value: 'village_sarpanch', label: 'Village Sarpanch' },
    { value: 'other', label: 'Other' },
  ];
  const states = [
    "Andhra Pradesh", "Goa", "Gujarat", "Karnataka", "Kerala", 
    "Maharashtra", "Odisha", "Tamil Nadu", "West Bengal"
  ];

  // Fetch officials from backend
  const fetchOfficials = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getOfficials();
      if (response.success) {
        setOfficials(response.officials);
        setFilteredOfficials(response.officials);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch officials");
      console.error("Fetch officials error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter officials based on search term and role filter
  const filterOfficials = () => {
    let filtered = officials;

    if (searchTerm) {
      filtered = filtered.filter(official =>
        official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.state.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter && roleFilter !== "all") {
      filtered = filtered.filter(official => official.role_value === roleFilter);
    }

    setFilteredOfficials(filtered);
  };

  // Load officials on component mount
  useEffect(() => {
    fetchOfficials();
  }, []);

  // Filter officials when search term or role filter changes
  useEffect(() => {
    filterOfficials();
  }, [searchTerm, roleFilter, officials]);

  // Fetch detailed information about an official
  const fetchOfficialDetails = async (officialId: number) => {
    try {
      setIsLoadingDetails(true);
      const response = await apiService.getOfficialDetails(officialId);
      if (response.success) {
        setOfficialDetails(response.official);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch official details");
      console.error("Fetch official details error:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Handle eye icon click
  const handleViewActivity = (official: any) => {
    setSelectedOfficial(official);
    setIsActivityModalOpen(true);
    fetchOfficialActivity(official.id);
  };

  const handleManagePermissions = (official: any) => {
    setSelectedOfficial(official);
    setPermissionsData({
      can_view_reports: official.can_view_reports || false,
      can_approve_reports: official.can_approve_reports || false,
      can_manage_teams: official.can_manage_teams || false
    });
    setIsPermissionsModalOpen(true);
  };

  const fetchOfficialActivity = async (officialId: number) => {
    try {
      setIsLoadingActivity(true);
      const response = await apiService.getOfficialActivity(officialId);
      if (response.success) {
        setActivityData(response);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch activity data");
      console.error("Fetch activity error:", error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const handleUpdatePermissions = async () => {
    if (!selectedOfficial) return;
    
    try {
      setIsUpdatingPermissions(true);
      const response = await apiService.updateOfficialPermissions(selectedOfficial.id, permissionsData);
      if (response.success) {
        toast.success("Permissions updated successfully!");
        setIsPermissionsModalOpen(false);
        // Refresh officials list to show updated permissions
        fetchOfficials();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to update permissions");
      console.error("Update permissions error:", error);
    } finally {
      setIsUpdatingPermissions(false);
    }
  };

  const handleViewDetails = (official: any) => {
    setSelectedOfficial(official);
    setIsDetailModalOpen(true);
    fetchOfficialDetails(official.id);
  };

  const validateForm = () => {
    if (!formData.first_name.trim()) {
      toast.error("First name is required!");
      return false;
    }
    if (!formData.last_name.trim()) {
      toast.error("Last name is required!");
      return false;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required!");
      return false;
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address!");
      return false;
    }
    if (formData.phone_number.length !== 10 || !/^\d+$/.test(formData.phone_number)) {
      toast.error("Phone number must be exactly 10 digits!");
      return false;
    }
    if (!formData.role) {
      toast.error("Role is required!");
      return false;
    }
    if (formData.role === 'other' && !formData.custom_role.trim()) {
      toast.error("Custom role is required when selecting 'Other' role!");
      return false;
    }
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long!");
      return false;
    }
    if (formData.password !== formData.confirm_password) {
      toast.error("Passwords do not match!");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('first_name', formData.first_name);
      if (formData.middle_name.trim()) {
        submitData.append('middle_name', formData.middle_name);
      }
      submitData.append('last_name', formData.last_name);
      submitData.append('email', formData.email);
      submitData.append('phone_number', formData.phone_number);
      submitData.append('password1', formData.password);
      submitData.append('password2', formData.confirm_password);
      submitData.append('role', formData.role);
      if (formData.custom_role.trim()) {
        submitData.append('custom_role', formData.custom_role);
      }
      if (formData.state.trim()) {
        submitData.append('state', formData.state);
      }
      if (formData.district.trim()) {
        submitData.append('district', formData.district);
      }
      if (formData.village.trim()) {
        submitData.append('village', formData.village);
      }
      if (formData.nagar_panchayat.trim()) {
        submitData.append('nagar_panchayat', formData.nagar_panchayat);
      }
      if (formData.current_designation.trim()) {
        submitData.append('current_designation', formData.current_designation);
      }
      if (formData.government_service_id.trim()) {
        submitData.append('government_service_id', formData.government_service_id);
      }
      submitData.append('can_view_reports', formData.can_view_reports.toString());
      submitData.append('can_approve_reports', formData.can_approve_reports.toString());
      submitData.append('can_manage_teams', formData.can_manage_teams.toString());

      if (formData.service_card_proof) {
        submitData.append('service_card_proof', formData.service_card_proof);
      }

      // Fetch CSRF token first
      const csrfToken = await apiService.fetchCsrfToken();
      
      // Use direct fetch for FormData with proper session handling
      const response = await fetch('https://pralay-backend-1.onrender.com/api/create-authority/', {
        method: 'POST',
        body: submitData,
        credentials: 'include',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create authority';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          if (errorData.errors) {
            const errorMessages = Object.values(errorData.errors).flat() as string[];
            errorMessage = `Validation errors: ${errorMessages.join(', ')}`;
            
            // Check for common errors and provide helpful messages
            if (errorMessages.some(msg => msg.includes('already exists'))) {
              errorMessage = 'This email address is already registered. Please use a different email.';
            } else if (errorMessages.some(msg => msg.includes('Phone number'))) {
              errorMessage = 'Phone number must be exactly 10 digits.';
            } else if (errorMessages.some(msg => msg.includes('too similar'))) {
              errorMessage = 'Password is too similar to your name. Please use a different password.';
            } else if (errorMessages.some(msg => msg.includes('required'))) {
              errorMessage = 'Please fill in all required fields.';
            }
          }
        } catch {
          const errorText = await response.text();
          if (response.status === 401 || errorText.includes('Authentication required')) {
            errorMessage = 'Session expired. Please login again.';
            localStorage.removeItem('user');
            localStorage.removeItem('authToken');
            toast.error('Session expired. Redirecting to login...');
            setTimeout(() => window.location.href = '/signin', 2000);
            return;
          } else if (response.status === 403 || errorText.includes('Access denied')) {
            errorMessage = 'You do not have permission to create authorities';
          } else if (response.status === 400) {
            errorMessage = 'Invalid form data. Please check all fields.';
          } else {
            errorMessage = `Server error (${response.status}): ${errorText.substring(0, 100)}...`;
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      toast.success(data.message || "Authority created successfully!");
      setActiveTab("list");
      
      // Refresh the officials list
      await fetchOfficials();
      
      // Reset form
      setFormData({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        password: "",
        confirm_password: "",
        role: "",
        custom_role: "",
        state: "",
        district: "",
        village: "",
        nagar_panchayat: "",
        current_designation: "",
        government_service_id: "",
        can_view_reports: false,
        can_approve_reports: false,
        can_manage_teams: false,
        service_card_proof: null
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create authority. Please try again.");
      console.error("Create authority error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const generatePassword = () => {
    const password = Math.random().toString(36).slice(-8);
    setFormData({...formData, password, confirm_password: password});
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({...formData, service_card_proof: file});
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("admin.officials.title")}</h1>
          <p className="text-muted-foreground">{t("admin.officials.subtitle")}</p>
        </div>
        <Button onClick={() => setActiveTab("add")} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>{t("admin.officials.addNewOfficial")}</span>
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">{t("admin.officials.title")}</TabsTrigger>
          <TabsTrigger value="add">{t("admin.officials.addOfficial")}</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search officials..." 
                      className="pl-10" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    {roleOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Officials Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registered Officials ({filteredOfficials.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2">Loading officials...</span>
                </div>
              ) : filteredOfficials.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No officials found</p>
                  <p className="text-sm">Try adjusting your search or filters</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOfficials.map((official) => (
                  <div key={official.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-glow/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary-glow">
                            {official.name.split(' ').map((n: string) => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-foreground">{official.name}</h3>
                          <p className="text-sm text-muted-foreground">{official.email}</p>
                          {official.current_designation && (
                            <p className="text-xs text-muted-foreground">{official.current_designation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge variant={official.role === "State Chairman" ? "default" : "outline"}>
                          {official.role}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          {official.state && official.district ? `${official.state}, ${official.district}` : 
                           official.state || official.district || 'No location'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <Badge variant={official.status === "Active" ? "default" : "secondary"}>
                          {official.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Last: {official.last_login}
                        </p>
                      </div>
                      
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewDetails(official)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleViewActivity(official)}
                          title="View Activity"
                        >
                          <Activity className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleManagePermissions(official)}
                          title="Manage Permissions"
                        >
                          <UserCheck className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Register New Official</CardTitle>
              <p className="text-sm text-muted-foreground">
                Create access credentials for government officials
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Personal Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Personal Information</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">First Name *</Label>
                      <Input
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="middle_name">Middle Name</Label>
                      <Input
                        id="middle_name"
                        value={formData.middle_name}
                        onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                        placeholder="Enter middle name"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="last_name">Last Name *</Label>
                      <Input
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone_number">Phone Number *</Label>
                      <Input
                        id="phone_number"
                        type="tel"
                        value={formData.phone_number}
                        onChange={(e) => setFormData({...formData, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                        placeholder="Enter 10-digit phone number"
                        maxLength={10}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Authentication Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Authentication</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          placeholder="Create a strong password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Must be at least 8 characters long</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm_password">Confirm Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirm_password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={formData.confirm_password}
                          onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
                          placeholder="Confirm your password"
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Role & Location Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Role & Location</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Role *</Label>
                      <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {formData.role === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="custom_role">Custom Role *</Label>
                        <Input
                          id="custom_role"
                          value={formData.custom_role}
                          onChange={(e) => setFormData({...formData, custom_role: e.target.value})}
                          placeholder="Enter custom role title"
                          required={formData.role === 'other'}
                        />
                      </div>
                    )}
                  </div>

                  {/* Dynamic Location Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({...formData, state: e.target.value})}
                        placeholder="Enter state"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        value={formData.district}
                        onChange={(e) => setFormData({...formData, district: e.target.value})}
                        placeholder="Enter district"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="village">Village</Label>
                      <Input
                        id="village"
                        value={formData.village}
                        onChange={(e) => setFormData({...formData, village: e.target.value})}
                        placeholder="Enter village"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="nagar_panchayat">Nagar Panchayat</Label>
                      <Input
                        id="nagar_panchayat"
                        value={formData.nagar_panchayat}
                        onChange={(e) => setFormData({...formData, nagar_panchayat: e.target.value})}
                        placeholder="Enter nagar panchayat"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Professional Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="current_designation">Current Designation</Label>
                      <Input
                        id="current_designation"
                        value={formData.current_designation}
                        onChange={(e) => setFormData({...formData, current_designation: e.target.value})}
                        placeholder="e.g., District Magistrate, SP, CMO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="government_service_id">Government Service ID</Label>
                      <Input
                        id="government_service_id"
                        value={formData.government_service_id}
                        onChange={(e) => setFormData({...formData, government_service_id: e.target.value})}
                        placeholder="Enter Government Service ID"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Upload Service Card / ID Proof</Label>
                    <div className="flex items-center space-x-4">
                      <Button type="button" variant="outline" className="relative">
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        Choose File
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {formData.service_card_proof ? formData.service_card_proof.name : "No file chosen"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Upload image or PDF file (max 10MB)</p>
                  </div>
                </div>

                {/* Special Permissions Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Special Permissions</h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_view_reports"
                        checked={formData.can_view_reports}
                        onCheckedChange={(checked) => setFormData({...formData, can_view_reports: checked as boolean})}
                      />
                      <Label htmlFor="can_view_reports">Can View Reports</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_approve_reports"
                        checked={formData.can_approve_reports}
                        onCheckedChange={(checked) => setFormData({...formData, can_approve_reports: checked as boolean})}
                      />
                      <Label htmlFor="can_approve_reports">Can Approve Reports</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="can_manage_teams"
                        checked={formData.can_manage_teams}
                        onCheckedChange={(checked) => setFormData({...formData, can_manage_teams: checked as boolean})}
                      />
                      <Label htmlFor="can_manage_teams">Can Manage Teams</Label>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button type="submit" className="flex-1" disabled={isLoading}>
                    {isLoading ? "Creating Authority..." : "Create Authority"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setActiveTab("list")}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Official Details Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Official Details</span>
            </DialogTitle>
          </DialogHeader>
          
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading details...</span>
            </div>
          ) : officialDetails ? (
            <div className="space-y-6">
              {/* Official Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <UserCheck className="h-5 w-5" />
                    <span>Basic Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                      <p className="text-lg font-semibold">{officialDetails.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-lg">{officialDetails.email}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Role</Label>
                      <Badge variant="outline" className="text-sm">
                        {officialDetails.role}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Designation</Label>
                      <p className="text-lg">{officialDetails.current_designation || 'Not specified'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                      <p className="text-lg">{officialDetails.phone_number || 'Not provided'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Government Service ID</Label>
                      <p className="text-lg">{officialDetails.government_service_id || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-lg">
                      {[officialDetails.state, officialDetails.district, officialDetails.nagar_panchayat, officialDetails.village]
                        .filter(Boolean)
                        .join(', ') || 'Not specified'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Activity Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Login</Label>
                      <p className="text-lg">{officialDetails.last_login_time ? 
                        new Date(officialDetails.last_login_time).toLocaleString() : 'Never'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Account Created</Label>
                      <p className="text-lg">{new Date(officialDetails.date_joined).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Created By</Label>
                      <p className="text-lg">{officialDetails.created_by}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Permissions</Label>
                    <div className="flex space-x-2 mt-2">
                      <Badge variant={officialDetails.can_view_reports ? "default" : "secondary"}>
                        View Reports
                      </Badge>
                      <Badge variant={officialDetails.can_approve_reports ? "default" : "secondary"}>
                        Approve Reports
                      </Badge>
                      <Badge variant={officialDetails.can_manage_teams ? "default" : "secondary"}>
                        Manage Teams
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sub-Authorities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Sub-Authorities ({officialDetails.sub_authorities_count})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {officialDetails.sub_authorities.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No sub-authorities created</p>
                  ) : (
                    <div className="space-y-3">
                      {officialDetails.sub_authorities.map((subAuth: any) => (
                        <div key={subAuth.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{subAuth.name}</h4>
                            <p className="text-sm text-muted-foreground">{subAuth.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {subAuth.state && subAuth.district ? `${subAuth.state}, ${subAuth.district}` : 'No location'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">{subAuth.role}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Created: {new Date(subAuth.created_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Team Members */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Members ({officialDetails.team_members_count})</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {officialDetails.team_members.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No team members assigned</p>
                  ) : (
                    <div className="space-y-3">
                      {officialDetails.team_members.map((member: any) => (
                        <div key={member.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                            <p className="text-xs text-muted-foreground">{member.phone_number || 'No phone'}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{member.designation || 'No designation'}</Badge>
                            <p className="text-xs text-muted-foreground mt-1">
                              Assigned: {new Date(member.assigned_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load official details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Activity Modal */}
      <Dialog open={isActivityModalOpen} onOpenChange={setIsActivityModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Activity Overview - {selectedOfficial?.first_name} {selectedOfficial?.last_name}</span>
            </DialogTitle>
          </DialogHeader>
          {isLoadingActivity ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading activity data...</span>
            </div>
          ) : activityData ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm font-medium">Total Sub-Authorities</p>
                        <p className="text-2xl font-bold">{activityData.total_sub_authorities}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <UserCheck className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">Total Team Members</p>
                        <p className="text-2xl font-bold">{activityData.total_team_members}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Activity className="h-5 w-5 text-purple-500" />
                      <div>
                        <p className="text-sm font-medium">Total Created</p>
                        <p className="text-2xl font-bold">{activityData.total_sub_authorities + activityData.total_team_members}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Activity Over Time (Last 12 Months)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center bg-muted/20 rounded-lg">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Chart visualization would go here</p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Data points: {activityData.activity_data.length} months
                      </p>
                    </div>
                  </div>
                  
                  {/* Data Table */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Monthly Breakdown</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Month</th>
                            <th className="text-center p-2">Sub-Authorities</th>
                            <th className="text-center p-2">Team Members</th>
                            <th className="text-center p-2">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {activityData.activity_data.map((month: any, index: number) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{month.month}</td>
                              <td className="p-2 text-center">
                                <Badge variant={month.sub_authorities > 0 ? "default" : "secondary"}>
                                  {month.sub_authorities}
                                </Badge>
                              </td>
                              <td className="p-2 text-center">
                                <Badge variant={month.team_members > 0 ? "default" : "secondary"}>
                                  {month.team_members}
                                </Badge>
                              </td>
                              <td className="p-2 text-center font-semibold">{month.total}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Failed to load activity data</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Permissions Modal */}
      <Dialog open={isPermissionsModalOpen} onOpenChange={setIsPermissionsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Manage Permissions - {selectedOfficial?.first_name} {selectedOfficial?.last_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_view_reports"
                  checked={permissionsData.can_view_reports}
                  onCheckedChange={(checked) => 
                    setPermissionsData(prev => ({ ...prev, can_view_reports: checked as boolean }))
                  }
                />
                <Label htmlFor="can_view_reports" className="text-sm font-medium">
                  Can View Reports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_approve_reports"
                  checked={permissionsData.can_approve_reports}
                  onCheckedChange={(checked) => 
                    setPermissionsData(prev => ({ ...prev, can_approve_reports: checked as boolean }))
                  }
                />
                <Label htmlFor="can_approve_reports" className="text-sm font-medium">
                  Can Approve Reports
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="can_manage_teams"
                  checked={permissionsData.can_manage_teams}
                  onCheckedChange={(checked) => 
                    setPermissionsData(prev => ({ ...prev, can_manage_teams: checked as boolean }))
                  }
                />
                <Label htmlFor="can_manage_teams" className="text-sm font-medium">
                  Can Manage Teams
                </Label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsPermissionsModalOpen(false)}
                disabled={isUpdatingPermissions}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleUpdatePermissions}
                disabled={isUpdatingPermissions}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdatingPermissions ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfficialsManagement;