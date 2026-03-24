import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Camera,
  User,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiService } from "@/services/api";
import { toast } from "sonner";

interface Report {
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
    image_url?: string;
  }>;
}

interface EnhancedReportDetailsModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
}

// Reusable lifecycle tracker component (placed in same file as requested)
const ReportLifecycleTracker = ({ status }: { status: string }) => {
  const steps = ["submitted", "pending", "approved", "action", "closed"];

  const getCurrentStepIndex = (s: string) => {
    switch (s) {
      case "pending":
        return 1; // Report Submitted + Pending Authority
      case "verified":
        return 2; // Approved
      case "under_investigation":
        return 3; // Action Taken
      case "resolved":
        return 4; // Closed
      default:
        return 0; // fallback to submitted
    }
  };

  // If discarded, show a red rejected banner instead
  if (status === "discarded") {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-red-800 flex items-center gap-3">
        <XCircle className="h-5 w-5 text-red-500" />
        <div>
          <div className="font-semibold">Report Rejected</div>
          <div className="text-sm text-red-700">This report was discarded by authorities.</div>
        </div>
      </div>
    );
  }

  const current = getCurrentStepIndex(status);

  const icons: Record<string, JSX.Element> = {
    submitted: <FileText className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    approved: <CheckCircle className="h-4 w-4" />,
    action: <AlertTriangle className="h-4 w-4" />,
    closed: <CheckCircle className="h-4 w-4" />,
  };

  const labels: Record<string, string> = {
    submitted: "Report Submitted",
    pending: "Pending Authority",
    approved: "Approved",
    action: "Action Taken",
    closed: "Closed",
  };

  const messages: Record<string, string> = {
    submitted: "Report successfully submitted.",
    pending: "Currently under review by authorities",
    approved: "Report approved by authority",
    action: "Field teams taking action",
    closed: "Issue resolved and closed",
  };

  return (
    <div className="my-4">
      <div className="flex items-center gap-4">
        {steps.map((step, idx) => {
          const isCompleted = idx < current;
          const isActive = idx === current;

          return (
            <div className="flex items-center" key={step}>
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full h-9 w-9 flex items-center justify-center transition-transform duration-200 ease-in-out
                    ${isCompleted ? 'bg-green-500 text-white scale-100' : isActive ? 'bg-blue-500 text-white animate-pulse scale-105 ring-4 ring-blue-200/40' : 'bg-gray-100 text-gray-600'}`}
                >
                  {icons[step]}
                </div>
                <div className="mt-2 text-xs text-center w-24">
                  <div className={`${isCompleted ? 'text-green-700' : isActive ? 'text-blue-600' : 'text-gray-500'}`}>{labels[step]}</div>
                </div>
              </div>

              {/* Connector - don't render after last */}
              {idx < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-4 self-center ${idx < current ? 'bg-green-300' : 'bg-gray-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Small helper text under current step */}
      <div className="mt-3 text-sm text-muted-foreground">
        <div className="w-full flex justify-center">
          <span className="text-xs text-center">
            {messages[steps[current]]}
          </span>
        </div>
      </div>
    </div>
  );
};

export const EnhancedReportDetailsModal = ({ report, isOpen, onClose }: EnhancedReportDetailsModalProps) => {
  const { t } = useTranslation();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState<{[key: string]: string}>({});

  // Don't render if report is null
  if (!report) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "discarded":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "under_investigation":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "discarded":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      case "under_investigation":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "resolved":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
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

  const handleImageError = (imageId: string) => {
    console.log(`Failed to load image ${imageId}`);
  };

  const nextImage = () => {
    if (report.images.length > 0) {
      setSelectedImageIndex((prev) => (prev + 1) % report.images.length);
    }
  };

  const prevImage = () => {
    if (report.images.length > 0) {
      setSelectedImageIndex((prev) => (prev - 1 + report.images.length) % report.images.length);
    }
  };

  const openImageInNewTab = (imageUrl: string) => {
    window.open(imageUrl, '_blank');
  };

  // Handlers for lifecycle actions
  const handleTakeAction = async () => {
    try {
      setActionLoading(true);
      await apiService.takeAction(report.report_id);
      toast.success('Authorities have started taking action');
      // Refresh to pick up updated status
      window.location.reload();
    } catch (err: any) {
      console.error('Take action failed', err);
      toast.error(err?.message || 'Failed to take action');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkResolved = async () => {
    try {
      setActionLoading(true);
      await apiService.markResolved(report.report_id);
      toast.success('Report marked as resolved');
      window.location.reload();
    } catch (err: any) {
      console.error('Mark resolved failed', err);
      toast.error(err?.message || 'Failed to mark resolved');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{t("citizen.history.viewDetails")}</span>
            <Badge className={getStatusColor(report.status)}>
              {getStatusIcon(report.status)}
              <span className="ml-1">{t(`status.${report.status}`)}</span>
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report ID */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Report ID: {report.report_id}</span>
          </div>

          {/* Hazard Type and Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {report.hazard_type_display}
            </h3>
            <p className="text-muted-foreground">{report.description}</p>
          </div>

          <Separator />

          {/* Report lifecycle tracker (new) */}
          <ReportLifecycleTracker status={report.status} />

          {/* Location and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{t("citizen.reportHazard.location")}</p>
                <p className="text-muted-foreground">{report.location.full_location}</p>
                <p className="text-xs text-muted-foreground">
                  Coordinates: {report.location.latitude.toFixed(6)}, {report.location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-muted-foreground">
                  {new Date(report.reported_at).toLocaleDateString()} at {new Date(report.reported_at).toLocaleTimeString()}
                </p>
                {report.reviewed_at && (
                  <p className="text-xs text-muted-foreground">
                    Reviewed: {new Date(report.reviewed_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Reporter and Reviewer Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Reported By</p>
                <p className="text-muted-foreground">{report.reported_by.name}</p>
                <p className="text-xs text-muted-foreground">{report.reported_by.email}</p>
              </div>
            </div>
            {report.reviewed_by && (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <div>
                  <p className="text-sm font-medium">Reviewed By</p>
                  <p className="text-muted-foreground">{report.reviewed_by.name}</p>
                  <p className="text-xs text-muted-foreground">{report.reviewed_by.email}</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Images */}
          {report.images_count > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Images ({report.images_count})</span>
              </h4>
              
              {report.images.length > 0 ? (
                <div className="space-y-4">
                  {/* Main Image Display */}
                  <div className="relative">
                    <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                      {report.images[selectedImageIndex]?.image_url ? (
                        <img
                          src={report.images[selectedImageIndex].image_url}
                          alt={`Hazard evidence ${selectedImageIndex + 1}`}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(report.images[selectedImageIndex].id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <div className="text-center">
                            <Camera className="h-12 w-12 mx-auto mb-2" />
                            <p className="text-sm">Image not available</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Navigation arrows for multiple images */}
                    {report.images.length > 1 && (
                      <>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute left-2 top-1/2 transform -translate-y-1/2"
                          onClick={prevImage}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2"
                          onClick={nextImage}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Image Thumbnails */}
                  {report.images.length > 1 && (
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {report.images.map((image, index) => (
                        <button
                          key={image.id}
                          onClick={() => setSelectedImageIndex(index)}
                          className={`aspect-square rounded-lg overflow-hidden border-2 ${
                            selectedImageIndex === index ? 'border-primary' : 'border-transparent'
                          }`}
                        >
                          {image.image_url ? (
                            <img
                              src={image.image_url}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              onError={() => handleImageError(image.id)}
                            />
                          ) : (
                            <div className="w-full h-full bg-muted flex items-center justify-center">
                              <Camera className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Image Info */}
                  <div className="text-sm text-muted-foreground">
                    <p>Image {selectedImageIndex + 1} of {report.images.length}</p>
                    {report.images[selectedImageIndex] && (
                      <div className="flex items-center space-x-4 mt-1">
                        <span>
                          AI Verified: {report.images[selectedImageIndex].is_verified_by_ai ? 'Yes' : 'No'}
                        </span>
                        <span>
                          Confidence: {(report.images[selectedImageIndex].ai_confidence_score * 100).toFixed(1)}%
                        </span>
                        {report.images[selectedImageIndex].image_url && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openImageInNewTab(report.images[selectedImageIndex].image_url!)}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Open Full Size
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Array.from({ length: report.images_count }).map((_, i) => (
                    <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed">
                      <div className="text-center">
                        <Camera className="h-8 w-8 mx-auto mb-2" />
                        <p className="text-sm">Image {i + 1}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Status and Verification Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Report Status</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusColor(report.status)}>
                  {getStatusIcon(report.status)}
                  <span className="ml-1">{t(`status.${report.status}`)}</span>
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Emergency Level:</span>
                <span className={getSeverityColor(report.emergency_level)}>
                  {report.emergency_level.charAt(0).toUpperCase() + report.emergency_level.slice(1)}
                </span>
              </div>
              {report.ai_verification_score && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">AI Verification Score:</span>
                  <span>{(report.ai_verification_score * 100).toFixed(1)}%</span>
                </div>
              )}
              {report.status === "verified" && (
                <p className="text-green-600 text-xs">
                  ✓ This report has been verified by officials and action has been taken.
                </p>
              )}
              {report.status === "pending" && (
                <p className="text-yellow-600 text-xs">
                  ⏳ This report is under review by officials.
                </p>
              )}
              {report.status === "discarded" && (
                <p className="text-red-600 text-xs">
                  ✗ This report was determined to be invalid or duplicate.
                </p>
              )}
              {report.status === "under_investigation" && (
                <p className="text-blue-600 text-xs">
                  🔍 This report is currently under investigation.
                </p>
              )}
              {report.status === "resolved" && (
                <p className="text-green-600 text-xs">
                  ✅ This report has been resolved and action has been completed.
                </p>
              )}
              {/* Action buttons: authority -> Take Action, owner -> Mark as Resolved */}
              <div className="mt-3 flex items-center space-x-2">
                {(() => {
                  // Determine current user from localStorage (frontend auth store)
                  try {
                    if (typeof window !== 'undefined') {
                      const stored = localStorage.getItem('user');
                      const currentUser = stored ? JSON.parse(stored) : null;
                      const role = (currentUser?.role || '').toLowerCase();
                      const authorityRoles = ['state_chairman', 'district_chairman', 'nagar_panchayat_chairman', 'village_sarpanch'];

                      // Authority 'Take Action' button
                      if (authorityRoles.includes(role) && !['under_investigation', 'resolved', 'discarded'].includes(report.status)) {
                        return (
                          <Button size="sm" onClick={handleTakeAction} disabled={actionLoading}>
                            Take Action
                          </Button>
                        );
                      }

                      // Citizen 'Mark as Resolved' button (only report owner)
                      if (report.status === 'under_investigation' && currentUser && (currentUser as any).email === report.reported_by.email) {
                        return (
                          <Button size="sm" onClick={handleMarkResolved} disabled={actionLoading}>
                            Mark as Resolved
                          </Button>
                        );
                      }
                    }
                  } catch (e) {
                    // ignore
                  }
                  return null;
                })()}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};