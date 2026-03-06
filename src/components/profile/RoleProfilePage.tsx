import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiService } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { toPng } from "html-to-image";
import JsBarcode from "jsbarcode";
import PralayLogo from "@/pages/images/Pralay-logo.png";
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
  FileCheck,
  Briefcase,
  UserCheck,
  Eye,
  CheckCircle2,
  Users,
  Download,
} from "lucide-react";

type RoleProfilePageProps = {
  title: string;
  subtitle: string;
  accentClassName?: string;
};

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
  current_designation: string;
  custom_role: string;
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
  current_designation: "",
  custom_role: "",
};

const RoleProfilePage = ({ title, subtitle, accentClassName = "from-primary/10 via-primary/5" }: RoleProfilePageProps) => {
  const { toast } = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<ProfileForm>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isIdCardOpen, setIsIdCardOpen] = useState(false);
  const [isDownloadingIdCard, setIsDownloadingIdCard] = useState(false);

  const [selectedProfileImage, setSelectedProfileImage] = useState<File | null>(null);
  const [profilePreviewUrl, setProfilePreviewUrl] = useState<string | null>(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const idCardRef = useRef<HTMLDivElement>(null);
  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [barcodeImgUrl, setBarcodeImgUrl] = useState<string | null>(null);

  const fullName = useMemo(() => {
    if (!profile) return "User";
    return [profile.first_name, profile.middle_name, profile.last_name].filter(Boolean).join(" ") || "User";
  }, [profile]);

  const displayRole = useMemo(() => profile?.custom_role || profile?.role_display || profile?.role || "User", [profile]);

  const displayLocation = useMemo(() => {
    if (!profile) return "State- —";
    return `State- ${profile.state || "—"}`;
  }, [profile]);

  const uniqueCardId = useMemo(() => {
    const userId = String(profile?.id ?? "0").padStart(4, "0");
    const govId = String(profile?.government_service_id || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const emailPart = String(profile?.email || "").split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const seed = (govId || `${emailPart}${userId}`).slice(0, 10) || `PRALAY${userId}`;
    return `PRL${userId}${seed}`;
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
        current_designation: response.profile.current_designation || "",
        custom_role: response.profile.custom_role || "",
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
      current_designation: profile.current_designation || "",
      custom_role: profile.custom_role || "",
    });

    if (profilePreviewUrl) {
      URL.revokeObjectURL(profilePreviewUrl);
    }

    setProfilePreviewUrl(null);
    setSelectedProfileImage(null);
    setRemoveProfilePicture(false);
    setIsEditing(false);
  };

  const onSave = async () => {
    setIsSaving(true);
    try {
      const hasImageChanges = !!selectedProfileImage || removeProfilePicture;

      const payload = hasImageChanges
        ? (() => {
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
            formData.append("current_designation", form.current_designation);
            formData.append("custom_role", form.custom_role);

            if (selectedProfileImage) {
              formData.append("profile_picture", selectedProfileImage);
            }

            if (removeProfilePicture) {
              formData.append("remove_profile_picture", "true");
            }

            return formData;
          })()
        : {
            ...form,
          };

      const response = await apiService.updateProfile(payload as any);
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
            profile_picture_url: response.profile.profile_picture_url,
            state: response.profile.state,
            district: response.profile.district,
            nagar_panchayat: response.profile.nagar_panchayat,
            village: response.profile.village,
            current_designation: response.profile.current_designation,
            custom_role: response.profile.custom_role,
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

  useEffect(() => {
    if (!uniqueCardId) return;

    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;

    // determine desired barcode width based on id card container, fallback to 400
    const containerWidth = idCardRef.current?.clientWidth || 430;
    const targetWidth = Math.max(200, Math.round(containerWidth * 0.92));
    const targetHeight = 64;

    // set canvas size and render barcode into it
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    JsBarcode(canvas, uniqueCardId, {
      format: "CODE128",
      displayValue: false,
      lineColor: "#000000",
      width: 0.9,
      height: targetHeight,
      margin: 6,
    });

    try {
      const dataUrl = canvas.toDataURL("image/png");
      setBarcodeImgUrl(dataUrl);
    } catch (err) {
      // ignore
      setBarcodeImgUrl(null);
    }
  }, [uniqueCardId, isIdCardOpen]);

  const onDownloadIdCard = async () => {
    if (!idCardRef.current) return;

    setIsDownloadingIdCard(true);
    try {
      const dataUrl = await toPng(idCardRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `${fullName.replace(/\s+/g, "_") || "pralay"}_id_card.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download ID card. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloadingIdCard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">Loading profile...</CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <Card className="overflow-hidden border-primary/20">
        <div className={`bg-gradient-to-r ${accentClassName} to-background p-5`}>
          <div className="flex flex-wrap items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/15 flex items-center justify-center overflow-hidden border border-primary/20">
              {profilePreviewUrl || (profile?.profile_picture_url && !removeProfilePicture) ? (
                <img src={profilePreviewUrl || profile?.profile_picture_url} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <UserCircle2 className="h-12 w-12 text-primary" />
              )}
            </div>

            <div className="space-y-1 flex-1 min-w-[240px]">
              <h2 className="text-xl font-semibold truncate">{fullName}</h2>
              <p className="text-sm text-muted-foreground truncate">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Badge variant="secondary" className="text-xs">
                  {profile?.role_display || profile?.role || "User"}
                </Badge>
                {profile?.current_designation && (
                  <Badge variant="outline" className="text-xs">
                    {profile.current_designation}
                  </Badge>
                )}
              </div>

              {isEditing && (
                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={onSelectProfileImage} className="hidden" />
                  <Button type="button" variant="outline" size="sm" className="h-8" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="h-3.5 w-3.5 mr-1" />
                    {profile?.profile_picture_url || profilePreviewUrl ? "Change Photo" : "Add Photo"}
                  </Button>
                  {(profile?.profile_picture_url || profilePreviewUrl) && (
                    <Button type="button" variant="outline" size="sm" className="h-8 text-destructive hover:text-destructive" onClick={onRemoveProfilePicture}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>
              )}
            </div>

            {!isEditing ? (
              <div className="flex gap-2">
                <Dialog open={isIdCardOpen} onOpenChange={setIsIdCardOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <UserCheck className="h-4 w-4 mr-2" />
                      ID Card
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[420px] p-4 sm:p-5">
                    <DialogHeader>
                      <DialogTitle>Official ID Card</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-3">
                      <div
                        ref={idCardRef}
                        className="relative mx-auto h-[760px] w-[430px] max-w-full overflow-hidden rounded-[22px] border border-sky-200 bg-[#F7FAFF] text-[#0F172A]"
                      >
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(2,132,199,0.08),transparent_45%),radial-gradient(circle_at_80%_65%,rgba(14,165,233,0.1),transparent_40%)]" />

                        <div className="absolute -top-28 left-1/2 h-56 w-[700px] -translate-x-[60%] rounded-[50%] bg-gradient-to-r from-[#003EBA] via-[#0078E7] to-[#14B8EA]" />
                        <div className="absolute -top-24 left-1/2 h-48 w-[640px] -translate-x-[58%] rounded-[50%] bg-[#F7FAFF]" />
                        <div className="absolute -bottom-20 left-1/2 h-48 w-[760px] -translate-x-[62%] rounded-[50%] bg-gradient-to-r from-[#003EBA] via-[#0078E7] to-[#14B8EA]" />

                        <div className="relative z-10 flex h-full flex-col px-8 py-8">
                          <div className="flex items-center gap-3">
                            <div className="h-16 w-16 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
                              <img src={PralayLogo} alt="Pralay" className="h-full w-full object-contain" />
                            </div>
                            <h3 className="text-[48px] font-bold leading-none text-[#1C64B0]">Pralay</h3>
                          </div>

                          <div className="mt-8 self-center rounded-full border-[6px] border-[#1295E3] p-1">
                            <div className="h-52 w-52 overflow-hidden rounded-full bg-slate-100">
                              {profilePreviewUrl || (profile?.profile_picture_url && !removeProfilePicture) ? (
                                <img
                                  src={profilePreviewUrl || profile?.profile_picture_url}
                                  alt={fullName}
                                  className="h-full w-full object-cover"
                                  crossOrigin="anonymous"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-200">
                                  <UserCircle2 className="h-20 w-20 text-slate-500" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 text-center px-2">
                            <h4 className="text-[24px] font-bold leading-tight tracking-tight text-black">{fullName}</h4>
                            <p className="mt-2 text-[16px] font-medium leading-none text-slate-800">{displayRole}</p>
                            <p className="mt-2 text-[14px] leading-none text-slate-700">{displayLocation}</p>
                          </div>

                          <div className="mx-auto mt-4 h-[2px] w-[88%] bg-[#1D6FB7]/80" />

                          <div className="mt-5 space-y-2 text-[14px] leading-tight text-slate-900">
                            <div className="flex gap-2">
                              <span className="min-w-[64px] text-slate-600">Email</span>
                              <span className="break-all">{profile?.email || "—"}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="min-w-[64px] text-slate-600">Phone</span>
                              <span>{profile?.phone_number || "—"}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="min-w-[64px] text-slate-600">Gov ID</span>
                              <span>{profile?.government_service_id || "—"}</span>
                            </div>
                          </div>

                          <div className="mt-auto rounded-2xl bg-white/95 px-6 py-6 shadow-sm ring-1 ring-slate-200 flex flex-col items-center justify-center">
                            {barcodeImgUrl ? (
                              <img src={barcodeImgUrl} alt={`Barcode ${uniqueCardId}`} className="block h-[72px] w-[92%] max-w-full object-contain" />
                            ) : (
                              <canvas ref={barcodeCanvasRef} style={{ display: "none" }} />
                            )}
                            <p className="mt-2 text-center text-[12px] tracking-[0.15em] text-slate-600">ID {uniqueCardId}</p>
                          </div>
                        </div>
                      </div>

                      <Button className="w-full" onClick={onDownloadIdCard} disabled={isDownloadingIdCard}>
                        <Download className="h-4 w-4 mr-2" />
                        {isDownloadingIdCard ? "Downloading..." : "Download ID Card"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </div>
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Personal & Location Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <Textarea value={form.address} onChange={(e) => onFieldChange("address", e.target.value)} disabled={!isEditing} className="min-h-24" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Professional Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Briefcase className="h-4 w-4" />Designation</Label>
              <Input value={form.current_designation} onChange={(e) => onFieldChange("current_designation", e.target.value)} disabled={!isEditing} />
            </div>

            <div className="space-y-2">
              <Label>Custom Role</Label>
              <Input value={form.custom_role} onChange={(e) => onFieldChange("custom_role", e.target.value)} disabled={!isEditing} />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground flex items-center gap-2"><Shield className="h-4 w-4" />System Role</span>
              <span className="font-medium text-right">{profile?.role_display || profile?.role || "—"}</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground flex items-center gap-2"><FileCheck className="h-4 w-4" />Gov Service ID</span>
              <span className="font-medium text-right break-all">{profile?.government_service_id || "—"}</span>
            </div>

            {profile?.service_card_proof_url && (
              <Button variant="outline" className="w-full justify-start" onClick={() => window.open(profile.service_card_proof_url, "_blank") }>
                <Download className="h-4 w-4 mr-2" />
                View Service Card Proof
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Access & Account Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-2 text-muted-foreground mb-1"><Eye className="h-4 w-4" />View Reports</div>
              <div className="font-semibold">{profile?.can_view_reports ? "Allowed" : "Not allowed"}</div>
            </div>
            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-2 text-muted-foreground mb-1"><CheckCircle2 className="h-4 w-4" />Approve Reports</div>
              <div className="font-semibold">{profile?.can_approve_reports ? "Allowed" : "Not allowed"}</div>
            </div>
            <div className="p-3 rounded-md border bg-muted/20">
              <div className="flex items-center gap-2 text-muted-foreground mb-1"><Users className="h-4 w-4" />Manage Teams</div>
              <div className="font-semibold">{profile?.can_manage_teams ? "Allowed" : "Not allowed"}</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" />Email</span>
            <span className="font-medium text-right break-all">{profile?.email || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" />Joined</span>
            <span className="font-medium text-right">{toReadableDate(profile?.date_joined)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><Clock3 className="h-4 w-4" />Last Login</span>
            <span className="font-medium text-right">{toReadableDate(profile?.last_login_time)}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground flex items-center gap-2"><UserCheck className="h-4 w-4" />Created By</span>
            <span className="font-medium text-right">{profile?.created_by || "System"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-medium text-right">#{profile?.id || "—"}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleProfilePage;
