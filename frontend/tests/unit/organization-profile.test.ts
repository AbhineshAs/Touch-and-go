// tests/unit/organization-profile.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { OrganizationProfile } from "../../types/organization";
import {
  DEFAULT_ORGANIZATION_PROFILE,
  ORGANIZATION_INDUSTRIES,
  COMPANY_SIZE_OPTIONS,
  getOrganizationProfile,
  saveOrganizationProfile,
  updateOrganizationLogo,
} from "../../lib/organization/profileService";

describe("Organization Profile Management Unit Tests", () => {
  it("Validates DEFAULT_ORGANIZATION_PROFILE schema and data contract", () => {
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.id);
    assert.equal(DEFAULT_ORGANIZATION_PROFILE.name, "RazorWave Technologies");
    assert.equal(
      DEFAULT_ORGANIZATION_PROFILE.legalEntityName,
      "RazorWave Technologies Private Limited"
    );
    assert.equal(DEFAULT_ORGANIZATION_PROFILE.isVerified, true);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.industry);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.companySize);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.tagline);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.about);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.headquarters);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.website);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.contactEmail);
    assert.ok(DEFAULT_ORGANIZATION_PROFILE.contactPhone);
  });

  it("Ensures industry options and company size options are non-empty lists", () => {
    assert.ok(ORGANIZATION_INDUSTRIES.length >= 5);
    assert.ok(ORGANIZATION_INDUSTRIES.includes("Enterprise Cloud & Software"));
    assert.ok(ORGANIZATION_INDUSTRIES.includes("Artificial Intelligence & ML"));

    assert.ok(COMPANY_SIZE_OPTIONS.length >= 5);
    assert.ok(COMPANY_SIZE_OPTIONS.includes("150–250 employees"));
  });

  describe("Company Information Updates", () => {
    it("Updates company branding and legal details while preserving other fields", () => {
      const initial: OrganizationProfile = {
        ...DEFAULT_ORGANIZATION_PROFILE,
        id: "org_test_1",
      };

      const updated: OrganizationProfile = {
        ...initial,
        name: "RazorWave Cloud Systems",
        legalEntityName: "RazorWave Cloud Systems India Pvt Ltd",
        tagline: "Next-generation distributed cloud & AI pipelines",
        about: "Leading enterprise cloud migration and Kubernetes orchestration.",
        industry: "Artificial Intelligence & ML",
        companySize: "250–500 employees",
      };

      const saved = saveOrganizationProfile(updated);

      assert.equal(saved.id, "org_test_1");
      assert.equal(saved.name, "RazorWave Cloud Systems");
      assert.equal(saved.legalEntityName, "RazorWave Cloud Systems India Pvt Ltd");
      assert.equal(saved.tagline, "Next-generation distributed cloud & AI pipelines");
      assert.equal(saved.industry, "Artificial Intelligence & ML");
      assert.equal(saved.companySize, "250–500 employees");
      // Headquarters & contact details should remain unchanged
      assert.equal(saved.headquarters, initial.headquarters);
      assert.equal(saved.contactEmail, initial.contactEmail);
    });
  });

  describe("Contact Details Updates", () => {
    it("Updates headquarters, website, email, phone, and social links", () => {
      const initial: OrganizationProfile = {
        ...DEFAULT_ORGANIZATION_PROFILE,
        id: "org_test_contact",
      };

      const updated: OrganizationProfile = {
        ...initial,
        headquarters: "Hyderabad, Telangana, India",
        website: "https://cloud.razorwave.com",
        contactEmail: "talent-acquisition@razorwave.com",
        contactPhone: "+91 40 4567 8901",
        linkedinUrl: "https://www.linkedin.com/company/razorwave-cloud",
        twitterUrl: "https://twitter.com/razorwave_cloud",
      };

      const saved = saveOrganizationProfile(updated);

      assert.equal(saved.headquarters, "Hyderabad, Telangana, India");
      assert.equal(saved.website, "https://cloud.razorwave.com");
      assert.equal(saved.contactEmail, "talent-acquisition@razorwave.com");
      assert.equal(saved.contactPhone, "+91 40 4567 8901");
      assert.equal(saved.linkedinUrl, "https://www.linkedin.com/company/razorwave-cloud");
      assert.equal(saved.twitterUrl, "https://twitter.com/razorwave_cloud");
      // Company name should remain intact
      assert.equal(saved.name, initial.name);
    });
  });

  describe("Interactive Logo Management", () => {
    it("Updates logo URL with uploaded image data", () => {
      const orgId = "org_test_logo";
      const initial: OrganizationProfile = {
        ...DEFAULT_ORGANIZATION_PROFILE,
        id: orgId,
        logoUrl: null,
      };
      saveOrganizationProfile(initial);

      const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
      const updated = updateOrganizationLogo(orgId, mockDataUrl);

      assert.equal(updated.id, orgId);
      assert.equal(updated.logoUrl, mockDataUrl);

      const retrieved = getOrganizationProfile(orgId);
      assert.equal(retrieved.logoUrl, mockDataUrl);
    });

    it("Removes current logo resetting it to null for fallback display", () => {
      const orgId = "org_test_remove_logo";
      const initial: OrganizationProfile = {
        ...DEFAULT_ORGANIZATION_PROFILE,
        id: orgId,
        logoUrl: "https://example.com/logo.png",
      };
      saveOrganizationProfile(initial);

      const updated = updateOrganizationLogo(orgId, null);
      assert.equal(updated.logoUrl, null);

      const retrieved = getOrganizationProfile(orgId);
      assert.equal(retrieved.logoUrl, null);
    });
  });

  describe("Verification Status & Persistence", () => {
    it("Preserves verified entity badge status across profile updates", () => {
      const orgId = "org_verified_test";
      const initial: OrganizationProfile = {
        ...DEFAULT_ORGANIZATION_PROFILE,
        id: orgId,
        isVerified: true,
      };
      saveOrganizationProfile(initial);

      const updated: OrganizationProfile = {
        ...initial,
        about: "Updated narrative describing AI core features.",
      };
      const saved = saveOrganizationProfile(updated);

      assert.equal(saved.isVerified, true);
    });
  });
});
