# TAG — Candidate Experience & Career Discovery

This repository implements the **TAG candidate experience** in Next.js 16 and React 19. TAG understands a candidate's current career situation, challenges, strengths, goals, and preferred support, translating confirmed answers into a personalized dashboard with explainable recommendations and an actionable 7-day plan.

---

## Core Principles & Scope Boundaries

1. **Self-Reported Signals ("Quality")**: Skills, strengths, and examples are treated as self-reported evidence. TAG **never** generates candidate-quality scores, employability percentages, personality diagnoses, or employer rankings.
2. **Explainable Recommendations**: Recommendations are candidate-facing guidance with a concrete rationale linking to confirmed answers and an authored working activity.
3. **Frontend In-Memory Preview**: Identity, discovery draft, confirmed snapshot, task progress, and feedback reside strictly in memory for this preview phase. A clear notice informs users that refreshing resets the preview. No `localStorage` is used for authentication or answer storage.
4. **Mock Phone Verification**: Simulated OTP with visible demo code (`729410`), 30-second resend cooldown, 5-minute expiry, and simulated locking after 5 wrong attempts. No client verified flag is treated as real server authentication.

---

## Route Map

| Route | Purpose | Key Behaviors |
| :--- | :--- | :--- |
| `/sign-up?role=candidate` | Candidate Registration | Name, email syntax validation, phone with country selector (+91 default), terms checkbox, privacy link. No password field for candidates. Preserves "Hiring Team" toggle. |
| `/verify-phone` | Phone Verification | 6-digit accessible input (paste, numeric keyboard, `autocomplete="one-time-code"`), demo code notice (`729410`), 30s resend cooldown, 5m expiry, edit phone link. |
| `/onboarding` | 12-Step Adaptive Discovery | Two-column desktop layout (question group + live summary card), collapsible mobile drawer, selectable cards/chips, stage follow-ups, Back, Skip, Continue. |
| `/onboarding/review` | Q13 Understanding Summary | Grouped editable summary of confirmed answers (About you, Challenges, Strengths/Skills, Plan/Preferences), "Confirm & Create My Dashboard" CTA. |
| `/dashboard` | Personalized Dashboard | 1. Current focus summary<br>2. Next Action hero card<br>3. Strengths & skills with honest badges<br>4. Up to 3 recommendations with "Why this is here"<br>5. Budgeted 7-day action plan<br>6. Illustrative role cards<br>7. Plan task progress counter<br>8. Preferences edit trigger |
| `/dashboard/activities/[activityId]` | Working Local Activities | Step-by-step interactive checklists, STAR prompt builder, worksheets, and local completion controls. |
| `/dashboard/preferences` | Answer Reconfirmation | Edit discovery answers, reconfirm (bumps revision), recalculate recommendations, reconcile tasks with topic isolation. |

---

## Recommendation Engine (R01 – R11)

Recommendations are computed deterministically by a pure TypeScript engine without using name, email, or phone:

- **R01**: Unclear direction or exploration goal $\rightarrow$ Role comparison worksheet (`act-role-comparison`)
- **R02**: Few interview calls with CV/unsure follow-up $\rightarrow$ CV review checklist (`act-cv-review`)
- **R03**: Few interview calls with targeting follow-up $\rightarrow$ Role-to-experience mapping (`act-role-mapping`)
- **R04**: Interview challenge $\rightarrow$ Structured interview practice & reflection (`act-interview-practice`)
- **R05**: Learning target stated $\rightarrow$ Targeted skill sprint (`act-skill-exercise`)
- **R06**: Project challenge with no example $\rightarrow$ End-to-end project brief (`act-project-brief`)
- **R07**: Project challenge with existing example $\rightarrow$ Project documentation checklist (`act-project-docs`)
- **R08**: Transition challenge or switcher goal $\rightarrow$ Transferable skills translation (`act-transferable-skills`)
- **R09**: Difficult openings challenge $\rightarrow$ Search preferences checklist (`act-search-preferences`)
- **R10**: Explicit support preference with no matching challenge rule $\rightarrow$ Corresponding catalogue activity
- **R11**: Sparse data or neutral fallback $\rightarrow$ Neutral focus picker (`act-focus-picker`)

### Ranking & Capping
- **Lexicographical Sort**:
  1. Addresses primary challenge
  2. Matches preferred support
  3. Addresses primary goal
  4. Stable rule ID
- **Category Cap**: At most 2 recommendations in any one support category; up to 3 total recommendations.
- **Dismissal Persistence**: Dismissals persist using `${ruleId}:${subjectId}:${reason}` fingerprints. Dismissing all advice shows "You're up to date" rather than immediately repeating dismissed cards.

---

## 7-Day Action Plan & Task Reconciliation

- **Weekly Duration Caps**:
  - `< 1 hour / week`: capped at $\le 45$ minutes
  - `1–3 hours / week`: capped at $\le 120$ minutes
  - `3–5 hours / week`: capped at $\le 180$ minutes
  - `> 5 hours / week`: capped at $\le 240$ minutes
  - `Unsure`: exactly 1 disclosed 15-minute starter task
