"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentTranscriptGradeSchema = exports.GradeSchema = exports.GradeSchemeSchema = exports.SectionRegistrationReferenceSchema = exports.AcademicCredentialSchema = exports.HonorSchema = exports.StudentAcademicProgramSchema = exports.SectionReferenceSchema = exports.SectionRegistrationSchema = exports.GradingOptionSchema = exports.RegistrationStatusSchema = exports.SectionSchema = exports.SectionCreditsSchema = exports.InstructorSchema = exports.ScheduleSchema = exports.RoomSchema = exports.InstructionalMethodSchema = void 0;
// Export shared reference schemas first (to avoid conflicts)
__exportStar(require("./schemas/references"), exports);
// Export all schemas (using explicit exports to avoid duplicate reference schema conflicts)
__exportStar(require("./schemas/person"), exports);
__exportStar(require("./schemas/student"), exports);
__exportStar(require("./schemas/academic-period"), exports);
__exportStar(require("./schemas/course"), exports);
var section_1 = require("./schemas/section");
Object.defineProperty(exports, "InstructionalMethodSchema", { enumerable: true, get: function () { return section_1.InstructionalMethodSchema; } });
Object.defineProperty(exports, "RoomSchema", { enumerable: true, get: function () { return section_1.RoomSchema; } });
Object.defineProperty(exports, "ScheduleSchema", { enumerable: true, get: function () { return section_1.ScheduleSchema; } });
Object.defineProperty(exports, "InstructorSchema", { enumerable: true, get: function () { return section_1.InstructorSchema; } });
Object.defineProperty(exports, "SectionCreditsSchema", { enumerable: true, get: function () { return section_1.SectionCreditsSchema; } });
Object.defineProperty(exports, "SectionSchema", { enumerable: true, get: function () { return section_1.SectionSchema; } });
var section_registration_1 = require("./schemas/section-registration");
Object.defineProperty(exports, "RegistrationStatusSchema", { enumerable: true, get: function () { return section_registration_1.RegistrationStatusSchema; } });
Object.defineProperty(exports, "GradingOptionSchema", { enumerable: true, get: function () { return section_registration_1.GradingOptionSchema; } });
Object.defineProperty(exports, "SectionRegistrationSchema", { enumerable: true, get: function () { return section_registration_1.SectionRegistrationSchema; } });
Object.defineProperty(exports, "SectionReferenceSchema", { enumerable: true, get: function () { return section_registration_1.SectionReferenceSchema; } });
__exportStar(require("./schemas/academic-program"), exports);
var student_academic_program_1 = require("./schemas/student-academic-program");
Object.defineProperty(exports, "StudentAcademicProgramSchema", { enumerable: true, get: function () { return student_academic_program_1.StudentAcademicProgramSchema; } });
var academic_credential_1 = require("./schemas/academic-credential");
Object.defineProperty(exports, "HonorSchema", { enumerable: true, get: function () { return academic_credential_1.HonorSchema; } });
Object.defineProperty(exports, "AcademicCredentialSchema", { enumerable: true, get: function () { return academic_credential_1.AcademicCredentialSchema; } });
var student_transcript_grade_1 = require("./schemas/student-transcript-grade");
Object.defineProperty(exports, "SectionRegistrationReferenceSchema", { enumerable: true, get: function () { return student_transcript_grade_1.SectionRegistrationReferenceSchema; } });
Object.defineProperty(exports, "GradeSchemeSchema", { enumerable: true, get: function () { return student_transcript_grade_1.GradeSchemeSchema; } });
Object.defineProperty(exports, "GradeSchema", { enumerable: true, get: function () { return student_transcript_grade_1.GradeSchema; } });
Object.defineProperty(exports, "StudentTranscriptGradeSchema", { enumerable: true, get: function () { return student_transcript_grade_1.StudentTranscriptGradeSchema; } });
// Narrative Platform schemas (Phase 0)
__exportStar(require("./schemas/narrative"), exports);
// Export mappers
__exportStar(require("./mappers"), exports);
// Export config
__exportStar(require("./config"), exports);
