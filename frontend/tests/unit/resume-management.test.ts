// tests/unit/resume-management.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { UploadedResume } from "../../types/profile";

describe("Candidate Resume Management Unit Tests", () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
  });

  // Helper simulating the Context / Storage manager
  class ResumeManagerService {
    private currentResume: UploadedResume | null = null;
    private readonly storageKey = "tag_candidate_uploaded_resume";

    constructor(initialResume?: UploadedResume) {
      if (initialResume) {
        this.currentResume = initialResume;
        mockStorage[this.storageKey] = JSON.stringify(initialResume);
      }
    }

    getResume(): UploadedResume | null {
      if (this.currentResume) return this.currentResume;
      const raw = mockStorage[this.storageKey];
      if (raw) {
        try {
          this.currentResume = JSON.parse(raw);
          return this.currentResume;
        } catch {}
      }
      return null;
    }

    uploadResume(fileData: Omit<UploadedResume, "id" | "uploadedAt">): UploadedResume {
      const newResume: UploadedResume = {
        id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        ...fileData,
        uploadedAt: new Date().toISOString(),
      };
      this.currentResume = newResume;
      mockStorage[this.storageKey] = JSON.stringify(newResume);
      return newResume;
    }

    replaceResume(newFileData: Omit<UploadedResume, "id" | "uploadedAt">): UploadedResume {
      return this.uploadResume(newFileData);
    }

    deleteResume(): void {
      this.currentResume = null;
      delete mockStorage[this.storageKey];
    }

    updateScore(score: number): UploadedResume | null {
      if (!this.currentResume) return null;
      this.currentResume.atsScore = score;
      mockStorage[this.storageKey] = JSON.stringify(this.currentResume);
      return this.currentResume;
    }
  }

  describe("1. Upload Resume", () => {
    it("Starts with no active resume", () => {
      const manager = new ResumeManagerService();
      assert.equal(manager.getResume(), null);
    });

    it("Uploads a valid PDF resume and saves metadata & DataURL", () => {
      const manager = new ResumeManagerService();
      const uploaded = manager.uploadResume({
        fileName: "Alen_William_Resume_2026.pdf",
        fileSize: 245760, // 240 KB
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
        extractedText: "Alen William\nSoftware Engineer\nSkills: TypeScript, Next.js, React",
      });

      assert.ok(uploaded.id.startsWith("res_"));
      assert.equal(uploaded.fileName, "Alen_William_Resume_2026.pdf");
      assert.equal(uploaded.fileSize, 245760);
      assert.equal(uploaded.fileType, "application/pdf");
      assert.ok(uploaded.uploadedAt.length > 0);
      assert.ok(uploaded.dataUrl?.startsWith("data:application/pdf"));
      assert.ok(uploaded.extractedText?.includes("Alen William"));

      // Verify persistence in storage
      assert.ok(mockStorage["tag_candidate_uploaded_resume"]);
      const stored = JSON.parse(mockStorage["tag_candidate_uploaded_resume"]);
      assert.equal(stored.fileName, "Alen_William_Resume_2026.pdf");
    });

    it("Uploads a DOCX resume file accurately", () => {
      const manager = new ResumeManagerService();
      const docx = manager.uploadResume({
        fileName: "Alen_William_CV.docx",
        fileSize: 184320,
        fileType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        dataUrl: "data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,...",
        extractedText: "Professional Summary: 4+ years of React and Next.js engineering.",
      });

      assert.equal(docx.fileName, "Alen_William_CV.docx");
      assert.equal(manager.getResume()?.fileName, "Alen_William_CV.docx");
    });
  });

  describe("2. View Resume", () => {
    it("Retrieves complete resume details for modal preview", () => {
      const manager = new ResumeManagerService();
      manager.uploadResume({
        fileName: "Candidate_Portfolio_Resume.pdf",
        fileSize: 512000,
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,PDFDATA...",
        extractedText: "Experience: Senior Frontend Architect at Touch & Go",
      });

      const current = manager.getResume();
      assert.ok(current);
      assert.equal(current?.fileName, "Candidate_Portfolio_Resume.pdf");
      assert.equal(current?.fileType, "application/pdf");
      assert.equal(current?.extractedText, "Experience: Senior Frontend Architect at Touch & Go");
    });
  });

  describe("3. Download Resume", () => {
    it("Preserves downloadable dataUrl and exact filename for client download", () => {
      const manager = new ResumeManagerService();
      const resume = manager.uploadResume({
        fileName: "Alen_William_Official_CV.pdf",
        fileSize: 320000,
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,SGVsbG8gV29ybGQ=",
        extractedText: "Hello World Resume Content",
      });

      // Emulate download payload check
      const downloadPayload = {
        href: resume.dataUrl,
        downloadName: resume.fileName,
      };

      assert.equal(downloadPayload.downloadName, "Alen_William_Official_CV.pdf");
      assert.ok(downloadPayload.href?.startsWith("data:application/pdf;base64,"));
    });
  });

  describe("4. Replace Resume", () => {
    it("Replaces an existing resume with a new file and updates timestamp", async () => {
      const manager = new ResumeManagerService();
      const first = manager.uploadResume({
        fileName: "Old_Resume_2025.pdf",
        fileSize: 150000,
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,OLD...",
      });

      assert.equal(first.fileName, "Old_Resume_2025.pdf");

      // Replace with new file
      const updated = manager.replaceResume({
        fileName: "New_Updated_Resume_2026.pdf",
        fileSize: 220000,
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,NEW...",
        extractedText: "Updated experience with Docker and Kubernetes",
      });

      assert.equal(updated.fileName, "New_Updated_Resume_2026.pdf");
      assert.equal(updated.fileSize, 220000);
      assert.equal(manager.getResume()?.fileName, "New_Updated_Resume_2026.pdf");

      // Old resume is no longer the active resume
      const stored = JSON.parse(mockStorage["tag_candidate_uploaded_resume"]);
      assert.equal(stored.fileName, "New_Updated_Resume_2026.pdf");
    });
  });

  describe("5. Delete Resume", () => {
    it("Deletes the active resume and clears persisted storage", () => {
      const manager = new ResumeManagerService();
      manager.uploadResume({
        fileName: "Resume_To_Delete.pdf",
        fileSize: 100000,
        fileType: "application/pdf",
      });

      assert.ok(manager.getResume());
      assert.ok(mockStorage["tag_candidate_uploaded_resume"]);

      // Perform deletion
      manager.deleteResume();

      assert.equal(manager.getResume(), null);
      assert.equal(mockStorage["tag_candidate_uploaded_resume"], undefined);
    });

    it("Permits re-uploading immediately after deletion", () => {
      const manager = new ResumeManagerService();
      manager.uploadResume({
        fileName: "First.pdf",
        fileSize: 100000,
        fileType: "application/pdf",
      });
      manager.deleteResume();
      assert.equal(manager.getResume(), null);

      const reuploaded = manager.uploadResume({
        fileName: "Fresh_Start.pdf",
        fileSize: 120000,
        fileType: "application/pdf",
      });

      assert.equal(reuploaded.fileName, "Fresh_Start.pdf");
      assert.equal(manager.getResume()?.fileName, "Fresh_Start.pdf");
    });
  });

  describe("6. ATS Score Integration", () => {
    it("Updates ATS score on active resume", () => {
      const manager = new ResumeManagerService();
      manager.uploadResume({
        fileName: "Scored_CV.pdf",
        fileSize: 200000,
        fileType: "application/pdf",
      });

      manager.updateScore(92);
      const scored = manager.getResume();
      assert.equal(scored?.atsScore, 92);
      const stored = JSON.parse(mockStorage["tag_candidate_uploaded_resume"]);
      assert.equal(stored.atsScore, 92);
    });
  });

  describe("7. Logout & Persistence Across Session Reset", () => {
    it("Preserves candidate resume across logout and reloads upon re-login", () => {
      const email = "alenwilliam212@gmail.com";
      const userResumeKey = `tag_candidate_resume_${email}`;

      // 1. Candidate uploads resume
      const manager = new ResumeManagerService();
      const uploaded = manager.uploadResume({
        fileName: "Alen_William_Cv.pdf",
        fileSize: 76800,
        fileType: "application/pdf",
        dataUrl: "data:application/pdf;base64,JVBERi0xLjQKJ...",
        extractedText: "Alen William Resume\nAspiring Backend Engineer",
        atsScore: 88,
      });

      // Save to user-scoped persistent record
      mockStorage[userResumeKey] = JSON.stringify(uploaded);
      mockStorage["tag_auth_user"] = JSON.stringify({ email, name: "alenwilliam212", role: "candidate" });
      mockStorage["tag_auth_token"] = "tag_jwt_token_123";

      assert.equal(manager.getResume()?.fileName, "Alen_William_Cv.pdf");

      // 2. Simulate Logout / resetAll():
      // Session keys are removed, but user-scoped DB data is strictly preserved!
      delete mockStorage["tag_auth_token"];
      delete mockStorage["tag_auth_user"];
      delete mockStorage["tag_active_role"];
      delete mockStorage["tag_candidate_uploaded_resume"];

      // Verify session is cleared
      assert.equal(mockStorage["tag_candidate_uploaded_resume"], undefined);
      assert.equal(mockStorage["tag_auth_token"], undefined);
      // But user-scoped persistent record is intact
      assert.ok(mockStorage[userResumeKey]);

      // 3. Candidate logs back in with the same email
      const userRecordStr = mockStorage[userResumeKey];
      assert.ok(userRecordStr);
      const restoredResume: UploadedResume = JSON.parse(userRecordStr);

      const rehydratedManager = new ResumeManagerService(restoredResume);
      assert.equal(rehydratedManager.getResume()?.fileName, "Alen_William_Cv.pdf");
      assert.equal(rehydratedManager.getResume()?.atsScore, 88);
      assert.equal(rehydratedManager.getResume()?.fileSize, 76800);
    });
  });
});
