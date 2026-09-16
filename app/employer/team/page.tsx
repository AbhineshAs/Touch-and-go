"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Modal, AlertDialog } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import { LoadingState } from "@/components/ui/States";
import { OrganizationMember } from "@/types";
import { getTeamMembers, inviteTeamMember, removeTeamMember } from "@/lib/api/employers";
import { formatDate } from "@/lib/utils";
import { Users, UserPlus, Mail, Shield, Trash2, CheckCircle2 } from "lucide-react";

export default function EmployerTeamPage() {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Invite modal
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<OrganizationMember["role"]>("Recruiter");
  const [isInviting, setIsInviting] = useState(false);

  // Remove confirmation
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await getTeamMembers("org_razorwave");
      setMembers(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    const newMem = await inviteTeamMember("org_razorwave", { name, email, role });
    setMembers([newMem, ...members]);
    setIsInviting(false);
    setIsInviteOpen(false);
    setName("");
    setEmail("");
  };

  const handleRemoveConfirm = async () => {
    if (!memberToRemove) return;
    await removeTeamMember("org_razorwave", memberToRemove.id);
    setMembers(members.filter((m) => m.id !== memberToRemove.id));
    setMemberToRemove(null);
  };

  if (isLoading) {
    return <LoadingState message="Loading team members..." />;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Team & Hiring Roles ({members.length})
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Manage recruiter access, assign hiring managers, and collaborate on pipelines.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsInviteOpen(true)}
        >
          Invite Colleague
        </Button>
      </div>

      <Card className="bg-surface border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-background border-b border-border text-text-secondary uppercase tracking-wider text-[10px] font-bold">
              <tr>
                <th className="p-4">Team Member</th>
                <th className="p-4">Organization Role</th>
                <th className="p-4">Status</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-soft text-primary flex items-center justify-center font-bold text-xs">
                        {member.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary">{member.name}</span>
                        <span className="text-[11px] text-text-muted">{member.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-text-primary">
                      <Shield className="w-3.5 h-3.5 text-primary" />
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={member.status} />
                  </td>
                  <td className="p-4 text-text-muted">{formatDate(member.joinedAt)}</td>
                  <td className="p-4 text-right">
                    {member.role !== "Employer Administrator" && (
                      <button
                        onClick={() => setMemberToRemove(member)}
                        className="p-1.5 text-text-muted hover:text-danger rounded-lg transition-colors cursor-pointer"
                        title="Remove member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* INVITE MODAL */}
      <Modal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Invited colleagues can review applicants, score interviews, and manage jobs."
        size="sm"
      >
        <form onSubmit={handleInviteSubmit} className="flex flex-col gap-4 text-xs">
          <Input
            label="Full Name"
            placeholder="e.g. Sneha Mukherjee"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Corporate Email Address"
            type="email"
            placeholder="sneha.m@razorwave.tech"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1.5">
            <label className="font-semibold text-text-secondary">Permission Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="p-2 rounded-lg border border-border bg-surface text-text-primary"
            >
              <option value="Recruiter">Recruiter (Screen applicants, manage pipeline)</option>
              <option value="Hiring Manager">Hiring Manager (Review shortlists, submit scorecards)</option>
              <option value="Employer Administrator">Employer Administrator (Full organization control)</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isInviting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>

      {/* REMOVE CONFIRMATION */}
      <AlertDialog
        isOpen={!!memberToRemove}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleRemoveConfirm}
        title="Remove Team Member"
        description={`Are you sure you want to remove ${memberToRemove?.name} from RazorWave Technologies? They will lose access to active pipelines and candidate notes.`}
        confirmText="Remove Member"
        isDestructive
      />
    </div>
  );
}
