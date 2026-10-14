'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { LoadingState } from '@/components/ui/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { useToast } from '@/context/ToastContext';
import { mapService } from '@/services/mapService';
import { locationService } from '@/services/locationService';
import { Project, State, District } from '@/types';
import { formatNumber } from '@/utils/formatters';
import {
  MapPin,
  Layers,
  Filter,
  Eye,
  RefreshCw,
  Building2,
  AlertTriangle,
  CheckCircle2,
  X,
  ExternalLink,
  Lock
} from 'lucide-react';

const ProjectLeafletMap = dynamic(
  () => import('@/components/map/ProjectLeafletMap'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center bg-slate-100 rounded-xl border border-slate-200">
        <LoadingState message="Initializing Leaflet GIS spatial engine..." />
      </div>
    ),
  }
);

export default function MapPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { demoLogin } = useAuth();
  const { error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Filters
  const [stateId, setStateId] = useState<number | undefined>(user?.stateId);
  const [districtId, setDistrictId] = useState<number | undefined>(user?.districtId);
  const [status, setStatus] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [category, setCategory] = useState('ALL');

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);

  useEffect(() => {
    locationService.getStates().then(res => {
      if (res.success && res.data) setStates(res.data);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (stateId) {
      locationService.getDistrictsByState(stateId).then(res => {
        if (res.success && res.data) setDistricts(res.data);
      }).catch(() => {});
    } else {
      setDistricts([]);
      setDistrictId(undefined);
    }
  }, [stateId]);

  const loadMapProjects = async () => {
    setIsLoading(true);
    try {
      const data = await mapService.getProjects({
        stateId,
        districtId,
        status: status !== 'ALL' ? status : undefined,
        riskLevel: riskLevel !== 'ALL' ? riskLevel : undefined,
        category: category !== 'ALL' ? category : undefined,
      });
      setProjects(data || []);
      if (data && data.length > 0 && !selectedProject) {
        setSelectedProject(data[0]);
      }
    } catch (err: any) {
      toastError('Map Load Error', err.message || 'Could not fetch GIS coordinates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMapProjects();
  }, [stateId, districtId, status, riskLevel, category, isAuthenticated]);

  const handleClearFilters = () => {
    if (user?.role === 'ROLE_MINISTRY_ADMIN') {
      setStateId(undefined);
      setDistrictId(undefined);
    }
    setStatus('ALL');
    setRiskLevel('ALL');
    setCategory('ALL');
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingState message="Verifying official authorization credentials..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100/70">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Topbar
          title="NIDHINETRA — GIS Spatial Portal"
          scopeBadge={user?.role === 'ROLE_MINISTRY_ADMIN' ? 'National GIS Grid' : user?.stateName || 'Assigned Jurisdiction'}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-5 max-w-7xl w-full mx-auto">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gov-navy-900" />
              <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                GIS Project Map
              </h1>
            </div>
            <p className="text-xs text-slate-500">
              Interactive spatial view of geotagged works, physical execution milestones, and risk telemetry
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadMapProjects}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Sync Coordinates
            </Button>
            <Link href="/projects">
              <Button variant="primary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                Project Registry
              </Button>
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-blue-900 shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>
                <strong>National Public GIS View:</strong> Displaying geotagged MPLADS assets across India via OpenStreetMap. Sign in with official credentials for administrative sanction workflows.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="primary" size="sm" onClick={() => demoLogin('MINISTRY')}>
                1-Click Official Login
              </Button>
              <Link href="/login">
                <Button variant="outline" size="sm">
                  Login
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gov-navy-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <Filter className="w-3.5 h-3.5 text-gov-saffron" />
              GIS Spatial Filters ({projects.length} Geotagged Assets)
            </span>
            {(status !== 'ALL' || riskLevel !== 'ALL' || category !== 'ALL' || (stateId && user?.role === 'ROLE_MINISTRY_ADMIN')) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] font-bold text-red-700 hover:underline flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" /> Reset Filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* State */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">State / UT</label>
              <select
                value={stateId || ''}
                onChange={(e) => setStateId(e.target.value ? Number(e.target.value) : undefined)}
                disabled={user?.role === 'ROLE_STATE_NODAL_AUTHORITY' || user?.role === 'ROLE_DISTRICT_AUTHORITY' || user?.role === 'ROLE_MP'}
                className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white disabled:bg-slate-100"
              >
                <option value="">All States & UTs</option>
                {states.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">District</label>
              <select
                value={districtId || ''}
                onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : undefined)}
                disabled={!stateId || user?.role === 'ROLE_DISTRICT_AUTHORITY'}
                className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white disabled:bg-slate-100"
              >
                <option value="">All Districts</option>
                {districts.map((d) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
              >
                <option value="ALL">All Statuses</option>
                <option value="ONGOING">Ongoing</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
                <option value="SANCTIONED">Sanctioned</option>
              </select>
            </div>

            {/* Risk */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Risk Severity</label>
              <select
                value={riskLevel}
                onChange={(e) => setRiskLevel(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
              >
                <option value="ALL">All Risk Levels</option>
                <option value="LOW">Low Risk</option>
                <option value="MODERATE">Moderate Risk</option>
                <option value="HIGH">High Risk</option>
                <option value="ANOMALY_FLAGGED">Anomaly Flagged</option>
              </select>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Sector</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
              >
                <option value="ALL">All Sectors</option>
                <option value="Drinking Water">Drinking Water</option>
                <option value="Education">Education</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Roads & Bridges">Roads & Bridges</option>
                <option value="Sanitation & Public Utilities">Sanitation</option>
                <option value="Rural Infrastructure">Rural Infra</option>
              </select>
            </div>
          </div>

          {/* Map Color Legend */}
          <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span className="font-bold">Marker Legend:</span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#138808]" />
              Completed Works
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#0A2540]" />
              Ongoing Works
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#E65100]" />
              Delayed Works
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-[#DC2626]" />
              High Risk / Anomaly
            </span>
          </div>
        </div>

        {/* LEAFLET MAP + SIDEBAR DETAIL PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-[600px]">
            <ProjectLeafletMap
              projects={projects}
              selectedProject={selectedProject}
              onSelectProject={(p) => setSelectedProject(p)}
            />
          </div>

          {/* SIDE INSPECTION PANEL */}
          <div className="lg:col-span-4 h-[600px] flex flex-col">
            {selectedProject ? (
              <Card
                title="Inspected Asset Telemetry"
                subtitle={selectedProject.projectId}
                headerIcon={<MapPin className="w-5 h-5 text-gov-navy-900" />}
                className="h-full flex flex-col justify-between"
              >
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <StatusBadge status={selectedProject.status} />
                      <RiskBadge riskLevel={selectedProject.riskLevel} />
                    </div>
                    <h3 className="font-black text-sm text-gov-navy-900 leading-snug">
                      {selectedProject.projectName}
                    </h3>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
                    <div>
                      <span className="text-slate-400 block font-medium">Jurisdiction:</span>
                      <span className="font-bold text-slate-800">
                        {selectedProject.districtName}, {selectedProject.stateName}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Sector:</span>
                      <span className="font-bold text-slate-800">{selectedProject.categoryName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">MP:</span>
                      <span className="font-bold text-slate-800">{selectedProject.mpName || 'Hon. MP'}</span>
                    </div>
                  </div>

                  {/* Progress & Financials */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Sanctioned</span>
                      <span suppressHydrationWarning className="font-bold text-slate-900 font-mono">
                        ₹{formatNumber(selectedProject.sanctionedAmount)} L
                      </span>
                    </div>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-lg">
                      <span className="text-slate-400 block text-[10px]">Disbursed</span>
                      <span suppressHydrationWarning className="font-bold text-emerald-700 font-mono">
                        ₹{formatNumber(selectedProject.expenditureAmount)} L
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold mb-1 text-xs">
                      <span>Physical Progress</span>
                      <span className="text-gov-navy-900">{selectedProject.physicalProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gov-navy-800 h-full rounded-full"
                        style={{ width: `${selectedProject.physicalProgress}%` }}
                      />
                    </div>
                  </div>

                  {selectedProject.riskReason && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 text-[11px] leading-relaxed">
                      <strong>Risk Note:</strong> {selectedProject.riskReason}
                    </div>
                  )}

                  <div className="pt-1">
                    <Link href={`/projects/${selectedProject.id}`}>
                      <Button variant="primary" size="md" className="w-full font-bold text-xs" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                        View Project Dossier
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ) : (
              <Card title="Inspected Asset" className="h-full flex items-center justify-center text-center p-8 text-xs text-slate-400">
                <p>Click on any marker on the map to inspect project telemetry.</p>
              </Card>
            )}
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
