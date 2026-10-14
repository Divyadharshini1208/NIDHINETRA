'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Camera,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Upload,
  RefreshCw,
  Hash,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import { photoVerificationService } from '@/services/photoVerificationService';
import { PhotoVerificationRecord, Project } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

interface PhotoVerificationSectionProps {
  project: Project;
}

export function PhotoVerificationSection({ project }: PhotoVerificationSectionProps) {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [verifications, setVerifications] = useState<PhotoVerificationRecord[]>([]);
  
  // Upload form state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [claimedLatitude, setClaimedLatitude] = useState<string>('');
  const [claimedLongitude, setClaimedLongitude] = useState<string>('');
  const [mbReference, setMbReference] = useState<string>('');
  const [verificationNotes, setVerificationNotes] = useState<string>('');
  const [latestResult, setLatestResult] = useState<PhotoVerificationRecord | null>(null);

  const canUpload = user?.role === 'ROLE_DISTRICT_AUTHORITY' ||
                    user?.role === 'ROLE_STATE_NODAL_AUTHORITY' ||
                    user?.role === 'ROLE_MINISTRY_ADMIN';

  const loadVerifications = async () => {
    setIsLoading(true);
    try {
      const records = await photoVerificationService.getProjectPhotoVerifications(project.id);
      setVerifications(records);
    } catch (err: any) {
      toastError('Load Failed', err.message || 'Could not fetch verification records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadVerifications();
  }, [project.id]);

  const handleUseCurrentLocation = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setClaimedLatitude(position.coords.latitude.toFixed(6));
          setClaimedLongitude(position.coords.longitude.toFixed(6));
          success('GPS Acquired', `Lat: ${position.coords.latitude.toFixed(4)}, Lng: ${position.coords.longitude.toFixed(4)}`);
        },
        (error) => {
          toastError('GPS Unavailable', error.message || 'Could not retrieve device location');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toastError('Not Supported', 'Geolocation is not supported by your browser.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        toastError('File Too Large', 'Maximum file size allowed is 10MB.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !claimedLatitude) {
      toastError('Input Required', 'Please select a photo or enter inspection GPS coordinates.');
      return;
    }

    setIsUploading(true);
    try {
      const payload: any = {
        projectId: project.id,
        file: selectedFile || undefined,
        measurementBookRef: mbReference || undefined,
        notes: verificationNotes || undefined,
      };

      if (claimedLatitude) {
        payload.claimedLatitude = parseFloat(claimedLatitude);
      }
      if (claimedLongitude) {
        payload.claimedLongitude = parseFloat(claimedLongitude);
      }

      const result = await photoVerificationService.verifyProjectPhoto(payload);
      setLatestResult(result);
      success(
        'Verification Processed',
        `Outcome: ${result.verificationStatus} (${result.distanceMeters !== undefined ? `${result.distanceMeters}m from site` : 'No GPS'})`
      );

      // Reset form fields
      setSelectedFile(null);
      setMbReference('');
      setVerificationNotes('');

      // Refresh verification list
      loadVerifications();
    } catch (err: any) {
      toastError('Verification Failed', err.message || 'Error processing photo geofence verification');
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'LOCATION_MATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Location Match (&lt;500m)
          </span>
        );
      case 'LOCATION_MISMATCH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Location Mismatch (Flagged)
          </span>
        );
      case 'GPS_METADATA_MISSING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            GPS Metadata Missing
          </span>
        );
      case 'POSSIBLE_DUPLICATE_IMAGE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-300">
            <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
            Possible Duplicate Image
          </span>
        );
      case 'MANUAL_VERIFICATION_REQUIRED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            Manual Review Required
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* STATUTORY GOVERNANCE BANNER */}
      <div className="bg-amber-50 border-l-4 border-gov-saffron p-4 rounded-r-xl text-xs text-amber-950 shadow-2xs flex items-start space-x-3">
        <ShieldAlert className="w-5 h-5 text-gov-saffron shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900">
            Statutory Geofence & Evidence Verification Protocol:
          </h4>
          <p className="text-amber-800 mt-1 leading-relaxed">
            Image GPS metadata is evaluated against the sanctioned project coordinate footprint using the Haversine formula (configurable threshold: 500 meters).
            <strong> Important:</strong> Image metadata can be missing, altered, or stripped by camera applications. A location mismatch or missing GPS header is a prompt for manual inspection by the District Authority and <strong>does not automatically establish irregularity or fraud</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* UPLOAD & VERIFY FORM */}
        <div className="lg:col-span-1 space-y-4">
          <Card
            title="Upload Progress Photo Evidence"
            subtitle="Submit on-site photograph and Measurement Book (MB) link"
            headerIcon={<Camera className="w-5 h-5 text-gov-navy-800" />}
          >
            {canUpload ? (
              <form onSubmit={handleSubmitVerification} className="space-y-4 text-xs">
                {/* Photo Upload Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Site Photo (JPEG, PNG, WebP &bull; Max 10MB)
                  </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                    <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                    {selectedFile ? (
                      <span className="font-semibold text-gov-navy-900 truncate block">
                        {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                    ) : (
                      <span className="text-slate-500">
                        Click or drag photo here to verify EXIF & Hash
                      </span>
                    )}
                  </div>
                </div>

                {/* Optional claimed GPS coordinates */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700">GPS Coordinates</label>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="text-[11px] font-bold text-gov-navy-800 hover:text-gov-saffron flex items-center gap-1 transition"
                    >
                      <MapPin className="w-3 h-3" />
                      Acquire GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude (e.g. 18.5204)"
                      value={claimedLatitude}
                      onChange={(e) => setClaimedLatitude(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:ring-1 focus:ring-gov-navy-800"
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude (e.g. 73.8567)"
                      value={claimedLongitude}
                      onChange={(e) => setClaimedLongitude(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:ring-1 focus:ring-gov-navy-800"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    Coordinates will be extracted automatically from image EXIF if present.
                  </span>
                </div>

                {/* Measurement Book Reference */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Measurement Book (MB) Ref # (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MB/2026/SEC-4/P-42"
                    value={mbReference}
                    onChange={(e) => setMbReference(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs font-mono focus:ring-1 focus:ring-gov-navy-800"
                  />
                </div>

                {/* Verification Remarks */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Field Inspection Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Physical stage inspected, foundation status, materials on site..."
                    value={verificationNotes}
                    onChange={(e) => setVerificationNotes(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-300 rounded-md text-xs focus:ring-1 focus:ring-gov-navy-800"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="w-full font-bold"
                  isLoading={isUploading}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify Geofence & Record Audit
                </Button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-600 text-xs">
                Your role ({user?.role}) does not have permission to upload new photo verifications. You may view existing verified evidence below.
              </div>
            )}
          </Card>

          {/* LATEST VERIFICATION RESULT CARD */}
          {latestResult && (
            <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">Verification Outcome</span>
                {getStatusBadge(latestResult.verificationStatus)}
              </div>

              <div className="space-y-1.5 text-xs">
                {latestResult.distanceMeters !== undefined && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Haversine Distance:</span>
                    <span className="font-bold font-mono text-gov-navy-900">
                      {latestResult.distanceMeters.toFixed(1)} meters
                    </span>
                  </div>
                )}
                {latestResult.thresholdMeters && (
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Allowed Geofence:</span>
                    <span className="font-mono text-slate-700">{latestResult.thresholdMeters} m</span>
                  </div>
                )}
                {latestResult.fileHash && (
                  <div className="py-1">
                    <span className="text-slate-500 block">SHA-256 Digest:</span>
                    <span className="font-mono text-[10px] text-slate-700 break-all block bg-slate-50 p-1 rounded mt-0.5">
                      {latestResult.fileHash}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* VERIFICATION HISTORY LIST */}
        <div className="lg:col-span-2 space-y-4">
          <Card
            title={`Evidence Verification Audit Trail (${verifications.length})`}
            subtitle="Historical photographic submissions, coordinate audits, and perceptual hash checks"
            headerIcon={<FileCheck className="w-5 h-5 text-gov-navy-800" />}
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={loadVerifications}
                isLoading={isLoading}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Refresh
              </Button>
            }
          >
            {verifications.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Camera className="w-10 h-10 text-slate-300 mx-auto" />
                <h5 className="font-bold text-slate-700 text-sm">No Photo Verification Records Yet</h5>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When field officers or District Authorities upload inspection photos, geofence match audits, Haversine measurements, and image hash validations will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {verifications.map((record) => (
                  <div
                    key={record.id}
                    className="p-4 bg-slate-50/70 border border-slate-200 rounded-xl space-y-3 hover:bg-white transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-gov-navy-900">
                          #{record.id}
                        </span>
                        <span className="text-xs text-slate-700 font-semibold truncate max-w-xs">
                          {record.fileName || 'Site_Progress_Photo.jpg'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(record.verificationStatus)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      {/* Approved site coordinates */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Sanctioned Coordinates
                        </span>
                        <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                          {record.projectApprovedLatitude !== undefined && record.projectApprovedLongitude !== undefined
                            ? `${record.projectApprovedLatitude.toFixed(4)}, ${record.projectApprovedLongitude.toFixed(4)}`
                            : 'Not mapped'}
                        </span>
                      </div>

                      {/* Extracted coordinates */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Extracted Photo GPS
                        </span>
                        <span className="font-mono font-semibold text-slate-800 block mt-0.5">
                          {record.extractedLatitude !== undefined && record.extractedLongitude !== undefined
                            ? `${record.extractedLatitude.toFixed(4)}, ${record.extractedLongitude.toFixed(4)}`
                            : 'No EXIF metadata'}
                        </span>
                      </div>

                      {/* Distance metric */}
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">
                          Haversine Distance
                        </span>
                        <span className="font-mono font-bold text-gov-navy-900 block mt-0.5">
                          {record.distanceMeters !== undefined
                            ? `${record.distanceMeters.toFixed(0)} meters`
                            : 'Indeterminate'}
                        </span>
                      </div>
                    </div>

                    {record.verificationNotes && (
                      <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                        <strong>Notes:</strong> {record.verificationNotes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>
                        Verified by: <strong className="text-slate-600">{record.verifiedBy || 'Field Officer'}</strong>
                      </span>
                      <span>
                        {record.verifiedAt ? new Date(record.verifiedAt).toLocaleString('en-IN') : 'Audit Logged'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
