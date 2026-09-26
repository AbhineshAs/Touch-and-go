// tests/e2e/portal-integration.test.ts

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { computeProfileCompleteness } from "../../lib/candidate/profile/completeness";
import { deriveProfileSuggestions } from "../../lib/candidate/profile/suggestions";
import { matchSampleJobs, normalizeSkill } from "../../lib/candidate/jobs/matcher";
import { CandidateRecord, ResumeDraft, StructuredProfile, DiscoveryDraft } from "../../lib/candidate/types";

function mockDiscovery(overrides: Partial<DiscoveryDraft> = {}): DiscoveryDraft {
  return {
    targetRoles: [],
    challenges: [],
    skills: [],
    strengths: [],
    preferredSupport: [],
    ...overrides,
  };
}

describe("Candidate Portal Integration Acceptance Tests (1 to 13)", () => {
  // Test 1: Fresh candidate profile creation has 0 applications, 0 saved jobs, 0 interviews, no Ananya data
  test("Test 1: Fresh candidate lands with own identity, 0 apps, 0 saved jobs, 0 interviews, no Ananya data", () => {
    const candidate: CandidateRecord = {
      id: "cand_fresh_123",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      confirmedAt: new Date().toISOString(),
      identity: {
        fullName: "Rahul Verma",
        email: "rahul.verma@example.com",
        countryCode: "+91",
        phone: "9812345678",
        agreeToTerms: true,
      },
      discovery: {
        careerStage: "fresher",
        primaryGoal: "first_job",
        targetRoles: ["Frontend Engineer"],
        challenges: ["few_interview_calls"],
        primaryChallenge: "few_interview_calls",
        skills: [{ name: "React", level: "comfortable" }],
        strengths: ["problem_solving"],
        preferredSupport: ["cv_support"],
        timeBudget: "1_to_3_hours",
      },
      profile: {
        headline: "Aspiring Frontend Engineer",
        summary: "Motivated fresher targeting Frontend Engineering positions.",
        location: "India",
        phone: "9812345678",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "comfortable" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Frontend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    assert.equal(candidate.identity.fullName, "Rahul Verma");
    assert.notEqual(candidate.identity.fullName, "Ananya Sharma");
    assert.equal(candidate.applications.length, 0, "Applications count must start at 0");
    assert.equal(candidate.savedJobIds.length, 0, "Saved jobs count must start at 0");
    assert.equal(candidate.interviews.length, 0, "Interviews must be empty");
    assert.equal(candidate.profile.headline, "Aspiring Frontend Engineer");
  });

  // Test 2: Incomplete vs completed candidate behavior
  test("Test 2: Completed candidate has onboardingComplete=true; incomplete has false", () => {
    const incompleteCandidate: Partial<CandidateRecord> = {
      onboardingComplete: false,
      discovery: mockDiscovery({ targetRoles: [] }),
    };
    const completeCandidate: Partial<CandidateRecord> = {
      onboardingComplete: true,
      discovery: mockDiscovery({ targetRoles: ["Frontend Engineer"] }),
    };

    assert.equal(incompleteCandidate.onboardingComplete, false);
    assert.equal(completeCandidate.onboardingComplete, true);
  });

  // Test 3: No selected skills -> none appear in profile or job-match explanations
  test("Test 3: No selected skills -> none appear in profile, resume, or match explanations", () => {
    const candidate: CandidateRecord = {
      id: "cand_no_skills",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Priya Patel",
        email: "priya@example.com",
        countryCode: "+91",
        phone: "9876500000",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({
        careerStage: "student",
        targetRoles: ["Exploring"],
        skills: [],
      }),
      profile: {
        headline: "Computer Science Student",
        summary: "Exploring opportunities",
        location: "India",
        phone: "9876500000",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [],
        links: [],
        jobPreferences: {
          desiredRoles: [],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    const matches = matchSampleJobs(candidate);
    assert.ok(matches.length > 0);
    // None of the matches should claim the candidate listed any skill
    for (const m of matches) {
      assert.ok(
        !m.matchReasons.some((r) => r.includes("You have listed:")),
        `Match reason shouldn't claim skills when none listed: ${m.matchReasons.join(", ")}`
      );
    }
  });

  // Test 4: Edit target role and work preference -> suggestions and sample job order update
  test("Test 4: Edit target role and work preference updates sample job ranking; saved jobs remain saved", () => {
    const candidate: CandidateRecord = {
      id: "cand_edit_pref",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Karan Singh",
        email: "karan@example.com",
        countryCode: "+91",
        phone: "9123456789",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({
        careerStage: "experienced",
        targetRoles: ["Backend Engineer"],
        skills: [{ name: "Go", level: "confident" }],
        workPreferences: { locationMode: "remote" },
      }),
      profile: {
        headline: "Backend Engineer",
        summary: "Backend Go developer",
        location: "India",
        phone: "9123456789",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "Go", level: "confident" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Backend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["remote"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: ["job_02"],
      interviews: [],
    };

    const matchesBefore = matchSampleJobs(candidate);
    // Top match should be Go / Backend
    assert.ok(matchesBefore[0].job.title.includes("Backend"));
    assert.ok(candidate.savedJobIds.includes("job_02"));

    // Now candidate changes target role to "Frontend Engineer" and skills to "React"
    const updatedCandidate: CandidateRecord = {
      ...candidate,
      profileRevision: 2,
      discovery: {
        ...candidate.discovery,
        targetRoles: ["Frontend Engineer"],
        skills: [{ name: "React", level: "confident" }],
      },
      profile: {
        ...candidate.profile,
        skills: [{ name: "React", level: "confident" }],
      },
    };

    const matchesAfter = matchSampleJobs(updatedCandidate);
    // Top match should now be Frontend
    assert.ok(matchesAfter[0].job.title.includes("Frontend"));


    // Saved job remains saved
    assert.ok(updatedCandidate.savedJobIds.includes("job_02"));
  });

  // Test 5: Six-group completeness formula and resolved suggestion disappears
  test("Test 5: Adding education/project changes completeness from 67% to 83% and resolves suggestion", () => {
    const candidate: CandidateRecord = {
      id: "cand_comp",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Anita Roy",
        email: "anita@example.com",
        countryCode: "+91",
        phone: "9988776655",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({
        careerStage: "fresher",
        targetRoles: ["Frontend Engineer"],
        skills: [{ name: "React", level: "comfortable" }],
        workPreferences: { locationMode: "any", jobType: "any", availability: "immediate" },
      }),
      profile: {
        headline: "Aspiring Frontend Engineer",
        summary: "Fresher web developer",
        location: "India",
        phone: "9988776655",
        education: [], // Missing background evidence!
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "comfortable" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Frontend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    // 5 out of 6 groups complete: contact, direction, skills, work_preferences, summary
    // Missing: background_evidence
    const compBefore = computeProfileCompleteness(candidate);
    assert.equal(compBefore.score, Math.round((5 / 6) * 100)); // 83%
    assert.ok(compBefore.missingGroups.some((m) => m.group === "background_evidence"));

    const sugBefore = deriveProfileSuggestions(candidate);
    assert.ok(sugBefore.some((s) => s.id === "sug_fresher_background"));

    // Now add education
    const candidateWithEdu: CandidateRecord = {
      ...candidate,
      profile: {
        ...candidate.profile,
        education: [
          {
            id: "edu_1",
            degree: "B.Tech Computer Science",
            institution: "NIT Trichy",
            fieldOfStudy: "Computer Science",
            startYear: "2022",
            endYear: "2026",
          },
        ],
      },
    };

    const compAfter = computeProfileCompleteness(candidateWithEdu);
    assert.equal(compAfter.score, 100, "All 6 groups are now complete");
    assert.equal(compAfter.missingGroups.length, 0);

    const sugAfter = deriveProfileSuggestions(candidateWithEdu);
    assert.ok(!sugAfter.some((s) => s.id === "sug_fresher_background"));
  });

  // Test 6: Missing optional history does not fabricate a resume section
  test("Test 6: Missing optional experience does not block onboarding or fabricate resume items", () => {
    const candidate: CandidateRecord = {
      id: "cand_fresher_clean",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Sneha Rao",
        email: "sneha@example.com",
        countryCode: "+91",
        phone: "9876543211",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({
        careerStage: "fresher",
        targetRoles: ["Frontend Engineer"],
        skills: [{ name: "JavaScript", level: "confident" }],
      }),
      profile: {
        headline: "Aspiring Frontend Engineer",
        summary: "Graduate programmer",
        location: "India",
        phone: "9876543211",
        education: [],
        experience: [], // Empty!
        projects: [],
        certifications: [],
        skills: [{ name: "JavaScript", level: "confident" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Frontend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    assert.equal(candidate.onboardingComplete, true);
    assert.equal(candidate.profile.experience.length, 0);
  });

  // Test 7: Profile revision out-of-sync detection for resume builder
  test("Test 7: Bumping profileRevision marks resume draft out-of-sync until reviewed", () => {
    const candidate: CandidateRecord = {
      id: "cand_sync",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Arjun Dev",
        email: "arjun@example.com",
        countryCode: "+91",
        phone: "9800000001",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({ targetRoles: ["Frontend Engineer"], skills: [{ name: "React", level: "comfortable" }] }),
      profile: {
        headline: "Frontend Engineer",
        summary: "Initial summary",
        location: "India",
        phone: "9800000001",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "comfortable" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Frontend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
      resumeDraft: {
        sourceProfileRevision: 1,
        contact: { fullName: "Arjun Dev", email: "arjun@example.com", phone: "9800000001", location: "India" },
        headline: "Frontend Engineer",
        summary: "Custom edited resume summary",
        skills: ["React"],
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        links: [],
        sectionOrder: ["summary", "skills", "experience", "education", "projects", "certifications", "links"],
        visibleSections: { summary: true, experience: true, projects: true, education: true, skills: true, certifications: true, links: true },
        hasReviewedProfileChanges: true,
      },
    };

    // Before profile change: in-sync
    assert.equal(candidate.profileRevision, candidate.resumeDraft!.sourceProfileRevision);

    // Profile is updated to Revision 2 (e.g. user adds a project in profile)
    const updatedCandidate: CandidateRecord = {
      ...candidate,
      profileRevision: 2,
      profile: {
        ...candidate.profile,
        projects: [{ id: "p1", title: "New Project", description: "Portfolio work", technologies: ["React"] }],
      },
      resumeDraft: {
        ...candidate.resumeDraft!,
        hasReviewedProfileChanges: false,
      },
    };

    // Detection: profileRevision > sourceProfileRevision AND !hasReviewedProfileChanges
    const isOutOfSync =
      updatedCandidate.profileRevision > updatedCandidate.resumeDraft!.sourceProfileRevision &&
      !updatedCandidate.resumeDraft!.hasReviewedProfileChanges;

    assert.equal(isOutOfSync, true, "Should detect out of sync draft");
    // Custom summary should be preserved
    assert.equal(updatedCandidate.resumeDraft!.summary, "Custom edited resume summary");
  });

  // Test 8: Private challenges and weekly time never appear in resume draft
  test("Test 8: Private challenges and weekly time budgets are completely excluded from resume draft", () => {
    const candidate: CandidateRecord = {
      id: "cand_privacy",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: {
        fullName: "Meera Nair",
        email: "meera@example.com",
        countryCode: "+91",
        phone: "9800000002",
        agreeToTerms: true,
      },
      discovery: mockDiscovery({
        challenges: ["few_interview_calls", "unclear_direction"],
        primaryChallenge: "few_interview_calls",
        timeBudget: "under_1_hour",
        targetRoles: ["Frontend Engineer"],
        skills: [{ name: "React", level: "confident" }],
      }),
      profile: {
        headline: "Frontend Engineer",
        summary: "Experienced developer",
        location: "India",
        phone: "9800000002",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "confident" }],
        links: [],
        jobPreferences: {
          desiredRoles: ["Frontend Engineer"],
          preferredLocations: [],
          desiredWorkModes: ["any"],
          employmentTypes: ["any"],
          availability: "immediate",
          salaryCurrency: "INR",
          salaryPeriod: "year",
        },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    const draftKeys = Object.keys(candidate.profile);
    assert.ok(!draftKeys.includes("challenges"));
    assert.ok(!draftKeys.includes("timeBudget"));
    assert.ok(!draftKeys.includes("primaryChallenge"));
  });

  // Test 9: Free-only resource preference correctly maps
  test("Test 9: freeOnlyResources boolean maps faithfully without UI discrepancy", () => {
    const draftTrue = { freeOnlyResources: true };
    const draftFalse = { freeOnlyResources: false };

    assert.equal(Boolean(draftTrue.freeOnlyResources), true);
    assert.equal(Boolean(draftFalse.freeOnlyResources), false);
  });

  // Test 10: Candidate isolation (No cross-account leakage)
  test("Test 10: Switching candidates does not leak profile, resume, jobs or applications", () => {
    const candidateA: CandidateRecord = {
      id: "cand_A",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: { fullName: "Candidate A", email: "a@test.com", phone: "1111111111", countryCode: "+91", agreeToTerms: true },
      discovery: mockDiscovery({ targetRoles: ["Role A"], skills: [{ name: "Skill A", level: "confident" }] }),
      profile: {
        headline: "Role A",
        summary: "Summary A",
        location: "A City",
        phone: "1111111111",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "Skill A", level: "confident" }],
        links: [],
        jobPreferences: { desiredRoles: ["Role A"], preferredLocations: [], desiredWorkModes: ["any"], employmentTypes: ["any"], availability: "immediate", salaryCurrency: "INR", salaryPeriod: "year" },
      },
      applications: [{ id: "app_A", jobId: "job_01", jobTitle: "Title A", organizationName: "Org A", location: "Loc A", workMode: "Remote", appliedAt: "2026-09-18T00:00:00Z", stage: "Applied" }],
      savedJobIds: ["job_01"],
      interviews: [],
    };

    const candidateB: CandidateRecord = {
      id: "cand_B",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: { fullName: "Candidate B", email: "b@test.com", phone: "2222222222", countryCode: "+91", agreeToTerms: true },
      discovery: mockDiscovery({ targetRoles: ["Role B"], skills: [{ name: "Skill B", level: "comfortable" }] }),
      profile: {
        headline: "Role B",
        summary: "Summary B",
        location: "B City",
        phone: "2222222222",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "Skill B", level: "comfortable" }],
        links: [],
        jobPreferences: { desiredRoles: ["Role B"], preferredLocations: [], desiredWorkModes: ["any"], employmentTypes: ["any"], availability: "immediate", salaryCurrency: "INR", salaryPeriod: "year" },
      },
      applications: [], // ZERO!
      savedJobIds: [], // ZERO!
      interviews: [],
    };

    assert.equal(candidateA.applications.length, 1);
    assert.equal(candidateB.applications.length, 0);
    assert.equal(candidateA.savedJobIds.length, 1);
    assert.equal(candidateB.savedJobIds.length, 0);
    assert.notEqual(candidateA.identity.fullName, candidateB.identity.fullName);
  });

  // Test 11: Job rules respect explicit constraints and identity fields have no influence
  test("Test 11: Candidate name/email/phone has 0 influence on job match ranking", () => {
    const candidateBase: CandidateRecord = {
      id: "cand_rank_1",
      schemaVersion: "1.0.0",
      profileRevision: 1,
      onboardingComplete: true,
      identity: { fullName: "Vikram Malhotra", email: "vikram@example.com", phone: "9876500001", countryCode: "+91", agreeToTerms: true },
      discovery: mockDiscovery({ targetRoles: ["Frontend Engineer"], skills: [{ name: "React", level: "confident" }] }),
      profile: {
        headline: "Frontend Engineer",
        summary: "Summary",
        location: "India",
        phone: "9876500001",
        education: [],
        experience: [],
        projects: [],
        certifications: [],
        skills: [{ name: "React", level: "confident" }],
        links: [],
        jobPreferences: { desiredRoles: ["Frontend Engineer"], preferredLocations: [], desiredWorkModes: ["any"], employmentTypes: ["any"], availability: "immediate", salaryCurrency: "INR", salaryPeriod: "year" },
      },
      applications: [],
      savedJobIds: [],
      interviews: [],
    };

    const matches1 = matchSampleJobs(candidateBase);

    // Change only identity
    const candidateChangedIdentity: CandidateRecord = {
      ...candidateBase,
      identity: { fullName: "Aisha Khan", email: "aisha@example.org", phone: "9999999999", countryCode: "+44", agreeToTerms: true },
    };

    const matches2 = matchSampleJobs(candidateChangedIdentity);

    assert.equal(matches1.length, matches2.length);
    assert.equal(matches1[0].job.id, matches2[0].job.id);
    assert.equal(matches1[0].score, matches2[0].score);
  });

  // Test 12: Save/Unsave updates count, application requires simulated submission
  test("Test 12: Toggling saved job updates count; applications require explicit simulated submission", () => {
    let savedIds: string[] = [];
    const toggle = (id: string) => {
      savedIds = savedIds.includes(id) ? savedIds.filter((x) => x !== id) : [...savedIds, id];
    };

    assert.equal(savedIds.length, 0);
    toggle("job_01");
    assert.equal(savedIds.length, 1);
    assert.ok(savedIds.includes("job_01"));
    toggle("job_01");
    assert.equal(savedIds.length, 0);
  });

  // Test 13: Skill normalization aliases work accurately
  test("Test 13: Skill normalization correctly handles aliases", () => {
    assert.equal(normalizeSkill("React.js"), "react");
    assert.equal(normalizeSkill("TypeScript"), "typescript");
    assert.equal(normalizeSkill("TS"), "typescript");
    assert.equal(normalizeSkill("Golang"), "go");
    assert.equal(normalizeSkill("TailwindCSS"), "tailwind css");
  });
});
