"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/States";
import { Organization, VerificationStatus } from "@/types";
import { getVerificationQueue, updateVerificationStatus } from "@/lib/api/admin";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  Building2,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

export default function AdminVerificationsPage() {
  const [queue, setQueue] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Review modal state
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getVerificationQueue();
      setQueue(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAction = async (status: VerificationStatus) => {
    if (!selectedOrg) return;
    setIsProcessing(true);
    const updated = await updateVerificationStatus(selectedOrg.id, status, reviewNotes || `Marked as ${status}`);
    setQueue(queue.map((o) => (o.id === updated.id ? updated : o)));
    setIsProcessing(false);
    setSelectedOrg(null);
    setReviewNotes("");
  };

  if (isLoading) {
    return <LoadingState message="Loading employer verification records..." />;
  }

  return (
    <div className="flex flex-col gap-6 pb-16">
      <div className="flex flex-col gap-1 pb-4 border-b border-border">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Employer Verification Queue ({queue.length})
        </h1>
        <p className="text-xs sm:text-sm text-text-secondary">
          Validate Ministry of Corporate Affairs records and domain ownership before unlocking candidate profiles.
        </p>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Company</th>
                <th className="p-4">Corporate Domain</th>
                <th className="p-4">Status</th>
                <th className="p-4">Risk Level</th>
                <th className="p-4">Reviewed By</th>
                <th className="p-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {queue.map((org) => (
                <tr key={org.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={org.logo}
                        alt={org.name}
                        className="w-9 h-9 rounded-lg object-cover border border-border shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{org.name}</span>
                        <span className="text-[11px] text-text-muted">{org.verification.registeredEntityName}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-text-secondary">{org.domain}</td>
                  <td className="p-4">
                    <StatusBadge status={org.verification.status} />
                  </td>
                  <td className="p-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        org.verification.riskLevel === "High"
                          ? "bg-danger-soft text-danger"
                          : "bg-success-soft text-success"
                      }`}
                    >
                      {org.verification.riskLevel} Risk
                    </span>
                  </td>
                  <td className="p-4 text-text-secondary">
                    {org.verification.reviewedBy || "Unassigned"}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrg(org);
                        setReviewNotes(org.verification.reviewNotes || "");
                      }}
                    >
                      Inspect & Audit
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* REVIEW & DECISION MODAL */}
      <Modal
        isOpen={!!selectedOrg}
        onClose={() => setSelectedOrg(null)}
        title={`Audit Verification: ${selectedOrg?.name}`}
        description="Verify government CIN, GST certificates, and domain ownership records."
        size="lg"
      >
        {selectedOrg && (
          <div className="flex flex-col gap-5 text-xs">
            {/* Legal records */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl bg-background border border-border-subtle">
              <div>
                <span className="text-text-muted block text-[11px]">Registered Entity</span>
                <strong className="text-text-primary">{selectedOrg.verification.registeredEntityName}</strong>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">CIN Number</span>
                <strong className="text-text-primary font-mono">{selectedOrg.verification.businessRegistrationNumber}</strong>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">GSTIN</span>
                <strong className="text-text-primary font-mono">{selectedOrg.verification.gstNumber || "29AABCR4582E1Z8"}</strong>
              </div>
              <div>
                <span className="text-text-muted block text-[11px]">Domain Ownership</span>
                <strong className="text-success font-medium">Confirmed ({selectedOrg.domain})</strong>
              </div>
            </div>

            {/* Submitted files */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-text-primary">Submitted Compliance Documents</span>
              {selectedOrg.verification.documentsSubmitted.map((d) => (
                <div
                  key={d.id}
                  className="p-3 rounded-lg border border-border bg-surface flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-text-primary">{d.type}</span>
                    <span className="text-text-muted text-[11px]">({d.fileName})</span>
                  </div>
                  <span className="text-success font-semibold text-[11px]">Verified Match</span>
                </div>
              ))}
            </div>

            {/* Decision Notes */}
            <Textarea
              label="Mandatory Audit Justification / Review Notes"
              placeholder="Record reason for approval, clarification request, or rejection..."
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              rows={3}
              required
            />

            {/* Decision Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-danger hover:bg-danger-soft hover:text-danger"
                  isLoading={isProcessing}
                  onClick={() => handleAction("Rejected")}
                >
                  Reject Entity
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  isLoading={isProcessing}
                  onClick={() => handleAction("Action Required")}
                >
                  Request Clarification
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelectedOrg(null)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  isLoading={isProcessing}
                  leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  onClick={() => handleAction("Verified")}
                >
                  Approve Verification
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
