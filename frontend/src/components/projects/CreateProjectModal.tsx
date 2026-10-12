'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { projectService } from '@/services/projectService';
import { locationService } from '@/services/locationService';
import { Project, ProjectCategory, State, District, Constituency } from '@/types';
import {
  Building2,
  FileText,
  IndianRupee,
  Users,
  MapPin,
  Calendar,
  Layers,
  Paperclip,
  CheckCircle2,
  ShieldAlert,
  Info
} from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (project: Project) => void;
}

const DEFAULT_CATEGORIES = [
  { id: 1, code: 'DRINKING_WATER', name: 'Drinking Water' },
  { id: 2, code: 'EDUCATION', name: 'Education' },
  { id: 3, code: 'HEALTHCARE', name: 'Healthcare' },
  { id: 4, code: 'ROADS_BRIDGES', name: 'Roads & Bridges' },
  { id: 5, code: 'SANITATION_UTILITIES', name: 'Sanitation & Public Utilities' },
  { id: 6, code: 'RURAL_INFRA', name: 'Rural Infrastructure' },
];

export function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { user } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();

  const isMp = user?.role === 'ROLE_MP';

  // Form Fields
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | string>('');
  const [locationDetails, setLocationDetails] = useState('');
  const [stateId, setStateId] = useState<number | string>(user?.stateId || 1);
  const [districtId, setDistrictId] = useState<number | string>(user?.districtId || 1);
  const [constituencyId, setConstituencyId] = useState<number | string>(user?.constituencyId || 1);
  const [sanctionedAmount, setSanctionedAmount] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [implementingAgency, setImplementingAgency] = useState('Zilla Parishad Pune');
  const [documentUrl, setDocumentUrl] = useState('');
  const [expectedCompletionDate, setExpectedCompletionDate] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Dropdown options
  const [categories, setCategories] = useState<ProjectCategory[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);

  // State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setProjectName('');
      setDescription('');
      setSanctionedAmount('');
      setBeneficiaries('');
      setLocationDetails('');
      setDocumentUrl('');
      setErrors({});

      // Set default expected date to 6 months from now
      const defaultDate = new Date();
      defaultDate.setMonth(defaultDate.getMonth() + 6);
      setExpectedCompletionDate(defaultDate.toISOString().split('T')[0]);

      // Set user defaults
      if (user?.stateId) setStateId(user.stateId);
      if (user?.districtId) setDistrictId(user.districtId);
      if (user?.constituencyId) setConstituencyId(user.constituencyId);

      // Pre-fill implementing agency
      if (user?.districtName) {
        setImplementingAgency(`District Collector & Magistrate Office, ${user.districtName}`);
      } else {
        setImplementingAgency('Zilla Parishad / District Implementing Agency');
      }

      // Fetch Categories
      projectService.getCategories()
        .then((cats) => {
          if (cats && cats.length > 0) {
            setCategories(cats);
            setCategoryId(cats[0].id);
          } else {
            setCategories(DEFAULT_CATEGORIES as any);
            setCategoryId(DEFAULT_CATEGORIES[0].id);
          }
        })
        .catch(() => {
          setCategories(DEFAULT_CATEGORIES as any);
          setCategoryId(DEFAULT_CATEGORIES[0].id);
        });

      // Fetch States if Admin
      if (!isMp) {
        locationService.getStates().then((res) => {
          if (res.success && res.data) setStates(res.data);
        }).catch(() => {});
      }
    }
  }, [isOpen, user, isMp]);

  // Load districts when state changes (Admin mode)
  useEffect(() => {
    if (!isMp && stateId) {
      locationService.getDistrictsByState(Number(stateId)).then((res) => {
        if (res.success && res.data) {
          setDistricts(res.data);
          if (res.data.length > 0 && !res.data.some(d => d.id === Number(districtId))) {
            setDistrictId(res.data[0].id);
          }
        }
      }).catch(() => {});
    }
  }, [stateId, isMp]);

  // Load constituencies when district changes (Admin mode)
  useEffect(() => {
    if (!isMp && districtId) {
      locationService.getConstituenciesByDistrict(Number(districtId)).then((res) => {
        if (res.success && res.data) {
          setConstituencies(res.data);
          if (res.data.length > 0 && !res.data.some(c => c.id === Number(constituencyId))) {
            setConstituencyId(res.data[0].id);
          }
        }
      }).catch(() => {});
    }
  }, [districtId, isMp]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!projectName.trim()) {
      newErrors.projectName = 'Project Title is required';
    } else if (projectName.trim().length < 5) {
      newErrors.projectName = 'Project Title must be at least 5 characters';
    }

    if (!categoryId) {
      newErrors.categoryId = 'Project Category is required';
    }

    if (!sanctionedAmount) {
      newErrors.sanctionedAmount = 'Estimated cost is required';
    } else {
      const num = parseFloat(sanctionedAmount);
      if (isNaN(num) || num <= 0) {
        newErrors.sanctionedAmount = 'Estimated cost must be greater than 0';
      } else if (num > 500) {
        newErrors.sanctionedAmount = 'Estimated cost exceeds maximum project limit (₹500 Lakhs)';
      }
    }

    if (!stateId) {
      newErrors.stateId = 'State selection is required';
    }
    if (!districtId) {
      newErrors.districtId = 'District selection is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedCat = categories.find(c => c.id === Number(categoryId));

      const payload: Partial<Project> = {
        projectName: projectName.trim(),
        description: description.trim(),
        categoryId: Number(categoryId),
        categoryName: selectedCat?.name || 'General Infrastructure',
        stateId: Number(stateId),
        districtId: Number(districtId),
        constituencyId: constituencyId ? Number(constituencyId) : undefined,
        sanctionedAmount: parseFloat(sanctionedAmount),
        beneficiaries: beneficiaries ? parseInt(beneficiaries, 10) : undefined,
        locationDetails: locationDetails.trim() || undefined,
        implementingAgency: implementingAgency.trim() || undefined,
        documentUrl: documentUrl.trim() || undefined,
        expectedCompletionDate: expectedCompletionDate || undefined,
        latitude: latitude ? parseFloat(latitude) : undefined,
        longitude: longitude ? parseFloat(longitude) : undefined,
        status: 'PROPOSED',
      };

      const createdProject = await projectService.createProject(payload);

      toastSuccess(
        'Project Recommendation Submitted',
        `Successfully created work ${createdProject.projectId} under initial status "Submitted / Pending Review".`
      );

      if (onSuccess) {
        onSuccess(createdProject);
      }
      onClose();
    } catch (err: any) {
      toastError(
        'Failed to Submit Recommendation',
        err.message || 'An error occurred while saving the project to the database.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recommend New Developmental Work (MPLADS)"
      subtitle="Submit formal recommendation to District Authority for technical scrutiny, feasibility assessment, and sanction"
      maxWidth="2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-gov-navy-600" />
            <span>Assigned initial status: <strong>Submitted / Pending Review</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant="saffron"
              size="sm"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
            >
              Submit Recommendation
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 py-1 text-slate-800">
        {/* Parliamentary Jurisdiction Scope Banner */}
        <div className="p-3 bg-gov-navy-50/70 border border-gov-navy-200/80 rounded-lg flex items-start gap-3 text-xs">
          <div className="p-1.5 bg-gov-navy-100 rounded text-gov-navy-800 mt-0.5">
            <Building2 className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 font-bold text-gov-navy-900">
              <span>Jurisdiction Scope</span>
              <span className="text-[10px] px-2 py-0.2 rounded bg-gov-navy-200/60 text-gov-navy-900 font-semibold uppercase">
                {isMp ? 'MP Scoped' : 'Administrative Scope'}
              </span>
            </div>
            <p className="text-slate-600 mt-0.5">
              Recommending Member: <strong>{user?.fullName || 'Hon. MP'}</strong> • Constituency: <strong>{user?.constituencyName || 'Pune'}</strong> • District: <strong>{user?.districtName || 'Pune'}</strong> ({user?.stateName || 'Maharashtra'})
            </p>
          </div>
        </div>

        {/* Project Title */}
        <div>
          <Input
            label="Project / Work Title"
            required
            placeholder="e.g. Construction of Community RO Drinking Water Plant with Solar Power Backup"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            error={errors.projectName}
            helperText="Provide a clear, descriptive title of the proposed physical infrastructure or facility"
          />
        </div>

        {/* Category & Estimated Cost Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Work Category <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs rounded-md border border-slate-300 py-2 pl-3 pr-8 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy-600"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {errors.categoryId && <p className="mt-1 text-xs text-red-600 font-medium">{errors.categoryId}</p>}
          </div>

          <div>
            <Input
              label="Estimated Cost (₹ in Lakhs)"
              required
              type="number"
              step="0.01"
              min="0.1"
              placeholder="e.g. 45.00"
              leftIcon={<IndianRupee className="w-3.5 h-3.5 text-slate-400" />}
              value={sanctionedAmount}
              onChange={(e) => setSanctionedAmount(e.target.value)}
              error={errors.sanctionedAmount}
              helperText={
                sanctionedAmount && !isNaN(parseFloat(sanctionedAmount))
                  ? `Equivalent to ₹ ${(parseFloat(sanctionedAmount) * 100000).toLocaleString('en-IN')}`
                  : 'Enter estimated budget required in Lakhs INR'
              }
            />
          </div>
        </div>

        {/* Beneficiaries & Implementing Agency */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Estimated Beneficiaries"
              type="number"
              placeholder="e.g. 12500"
              leftIcon={<Users className="w-3.5 h-3.5 text-slate-400" />}
              value={beneficiaries}
              onChange={(e) => setBeneficiaries(e.target.value)}
              helperText="Approximate population / villagers directly served"
            />
          </div>

          <div>
            <Input
              label="Implementing / Executing Agency"
              placeholder="e.g. Zilla Parishad Pune / Rural Water Supply Dept"
              leftIcon={<Building2 className="w-3.5 h-3.5 text-slate-400" />}
              value={implementingAgency}
              onChange={(e) => setImplementingAgency(e.target.value)}
              helperText="Government department or agency executing ground work"
            />
          </div>
        </div>

        {/* Location Details */}
        <div>
          <Input
            label="Site / Village / Ward Location Details"
            placeholder="e.g. Gram Panchayat Haveli, Ward No. 4, Near Primary Health Sub-Centre"
            leftIcon={<MapPin className="w-3.5 h-3.5 text-slate-400" />}
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            helperText="Specific revenue village, survey number, or landmark where work will be executed"
          />
        </div>

        {/* Administrative Selectors (if Admin) or Locked Display (if MP) */}
        {!isMp ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">State</label>
              <select
                value={stateId}
                onChange={(e) => setStateId(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 py-1.5 px-2 bg-white"
              >
                {states.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">District</label>
              <select
                value={districtId}
                onChange={(e) => setDistrictId(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 py-1.5 px-2 bg-white"
              >
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Constituency</label>
              <select
                value={constituencyId}
                onChange={(e) => setConstituencyId(e.target.value)}
                className="w-full text-xs rounded border border-slate-300 py-1.5 px-2 bg-white"
              >
                {constituencies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
        ) : null}

        {/* Description / Detailed Justification */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Work Justification & Scope of Work
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the developmental necessity, community benefit, and physical scope (e.g., Installation of high-recovery RO plant with 2,000 LPH capacity to address fluoride contamination in drinking water)."
            className="w-full text-xs rounded-md border border-slate-300 p-2.5 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-gov-navy-600 placeholder-slate-400"
          />
        </div>

        {/* Supporting Documents & Target Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="Supporting Documents / DPR Reference"
              placeholder="e.g. DPR-WATER-2026-PUN-01.pdf or Gram Sabha Resolution"
              leftIcon={<Paperclip className="w-3.5 h-3.5 text-slate-400" />}
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              helperText="Gram Sabha resolution, DPR reference, or estimate document link"
            />
          </div>

          <div>
            <Input
              label="Expected Completion Date"
              type="date"
              leftIcon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
              value={expectedCompletionDate}
              onChange={(e) => setExpectedCompletionDate(e.target.value)}
              helperText="Estimated timeline for physical ground delivery"
            />
          </div>
        </div>

        {/* GIS Coordinates (Optional) */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <div>
            <Input
              label="Latitude (Optional)"
              type="number"
              step="any"
              placeholder="18.5204"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
            />
          </div>
          <div>
            <Input
              label="Longitude (Optional)"
              type="number"
              step="any"
              placeholder="73.8567"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
