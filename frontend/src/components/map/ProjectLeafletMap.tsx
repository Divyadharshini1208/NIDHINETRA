'use client';

import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Project } from '@/types';
import { ExternalLink, MapPin, AlertTriangle, Layers, Navigation } from 'lucide-react';

interface ProjectLeafletMapProps {
  projects: Project[];
  selectedProject?: Project | null;
  onSelectProject?: (project: Project) => void;
}

// Helper to determine marker color based on MPLADS status & risk telemetry
const getMarkerColor = (p: Project): string => {
  if (p.riskLevel === 'HIGH' || p.riskLevel === 'ANOMALY_FLAGGED' || p.riskLevel === 'CRITICAL') {
    return '#DC2626'; // Alert Red (High Risk / Anomaly)
  }
  if (p.status === 'COMPLETED') {
    return '#138808'; // Vibrant India Green (Completed)
  }
  if (p.status === 'DELAYED') {
    return '#E65100'; // Gov Saffron / Amber (Delayed)
  }
  return '#0A2540'; // Deep Navy (Ongoing)
};

// Component to handle dynamic map bounds and panning when projects or selection changes
function MapController({
  projects,
  selectedProject,
}: {
  projects: Project[];
  selectedProject?: Project | null;
}) {
  const map = useMap();
  const initialFitDone = useRef(false);

  useEffect(() => {
    if (!map) return;
    const validProjects = projects.filter((p) => p.latitude != null && p.longitude != null);
    if (validProjects.length === 0) return;

    if (selectedProject?.latitude != null && selectedProject?.longitude != null) {
      map.setView([selectedProject.latitude, selectedProject.longitude], 12, {
        animate: true,
      });
    } else if (!initialFitDone.current) {
      if (validProjects.length === 1) {
        map.setView([validProjects[0].latitude!, validProjects[0].longitude!], 10, {
          animate: true,
        });
      } else {
        const bounds = L.latLngBounds(
          validProjects.map((p) => [p.latitude!, p.longitude!])
        );
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
      initialFitDone.current = true;
    }
  }, [map, projects, selectedProject]);

  return null;
}

export default function ProjectLeafletMap({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectLeafletMapProps) {
  const validProjects = projects.filter(
    (p) => typeof p.latitude === 'number' && typeof p.longitude === 'number'
  );

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden shadow-inner border border-slate-200 relative bg-slate-50">
      {/* Top Banner Indicator: OpenStreetMap Engine (Zero API Keys) */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 shadow-md flex items-center gap-2 text-[11px] font-semibold text-slate-700">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Layers className="w-3.5 h-3.5 text-gov-navy-900" />
        <span>OpenStreetMap Standard Tile Engine (No API Key Required)</span>
      </div>

      <MapContainer
        center={[20.5937, 78.9629]} // Geographic center of India
        zoom={5}
        minZoom={4}
        maxZoom={19}
        scrollWheelZoom={true}
        zoomControl={false}
        className="w-full h-full min-h-[500px] z-0"
      >
        {/* OpenStreetMap Standard Tiles - 100% Free, Zero API Key Configuration */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          maxZoom={19}
        />

        <ZoomControl position="bottomright" />

        <MapController projects={projects} selectedProject={selectedProject} />

        {/* Real Geotagged Project Markers from Backend API */}
        {validProjects.map((p) => {
          const isSelected = selectedProject?.id === p.id;
          const markerColor = getMarkerColor(p);

          return (
            <CircleMarker
              key={p.id}
              center={[p.latitude!, p.longitude!]}
              radius={isSelected ? 11 : 8.5}
              pathOptions={{
                fillColor: markerColor,
                color: isSelected ? '#F59E0B' : '#FFFFFF',
                weight: isSelected ? 3.5 : 2.5,
                opacity: 1,
                fillOpacity: 0.95,
              }}
              eventHandlers={{
                click: () => {
                  if (onSelectProject) onSelectProject(p);
                },
              }}
            >
              <Popup className="mplads-custom-popup" minWidth={270} maxWidth={320}>
                <div className="p-3 font-sans text-slate-800">
                  {/* Header: Project ID & Status */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                    <span className="font-mono text-[10px] font-bold bg-[#0A2540] text-white px-2 py-0.5 rounded shadow-2xs">
                      {p.projectId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'DELAYED'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-xs font-black text-slate-900 leading-snug mb-1.5 line-clamp-2">
                    {p.projectName}
                  </h4>

                  {/* Metadata */}
                  <div className="space-y-1 text-[11px] text-slate-600 mb-2.5">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {p.districtName || 'District'}, {p.stateName || 'State'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Sector:</span>
                      <span className="font-semibold text-slate-700">
                        {p.categoryName || 'Infrastructure'}
                      </span>
                    </div>
                  </div>

                  {/* Physical Progress Bar */}
                  <div className="mb-2">
                    <div className="flex justify-between text-[11px] font-medium mb-1">
                      <span className="text-slate-600">Physical Progress</span>
                      <span className="font-black text-[#0A2540]">{p.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, Math.max(0, p.physicalProgress))}%`,
                          backgroundColor: markerColor,
                        }}
                      />
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-1.5 text-[10px] bg-slate-50 p-2 rounded border border-slate-200 mb-2.5">
                    <div>
                      <span className="text-slate-400 block font-medium">Sanctioned</span>
                      <span className="font-bold font-mono text-slate-900">
                        ₹{p.sanctionedAmount}L
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Disbursed</span>
                      <span className="font-bold font-mono text-emerald-700">
                        ₹{p.expenditureAmount}L
                      </span>
                    </div>
                  </div>

                  {/* Risk Telemetry Flag */}
                  {p.riskScore != null && p.riskScore > 30 && (
                    <div className="mb-2.5 p-1.5 bg-red-50 border border-red-200 rounded text-[10px] text-red-800 flex items-start gap-1">
                      <AlertTriangle className="w-3 h-3 text-red-600 shrink-0 mt-0.5" />
                      <span className="leading-tight font-medium">
                        Risk Score: {p.riskScore}/100 ({p.riskLevel})
                      </span>
                    </div>
                  )}

                  {/* Action Link to Full Project Dossier */}
                  <Link
                    href={`/projects/${p.id}`}
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-[#0A2540] hover:bg-[#0F3A66] text-white rounded text-[11px] font-bold text-center transition-colors no-underline shadow-2xs"
                  >
                    <span>View Master Dossier</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}
