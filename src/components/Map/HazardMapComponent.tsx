import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
// @ts-ignore optional clustering plugin
import "leaflet.markercluster";

interface HazardImage {
  id: number;
  url: string;
  type: string;
  caption: string;
  is_verified_by_ai: boolean;
  ai_confidence_score?: number;
}

interface HazardReport {
  id: string;
  report_id: string;
  hazard_type: string;
  hazard_type_display: string;
  description: string;
  coordinates: [number, number];
  location: {
    latitude: number;
    longitude: number;
    country: string;
    state: string;
    district: string;
    city: string;
    address?: string;
  };
  status: "verified" | "pending" | "discarded" | "under_investigation" | "resolved";
  status_display: string;
  is_verified: boolean;
  reported_at: string;
  reported_by: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  images_count: number;
  has_images: boolean;
  images: HazardImage[];
  reviewed_by?: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
  review_notes?: string;
}

interface LocationIndicator {
  lat: number;
  lng: number;
  title: string;
  description: string;
}

interface HazardMapComponentProps {
  reports: HazardReport[];
  onReportClick?: (report: HazardReport) => void;
  locationIndicator?: LocationIndicator | null;
}

const HazardMapComponent = ({ reports, onReportClick = () => {}, locationIndicator }: HazardMapComponentProps) => {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const locationMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      attributionControl: true,
      preferCanvas: true,
    }).setView([20.5937, 78.9629], 5);
    mapRef.current = map;

    // Theme-aware tiles
    const prefersDark = document.documentElement.classList.contains("dark");
    const tileUrl = prefersDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    L.tileLayer(tileUrl, {
      attribution: '&copy; OpenStreetMap, © Carto',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // Optional cluster group if plugin available
    // Disable clustering - show all markers directly
    const clusterGroup = null;

    // Add markers with offset for overlapping coordinates
    const coordinateCounts = new Map();
    reports.forEach((report) => {
      const markerColor =
        report.status === "verified" ? "#10b981" :        // Green for verified
        report.status === "pending" ? "#f59e0b" :          // Yellow for pending
        report.status === "discarded" ? "#ef4444" :        // Red for discarded
        report.status === "under_investigation" ? "#8b5cf6" : // Purple for under investigation
        report.status === "resolved" ? "#06b6d4" :        // Cyan for resolved
        "#6b7280";                                        // Gray for other statuses

      // Add small offset for overlapping coordinates
      const coordKey = `${report.coordinates[0]},${report.coordinates[1]}`;
      const count = coordinateCounts.get(coordKey) || 0;
      coordinateCounts.set(coordKey, count + 1);
      
      const offsetLat = report.coordinates[0] + (count * 0.001); // Small offset
      const offsetLng = report.coordinates[1] + (count * 0.001);

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${markerColor};
            width: 28px;
            height: 28px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            position: relative;
          ">
            <div style="
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(45deg);
            "></div>
            ${count > 0 ? `
              <div style="
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 16px;
                height: 16px;
                font-size: 10px;
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                transform: rotate(45deg);
              ">${count + 1}</div>
            ` : ''}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const marker = L.marker([offsetLat, offsetLng], { icon, riseOnHover: true });

      // Hover tooltip
      const locationText = `${report.location.city}, ${report.location.district}`;
      marker.bindTooltip(`${report.hazard_type_display} • ${locationText}`, { direction: 'top', offset: [0, -10], opacity: 0.9 });

      // Format date
      const reportDate = new Date(report.reported_at);
      const formattedDate = reportDate.toLocaleDateString();
      const formattedTime = reportDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      marker.bindPopup(`
        <div style="min-width: 280px; max-width: 350px;">
          <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px;">
            <h4 style="font-weight: 600; margin: 0 0 4px 0; color: #111827;">${report.hazard_type_display}</h4>
            <div style="
              display: inline-block;
              padding: 4px 8px;
              border-radius: 6px;
              font-size: 11px;
              font-weight: 500;
              background-color: ${markerColor};
              color: white;
            ">${report.status_display}</div>
          </div>
          
          <div style="margin-bottom: 12px;">
            <p style="font-size: 13px; color: #374151; margin: 0 0 8px 0; line-height: 1.4;">${report.description}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 8px; border-radius: 6px; margin-bottom: 12px;">
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">📍 <strong>Location:</strong> ${locationText}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">🏛️ <strong>District:</strong> ${report.location.district}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0 0 4px 0;">🏛️ <strong>State:</strong> ${report.location.state}</p>
            <p style="font-size: 12px; color: #6b7280; margin: 0;">📊 <strong>Coordinates:</strong> ${report.coordinates[0].toFixed(6)}, ${report.coordinates[1].toFixed(6)}</p>
            ${count > 0 ? `<p style="font-size: 11px; color: #ef4444; margin: 4px 0 0 0;">⚠️ <strong>Note:</strong> ${count + 1} reports at this location</p>` : ''}
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
            <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">🕒 <strong>Reported:</strong> ${formattedDate} at ${formattedTime}</p>
            <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">👤 <strong>Reporter:</strong> ${report.reported_by.first_name} ${report.reported_by.last_name}</p>
            <p style="font-size: 11px; color: #6b7280; margin: 0 0 4px 0;">📧 <strong>Email:</strong> ${report.reported_by.email}</p>
            ${report.has_images ? `<p style="font-size: 11px; color: #059669; margin: 0;">📷 <strong>Images:</strong> ${report.images_count} uploaded</p>` : ''}
            ${report.reviewed_by ? `<p style="font-size: 11px; color: #6b7280; margin: 0;">✅ <strong>Reviewed by:</strong> ${report.reviewed_by.first_name} ${report.reviewed_by.last_name}</p>` : ''}
            ${report.review_notes ? `<p style="font-size: 11px; color: #6b7280; margin: 0; font-style: italic;">📝 <strong>Notes:</strong> ${report.review_notes}</p>` : ''}
          </div>
        </div>
      `);

      marker.on("click", () => {
        onReportClick(report);
      });
      // Add marker directly to map (no clustering)
      marker.addTo(map);
    });

    // No cluster group needed - markers added directly to map

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [reports, onReportClick]);

  // Handle location indicator
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing location marker
    if (locationMarkerRef.current) {
      mapRef.current.removeLayer(locationMarkerRef.current);
      locationMarkerRef.current = null;
    }

    // Add new location marker if locationIndicator exists
    if (locationIndicator) {
      // Create a special icon for the location indicator
      const locationIcon = L.divIcon({
        className: "location-indicator-marker",
        html: `
          <div style="
            background-color: #3b82f6;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
            position: relative;
            animation: pulse 2s infinite;
          ">
            <div style="
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 12px;
              height: 12px;
              background: white;
              border-radius: 50%;
            "></div>
          </div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.1); opacity: 0.8; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const locationMarker = L.marker(
        [locationIndicator.lat, locationIndicator.lng], 
        { icon: locationIcon, riseOnHover: true }
      );

      // Add popup for location indicator
      locationMarker.bindPopup(`
        <div style="min-width: 250px;">
          <h4 style="font-weight: 600; margin-bottom: 8px; color: #3b82f6;">📍 ${locationIndicator.title}</h4>
          <p style="font-size: 13px; color: #666; margin-bottom: 8px;">${locationIndicator.description}</p>
          <p style="font-size: 11px; color: #999; margin: 0;">
            Coordinates: ${locationIndicator.lat.toFixed(6)}, ${locationIndicator.lng.toFixed(6)}
          </p>
        </div>
      `, { closeButton: true, autoClose: false });

      locationMarker.addTo(mapRef.current);
      locationMarkerRef.current = locationMarker;

      // Pan to the location indicator
      mapRef.current.setView([locationIndicator.lat, locationIndicator.lng], 15);
    }
  }, [locationIndicator]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-b-lg"
      style={{ minHeight: "540px" }}
    />
  );
};

export default HazardMapComponent;
