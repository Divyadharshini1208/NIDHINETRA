'use client';

import React, { useState, useEffect } from 'react';
import { Topbar } from '@/components/common/Topbar';
import { Sidebar } from '@/components/common/Sidebar';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { adminService, AdminUser, UserStatistics } from '@/services/adminService';
import {
  Users,
  ShieldCheck,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ShieldAlert,
  Ban,
  Check,
  X,
  UserX,
  Info
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [statistics, setStatistics] = useState<UserStatistics>({
    totalPersonnel: 0,
    activeAccounts: 0,
    approvedClearance: 0,
    pendingApproval: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    variant: 'danger' | 'warning' | 'info';
    action: () => Promise<void>;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmLabel: 'Confirm',
    variant: 'warning',
    action: async () => {},
  });

  // Rejection modal state
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    user: AdminUser | null;
    reason: string;
  }>({
    isOpen: false,
    user: null,
    reason: '',
  });

  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getUsers(0, 100);
      setUsers(data.users || []);
      if (data.statistics) {
        setStatistics(data.statistics);
      } else {
        // Fallback calculation from returned list if needed
        const uList = data.users || [];
        setStatistics({
          totalPersonnel: uList.length,
          activeAccounts: uList.filter(u => u.isActive && u.accountStatus === 'ACTIVE').length,
          approvedClearance: uList.filter(u => u.isApproved && u.clearanceStatus === 'APPROVED').length,
          pendingApproval: uList.filter(u => !u.isApproved || u.clearanceStatus === 'PENDING').length,
        });
      }
    } catch (err: any) {
      toastError('Load Error', err.message || 'Could not fetch user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Explicit approval handler (triggers confirmation)
  const handlePromptApprove = (u: AdminUser) => {
    if (currentUser && currentUser.id === u.id) {
      toastError('Action Disallowed', 'Ministry Administrators are not permitted to approve their own account.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Account Approval',
      message: `Are you sure you want to approve official clearance for ${u.fullName} (${u.email})? This will set clearance status to APPROVED, activate the account, and grant access to the portal.`,
      confirmLabel: 'Approve & Activate',
      variant: 'info',
      action: async () => {
        setIsActionLoading(true);
        try {
          const res = await adminService.approveUser(u.id, true);
          success('Account Approved', `${u.fullName}'s account has been approved and activated.`);
          if (res && res.statistics) setStatistics(res.statistics);
          await loadUsers();
        } catch (err: any) {
          toastError('Approval Failed', err.message || 'Could not approve account');
        } finally {
          setIsActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Revoke clearance handler (triggers confirmation)
  const handlePromptRevoke = (u: AdminUser) => {
    if (currentUser && currentUser.id === u.id) {
      toastError('Action Disallowed', 'Ministry Administrators are not permitted to alter clearance on their own account.');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      title: 'Confirm Clearance Revocation',
      message: `Are you sure you want to revoke official clearance for ${u.fullName} (${u.email})? This will set clearance status to REVOKED, deactivate the account, and immediately revoke portal access.`,
      confirmLabel: 'Revoke Clearance',
      variant: 'danger',
      action: async () => {
        setIsActionLoading(true);
        try {
          const res = await adminService.approveUser(u.id, false);
          success('Clearance Revoked', `${u.fullName}'s clearance has been revoked.`);
          if (res && res.statistics) setStatistics(res.statistics);
          await loadUsers();
        } catch (err: any) {
          toastError('Revocation Failed', err.message || 'Could not revoke clearance');
        } finally {
          setIsActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Prompt rejection modal
  const handlePromptReject = (u: AdminUser) => {
    if (currentUser && currentUser.id === u.id) {
      toastError('Action Disallowed', 'Ministry Administrators are not permitted to reject their own account.');
      return;
    }

    setRejectModal({
      isOpen: true,
      user: u,
      reason: '',
    });
  };

  // Execute rejection
  const handleExecuteReject = async () => {
    if (!rejectModal.user) return;
    setIsActionLoading(true);
    try {
      const res = await adminService.rejectUser(rejectModal.user.id, rejectModal.reason);
      success('Application Rejected', `Registration for ${rejectModal.user.fullName} has been rejected.`);
      if (res && res.statistics) setStatistics(res.statistics);
      setRejectModal({ isOpen: false, user: null, reason: '' });
      await loadUsers();
    } catch (err: any) {
      toastError('Rejection Failed', err.message || 'Could not reject registration application');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Toggle active/inactive status (deactivate / reactivate)
  const handlePromptToggleStatus = (u: AdminUser) => {
    if (currentUser && currentUser.id === u.id) {
      toastError('Action Disallowed', 'Ministry Administrators are not permitted to toggle status on their own account.');
      return;
    }

    const actionText = u.isActive ? 'Deactivate' : 'Activate';
    setConfirmDialog({
      isOpen: true,
      title: `Confirm ${actionText} Account`,
      message: u.isActive
        ? `Are you sure you want to deactivate ${u.fullName}'s account? The user will be unable to log in until reactivated.`
        : `Are you sure you want to reactivate ${u.fullName}'s account? The user will regain access according to their approved clearance.`,
      confirmLabel: `${actionText} Account`,
      variant: u.isActive ? 'warning' : 'info',
      action: async () => {
        setIsActionLoading(true);
        try {
          const res = await adminService.toggleStatus(u.id);
          success('Status Updated', `${u.fullName}'s account status has been updated.`);
          if (res && res.statistics) setStatistics(res.statistics);
          await loadUsers();
        } catch (err: any) {
          toastError('Update Failed', err.message || 'Could not update account status');
        } finally {
          setIsActionLoading(false);
          setConfirmDialog(prev => ({ ...prev, isOpen: false }));
        }
      },
    });
  };

  // Pending queue users
  const pendingUsers = users.filter(
    u => u.clearanceStatus === 'PENDING' || u.accountStatus === 'PENDING' || !u.isApproved
  );

  // Filtered directory users
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.organization?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.designation?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;

    let matchesStatus = true;
    if (statusFilter === 'ACTIVE') {
      matchesStatus = u.isActive && u.accountStatus === 'ACTIVE';
    } else if (statusFilter === 'INACTIVE') {
      matchesStatus = !u.isActive && u.accountStatus === 'INACTIVE';
    } else if (statusFilter === 'APPROVED') {
      matchesStatus = u.isApproved && u.clearanceStatus === 'APPROVED';
    } else if (statusFilter === 'PENDING') {
      matchesStatus = !u.isApproved || u.clearanceStatus === 'PENDING';
    } else if (statusFilter === 'REJECTED') {
      matchesStatus = u.clearanceStatus === 'REJECTED' || u.accountStatus === 'REJECTED';
    } else if (statusFilter === 'REVOKED') {
      matchesStatus = u.clearanceStatus === 'REVOKED' || u.accountStatus === 'REVOKED';
    }

    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (roleName: string) => {
    switch (roleName) {
      case 'ROLE_MINISTRY_ADMIN':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-navy-100 text-gov-navy-900 border border-gov-navy-300">Central Ministry Admin</span>;
      case 'ROLE_STATE_NODAL_AUTHORITY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">State Nodal Authority</span>;
      case 'ROLE_DISTRICT_AUTHORITY':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">District Authority</span>;
      case 'ROLE_MP':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">Member of Parliament</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-800">{roleName}</span>;
    }
  };

  const getAccountStatusBadge = (u: AdminUser) => {
    if (u.accountStatus === 'ACTIVE' || (u.isActive && u.isApproved)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Active
        </span>
      );
    }
    if (u.accountStatus === 'PENDING' || (!u.isApproved && u.clearanceStatus === 'PENDING')) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" /> Pending
        </span>
      );
    }
    if (u.accountStatus === 'INACTIVE') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <XCircle className="w-3 h-3" /> Inactive
        </span>
      );
    }
    if (u.accountStatus === 'REJECTED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
          <Ban className="w-3 h-3" /> Rejected
        </span>
      );
    }
    if (u.accountStatus === 'REVOKED') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
          <ShieldAlert className="w-3 h-3" /> Revoked
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
        {u.accountStatus || 'Unknown'}
      </span>
    );
  };

  const getClearanceBadge = (u: AdminUser) => {
    if (u.clearanceStatus === 'APPROVED' || (u.isApproved && !u.clearanceStatus)) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <ShieldCheck className="w-3 h-3" /> Approved
        </span>
      );
    }
    if (u.clearanceStatus === 'PENDING' || !u.isApproved) {
      if (u.clearanceStatus === 'REJECTED') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-800 border border-red-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      }
      if (u.clearanceStatus === 'REVOKED') {
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <ShieldAlert className="w-3 h-3" /> Revoked
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
          <Clock className="w-3 h-3" /> Pending Clearance
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
        {u.clearanceStatus || 'Pending'}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="NIDHINETRA — User Governance & Account Clearance"
          scopeBadge="National Security Administration"
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-gov-navy-800" />
                <h1 className="text-xl font-black text-gov-navy-900 tracking-tight">
                  NIDHINETRA User Governance & Clearances
                </h1>
              </div>
              <p className="text-xs text-slate-500">
                Authorized personnel directory, registration approval queue, and access clearance governance
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              isLoading={isLoading}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Refresh Directory
            </Button>
          </div>

          {/* Top KPI counters (Recalculated dynamically from PostgreSQL database) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block uppercase">Total Personnel</span>
              <span className="text-2xl font-black text-gov-navy-900 font-mono mt-1 block">
                {statistics.totalPersonnel}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block uppercase">Active Accounts</span>
              <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">
                {statistics.activeAccounts}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-semibold block uppercase">Approved Clearance</span>
              <span className="text-2xl font-black text-gov-navy-800 font-mono mt-1 block">
                {statistics.approvedClearance}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/40 shadow-xs">
              <span className="text-xs text-amber-900 font-semibold block uppercase">Pending Approval</span>
              <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">
                {statistics.pendingApproval}
              </span>
            </div>
          </div>

          {/* Section: Pending Approval Queue */}
          <Card
            title={`Pending Approval Requests (${pendingUsers.length})`}
            subtitle="New official registrations awaiting explicit Ministry Administrator review and clearance"
            headerIcon={<Clock className="w-5 h-5 text-amber-600" />}
            borderAccent
          >
            {pendingUsers.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No Pending Approval Requests</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  All registered personnel accounts have been processed. Newly registered accounts will appear here for administrative clearance.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-3 px-4">Applicant</th>
                      <th className="py-3 px-4">Requested Role</th>
                      <th className="py-3 px-4">Organization & Designation</th>
                      <th className="py-3 px-4">Jurisdiction</th>
                      <th className="py-3 px-4">Registration Date</th>
                      <th className="py-3 px-4 text-right">Approval Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {pendingUsers.map(u => {
                      const isSelf = currentUser?.id === u.id;
                      return (
                        <tr key={u.id} className="hover:bg-amber-50/30 transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-bold text-gov-navy-900 block">{u.fullName}</span>
                            <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                            {u.mobileNumber && (
                              <span className="text-slate-400 text-[10px] block">{u.mobileNumber}</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {getRoleBadge(u.role)}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{u.organization || 'Government Department'}</span>
                            <span className="text-slate-500 text-[11px]">{u.designation || 'Officer'}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-semibold text-slate-800 block">{u.stateName || 'National'}</span>
                            <span className="text-slate-500 text-[11px]">{u.districtName || '-'}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            }) : 'Recent'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {isSelf ? (
                              <span className="text-[11px] text-slate-400 italic">Self-approval disallowed</span>
                            ) : (
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handlePromptApprove(u)}
                                  leftIcon={<Check className="w-3.5 h-3.5" />}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white"
                                >
                                  Approve
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handlePromptReject(u)}
                                  leftIcon={<X className="w-3.5 h-3.5" />}
                                  className="text-red-700 hover:bg-red-50 border-red-200"
                                >
                                  Reject
                                </Button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {/* Filter Toolbar */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, email, designation, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
                >
                  <option value="ALL">All Roles</option>
                  <option value="ROLE_MINISTRY_ADMIN">Ministry Administrator</option>
                  <option value="ROLE_STATE_NODAL_AUTHORITY">State Nodal Authority</option>
                  <option value="ROLE_DISTRICT_AUTHORITY">District Authority</option>
                  <option value="ROLE_MP">Member of Parliament</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white text-slate-700 font-medium focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PENDING">Pending Approval</option>
                  <option value="ACTIVE">Active Accounts</option>
                  <option value="INACTIVE">Inactive Accounts</option>
                  <option value="APPROVED">Approved Clearance</option>
                  <option value="REJECTED">Rejected Applications</option>
                  <option value="REVOKED">Revoked Clearance</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Main User Directory Table */}
          <Card
            title="Authorized Personnel Directory"
            subtitle={`Showing ${filteredUsers.length} registered personnel profiles`}
            headerIcon={<ShieldCheck className="w-5 h-5 text-gov-navy-800" />}
            borderAccent
          >
            <Table
              columns={[
                {
                  key: 'user',
                  header: 'Personnel Name & Email',
                  render: (u: AdminUser) => (
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gov-navy-900 block text-xs">{u.fullName}</span>
                        {currentUser?.id === u.id && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-slate-500 text-[11px] font-mono">{u.email}</span>
                      {u.mobileNumber && (
                        <span className="text-slate-400 text-[10px] block">{u.mobileNumber}</span>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'role',
                  header: 'Jurisdiction Role',
                  render: (u: AdminUser) => getRoleBadge(u.role),
                },
                {
                  key: 'org',
                  header: 'Organization / Office',
                  render: (u: AdminUser) => (
                    <div className="text-xs">
                      <span className="text-slate-800 font-semibold block">{u.organization || 'Central MoSPI'}</span>
                      <span className="text-slate-500 text-[11px]">{u.designation || 'Officer'}</span>
                    </div>
                  ),
                },
                {
                  key: 'jurisdiction',
                  header: 'State & District',
                  render: (u: AdminUser) => (
                    <div className="text-xs">
                      <span className="font-semibold text-slate-800 block">{u.stateName || 'National'}</span>
                      <span className="text-slate-500 text-[11px]">{u.districtName || '-'}</span>
                    </div>
                  ),
                },
                {
                  key: 'status',
                  header: 'Account Status',
                  render: (u: AdminUser) => getAccountStatusBadge(u),
                },
                {
                  key: 'clearance',
                  header: 'Clearance Status',
                  render: (u: AdminUser) => (
                    <div>
                      {getClearanceBadge(u)}
                      {u.rejectionReason && (
                        <p className="text-[10px] text-red-600 mt-1 max-w-[150px] truncate" title={u.rejectionReason}>
                          Reason: {u.rejectionReason}
                        </p>
                      )}
                    </div>
                  ),
                },
                {
                  key: 'actions',
                  header: 'Clearance Actions',
                  render: (u: AdminUser) => {
                    const isSelf = currentUser?.id === u.id;
                    const isPending = u.clearanceStatus === 'PENDING' || !u.isApproved;
                    const isApproved = u.isApproved && u.clearanceStatus === 'APPROVED';
                    const isRevoked = u.clearanceStatus === 'REVOKED';
                    const isRejected = u.clearanceStatus === 'REJECTED';

                    if (isSelf) {
                      return <span className="text-[10px] text-slate-400 italic">Current User</span>;
                    }

                    return (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPending && (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handlePromptApprove(u)}
                              className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] py-1 px-2.5"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromptReject(u)}
                              className="text-red-700 hover:bg-red-50 border-red-200 text-[11px] py-1 px-2"
                            >
                              Reject
                            </Button>
                          </>
                        )}

                        {isApproved && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromptToggleStatus(u)}
                              className="text-[11px] py-1 px-2"
                            >
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePromptRevoke(u)}
                              className="text-red-700 hover:bg-red-50 border-red-200 text-[11px] py-1 px-2"
                            >
                              Revoke
                            </Button>
                          </>
                        )}

                        {(isRevoked || isRejected) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePromptApprove(u)}
                            className="text-blue-700 hover:bg-blue-50 border-blue-200 text-[11px] py-1 px-2"
                          >
                            Re-Approve
                          </Button>
                        )}
                      </div>
                    );
                  },
                },
              ]}
              data={filteredUsers}
              keyExtractor={(u: AdminUser) => u.id}
            />
          </Card>
        </main>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDialog.action}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmLabel={confirmDialog.confirmLabel}
        variant={confirmDialog.variant}
        isLoading={isActionLoading}
      />

      {/* Rejection Modal with Optional Reason */}
      <Modal
        isOpen={rejectModal.isOpen}
        onClose={() => setRejectModal({ isOpen: false, user: null, reason: '' })}
        title="Reject Clearance Application"
        subtitle={rejectModal.user ? `Reject application for ${rejectModal.user.fullName} (${rejectModal.user.email})` : undefined}
        maxWidth="md"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectModal({ isOpen: false, user: null, reason: '' })}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleExecuteReject}
              isLoading={isActionLoading}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-3 py-1">
          <div className="flex items-start gap-2 text-xs text-amber-800 bg-amber-50 p-3 rounded-md border border-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Rejecting this application will set the clearance and account status to REJECTED. The applicant will not be able to log in or access portal resources.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Rejection Reason (Optional):
            </label>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="e.g. Unverifiable official jurisdiction, incomplete institutional credentials..."
              rows={3}
              className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-navy-800 focus:outline-hidden"
            />
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              This reason will be logged into the central security audit trail.
            </span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
