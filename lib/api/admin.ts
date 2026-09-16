import {
  Organization,
  VerificationStatus,
  AuditEvent,
  ModerationReport,
  TaxonomyItem,
} from "@/types";
import {
  MOCK_ORGANIZATIONS,
  MOCK_AUDIT_LOGS,
  MOCK_MODERATION_REPORTS,
  MOCK_TAXONOMY,
} from "@/lib/mocks/data";

let orgsVerificationState: Organization[] = [...MOCK_ORGANIZATIONS];
let auditLogsState: AuditEvent[] = [...MOCK_AUDIT_LOGS];
let moderationState: ModerationReport[] = [...MOCK_MODERATION_REPORTS];
let taxonomyState: TaxonomyItem[] = [...MOCK_TAXONOMY];

export async function getVerificationQueue(): Promise<Organization[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...orgsVerificationState];
}

export async function updateVerificationStatus(
  organizationId: string,
  status: VerificationStatus,
  notes: string
): Promise<Organization> {
  await new Promise((r) => setTimeout(r, 400));
  const index = orgsVerificationState.findIndex((o) => o.id === organizationId);
  if (index === -1) throw new Error("Organization not found");

  orgsVerificationState[index] = {
    ...orgsVerificationState[index],
    verification: {
      ...orgsVerificationState[index].verification,
      status,
      reviewedAt: new Date().toISOString(),
      reviewedBy: "Priya Swaminathan",
      reviewNotes: notes,
    },
  };

  // Add immutable audit log entry
  auditLogsState = [
    {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: "Priya Swaminathan",
      actorEmail: "priya.admin@tagjobs.in",
      actorRole: "Admin",
      action: `VERIFICATION_${status.toUpperCase().replace(/\s+/g, "_")}`,
      resource: `Organization: ${orgsVerificationState[index].name}`,
      details: notes,
      ipAddress: "103.21.144.12",
      riskLevel: status === "Rejected" || status === "Suspended" ? "High" : "Low",
    },
    ...auditLogsState,
  ];

  return orgsVerificationState[index];
}

export async function getAuditLogs(): Promise<AuditEvent[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...auditLogsState];
}

export async function getModerationReports(): Promise<ModerationReport[]> {
  await new Promise((r) => setTimeout(r, 200));
  return [...moderationState];
}

export async function updateModerationStatus(
  reportId: string,
  status: ModerationReport["status"],
  notes?: string
): Promise<ModerationReport> {
  await new Promise((r) => setTimeout(r, 300));
  const index = moderationState.findIndex((m) => m.id === reportId);
  if (index === -1) throw new Error("Report not found");

  moderationState[index] = {
    ...moderationState[index],
    status,
    notes,
  };

  // Log to audit trail
  auditLogsState = [
    {
      id: `aud_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actorName: "Priya Swaminathan",
      actorEmail: "priya.admin@tagjobs.in",
      actorRole: "Admin",
      action: `MODERATION_${status.toUpperCase()}`,
      resource: `Report: ${moderationState[index].targetTitle}`,
      details: notes || `Moderation ticket marked as ${status}`,
      ipAddress: "103.21.144.12",
      riskLevel: status === "Resolved" ? "Medium" : "Low",
    },
    ...auditLogsState,
  ];

  return moderationState[index];
}

export async function getTaxonomy(): Promise<TaxonomyItem[]> {
  await new Promise((r) => setTimeout(r, 180));
  return [...taxonomyState];
}

export async function addTaxonomyItem(item: {
  type: "Skill" | "Job Title" | "Industry" | "Location";
  name: string;
  category?: string;
  aliases: string[];
}): Promise<TaxonomyItem> {
  await new Promise((r) => setTimeout(r, 350));
  const newItem: TaxonomyItem = {
    id: `tax_${Date.now()}`,
    type: item.type,
    name: item.name,
    slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: item.category || "General",
    aliases: item.aliases,
    status: "Active",
    usageCount: 1,
    updatedAt: new Date().toISOString(),
  };

  taxonomyState = [newItem, ...taxonomyState];
  return newItem;
}

export async function deprecateTaxonomyItem(id: string): Promise<TaxonomyItem> {
  await new Promise((r) => setTimeout(r, 300));
  const index = taxonomyState.findIndex((t) => t.id === id);
  if (index === -1) throw new Error("Taxonomy item not found");

  taxonomyState[index] = {
    ...taxonomyState[index],
    status: "Deprecated",
    updatedAt: new Date().toISOString(),
  };

  return taxonomyState[index];
}