- **Task Identity**: `${activityId}:${subjectId}:${stepId}`
- **Topic Isolation**: Switching a learning subject (e.g. React to SQL) creates a distinct task identity (`act-skill-exercise:sql:step1`) and will **never** inherit completion from another topic.
- **Archival**: Obsolete tasks from previous answer revisions are archived automatically.

---

## Run Commands

```bash
# Run unit and E2E test suites (26 tests)
npm test

# Run Next.js build
npm run build

# Start local development server
npm run dev

# Run lint checks
npm run lint
```

---

## Test Scenarios (A to G)

All test scenarios pass in `tests/e2e/scenarios.test.ts`:
- **Scenario A**: Fresher with few interview calls, React skills, CV support, and 1–3 hours receives CV review first and plan $\le 120$ min.
- **Scenario B**: Experienced user with technical interview challenge gets technical practice first, without an unmentioned CV issue guessed.
- **Scenario C**: Career switcher with unclear direction receives role exploration and transferable skills support.
- **Scenario D**: Prefer-not-to-say and unknown answers yield a neutral focus picker and disclosed starter task.
- **Scenario E**: Editing primary challenge changes top advice; switching from React to SQL does not carry over task completion.
- **Scenario F**: OTP wrong, expired, resend, and edit-phone paths work; stale responses cannot verify another phone.
- **Scenario G**: Modifying contact details (name, email, phone) leaves recommendation output completely unchanged.

---

---

## Candidate Portal Integration & Route Flow

The canonical candidate flow connects registration and discovery directly to the candidate portal:

```
/sign-in
  ├── Candidate: Phone + simulated OTP (729410)
  └── Employer:  Email + password (unchanged)
        ↓
/sign-up?role=candidate (passwordless identity creation)
        ↓
/verify-phone (simulated OTP verification)
        ↓
/onboarding (12-step adaptive discovery)
        ↓
/onboarding/review (Step 13 understanding summary)
        ↓ [Confirm & Create My Dashboard]
/candidate/dashboard (Canonical candidate portal)
```

> **Important**: `/dashboard` redirects client-side directly to `/candidate/dashboard`. All candidate links and buttons consistently target `/candidate/*` routes.

### Candidate Routes

| Route | Purpose | Key Behaviors |
| :--- | :--- | :--- |
| `/candidate/dashboard` | Main Candidate Dashboard | Greeting with candidate's actual name, 6-group completeness gauge with missing details modal, up to 3 contextual improvement suggestions, recommended sample jobs with factual reasons, career next steps, live applications/saved jobs counters. Clean zero-state for new candidates (0 applications, 0 saved jobs, 0 interviews, no Ananya demo data). |
| `/candidate/profile` | Structured Profile Editor | Editable headline, summary, contact info, and structured sections (Education, Experience, Projects, Certifications, Skills, Links, Job Preferences) with modals to add/edit/delete. |
| `/candidate/profile/resume` | Editable Resume Builder | Single-column professional printable layout. Pre-filled from profile with section reordering, bullet achievement prompts, deterministic summary suggestions, and two-way sync with profile revisions (`sourceProfileRevision`). Print CSS strips controls and formats cleanly for A4/PDF. |
| `/candidate/recommended` | Recommended Jobs | Sample jobs catalogue matched deterministically by target roles, skills, and work preferences with factual match reasons. |
| `/candidate/saved` | Saved Jobs | Synchronized save/unsave list linked to candidate state. |
| `/candidate/applications` | Applications | Candidate's submitted mock applications with "Not sent to employer" simulated apply modal. |
| `/candidate/jobs` | Job Catalogue | Browse all sample jobs with active search, filter, and save controls. |

---

## Canonical Candidate Data Model

A single authoritative candidate record (`CandidateRecord` in `lib/candidate/types.ts`) drives all candidate views:

```typescript
interface CandidateRecord {
  id: string;
  schemaVersion: "1.0.0";
  profileRevision: number;
  onboardingComplete: boolean;
  confirmedAt: string;
  identity: IdentityDraft;       // name, email, phone, country
  discovery: DiscoveryDraft;     // target roles, skills, challenges, goals, preferences
  profile: StructuredProfile;    // headline, summary, education[], experience[], projects[], certs[], skills[], jobPreferences
  applications: CandidateApplication[];
  savedJobIds: string[];
  interviews: CandidateInterview[];
}
```

- **Identity Independence**: Name, email, and phone never participate in job ranking or recommendation calculations.
- **Privacy Boundary**: Private discovery challenges, time budgets, and self-confidence ratings are never exposed in resumes or employer-facing cards.
- **Revision Tracking**: Incrementing `profileRevision` notifies the resume builder of source changes for review before updating drafts.

---

## 6-Group Profile Completeness Formula

