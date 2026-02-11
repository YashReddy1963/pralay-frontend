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
  FileText
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface Report {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: "verified" | "pending" | "discarded";
  description: string;
  images: number;
}

interface ReportDetailsModalProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}

export const ReportDetailsModal = ({ report, isOpen, onClose }: ReportDetailsModalProps) => {
  const { t } = useTranslation();

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
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <span>Report ID: {report.id}</span>
          </div>

          {/* Hazard Type */}
          <div>
            <h3 className="font-semibold text-lg mb-2">
              {t(`hazards.${report.type.toLowerCase().replace(/\s+/g, '')}`)}
            </h3>
            <p className="text-muted-foreground">{report.description}</p>
          </div>

          <Separator />

          {/* Location and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">{t("citizen.reportHazard.location")}</p>
                <p className="text-muted-foreground">{report.location}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-primary" />
              <div>
                <p className="text-sm font-medium">Date & Time</p>
                <p className="text-muted-foreground">{report.date} at {report.time}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Images */}
          {report.images > 0 && (
            <div>
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Camera className="h-4 w-4" />
                <span>Images ({report.images})</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Array.from({ length: report.images }).map((_, i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg flex items-center justify-center text-muted-foreground border-2 border-dashed">
                    <div className="text-center">
                      <Camera className="h-8 w-8 mx-auto mb-2" />
                      <p className="text-sm">Image {i + 1}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Details */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4" />
              <span>Report Status</span>
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge className={getStatusColor(report.status)}>
                  {getStatusIcon(report.status)}
                  <span className="ml-1">{t(`status.${report.status}`)}</span>
                </Badge>
              </div>
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