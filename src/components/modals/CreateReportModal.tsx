import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  AlertTriangle,
  Camera,
  FileText,
  Download
} from "lucide-react";
import { useOfficialLanguage } from "@/contexts/LanguageContext";

interface SocialPost {
  id: string;
  platform: string;
  content: string;
  author: string;
  timestamp: string;
  location?: string;
  images?: number;
}

interface CreateReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  socialPost?: SocialPost;
}

const hazardTypes = [
  { value: "highWaves", label: "High Waves" },
  { value: "marineDebris", label: "Marine Debris" },
  { value: "stormSurge", label: "Storm Surge" },
  { value: "waterPollution", label: "Water Pollution" },
  { value: "coastalFlooding", label: "Coastal Flooding" },
  { value: "cycloneWarning", label: "Cyclone Warning" },
];

const CreateReportModal = ({ isOpen, onClose, socialPost }: CreateReportModalProps) => {
  const { t } = useOfficialLanguage();
  const [formData, setFormData] = useState({
    hazardType: "",
    location: socialPost?.location || "",
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    verifyingOfficial: "",
    socialMediaReferences: socialPost?.content || "",
    citizenEvidence: "",
    remarks: "",
  });

  const handleSubmit = () => {
    // Mock report creation
    console.log("Creating report:", formData);
    onClose();
  };

  const handleExportPDF = () => {
    // Mock PDF export
    console.log("Exporting PDF report");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-primary" />
            <span>{t("social.createReport")}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Social Media Reference */}
          {socialPost && (
            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold mb-2">Social Media Reference</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{socialPost.platform}</Badge>
                    <span className="text-sm text-muted-foreground">{socialPost.timestamp}</span>
                  </div>
                  <p className="text-sm">{socialPost.content}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>Author: {socialPost.author}</span>
                    {socialPost.location && (
                      <span>Location: {socialPost.location}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Report Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="hazardType">{t("reportHazard.selectType")}</Label>
                <Select value={formData.hazardType} onValueChange={(value) => setFormData(prev => ({ ...prev, hazardType: value }))}>
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
                  value={formData.location}
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
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="verifyingOfficial">Verifying Official</Label>
                <Input
                  id="verifyingOfficial"
                  value={formData.verifyingOfficial}
                  onChange={(e) => setFormData(prev => ({ ...prev, verifyingOfficial: e.target.value }))}
                  placeholder="Enter official name"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="socialMediaReferences">Social Media References</Label>
                <Textarea
                  id="socialMediaReferences"
                  value={formData.socialMediaReferences}
                  onChange={(e) => setFormData(prev => ({ ...prev, socialMediaReferences: e.target.value }))}
                  placeholder="Social media post content and links"
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="citizenEvidence">Citizen Evidence</Label>
                <Textarea
                  id="citizenEvidence"
                  value={formData.citizenEvidence}
                  onChange={(e) => setFormData(prev => ({ ...prev, citizenEvidence: e.target.value }))}
                  placeholder="Additional evidence from citizens"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                  placeholder="Additional remarks and observations"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              {t("common.cancel")}
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button onClick={handleSubmit}>
                {t("common.submit")}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateReportModal;