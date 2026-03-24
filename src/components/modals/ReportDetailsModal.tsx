import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Camera,
  FileText,
  Download,
  ShieldAlert
} from "lucide-react";
import { useTranslation } from "react-i18next";
import PralayLogo from "@/pages/images/Pralay-logo.png";

interface Report {
  id: string;
  type: string;
  location: string;
  date: string;
  time: string;
  status: "verified" | "pending" | "discarded" | "under_investigation" | "resolved";
  description: string;
  severity?: "low" | "medium" | "high" | "critical";
  reporter?: string;
  reporterEmail?: string;
  source?: string;
  assignedTo?: string;
  latitude?: number;
  longitude?: number;
  images: {
    id: string;
    url?: string;
    caption?: string;
    image_type?: string;
  }[];
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
      case "under_investigation":
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    if (status === "under_investigation") return "Under Investigation";
    if (status === "resolved") return "Resolved";
    if (status === "verified") return "Verified";
    if (status === "discarded") return "Discarded";
    return "Pending";
  };

  const getSeverityLabel = (severity?: string) => {
    if (!severity) return "Moderate";
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  const escapeHtml = (value?: string | number) => {
    const input = value === undefined || value === null ? "" : String(value);
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const hasCoordinates = report.latitude !== undefined && report.longitude !== undefined;
  const mapEmbedUrl = hasCoordinates
    ? (() => {
        const lat = Number(report.latitude);
        const lon = Number(report.longitude);
        const delta = 0.05;
        const bbox = `${lon - delta},${lat - delta},${lon + delta},${lat + delta}`;
        return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
      })()
    : "";

  const createPrintableReportHtml = () => {
    const imageItems = report.images && report.images.length > 0
      ? report.images
          .map((image, idx) => {
            if (image.url) {
              return `
                <div class="media-item">
                  <img src="${escapeHtml(image.url)}" alt="Evidence ${idx + 1}" />
                  <div class="media-caption">${escapeHtml(image.caption || `Evidence ${idx + 1}`)}</div>
                </div>
              `;
            }
            return `
              <div class="media-item media-placeholder">
                <div>No image preview</div>
              </div>
            `;
          })
          .join("")
      : '<div class="media-empty">No evidence images uploaded</div>';

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Hazard Report ${escapeHtml(report.id)}</title>
          <style>
            * { box-sizing: border-box; }
            body {
              margin: 0;
              padding: 24px;
              font-family: "Segoe UI", Tahoma, sans-serif;
              background: #f2f6fb;
              color: #0f2747;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              max-width: 980px;
              margin: 0 auto;
              background: #ffffff;
              border: 1px solid #d2dfef;
              border-radius: 16px;
              overflow: hidden;
            }
            .top {
              background: linear-gradient(135deg, #1f4b7a, #2a6ea7);
              color: #fff;
              padding: 18px 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .top-title { font-size: 30px; font-weight: 800; letter-spacing: 1px; }
            .top-sub { font-size: 13px; opacity: 0.9; }
            .brand-wrap { display: flex; align-items: center; gap: 10px; }
            .brand-logo {
              width: 44px;
              height: 44px;
              object-fit: contain;
              border-radius: 8px;
              background: rgba(255,255,255,0.15);
              padding: 3px;
            }
            .id-card {
              background: rgba(255,255,255,0.12);
              border: 1px solid rgba(255,255,255,0.25);
              border-radius: 10px;
              padding: 10px 14px;
              min-width: 260px;
            }
            .id-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .content { padding: 20px 24px 24px; }
            h1 { margin: 0 0 16px; font-size: 36px; color: #11345b; }
            .section {
              border: 1px solid #cfdeef;
              border-radius: 12px;
              margin-bottom: 14px;
              overflow: hidden;
            }
            .section-head {
              background: linear-gradient(180deg, #e8f1fb, #dde9f6);
              padding: 10px 14px;
              font-size: 21px;
              font-weight: 700;
            }
            .section-body { padding: 12px 14px; }
            .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
            .kv { display: grid; grid-template-columns: 190px 1fr; gap: 8px; margin: 6px 0; }
            .key { color: #49617d; }
            .value { font-weight: 600; }
            .status {
              display: inline-block;
              padding: 4px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 700;
              background: #e4f6e8;
              color: #1f7a38;
            }
            .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
            .media-item img {
              width: 100%;
              height: 130px;
              object-fit: cover;
              border-radius: 8px;
              border: 1px solid #d5e2f0;
            }
            .media-caption { margin-top: 4px; font-size: 12px; color: #506986; }
            .media-placeholder {
              display: flex;
              align-items: center;
              justify-content: center;
              height: 130px;
              border: 1px dashed #afc6df;
              border-radius: 8px;
              color: #6b829d;
              background: #f7fbff;
            }
            .media-empty { color: #6b829d; }
            .map-preview {
              width: 100%;
              height: 120px;
              border: 1px solid #d5e2f0;
              border-radius: 8px;
              overflow: hidden;
            }
            .map-frame {
              width: 100%;
              height: 100%;
              border: 0;
            }
            table { width: 100%; border-collapse: collapse; }
            th, td {
              border-bottom: 1px solid #d9e4f0;
              text-align: left;
              padding: 8px;
              font-size: 13px;
            }
            th { background: #f5f8fc; color: #3f5876; }
            .footer {
              margin-top: 12px;
              padding: 10px 0 0;
              font-size: 12px;
              color: #5a7390;
              text-align: center;
            }
            @media print {
              * {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              body { background: #fff; padding: 0; }
              .sheet { border: none; border-radius: 0; }

              /* Keep headings readable even when browser omits background graphics */
              .top {
                background: #eaf2fb !important;
                border-bottom: 2px solid #2a6ea7 !important;
                color: #123b66 !important;
              }
              .top-title,
              .top-sub,
              .id-card,
              .id-card strong,
              .id-card span,
              h1,
              .section-head {
                color: #123b66 !important;
              }
              .top-sub {
                opacity: 1 !important;
              }
              .id-card {
                background: #f4f8ff !important;
                border-color: #c9dbee !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="sheet">
            <div class="top">
              <div class="brand-wrap">
                <img class="brand-logo" src="${escapeHtml(PralayLogo)}" alt="Pralay logo" />
                <div>
                  <div class="top-title">PRALAY</div>
                  <div class="top-sub">Integrated Platform for Coastal Hazard Reporting</div>
                </div>
              </div>
              <div class="id-card">
                <div class="id-row"><span>Report ID:</span><strong>${escapeHtml(report.id)}</strong></div>
                <div class="id-row"><span>Date:</span><strong>${escapeHtml(report.date)}</strong></div>
                <div class="id-row"><span>Status:</span><strong>${escapeHtml(getStatusLabel(report.status))}</strong></div>
              </div>
            </div>
            <div class="content">
              <h1>Integrated Ocean Hazard Intelligence Report</h1>

              <div class="section">
                <div class="section-head">Incident Overview</div>
                <div class="section-body grid2">
                  <div>
                    <div class="kv"><div class="key">Hazard Type</div><div class="value">${escapeHtml(report.type)}</div></div>
                    <div class="kv"><div class="key">Severity Level</div><div class="value">${escapeHtml(getSeverityLabel(report.severity))}</div></div>
                    <div class="kv"><div class="key">Status</div><div class="value"><span class="status">${escapeHtml(getStatusLabel(report.status))}</span></div></div>
                    <div class="kv"><div class="key">Reporting Source</div><div class="value">${escapeHtml(report.source || "Citizen")}</div></div>
                  </div>
                  <div>
                    <div class="kv"><div class="key">Reporter</div><div class="value">${escapeHtml(report.reporter || "N/A")}</div></div>
                    <div class="kv"><div class="key">Reporter Email</div><div class="value">${escapeHtml(report.reporterEmail || "N/A")}</div></div>
                    <div class="kv"><div class="key">Reported At</div><div class="value">${escapeHtml(`${report.date} ${report.time}`)}</div></div>
                    <div class="kv"><div class="key">Assigned To</div><div class="value">${escapeHtml(report.assignedTo || "Unassigned")}</div></div>
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-head">Location Intelligence</div>
                <div class="section-body grid2">
                  <div>
                    <div class="kv"><div class="key">Location</div><div class="value">${escapeHtml(report.location)}</div></div>
                    <div class="kv"><div class="key">GPS Coordinates</div><div class="value">${escapeHtml(report.latitude !== undefined && report.longitude !== undefined ? `${report.latitude}, ${report.longitude}` : "Not available")}</div></div>
                  </div>
                  <div>
                    ${hasCoordinates
                      ? `<div class="map-preview"><iframe class="map-frame" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="${escapeHtml(mapEmbedUrl)}" title="Map preview"></iframe></div>`
                      : `<div style="height:120px;border:1px dashed #afc6df;border-radius:8px;background:#f7fbff;display:flex;align-items:center;justify-content:center;color:#6883a1;">Map preview not available</div>`}
                  </div>
                </div>
              </div>

              <div class="section">
                <div class="section-head">Media Evidence</div>
                <div class="section-body">
                  <div class="kv"><div class="key">Evidence Count</div><div class="value">${escapeHtml(report.images?.length || 0)} photo(s)</div></div>
                  <div class="media-grid">${imageItems}</div>
                </div>
              </div>

              <div class="section">
                <div class="section-head">Authority Action Log</div>
                <div class="section-body">
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Authority</th>
                        <th>Action Taken</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>${escapeHtml(report.time)}</td>
                        <td>${escapeHtml(report.assignedTo || "Authority Team")}</td>
                        <td>Report reviewed and documented</td>
                        <td>${escapeHtml(getStatusLabel(report.status))}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div class="footer">
                Generated by PRALAY Disaster Intelligence System
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handleDownloadReport = () => {
    const printWindow = window.open("", "_blank", "width=1200,height=900");
    if (!printWindow) {
      return;
    }

    printWindow.document.open();
    printWindow.document.write(createPrintableReportHtml());
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 350);
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
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto p-0">
        <DialogHeader>
          <DialogTitle className="sr-only">
            {t("citizen.history.viewDetails")}
          </DialogTitle>
        </DialogHeader>

        <div className="bg-slate-50">
          <div className="rounded-t-lg bg-gradient-to-r from-[#1f4b7a] to-[#2a6ea7] px-6 py-5 text-white border-b-2 border-cyan-300">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={PralayLogo} alt="Pralay logo" className="h-11 w-11 rounded-md bg-white/20 p-1 object-contain" />
                <div>
                  <div className="text-3xl font-extrabold tracking-wide">PRALAY</div>
                  <div className="text-sm text-slate-100">Integrated Platform for Coastal Hazard Reporting</div>
                </div>
              </div>
              <div className="rounded-xl border border-white/30 bg-white/15 p-3 min-w-[280px] text-sm">
                <div className="flex justify-between py-0.5"><span className="opacity-90">Report ID:</span><strong>{report.id}</strong></div>
                <div className="flex justify-between py-0.5"><span className="opacity-90">Date:</span><strong>{report.date}</strong></div>
                <div className="flex justify-between py-0.5"><span className="opacity-90">Status:</span><strong>{getStatusLabel(report.status)}</strong></div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 space-y-4">
            <h2 className="text-3xl font-semibold text-[#11345b]">Integrated Ocean Hazard Intelligence Report</h2>

            <section className="rounded-xl border border-[#cfdeef] bg-white overflow-hidden">
              <div className="bg-gradient-to-b from-[#e8f1fb] to-[#dde9f6] px-4 py-2 text-xl font-semibold text-[#1b3557]">Incident Overview</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Hazard Type:</span><span className="font-semibold text-slate-800">{report.type}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Severity Level:</span><span className="font-semibold text-slate-800">{getSeverityLabel(report.severity)}</span></div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-600">Status:</span>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1">{getStatusLabel(report.status)}</span>
                    </Badge>
                  </div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Reporting Source:</span><span className="font-semibold text-slate-800">{report.source || "Citizen"}</span></div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Reporter:</span><span className="font-semibold text-slate-800">{report.reporter || "N/A"}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Reporter Email:</span><span className="font-semibold text-slate-800">{report.reporterEmail || "N/A"}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Generated:</span><span className="font-semibold text-slate-800">{report.date} {report.time}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Assigned To:</span><span className="font-semibold text-slate-800">{report.assignedTo || "Unassigned"}</span></div>
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#cfdeef] bg-white overflow-hidden">
              <div className="bg-gradient-to-b from-[#e8f1fb] to-[#dde9f6] px-4 py-2 text-xl font-semibold text-[#1b3557]">Location Intelligence</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4 py-3">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4"><span className="text-slate-600">Location:</span><span className="font-semibold text-slate-800 text-right">{report.location}</span></div>
                  <div className="flex justify-between gap-4"><span className="text-slate-600">GPS Coordinates:</span><span className="font-semibold text-slate-800">{report.latitude !== undefined && report.longitude !== undefined ? `${report.latitude}, ${report.longitude}` : "Not available"}</span></div>
                  <div className="flex items-start gap-2 pt-1 text-slate-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="text-xs">Location pin is available on dashboard map view.</span>
                  </div>
                </div>
                <div className="h-32 rounded-lg border border-dashed border-[#afc6df] bg-[#f7fbff] flex items-center justify-center text-[#6883a1] text-sm overflow-hidden">
                  {hasCoordinates ? (
                    <iframe
                      src={mapEmbedUrl}
                      title="Map preview"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="h-full w-full border-0"
                    />
                  ) : (
                    "Map preview not available"
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-xl border border-[#cfdeef] bg-white overflow-hidden">
              <div className="flex items-center justify-between bg-gradient-to-b from-[#e8f1fb] to-[#dde9f6] px-4 py-2">
                <div className="text-xl font-semibold text-[#1b3557]">Media Evidence</div>
                <Badge variant="outline" className="bg-white text-slate-700 border-slate-300">{report.images?.length || 0} photos</Badge>
              </div>
              <div className="px-4 py-3">
                {report.images && report.images.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {report.images.map((image, i) => (
                      <div key={image.id || i} className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                        {image.url ? (
                          <img
                            src={image.url}
                            alt={`Evidence ${i + 1}`}
                            className="w-full h-28 object-cover"
                          />
                        ) : (
                          <div className="w-full h-28 flex items-center justify-center text-slate-400">
                            <Camera className="h-6 w-6" />
                          </div>
                        )}
                        <div className="px-2 py-1 text-xs text-slate-600">{image.caption || `Evidence ${i + 1}`}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-sm text-slate-500">No media evidence uploaded</div>
                )}
              </div>
            </section>

            <section className="rounded-xl border border-[#cfdeef] bg-white overflow-hidden">
              <div className="bg-gradient-to-b from-[#e8f1fb] to-[#dde9f6] px-4 py-2 text-xl font-semibold text-[#1b3557] flex items-center gap-2">
                <ShieldAlert className="h-5 w-5" />
                Authority Action Log
              </div>
              <div className="px-4 py-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-slate-600 border-b border-slate-200">
                      <th className="py-2 pr-3">Timestamp</th>
                      <th className="py-2 pr-3">Authority</th>
                      <th className="py-2 pr-3">Action Taken</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 pr-3 text-slate-700">{report.time}</td>
                      <td className="py-2 pr-3 text-slate-700">{report.assignedTo || "Authority Team"}</td>
                      <td className="py-2 pr-3 text-slate-700">Report reviewed and documented</td>
                      <td className="py-2">
                        <Badge className={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-xl border border-[#cfdeef] bg-white px-4 py-3">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-slate-500" />
                <p className="text-sm text-slate-600">{report.description}</p>
              </div>
            </section>
          </div>

          <div className="px-6 pb-5 flex justify-end space-x-2">
            <Button onClick={handleDownloadReport}>
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
            <Button variant="outline" onClick={onClose}>
              {t("common.close")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};