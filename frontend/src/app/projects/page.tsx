'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskBadge } from '@/components/ui/RiskBadge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { LoadingState, EmptyState, ErrorState } from '@/components/ui/StateViews';
import { useAuth } from '@/context/AuthContext';
import { useRequireAuth } from '@/utils/useRequireAuth';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { locationService } from '@/services/locationService';
import { Project, State, District } from '@/types';
import {
  Building2,
  Search,
  Filter,
  Eye,
  Plus,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  MapPin,
  Clock,
  Calendar,
  Layers,
  X,
  Lock
} from 'lucide-react';

import { CreateProjectModal } from '@/components/projects/CreateProjectModal';

export default function ProjectsListingPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { demoLogin } = useAuth();
  const { error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authSettled, setAuthSettled] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortField, setSortField] = useState('id,desc');

  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [riskLevel, setRiskLevel] = useState('ALL');
  const [category, setCategory] = useState('ALL');
  const [stateId, setStateId] = useState<number | undefined>(user?.stateId);
  const [districtId, setDistrictId] = useState<number | undefined>(user?.districtId);
  const [mpName, setMpName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Safety timeout: never allow authentication loading to spin indefinitely
  useEffect(() => {
    const timer = setTimeout(() => {
      setAuthSettled(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Sync user scope once user details resolve
  useEffect(() => {
    if (user?.stateId && stateId === undefined) {
      setStateId(user.stateId);
    }
    if (user?.districtId && districtId === undefined) {
      setDistrictId(user.districtId);
    }
  }, [user]);

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

  const fetchProjects = async (page = 0) => {
    // Abort any pending in-flight request to prevent race conditions and redundant backend load
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const hasToken = typeof window !== 'undefined' && localStorage.getItem('mplads_token');
    if (!hasToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await projectService.getProjects({
        search: search.trim() || undefined,
        status: status !== 'ALL' ? status : undefined,
        riskLevel: riskLevel !== 'ALL' ? riskLevel : undefined,
        category: category !== 'ALL' ? category : undefined,
        stateId: stateId,
        districtId: districtId,
        mpName: mpName.trim() || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        size: pageSize,
        sort: sortField,
        signal: controller.signal,
      });

      setProjects(res.content || []);
      setTotalPages(res.totalPages || 1);
      setTotalElements(res.totalElements || 0);
      setCurrentPage(res.page || 0);
      setErrorMessage(null);
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return; // Request was aborted by newer fetch, ignore silently
      }
      const msg = err.message || 'Unable to retrieve projects from the PostgreSQL database.';
      if (err.message?.includes('Bearer token') || err.message?.includes('authentication')) {
        // Suppress unauthenticated noise; handled gracefully by the UI card
      } else {
        setErrorMessage(msg);
        toastError('Projects Load Failed', msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(0);
    return () => {
      abortControllerRef.current?.abort();
    };
  }, [pageSize, sortField, status, riskLevel, category, stateId, districtId, isAuthenticated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects(0);
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('ALL');
    setRiskLevel('ALL');
    setCategory('ALL');
    if (user?.role === 'ROLE_MINISTRY_ADMIN') {
      setStateId(undefined);
      setDistrictId(undefined);
    }
    setMpName('');
    setStartDate('');
    setEndDate('');
    fetchProjects(0);
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
          title="NIDHINETRA — Project Registry & Monitoring"
          scopeBadge={user?.role === 'ROLE_MINISTRY_ADMIN' ? 'National Scope' : user?.stateName || 'Scoped Access'}
        />

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        {/* Header Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
              Master Project Registry
            </h1>
            <p className="text-xs text-slate-500">
              Explore, filter, and monitor all MPLADS works with real-time physical progress and financial records
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {user && (user.role === 'ROLE_MP' || user.role === 'ROLE_MINISTRY_ADMIN') && (
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsCreateModalOpen(true)}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                className="font-bold shadow-xs text-xs"
              >
                + Create New Project
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => fetchProjects(currentPage)}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Link href="/map">
              <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                View on Map
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar Card */}
        <Card className="p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by Project Code, Name, MP Name, or Implementing Agency..."
                className="w-full text-xs pl-9 pr-4 py-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button type="submit" variant="primary" size="md" className="flex-1 sm:flex-initial text-xs">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                leftIcon={<Filter className="w-3.5 h-3.5" />}
                className="flex-1 sm:flex-initial text-xs"
              >
                {showAdvancedFilters ? 'Hide Filters' : 'Filters'}
              </Button>
              {(search || status !== 'ALL' || riskLevel !== 'ALL' || category !== 'ALL') && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="p-2 text-slate-500 hover:text-red-600 transition"
                  title="Clear all filters"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </form>

          {/* Quick Filter Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Status:</span>
            {['ALL', 'ONGOING', 'COMPLETED', 'DELAYED', 'SANCTIONED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatus(st)}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition ${
                  status === st
                    ? 'bg-gov-navy-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Risk Level:</span>
            {['ALL', 'LOW', 'MODERATE', 'HIGH', 'ANOMALY_FLAGGED'].map((rk) => (
              <button
                key={rk}
                onClick={() => setRiskLevel(rk)}
                className={`px-2.5 py-1 rounded-full font-bold text-[11px] transition ${
                  riskLevel === rk
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {rk.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Advanced Multi-Parameter Filters */}
          {showAdvancedFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-xs">
              {/* Category */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Project Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                >
                  <option value="ALL">All Categories</option>
                  <option value="Drinking Water">Drinking Water</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Roads & Bridges">Roads & Bridges</option>
                  <option value="Sanitation & Public Utilities">Sanitation & Utilities</option>
                  <option value="Rural Infrastructure">Rural Infrastructure</option>
                </select>
              </div>

              {/* State Filter (for Ministry Admin) */}
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

              {/* District Filter */}
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

              {/* MP Filter */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">MP Name</label>
                <input
                  type="text"
                  value={mpName}
                  onChange={(e) => setMpName(e.target.value)}
                  placeholder="Filter by MP name..."
                  className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                />
              </div>

              {/* Date range */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sanctioned From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Completion By</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                />
              </div>

              {/* Sort field */}
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Sort By</label>
                <select
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-md border border-slate-300 bg-white"
                >
                  <option value="id,desc">Newest First (Default)</option>
                  <option value="sanctionedAmount,desc">Sanctioned Amount (High to Low)</option>
                  <option value="physicalProgress,asc">Physical Progress (Lowest First)</option>
                  <option value="delayDays,desc">Delay Days (Longest First)</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={() => fetchProjects(0)}
                  className="w-full text-xs"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* PROJECTS TABLE */}
        <Card
          title="Filtered Projects"
          subtitle={isAuthenticated ? `Showing ${projects.length} of ${totalElements} projects matching criteria` : 'Protected Government Resource'}
          headerIcon={<Building2 className="w-5 h-5 text-gov-navy-800" />}
          borderAccent
        >
          {isLoading || (authLoading && !authSettled) ? (
            <div className="py-12">
              <LoadingState message="Loading projects from PostgreSQL database..." />
            </div>
          ) : errorMessage ? (
            <div className="py-12">
              <ErrorState
                title="Unable to Load Projects"
                message={errorMessage}
                onRetry={() => fetchProjects(currentPage)}
              />
            </div>
          ) : !isAuthenticated ? (
            <div className="py-12 text-center max-w-lg mx-auto space-y-4">
              <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto shadow-2xs">
                <Lock className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-gov-navy-900">Official Authentication Required</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Access to the Master Project Registry requires an authenticated stakeholder session with a valid Bearer token.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => demoLogin('MINISTRY')}
                >
                  1-Click Login (Ministry Admin)
                </Button>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Go to Login Page
                  </Button>
                </Link>
              </div>
            </div>
          ) : projects.length === 0 ? (
            <div className="py-12">
              <EmptyState
                title="No Projects Found"
                description="No projects match your active search and filter combination. Try clearing filters or broadening search parameters."
                actionLabel="Clear Filters"
                onAction={handleClearFilters}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <Table
                columns={[
                  {
                    key: 'code',
                    header: 'Project Code & Name',
                    render: (p: Project) => (
                      <div className="max-w-xs sm:max-w-sm">
                        <span className="font-bold text-gov-navy-900 block font-mono text-xs">{p.projectId}</span>
                        <span className="text-slate-700 font-semibold text-xs line-clamp-2">{p.projectName}</span>
                        <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                          MP: {p.mpName || 'Hon. MP'}
                        </span>
                      </div>
                    ),
                  },
                  {
                    key: 'location',
                    header: 'Location',
                    render: (p: Project) => (
                      <div className="text-xs">
                        <span className="font-bold text-slate-900">{p.districtName || 'District'}</span>
                        <span className="text-slate-500 block">{p.stateName || 'State'}</span>
                        {p.constituencyName && (
                          <span className="text-[10px] text-amber-700 block mt-0.5 font-medium">{p.constituencyName} PC</span>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: 'category',
                    header: 'Sector',
                    render: (p: Project) => (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                        {p.categoryName || 'General'}
                      </span>
                    ),
                  },
                  {
                    key: 'financials',
                    header: 'Financials (₹ Lakhs)',
                    render: (p: Project) => (
                      <div className="text-xs space-y-0.5">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Sanction:</span>
                          <span className="font-bold text-slate-900">₹{p.sanctionedAmount}L</span>
                        </div>
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500">Disbursed:</span>
                          <span className="font-bold text-emerald-700">₹{p.expenditureAmount}L</span>
                        </div>
                        <div className="flex justify-between gap-2 text-[10px]">
                          <span className="text-slate-400">Utilization:</span>
                          <span className="font-bold text-gov-navy-800">{p.utilizationPercent}%</span>
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'progress',
                    header: 'Physical Progress',
                    render: (p: Project) => (
                      <div className="w-24 text-xs">
                        <div className="flex justify-between font-bold mb-0.5">
                          <span>{p.physicalProgress}%</span>
                          {p.delayDays && p.delayDays > 0 ? (
                            <span className="text-[10px] text-amber-700">+{p.delayDays}d</span>
                          ) : null}
                        </div>
                        <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.physicalProgress >= 100
                                ? 'bg-emerald-600'
                                : p.delayDays && p.delayDays > 0
                                ? 'bg-amber-600'
                                : 'bg-gov-navy-800'
                            }`}
                            style={{ width: `${p.physicalProgress}%` }}
                          />
                        </div>
                      </div>
                    ),
                  },
                  {
                    key: 'status',
                    header: 'Status',
                    render: (p: Project) => <StatusBadge status={p.status} />,
                  },
                  {
                    key: 'risk',
                    header: 'Risk Level',
                    render: (p: Project) => <RiskBadge riskLevel={p.riskLevel} />,
                  },
                  {
                    key: 'action',
                    header: 'Action',
                    render: (p: Project) => (
                      <Link href={`/projects/${p.id}`}>
                        <Button variant="outline" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
                          Details
                        </Button>
                      </Link>
                    ),
                  },
                ]}
                data={projects}
                keyExtractor={(p: Project) => p.id}
              />

              {/* Pagination Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <span>Show</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(0);
                    }}
                    className="px-2 py-1 border border-slate-300 rounded bg-white text-xs"
                  >
                    <option value={10}>10 per page</option>
                    <option value={20}>20 per page</option>
                    <option value={50}>50 per page</option>
                  </select>
                  <span>records (Page {currentPage + 1} of {totalPages})</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 0 || isLoading}
                    onClick={() => fetchProjects(currentPage - 1)}
                    leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}
                  >
                    Previous
                  </Button>

                  <span className="px-3 py-1 font-bold text-gov-navy-900 bg-slate-100 rounded border border-slate-200">
                    {currentPage + 1}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage + 1 >= totalPages || isLoading}
                    onClick={() => fetchProjects(currentPage + 1)}
                    rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>
      </main>
      </div>

      {/* CREATE NEW PROJECT MODAL */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => fetchProjects(0)}
      />
    </div>
  );
}