Profile completeness is calculated transparently as:
$$\text{Completeness} = \text{round}\left(\frac{\text{Completed Detail Groups}}{6} \times 100\right)$$

| Group | Completion Requirement |
| :--- | :--- |
| **1. Contact** | Non-empty full name, email, and phone. |
| **2. Direction** | At least one specific target role (excluding "Exploring" alone) OR a custom headline. |
| **3. Skills** | At least one explicitly selected candidate skill. |
| **4. Background Evidence** | At least one structured entry in Education, Experience, or Projects. |
| **5. Work Preferences** | Explicit choices for work mode, job type, and availability (including "any" / "immediate"). |
| **6. Summary** | A non-empty confirmed professional summary. |

*Excluded from denominator*: Certifications, photos, salary, and private discovery challenges.

---

## Sample Job Matching Engine

Pure deterministic function `matchSampleJobs(candidate)`:
- **Filtering**: Filters out explicit must-have incompatibilities (e.g. candidate specifies remote-only, job is onsite-only).
- **Domain-Specific Scoring**: Weighs domain role matches (filtering generic terms like "engineer"), confirmed career stage compatibility, explicitly shared required skills (normalized through alias map), and work mode alignment.
- **Factual Match Reasons**: Explicit strings like *"Matches your Frontend Engineer interest"*, *"Remote matches your preference"*, *"You have listed: React"*.
- **No Mystery Scores**: No unexplained employability percentages or arbitrary fit numbers.
- **Empty State**: Friendly fallback offering "Edit preferences" and "Browse all sample jobs".

---

## Resume Builder & Two-Way Sync

- **Draft Isolation**: `ResumeDraft` tracks `sourceProfileRevision`. Resume wording edits remain in the draft without silently overwriting the canonical profile.
- **Out-of-Sync Banner**: When `profileRevision > draft.sourceProfileRevision`, a notification offers "Review Changes" to inspect added or removed profile items.
- **Sync Back to Profile**: An explicit "Save details to my profile" action updates the canonical profile and bumps `profileRevision`.
- **A4 Single-Column Print Layout**: Dedicated `@media print` CSS removes navigation, buttons, and prompts, formatting a clean printable resume.

---

## Acceptance Test Suite (39 Tests)

Run the test suite with `npm test`:

```bash
npm test
```

Includes 13 portal-specific acceptance tests:
1. Fresh candidate lands with own identity, 0 apps, 0 saved jobs, 0 interviews, no Ananya data.
2. Incomplete vs. completed candidate onboarding status separation.
3. No selected skills $\rightarrow$ none appear in profile, resume, or match reasons.
4. Editing target roles and work preferences updates sample job ranking; saved jobs persist.
5. Six-group completeness formula updates and resolves contextual suggestions.
6. Missing optional experience does not block onboarding or fabricate resume items.
7. Bumping `profileRevision` flags resume draft as out-of-sync until reviewed.
8. Private challenges and weekly time budgets are completely excluded from resume drafts.
9. `freeOnlyResources` boolean maps faithfully from discovery through review and dashboard.
10. Candidate isolation: switching accounts leaves zero data leakage.
11. Candidate name/email/phone has zero influence on job match ranking.
12. Toggling saved jobs updates count; applications require explicit simulated submission.
13. Skill normalization handles aliases (e.g., `React.js` $\rightarrow$ `react`, `Golang` $\rightarrow$ `go`).

---

## How to Test a New Candidate

1. Start the development server: `npm run dev` and navigate to `http://localhost:3000/sign-in`.
2. Click **Create an Account** (or go to `/sign-up?role=candidate`).
3. Fill in candidate details (e.g. `Dev Candidate`, `dev@example.com`, `9876543210`) and submit.
4. On `/verify-phone`, enter the demo code **`729410`** and verify.
5. Complete the 12-question discovery steps on `/onboarding`.
6. On `/onboarding/review`, click **Confirm & Create My Dashboard**.
7. Observe immediate landing on **`/candidate/dashboard`** with:
   - Your name in the greeting
   - Calculated completeness (e.g. 67% or 83%)
   - 0 Applications, 0 Saved Jobs, no interviews
   - Contextual suggestions matching your selected profile
   - Recommended sample jobs matching your target roles and skills
8. Navigate to `/candidate/profile` to add an education or project entry, then return to `/candidate/dashboard` to verify completeness updates to 100%.
9. Navigate to `/candidate/profile/resume` to preview the single-column resume, edit summary or bullet points, and click **Print / Save as PDF**.

---

## Future Integration Boundary

- **Authentication**: Replace simulated OTP challenge with server-issued OTP tokens and secure HTTP-only session cookies.
- **Persistence**: Replace in-memory `CandidateContext` with REST/GraphQL endpoints (`/api/v1/candidate/*`).
- **Job Feed & ATS**: Replace `SAMPLE_JOBS_CATALOGUE` with real-time job aggregation feeds and employer ATS integration.

