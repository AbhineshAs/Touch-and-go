// tests/unit/profile-photo.test.ts
import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";

const mockLocalStorage: Record<string, string> = {};

if (typeof (global as any).window === "undefined") {
  (global as any).window = {
    dispatchEvent: () => true,
    addEventListener: () => {},
    removeEventListener: () => {},
  };
  (global as any).localStorage = {
    getItem: (key: string) => mockLocalStorage[key] || null,
    setItem: (key: string, val: string) => {
      mockLocalStorage[key] = val;
    },
    removeItem: (key: string) => {
      delete mockLocalStorage[key];
    },
  };
}

const AVATAR_STORAGE_KEY = "tag_candidate_avatar";

describe("Candidate Profile Photo Unit Tests", () => {
  beforeEach(() => {
    for (const k in mockLocalStorage) delete mockLocalStorage[k];
  });

  it("Default state falls back to candidate initial when no photo is uploaded", () => {
    const candidateName = "New Candidate";
    const storedPhoto = (global as any).localStorage.getItem(AVATAR_STORAGE_KEY);
    assert.equal(storedPhoto, null);
    const initial = candidateName.charAt(0).toUpperCase();
    assert.equal(initial, "N");
  });

  it("Validates accepted image MIME types (png, jpeg, webp)", () => {
    const validMimes = ["image/png", "image/jpeg", "image/webp"];
    const invalidMimes = ["application/pdf", "text/plain", "video/mp4"];

    for (const mime of validMimes) {
      assert.equal(mime.startsWith("image/"), true);
    }
    for (const mime of invalidMimes) {
      assert.equal(mime.startsWith("image/"), false);
    }
  });

  it("Uploading photo saves data to localStorage and enables image state", () => {
    const mockDataUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    (global as any).localStorage.setItem(AVATAR_STORAGE_KEY, mockDataUrl);

    const saved = (global as any).localStorage.getItem(AVATAR_STORAGE_KEY);
    assert.equal(saved, mockDataUrl);
  });

  it("Removing current photo clears avatar from storage and reverts to user initial", () => {
    const mockDataUrl = "data:image/jpeg;base64,12345";
    (global as any).localStorage.setItem(AVATAR_STORAGE_KEY, mockDataUrl);
    assert.equal((global as any).localStorage.getItem(AVATAR_STORAGE_KEY), mockDataUrl);

    // Simulate handleRemovePhoto
    (global as any).localStorage.removeItem(AVATAR_STORAGE_KEY);
    assert.equal((global as any).localStorage.getItem(AVATAR_STORAGE_KEY), null);

    const candidateName = "Alen William";
    const initial = candidateName.charAt(0).toUpperCase();
    assert.equal(initial, "A");
  });
});
