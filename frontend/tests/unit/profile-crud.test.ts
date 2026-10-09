// tests/unit/profile-crud.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  WorkExperience,
  Education,
  Certification,
  Skill,
} from "../../types/profile";

describe("LinkedIn-Style Profile CRUD Unit Tests", () => {
  describe("Work Experience CRUD", () => {
    it("Creates and validates a new WorkExperience item", () => {
      const exp: WorkExperience = {
        id: "exp_1",
        title: "Frontend Tech Lead",
        company: "Stripe",
        employmentType: "Full-time",
        location: "Bengaluru, India",
        locationType: "Hybrid",
        startDate: "Jun 2024",
        endDate: "Present",
        isCurrent: true,
        description: "Leading merchant payment checkout UI.",
        skills: ["React", "TypeScript", "Tailwind CSS"],
      };

      assert.equal(exp.id, "exp_1");
      assert.equal(exp.title, "Frontend Tech Lead");
      assert.equal(exp.company, "Stripe");
      assert.equal(exp.employmentType, "Full-time");
      assert.equal(exp.isCurrent, true);
      assert.equal(exp.skills?.length, 3);
    });

    it("Updates an existing WorkExperience item preserving other fields", () => {
      const initial: WorkExperience = {
        id: "exp_2",
        title: "Software Engineer",
        company: "Meta",
        employmentType: "Full-time",
        startDate: "Jan 2023",
        endDate: "May 2024",
        isCurrent: false,
      };

      const updated: WorkExperience = {
        ...initial,
        title: "Senior Software Engineer",
        employmentType: "Contract",
      };

      assert.equal(updated.id, initial.id);
      assert.equal(updated.title, "Senior Software Engineer");
      assert.equal(updated.employmentType, "Contract");
      assert.equal(updated.company, "Meta");
    });

    it("Deletes a WorkExperience item from a list", () => {
      const list: WorkExperience[] = [
        {
          id: "exp_1",
          title: "Intern",
          company: "Amazon",
          employmentType: "Internship",
          startDate: "May 2022",
          endDate: "Aug 2022",
          isCurrent: false,
        },
        {
          id: "exp_2",
          title: "SDE I",
          company: "Amazon",
          employmentType: "Full-time",
          startDate: "Sep 2022",
          isCurrent: true,
        },
      ];

      const filtered = list.filter((e) => e.id !== "exp_1");
      assert.equal(filtered.length, 1);
      assert.equal(filtered[0].id, "exp_2");
    });
  });

  describe("Education CRUD", () => {
    it("Creates and validates an Education item", () => {
      const edu: Education = {
        id: "edu_1",
        school: "National Institute of Technology",
        degree: "B.Tech",
        fieldOfStudy: "Computer Science",
        startDate: "Sep 2022",
        endDate: "May 2026",
        grade: "8.9 CGPA",
        description: "Dean's List, Head of Open Source Club.",
      };

      assert.equal(edu.school, "National Institute of Technology");
      assert.equal(edu.degree, "B.Tech");
      assert.equal(edu.fieldOfStudy, "Computer Science");
      assert.equal(edu.grade, "8.9 CGPA");
    });

    it("Updates an Education item", () => {
      const initial: Education = {
        id: "edu_1",
        school: "IIT Madras",
        degree: "M.Tech",
        fieldOfStudy: "Data Science",
        startDate: "2024",
        endDate: "2026",
      };

      const updated: Education = {
        ...initial,
        grade: "9.2 CGPA",
      };

      assert.equal(updated.grade, "9.2 CGPA");
      assert.equal(updated.school, "IIT Madras");
    });

    it("Deletes an Education item", () => {
      const list: Education[] = [
        { id: "edu_1", school: "School A", degree: "BSc", fieldOfStudy: "Math", startDate: "2020", endDate: "2023" },
        { id: "edu_2", school: "School B", degree: "MSc", fieldOfStudy: "CS", startDate: "2023", endDate: "2025" },
      ];
      const after = list.filter((e) => e.id !== "edu_1");
      assert.equal(after.length, 1);
      assert.equal(after[0].id, "edu_2");
    });
  });

  describe("Certifications & Licenses CRUD", () => {
    it("Creates and validates a Certification item with credential URL", () => {
      const cert: Certification = {
        id: "cert_1",
        name: "AWS Certified Solutions Architect - Associate",
        issuingOrganization: "Amazon Web Services (AWS)",
        issueDate: "Mar 2026",
        expirationDate: "Mar 2029",
        credentialId: "AWS-SAA-839210",
        credentialUrl: "https://www.credly.com/badges/sample-id",
      };

      assert.equal(cert.name, "AWS Certified Solutions Architect - Associate");
      assert.equal(cert.issuingOrganization, "Amazon Web Services (AWS)");
      assert.equal(cert.credentialId, "AWS-SAA-839210");
      assert.ok(cert.credentialUrl?.startsWith("https://"));
    });

    it("Updates a Certification item", () => {
      const initial: Certification = {
        id: "cert_1",
        name: "Meta Certified Front-End Developer",
        issuingOrganization: "Meta",
        issueDate: "Jan 2025",
      };

      const updated: Certification = {
        ...initial,
        credentialId: "META-FED-0092",
      };

      assert.equal(updated.credentialId, "META-FED-0092");
    });

    it("Deletes a Certification item", () => {
      const list: Certification[] = [
        { id: "cert_1", name: "Cert A", issuingOrganization: "Org A", issueDate: "2025" },
        { id: "cert_2", name: "Cert B", issuingOrganization: "Org B", issueDate: "2026" },
      ];
      const after = list.filter((c) => c.id !== "cert_1");
      assert.equal(after.length, 1);
      assert.equal(after[0].id, "cert_2");
    });
  });

  describe("Technical & Domain Skills CRUD", () => {
    it("Creates and validates Skill item with proficiency levels", () => {
      const skill1: Skill = { id: "sk_1", name: "TypeScript", proficiency: "Expert" };
      const skill2: Skill = { id: "sk_2", name: "React", proficiency: "Advanced" };
      const skill3: Skill = { id: "sk_3", name: "Tailwind CSS", proficiency: "Comfortable" };
      const skill4: Skill = { id: "sk_4", name: "Docker", proficiency: "Beginner" };

      assert.equal(skill1.proficiency, "Expert");
      assert.equal(skill2.proficiency, "Advanced");
      assert.equal(skill3.proficiency, "Comfortable");
      assert.equal(skill4.proficiency, "Beginner");
    });

    it("Updates skill proficiency", () => {
      const skill: Skill = { id: "sk_1", name: "Go", proficiency: "Beginner" };
      const updated: Skill = { ...skill, proficiency: "Comfortable" };

      assert.equal(updated.name, "Go");
      assert.equal(updated.proficiency, "Comfortable");
    });

    it("Deletes a skill from collection", () => {
      const skills: Skill[] = [
        { id: "sk_1", name: "Python", proficiency: "Advanced" },
        { id: "sk_2", name: "Rust", proficiency: "Beginner" },
      ];
      const after = skills.filter((s) => s.name.toLowerCase() !== "rust");
      assert.equal(after.length, 1);
      assert.equal(after[0].name, "Python");
    });
  });
});
