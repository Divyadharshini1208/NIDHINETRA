export type RoleType =
  | 'ROLE_MINISTRY_ADMIN'
  | 'ROLE_STATE_NODAL_AUTHORITY'
  | 'ROLE_DISTRICT_AUTHORITY'
  | 'ROLE_MP';

export interface User {
  id: number;
  email: string;
  fullName: string;
  mobileNumber?: string;
  role: RoleType;
  stateId?: number;
  stateName?: string;
  districtId?: number;
  districtName?: string;
  constituencyId?: number;
  constituencyName?: string;
  organization?: string;
  designation?: string;
  isActive: boolean;
  isApproved: boolean;
  accountStatus?: string;
  clearanceStatus?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface State {
  id: number;
  code: string;
  name: string;
  totalSanctionedCr?: number;
  totalExpenditureCr?: number;
  activeProjectsCount?: number;
}

export interface District {
  id: number;
  code: string;
  name: string;
  stateId: number;
  stateName?: string;
  headquarters?: string;
}

export interface Constituency {
  id: number;
  code: string;
  name: string;
  districtId: number;
  districtName?: string;
  houseType?: string;
  mpName?: string;
}

export interface ProjectCategory {
  id: number;
  code: string;
  name: string;
  description?: string;
}

export type ProjectStatus =
  | 'PROPOSED'
  | 'SANCTIONED'
  | 'ONGOING'
  | 'DELAYED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type RiskLevel =
  | 'LOW'
  | 'MODERATE'
  | 'HIGH'
  | 'CRITICAL'
  | 'ANOMALY_FLAGGED';

export interface Project {
  id: number;
  projectId: string;
  projectName: string;
  description?: string;
  stateId?: number;
  stateCode?: string;
  stateName?: string;
  districtId?: number;
  districtCode?: string;
  districtName?: string;
  constituencyId?: number;
  constituencyCode?: string;
  constituencyName?: string;
  mpUserId?: number;
  mpName?: string;
  implementingAgency?: string;
  categoryId?: number;
  categoryCode?: string;
  categoryName?: string;
  sanctionedAmount: number; // Lakhs INR
  releasedAmount: number;   // Lakhs INR
  expenditureAmount: number;// Lakhs INR
  utilizationPercent: number; // (expenditure / released) * 100
  startDate?: string;
  expectedCompletionDate?: string;
  actualCompletionDate?: string;
  physicalProgress: number; // 0-100%
  financialProgress: number;// 0-100%
  status: ProjectStatus;
  riskLevel: RiskLevel;
  riskScore?: number;
  riskReason?: string;
  latitude?: number;
  longitude?: number;
  delayDays?: number;
  isDelayed?: boolean;
  beneficiaries?: number;
  locationDetails?: string;
  documentUrl?: string;
  feasibilityRemarks?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectReviewRequest {
  action: 'SANCTION' | 'REJECT';
  remarks?: string;
  sanctionedAmount?: number;
  sanctionOrderNumber?: string;
  sanctionDate?: string;
  workOrderNumber?: string;
  implementingAgency?: string;
}

export interface Sanction {
  id: number;
  projectId: number;
  projectCode?: string;
  sanctionOrderNumber: string;
  sanctionDate: string;
  sanctionedAmount: number;
  sanctioningAuthority?: string;
  workOrderNumber?: string;
  remarks?: string;
  createdAt?: string;
}

export interface FundRelease {
  id: number;
  projectId: number;
  projectCode?: string;
  installmentNumber: number;
  releaseOrderNumber: string;
  releaseDate: string;
  releasedAmount: number;
  disbursedBy?: string;
  pfmsReference?: string;
  remarks?: string;
  createdAt?: string;
}

export interface Expenditure {
  id: number;
  projectId: number;
  projectCode?: string;
  voucherNumber: string;
  expenditureDate: string;
  amount: number;
  componentName?: string;
  vendorName?: string;
  utilizationCertificateNumber?: string;
  remarks?: string;
  createdAt?: string;
}

export interface Payment {
  id: number;
  projectId: number;
  projectCode?: string;
  paymentReference: string;
  paymentDate: string;
  amount: number;
  payeeName: string;
  paymentMode?: string;
  paymentStatus: string;
  beneficiaryAccount?: string;
  remarks?: string;
  createdAt?: string;
}

export interface ProjectFinancials {
  projectId: number;
  projectCode: string;
  projectName: string;
  sanctionedAmount: number;
  releasedAmount: number;
  expenditureAmount: number;
  balanceWithImplementingAgency: number;
  unreleasedAmount: number;
  utilizationPercent: number;
  financialProgressPercent: number;
  sanctions: Sanction[];
  fundReleases: FundRelease[];
  expenditures: Expenditure[];
  payments: Payment[];
}

export interface ProjectProgressLog {
  id: number;
  projectId: number;
  projectCode?: string;
  reportingDate: string;
  physicalProgressPercent: number;
  financialProgressPercent: number;
  stageDescription?: string;
  inspectionNotes?: string;
  reportedBy?: string;
  delayDays?: number;
  isDelayed?: boolean;
  delayReason?: string;
  createdAt?: string;
}

export interface Document {
  id: number;
  projectId: number;
  projectCode?: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: number;
  uploadedBy?: string;
  uploadedAt?: string;
}

export interface RiskAlert {
  id: number;
  projectId: number;
  projectCode?: string;
  projectName?: string;
  stateName?: string;
  districtName?: string;
  categoryName?: string;
  sanctionedAmount?: number;
  physicalProgress?: number;
  financialProgress?: number;
  riskScore?: number;
  alertType: string;
  severity: string;
  title: string;
  description?: string;
  reasons?: string[];
  triggerRule?: string;
  status: string; // NEW, UNDER_REVIEW, INVESTIGATING, RESOLVED, DISMISSED
  assignedTo?: string;
  detectedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  investigation?: Investigation;
}

export interface InvestigationNote {
  id: number;
  authorName: string;
  authorRole?: string;
  noteText: string;
  createdAt?: string;
}

export interface Investigation {
  id: number;
  projectId: number;
  projectCode?: string;
  projectName?: string;
  riskAlertId?: number;
  caseNumber: string;
  investigatorName?: string;
  status: string; // ASSIGNED, IN_PROGRESS, COMPLETED, CLOSED
  priority?: string;
  assignedDate?: string;
  completionDate?: string;
  findingsSummary?: string;
  notes?: InvestigationNote[];
  createdAt?: string;
}

export interface AiMonitoringSummary {
  totalFlaggedAlerts: number;
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
  criticalRiskCount: number;
  costAnomaliesCount: number;
  duplicateRiskCount: number;
  delayedProjectsCount: number;
  paymentAnomaliesCount: number;
  progressMismatchCount: number;
  averageRiskScore: number;
  riskScoreDistribution: Array<{
    tier: string;
    count: number;
    color: string;
    label: string;
  }>;
  anomalyTypeBreakdown: Array<{
    category: string;
    count: number;
  }>;
  topHighRiskProjects: Array<Project>;
  recentAlerts: Array<RiskAlert>;
}

export interface AuditLog {
  id: number;
  action: string;
  performedBy: string;
  userRole: string;
  details: string;
  ipAddress?: string;
  status: string;
  timestamp: string;
}

export interface FinancialSummary {
  totalSanctionedCr: number;
  totalReleasedCr: number;
  totalExpenditureCr: number;
  totalUnspentBalanceCr: number;
  overallUtilizationPercent: number;
  categoryWiseFinancials: Array<{
    category: string;
    sanctionedCr: number;
    expenditureCr: number;
    utilizationPercent: number;
    projectCount: number;
  }>;
  stateWiseFinancials: Array<{
    stateCode: string;
    stateName: string;
    sanctionedCr: number;
    expenditureCr: number;
    utilizationPercent: number;
  }>;
  monthlyExpenditureTrend: Array<{
    month: string;
    expenditureCr: number;
    sanctionedCr: number;
  }>;
}

export interface AiAnalysisPreview {
  projectId: number;
  projectCode: string;
  overallHealth: string;
  anomalyRiskScore: number;
  riskClassification: string;
  anomalyIndicators: Array<{
    featureName: string;
    detectedPattern: string;
    confidence: string;
    severity: string;
    explanation: string;
  }>;
  predictiveTimeline: {
    expectedCompletion: string;
    aiEstimatedCompletion: string;
    estimatedDelayDays: number;
    costOverrunRiskPercent: number;
  };
  aiRecommendations: string[];
}

export interface ReportPreview {
  reportType: string;
  title: string;
  generatedAt: string;
  scope: string;
  summaryMetrics: Record<string, any>;
  columns: string[];
  rows: Array<Record<string, any>>;
}

export interface DataImportResult {
  batchId: string;
  fileName: string;
  totalRecords: number;
  validRecords: number;
  invalidRecords: number;
  duplicateRecords: number;
  canProceed: boolean;
  validationErrors: string[];
  previewRows: Array<Record<string, any>>;
}

export interface DataImportRecord {
  id: number;
  fileName: string;
  fileType?: string;
  uploadedBy?: string;
  totalRecords?: number;
  validRecords?: number;
  invalidRecords?: number;
  duplicateRecords?: number;
  status: string;
  createdAt?: string;
}

export interface InsightsSummary {
  totalProjects: number;
  completedProjects: number;
  ongoingProjects: number;
  delayedProjects: number;
  highRiskProjectsCount?: number;
  totalSanctionedCr: number;
  totalReleasedCr?: number;
  totalExpenditureCr: number;
  utilizationPercent?: number;
  fundUtilizationRate?: number;
  stateWiseDistribution?: any[];
  statusBreakdown?: any[];
  completionTrends?: any[];
  categoryWiseDistribution?: any[];
}

export interface DashboardStats {
  role: RoleType;
  scopeName: string;
  totalAssignedProjects: number;
  completedCount: number;
  ongoingCount: number;
  delayedCount: number;
  reviewRequiredCount: number;
  sanctionedAmountCr: number;
  expenditureAmountCr: number;
  utilizationRate: number;
  recentProjects: Array<{
    id: number;
    code: string;
    title: string;
    category: string;
    sanctionedAmountLakhs: number;
    releasedAmountLakhs?: number;
    expenditureAmountLakhs: number;
    physicalProgressPercent: number;
    status: string;
    riskLevel: string;
    riskReason?: string;
    stateName?: string;
    districtName?: string;
  }>;
  flaggedAnomalies: Array<{
    id: number;
    code: string;
    title: string;
    riskLevel: RiskLevel;
    riskReason: string;
    progressPercent: number;
    sanctionedLakhs: number;
    expenditureLakhs: number;
  }>;
  recentAuditLogs: AuditLog[];
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresInMs: number;
  user: User;
}

export interface OfficialMpladsData {
  isLiveFetched: boolean;
  sourcePortalUrl: string;
  sourceName: string;
  currentTenure: string;
  fetchedAt?: string;
  statutoryNotice: string;
  allocatedLimitCr: string;
  allocatedLimitRaw: string;
  worksRecommendedCount: number;
  worksRecommendedCr: string;
  worksRecommendedRaw: string;
  worksSanctionedCount: number;
  worksSanctionedCr: string;
  worksSanctionedRaw: string;
  worksCompletedCount: number;
  worksCompletedCr: string;
  worksCompletedRaw: string;
  expenditureOngoingCompletedCr: string;
  expenditureOngoingCompletedRaw: string;
  calamityWorksCount: number;
  calamityAmountCr: string;
  officialStates?: Array<{ stateId: number; stateName: string }>;
}
