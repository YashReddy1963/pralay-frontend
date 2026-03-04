import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import {
  UserCircle2,
  Mail,
  Phone,
  MapPin,
  Shield,
  CalendarDays,
  Clock3,
  Edit3,
  Save,
  X,
  Camera,
  Trash2,
} from "lucide-react";

type ProfileForm = {
  first_name: string;
  middle_name: string;
  last_name: string;
  phone_number: string;
  state: string;
  district: string;
  nagar_panchayat: string;
  village: string;
  address: string;
};

const toReadableDate = (value?: string) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
};

const emptyForm: ProfileForm = {
  first_name: "",
  middle_name: "",
  last_name: "",
  phone_number: "",
  state: "",
  district: "",
  nagar_panchayat: "",
  village: "",
  address: "",
};

const CitizenProfile = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fullName = useMemo(() => {
    if (!profile) return "Citizen";
    return [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || "Citizen";
  }, [profile]);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const response = await apiService.getProfile();
      setProfile(response.profile);
      setForm({
        first_name: response.profile.first_name || "",
        middle_name: response.profile.middle_name || "",
        last_name: response.profile.last_name || "",
        phone_number: response.profile.phone_number || "",
        state: response.profile.state || "",
        district: response.profile.district || "",
        nagar_panchayat: response.profile.nagar_panchayat || "",
        village: response.profile.village || "",
        address: response.profile.address || "",
      });
    } catch (error) {
      toast({
        title: "Unable to load profile",
        description: "Please refresh and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onFieldChange = (key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCancel = () => {
    if (!profile) return;
    setForm({
      first_name: profile.first_name || "",
      middle_name: profile.middle_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
      state: profile.state || "",
      district: profile.district || "",
      nagar_panchayat: profile.nagar_panchayat || "",
      village: profile.village || "",
      address: profile.address || "",
    });
    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }
    setProfilePreviewUrl(null);
    setSelectedProfileImage(null);
    setRemoveProfilePicture(false);
    setIsEditing(false);
  };

  const onSelectProfileImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid image",
        description: "Please choose an image file.",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Profile picture must be less than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    setSelectedProfileImage(file);
    setProfilePreviewUrl(URL.createObjectURL(file));
    setRemoveProfilePicture(false);
  };

  const onRemoveProfilePicture = () => {
    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    setProfilePreviewUrl(null);
    setSelectedProfileImage(null);
    setRemoveProfilePicture(true);
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const hasImageChanges = !!selectedProfileImage || removeProfilePicture;

      const payload = hasImageChanges ? (() => {
        const formData = new FormData();
        formData.append("first_name", form.first_name);
        formData.append("middle_name", form.middle_name);
        formData.append("last_name", form.last_name);
        formData.append("phone_number", form.phone_number);
        formData.append("state", form.state);
        formData.append("district", form.district);
        formData.append("nagar_panchayat", form.nagar_panchayat);
        formData.append("village", form.village);
        formData.append("address", form.address);

        if (selectedProfileImage) {
          formData.append("profile_picture", selectedProfileImage);
        }

        if (removeProfilePicture) {
          formData.append("remove_profile_picture", "true");
        }

        return formData;
      })() : form;

      const response = await apiService.updateProfile(payload);
      setProfile(response.profile);
      setIsEditing(false);

      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
      setProfilePreviewUrl(null);
      setSelectedProfileImage(null);
      setRemoveProfilePicture(false);

      if (user) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            first_name: response.profile.first_name,
            last_name: response.profile.last_name,
            phone_number: response.profile.phone_number,
            state: response.profile.state,
            district: response.profile.district,
            nagar_panchayat: response.profile.nagar_panchayat,
            village: response.profile.village,
            profile_picture_url: response.profile.profile_picture_url,
          })
        );
      }

      toast({
        title: "Profile updated",
        description: "Your profile information has been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error?.message || "Unable to save profile changes.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    return () => {
      if (profilePreviewUrl) {
        URL.revokeObjectURL(profilePreviewUrl);
      }
    };
  }, [profilePreviewUrl]);

  if (isLoading) {
    return (
      <div className="p-4 pb-20">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading profile...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      <Card className="overflow-hidden border-primary/20">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background p-5">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden border border-primary/20">
              {profilePreviewUrl || (profile?.profile_picture_url && !removeProfilePicture) ? (
                <img
                  src={profilePreviewUrl || profile?.profile_picture_url}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-10 w-10 text-primary" />
              )}
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <h1 className="text-xl font-semibold truncate">{fullName}</h1>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <div className="flex items-center gap-2 pt-1">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role_display || profile?.role || "Citizen"}
                </Badge>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2 pt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={onSelectProfileImage}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-3.5 w-3.5 mr-1" />
                    {profile?.profile_picture_url || profilePreviewUrl ? "Change Photo" : "Add Photo"}
                  </Button>
                  {(profile?.profile_picture_url || profilePreviewUrl) && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-8 text-destructive hover:text-destructive"
                      onClick={onRemoveProfilePicture}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button size="sm" onClick={onSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-1" />
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.first_name} onChange={(e) => onFieldChange("first_name", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Middle Name</Label>
              <Input value={form.middle_name} onChange={(e) => onFieldChange("middle_name", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.last_name} onChange={(e) => onFieldChange("last_name", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Phone className="h-4 w-4" />Phone</Label>
              <Input value={form.phone_number} onChange={(e) => onFieldChange("phone_number", e.target.value)} disabled={!isEditing} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Location
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => onFieldChange("state", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>District</Label>
              <Input value={form.district} onChange={(e) => onFieldChange("district", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Nagar Panchayat</Label>
              <Input value={form.nagar_panchayat} onChange={(e) => onFieldChange("nagar_panchayat", e.target.value)} disabled={!isEditing} />
            </div>
            <div className="space-y-2">
              <Label>Village</Label>
              <Input value={form.village} onChange={(e) => onFieldChange("village", e.target.value)} disabled={!isEditing} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              value={form.address}
              onChange={(e) => onFieldChange("address", e.target.value)}
              disabled={!isEditing}
              className="min-h-24"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Email</span>
            <span className="font-medium text-right truncate">{profile?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4" />Role</span>
            <span className="font-medium">{profile?.role_display || profile?.role || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" />Joined</span>
            <span className="font-medium text-right">{toReadableDate(profile?.date_joined)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><Clock3 className="h-4 w-4" />Last Login</span>
            <span className="font-medium text-right">{toReadableDate(profile?.last_login_time)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CitizenProfile;