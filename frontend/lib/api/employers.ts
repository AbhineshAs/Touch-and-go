import { Organization, OrganizationMember } from "@/types";
import { MOCK_ORGANIZATIONS } from "@/lib/mocks/data";

let orgsState: Organization[] = [...MOCK_ORGANIZATIONS];

export async function getOrganization(slugOrId: string = "org_razorwave"): Promise<Organization | null> {
  await new Promise((r) => setTimeout(r, 200));
  const org = orgsState.find((o) => o.id === slugOrId || o.slug === slugOrId);
  return org ? { ...org } : null;
}

export async function updateOrganization(
  id: string,
  updates: Partial<Organization>
): Promise<Organization> {
  await new Promise((r) => setTimeout(r, 350));
  const index = orgsState.findIndex((o) => o.id === id);
  if (index === -1) throw new Error("Organization not found");
  orgsState[index] = {
    ...orgsState[index],
    ...updates,
  };
  return { ...orgsState[index] };
}

export async function getTeamMembers(organizationId: string = "org_razorwave"): Promise<OrganizationMember[]> {
  await new Promise((r) => setTimeout(r, 180));
  const org = orgsState.find((o) => o.id === organizationId);
  return org ? [...org.members] : [];
}

export async function inviteTeamMember(
  organizationId: string,
  data: { name: string; email: string; role: OrganizationMember["role"] }
): Promise<OrganizationMember> {
  await new Promise((r) => setTimeout(r, 350));
  const org = orgsState.find((o) => o.id === organizationId);
  if (!org) throw new Error("Organization not found");

  const newMember: OrganizationMember = {
    id: `mem_${Date.now()}`,
    userId: `usr_${Date.now()}`,
    name: data.name,
    email: data.email,
    role: data.role,
    status: "Invited",
    joinedAt: new Date().toISOString(),
  };

  org.members = [newMember, ...org.members];
  return newMember;
}

export async function removeTeamMember(organizationId: string, memberId: string): Promise<boolean> {
  await new Promise((r) => setTimeout(r, 300));
  const org = orgsState.find((o) => o.id === organizationId);
  if (!org) return false;
  org.members = org.members.filter((m) => m.id !== memberId);
  return true;
}
