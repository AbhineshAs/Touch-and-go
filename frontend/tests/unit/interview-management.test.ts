import { describe, it, beforeEach, after } from "node:test";
import assert from "node:assert/strict";
import {
  scheduleInterview,
  getInterviews,
  getInterviewById,
  getInterviewsForApplication,
  updateInterview,
  cancelInterview,
  submitScorecard,
  deleteInterview,
  clearInterviewsState,
} from "../../lib/api/interviews";
import { InterviewScorecard } from "../../types";

describe("Interview Management Full CRUD & Lifecycle Unit Tests", () => {
  const mockStorage: Record<string, string> = ((globalThis as any).__sharedMockStorage =
    (globalThis as any).__sharedMockStorage || {});
  const originalFetch = globalThis.fetch;

  after(() => {
    globalThis.fetch = originalFetch;
  });

  beforeEach(() => {
    delete mockStorage["tag_interviews_storage"];

    (globalThis as any).localStorage = {
      getItem: (key: string) => mockStorage[key] || null,
      setItem: (key: string, value: string) => {
        mockStorage[key] = value;
      },
      removeItem: (key: string) => {
        delete mockStorage[key];
      },
      clear: () => {
        delete mockStorage["tag_interviews_storage"];
      },
    };

    (globalThis as any).window = {
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
      localStorage: (globalThis as any).localStorage,
    };

    clearInterviewsState();
    (globalThis as any).fetch = () => Promise.reject(new Error("Unit test isolation"));
  });

  it("1. Schedule Interview: creates an interview with Scheduled status, meeting link, and notes", async () => {
    const scheduled = await scheduleInterview({
      applicationId: "app_fe_101",
      candidateId: "usr_alen",
      candidateName: "alenwilliam212",
      jobId: "job_react_19",
      jobTitle: "Senior Frontend Engineer (React 19)",
      roundName: "Round 1 - Technical Screen",
      scheduledAt: "2026-10-15T14:30:00.000Z",
      durationMinutes: 45,
      interviewerName: "Alen William",
      interviewerRole: "Hiring Manager",
      interviewerEmail: "recruiting@company.com",
      meetingLink: "https://meet.google.com/tag-interview-room",
      candidateNote: "Prepare open source component architecture walk-through.",
    });

    assert.ok(scheduled.id.startsWith("int_"));
    assert.equal(scheduled.status, "Scheduled");
    assert.equal(scheduled.applicationId, "app_fe_101");
    assert.equal(scheduled.candidateName, "alenwilliam212");
    assert.equal(scheduled.meetingLink, "https://meet.google.com/tag-interview-room");
    assert.equal(scheduled.roundName, "Round 1 - Technical Screen");
    assert.equal(scheduled.candidateNote, "Prepare open source component architecture walk-through.");
  });

  it("2. Interview Details: retrieves an interview by ID and by applicationId", async () => {
    const appId = `app_be_unique_${Date.now()}_${Math.random()}`;
    const scheduled = await scheduleInterview({
      applicationId: appId,
      candidateId: "usr_priya",
      candidateName: "Priya Sharma",
      jobId: "job_python_01",
      jobTitle: "Senior Python Architect",
      scheduledAt: "2026-10-16T11:00:00.000Z",
      durationMinutes: 60,
      interviewerName: "Vikramaditya Nair",
      interviewerRole: "Engineering Lead",
      interviewerEmail: "vikram@company.com",
      meetingLink: "https://meet.google.com/xyz-abcd-efg",
    });

    const retrieved = await getInterviewById(scheduled.id);
    assert.ok(retrieved !== null);
    assert.equal(retrieved?.id, scheduled.id);
    assert.equal(retrieved?.jobTitle, "Senior Python Architect");

    const forApp = await getInterviewsForApplication(appId);
    assert.equal(forApp.length, 1);
    assert.equal(forApp[0].id, scheduled.id);
  });

  it("3. Edit Interview: updates date, interviewer, meeting link, and sets status to Rescheduled", async () => {
    const scheduled = await scheduleInterview({
      applicationId: "app_fe_303",
      candidateId: "usr_rahul",
      candidateName: "Rahul Verma",
      jobId: "job_fullstack",
      jobTitle: "Fullstack Developer",
      scheduledAt: "2026-10-18T10:00:00.000Z",
      durationMinutes: 45,
      interviewerName: "Alen William",
      interviewerRole: "Hiring Manager",
      interviewerEmail: "recruiting@company.com",
      meetingLink: "https://meet.google.com/old-link",
      candidateNote: "Initial note",
    });

    const updated = await updateInterview(scheduled.id, {
      scheduledAt: "2026-10-20T16:00:00.000Z",
      meetingLink: "https://zoom.us/j/1234567890",
      interviewerName: "Alen William & Sarah Jenkins",
      candidateNote: "Updated note with portfolio focus",
    });

    assert.equal(updated.id, scheduled.id);
    assert.equal(
      new Date(updated.scheduledAt).getTime(),
      new Date("2026-10-20T16:00:00.000Z").getTime()
    );
    assert.equal(updated.meetingLink, "https://zoom.us/j/1234567890");
    assert.equal(updated.interviewerName, "Alen William & Sarah Jenkins");
    assert.equal(updated.candidateNote, "Updated note with portfolio focus");
    assert.equal(updated.status, "Rescheduled");

    const refreshed = await getInterviewById(scheduled.id);
    assert.equal(refreshed?.meetingLink, "https://zoom.us/j/1234567890");
    assert.equal(refreshed?.status, "Rescheduled");
  });

  it("4. Cancel Interview: updates status to Cancelled and saves cancellation reason", async () => {
    const scheduled = await scheduleInterview({
      applicationId: "app_cancel_404",
      candidateId: "usr_ananya",
      candidateName: "Ananya Patel",
      jobId: "job_design_01",
      jobTitle: "Product Designer",
      scheduledAt: "2026-10-19T14:00:00.000Z",
      durationMinutes: 45,
      interviewerName: "Maya Lin",
      interviewerRole: "Design Director",
      interviewerEmail: "maya@company.com",
      meetingLink: "https://meet.google.com/design-review",
    });

    const cancelled = await cancelInterview(
      scheduled.id,
      "Candidate requested reschedule due to illness."
    );

    assert.equal(cancelled.status, "Cancelled");
    assert.equal(
      cancelled.cancellationReason,
      "Candidate requested reschedule due to illness."
    );
    assert.ok(cancelled.cancelledAt !== undefined);

    const check = await getInterviewById(scheduled.id);
    assert.equal(check?.status, "Cancelled");
    assert.equal(
      check?.cancellationReason,
      "Candidate requested reschedule due to illness."
    );
  });

  it("5. Submit Scorecard: records evaluation decision and marks interview Completed", async () => {
    const scheduled = await scheduleInterview({
      applicationId: "app_score_505",
      candidateId: "usr_dev",
      candidateName: "Devendra Joshi",
      jobId: "job_infra",
      jobTitle: "DevOps Engineer",
      scheduledAt: "2026-10-14T09:00:00.000Z",
      durationMinutes: 45,
      interviewerName: "Alen William",
      interviewerRole: "Hiring Manager",
      interviewerEmail: "recruiting@company.com",
      meetingLink: "https://meet.google.com/infra-round",
    });

    const scorecard: InterviewScorecard = {
      interviewerId: "usr_emp_01",
      interviewerName: "Alen William",
      technicalRating: 5,
      communicationRating: 4,
      domainKnowledgeRating: 5,
      cultureAddRating: 4,
      overallDecision: "Strong Yes",
      summary: "Superb Kubernetes and Terraform expertise. Strong hire.",
      submittedAt: new Date().toISOString(),
    };

    const completed = await submitScorecard(scheduled.id, scorecard);
    assert.equal(completed.status, "Completed");
    assert.equal(completed.scorecard?.overallDecision, "Strong Yes");
    assert.equal(completed.scorecard?.technicalRating, 5);
    assert.equal(
      completed.scorecard?.summary,
      "Superb Kubernetes and Terraform expertise. Strong hire."
    );

    const reloaded = await getInterviewById(scheduled.id);
    assert.equal(reloaded?.status, "Completed");
  });

  it("6. Filter Interviews: filters by status and search terms", async () => {
    const uniqueAarav = `Aarav_${Date.now()}`;
    await scheduleInterview({
      applicationId: `app_filter_1_${Date.now()}`,
      candidateId: "cand_1",
      candidateName: uniqueAarav,
      jobId: "job_1",
      jobTitle: "React Specialist",
      scheduledAt: "2026-10-22T10:00:00.000Z",
      durationMinutes: 45,
      interviewerName: "Lead Interviewer",
      interviewerRole: "Manager",
      interviewerEmail: "rec@comp.com",
      meetingLink: "https://meet.google.com/room-1",
    });

    const int2 = await scheduleInterview({
      applicationId: `app_filter_2_${Date.now()}`,
      candidateId: "cand_2",
      candidateName: `Sneha_${Date.now()}`,
      jobId: "job_2",
      jobTitle: "Data Scientist",
      scheduledAt: "2026-10-23T11:00:00.000Z",
      durationMinutes: 45,
      interviewerName: "Lead Interviewer",
      interviewerRole: "Manager",
      interviewerEmail: "rec@comp.com",
      meetingLink: "https://meet.google.com/room-2",
    });

    await cancelInterview(int2.id, "Candidate withdrawn");

    // Filter by Scheduled
    const scheduledOnly = await getInterviews({ status: "Scheduled" });
    assert.ok(scheduledOnly.some((i) => i.candidateName === uniqueAarav));
    assert.ok(!scheduledOnly.some((i) => i.id === int2.id));

    // Filter by Cancelled
    const cancelledOnly = await getInterviews({ status: "Cancelled" });
    assert.ok(cancelledOnly.some((i) => i.id === int2.id));

    // Search by candidate name
    const searchAarav = await getInterviews({ search: uniqueAarav.toLowerCase() });
    assert.equal(searchAarav.length, 1);
    assert.equal(searchAarav[0].candidateName, uniqueAarav);
  });

  it("7. Delete Interview: completely deletes interview record", async () => {
    const scheduled = await scheduleInterview({
      applicationId: "app_del_606",
      candidateId: "usr_delete_test",
      candidateName: "Delete Candidate",
      jobId: "job_del",
      jobTitle: "Temp Role",
      scheduledAt: "2026-10-25T10:00:00.000Z",
      durationMinutes: 30,
      interviewerName: "HR",
      interviewerRole: "Recruiter",
      interviewerEmail: "hr@comp.com",
      meetingLink: "https://meet.google.com/temp",
    });

    await deleteInterview(scheduled.id);
    const deleted = await getInterviewById(scheduled.id);
    assert.equal(deleted, null);
  });
});
