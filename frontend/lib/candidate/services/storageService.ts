// lib/candidate/services/storageService.ts

import {
  IdentityDraft,
  DiscoveryDraft,
  ConfirmedProfile,
  Recommendation,
  PlanTask,
  Feedback,
} from "../types";

export interface CandidateMemoryStore {
  identity: IdentityDraft | null;
  phoneVerified: boolean;
  discoveryDraft: DiscoveryDraft;
  confirmedProfile: ConfirmedProfile | null;
  recommendations: Recommendation[];
  tasks: PlanTask[];
  feedback: Feedback;
}

const initialDiscoveryDraft: DiscoveryDraft = {
  targetRoles: [],
  challenges: [],
  skills: [],
  strengths: [],
  preferredSupport: [],
};

const initialFeedback: Feedback = {
  savedRecommendationIds: [],
  dismissedFingerprints: [],
};

export class CandidateStorageService {
  private store: CandidateMemoryStore;

  constructor() {
    this.store = this.getCleanStore();
  }

  private getCleanStore(): CandidateMemoryStore {
    return {
      identity: null,
      phoneVerified: false,
      discoveryDraft: { ...initialDiscoveryDraft },
      confirmedProfile: null,
      recommendations: [],
      tasks: [],
      feedback: { ...initialFeedback },
    };
  }

  public getStore(): CandidateMemoryStore {
    return this.store;
  }

  public setIdentity(identity: IdentityDraft): void {
    this.store.identity = { ...identity };
  }

  public setPhoneVerified(verified: boolean): void {
    this.store.phoneVerified = verified;
  }

  public updateDiscoveryDraft(partial: Partial<DiscoveryDraft>): void {
    this.store.discoveryDraft = {
      ...this.store.discoveryDraft,
      ...partial,
    };
  }

  public setConfirmedProfile(profile: ConfirmedProfile): void {
    this.store.confirmedProfile = { ...profile };
  }

  public setRecommendations(recs: Recommendation[]): void {
    this.store.recommendations = [...recs];
  }

  public setTasks(tasks: PlanTask[]): void {
    this.store.tasks = [...tasks];
  }

  public setFeedback(feedback: Feedback): void {
    this.store.feedback = { ...feedback };
  }

  public resetAll(): void {
    this.store = this.getCleanStore();
  }
}

export const candidateStorage = new CandidateStorageService();
