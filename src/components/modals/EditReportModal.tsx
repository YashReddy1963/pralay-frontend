import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText,
  MapPin,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";

interface HazardReport {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: "verified" | "pending" | "discarded";
  severity: "low" | "medium" | "high";
  description: string;
  images: number;
  reporter: string;
}

interface EditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: HazardReport | null;
  onSave: (updatedReport: HazardReport) => void;
}

const hazardTypes = [
  { value: "highWaves", label: "High Waves" },
  { value: "marineDebris", label: "Marine Debris" },
  { value: "stormSurge", label: "Storm Surge" },
  { value: "waterPollution", label: "Water Pollution" },
  { value: "coastalFlooding", label: "Coastal Flooding" },
  { value: "cycloneWarning", label: "Cyclone Warning" },
];

const statusOptions = [
  { value: "verified", label: "Verified" },
  { value: "pending", label: "Pending" },
  { value: "discarded", label: "Discarded" },
];

const severityOptions = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
];

const EditReportModal = ({ isOpen, onClose, report, onSave }: EditReportModalProps) => {
  const { t } = useOfficialLanguage();
  const [formData, setFormData] = useState<Partial<HazardReport>>({});

  useEffect(() => {
    if (report) {
      setFormData(report);
    }
  }, [report]);

  const handleSubmit = () => {
    if (report && formData) {
      const updatedReport = { ...report, ...formData } as HazardReport;
      onSave(updatedReport);
      onClose();
    }
  };

  if (!report) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{t("reports.editReport")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Report ID */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <FileText className="h-4 w-4" />
            <span>Report ID: {report.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="type">{t("reports.type")}</Label>
                <Select 
                  value={formData.type || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select hazard type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hazardTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {t(`hazards.${type.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">{t("reportHazard.location")}</Label>
                <Input
                  id="location"
                  value={formData.location || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Enter location"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time || ""}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="reporter">Reporter</Label>
                <Input
                  id="reporter"
                  value={formData.reporter || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, reporter: e.target.value }))}
                  placeholder="Reporter name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={formData.status || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {t(`status.${status.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select 
                  value={formData.severity || ""} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, severity: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    {severityOptions.map((severity) => (
                      <SelectItem key={severity.value} value={severity.value}>
                        {t(`severity.${severity.value}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="images">Number of Images</Label>
                <Input
                  id="images"
                  type="number"
                  value={formData.images || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, images: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description">{t("reportHazard.description")}</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Report description"
              rows={4}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <Button onClick={handleSubmit}>
              {t("common.save")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditReportModal;