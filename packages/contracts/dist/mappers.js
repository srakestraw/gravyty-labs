"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbToBannerPerson = dbToBannerPerson;
exports.dbToBannerStudent = dbToBannerStudent;
exports.dbToBannerAcademicPeriod = dbToBannerAcademicPeriod;
exports.dbToBannerCourse = dbToBannerCourse;
exports.dbToBannerSection = dbToBannerSection;
exports.dbToBannerSectionRegistration = dbToBannerSectionRegistration;
exports.dbToBannerAcademicProgram = dbToBannerAcademicProgram;
exports.dbToBannerStudentAcademicProgram = dbToBannerStudentAcademicProgram;
exports.dbToBannerAcademicCredential = dbToBannerAcademicCredential;
exports.dbToBannerStudentTranscriptGrade = dbToBannerStudentTranscriptGrade;
// Helper to format dates as ISO strings
const formatDate = (date) => {
    if (!date)
        return null;
    return date.toISOString().split('T')[0];
};
const formatDateTime = (date) => {
    if (!date)
        return null;
    return date.toISOString();
};
// Person mapper
function dbToBannerPerson(person) {
    return {
        id: person.id,
        names: person.names.map((name) => ({
            given: name.given,
            middle: name.middle,
            family: name.family,
            type: name.type,
            preferred: name.preferred,
        })),
        birthDate: formatDate(person.birthDate),
        gender: person.gender || null,
        citizenshipStatus: person.citizenshipStatus || null,
        ethnicities: [], // Not stored in Phase 02
        races: [], // Not stored in Phase 02
        addresses: person.addresses.map((addr) => ({
            type: addr.type,
            lines: addr.line2 ? [addr.line1, addr.line2] : [addr.line1],
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
        })),
        emails: person.emails.map((email) => ({
            type: email.type,
            address: email.address,
            preferred: email.preferred,
        })),
        phones: person.phones.map((phone) => ({
            type: phone.type,
            number: phone.number,
            extension: phone.extension || null,
            preferred: phone.preferred,
        })),
        credentials: [], // Not stored in Phase 02
    };
}
// Student mapper
function dbToBannerStudent(student) {
    return {
        id: student.id,
        person: {
            id: student.personId,
        },
        type: student.type,
        status: student.status,
        startOn: formatDate(student.startOn),
        entryAcademicPeriod: student.entryAcademicPeriod
            ? {
                id: student.entryAcademicPeriod.id,
                code: student.entryAcademicPeriod.code,
            }
            : null,
        academicLevel: student.academicLevel || null,
        residency: student.residency || null,
        studentClassification: student.studentClassification || null,
        studentLoad: student.studentLoad || null,
        academicStanding: student.academicStandingCode
            ? {
                code: student.academicStandingCode,
                title: getAcademicStandingTitle(student.academicStandingCode),
            }
            : null,
        studentNumber: student.studentNumber,
        studentId: student.studentNumber,
    };
}
// Academic Period mapper
function dbToBannerAcademicPeriod(period) {
    return {
        id: period.id,
        code: period.code,
        title: period.title,
        type: period.type,
        startOn: formatDate(period.startOn),
        endOn: formatDate(period.endOn),
        censusOn: formatDate(period.censusOn),
        registrationStartOn: formatDate(period.registrationStartOn),
        registrationEndOn: formatDate(period.registrationEndOn),
        academicYear: period.academicYear,
        status: period.status,
    };
}
// Course mapper
function dbToBannerCourse(course) {
    return {
        id: course.id,
        subject: {
            code: course.subjectCode,
            title: getSubjectTitle(course.subjectCode),
        },
        number: course.number,
        title: course.title,
        description: course.description || null,
        credits: {
            creditType: course.creditType,
            minimum: Number(course.creditsMinimum),
            maximum: Number(course.creditsMaximum),
            increment: course.creditsIncrement ? Number(course.creditsIncrement) : null,
        },
        courseLevel: course.courseLevel,
        status: course.status,
        effectiveStartDate: formatDate(course.effectiveStartDate),
        effectiveEndDate: formatDate(course.effectiveEndDate),
        catalogYear: course.catalogYear || null,
        prerequisites: [], // Not stored in Phase 02
        corequisites: [], // Not stored in Phase 02
    };
}
// Section mapper
function dbToBannerSection(section) {
    return {
        id: section.id,
        course: {
            id: section.courseId,
        },
        academicPeriod: {
            id: section.academicPeriodId,
            code: section.academicPeriod.code,
        },
        number: section.number,
        title: section.title || null,
        crn: section.crn,
        startOn: formatDate(section.startOn),
        endOn: formatDate(section.endOn),
        status: section.status,
        capacity: section.capacity,
        enrolled: section.enrolled,
        available: section.available,
        waitlistCapacity: section.waitlistCapacity || null,
        waitlistEnrolled: section.waitlistEnrolled || null,
        instructionalMethod: section.instructionalMethodCode
            ? {
                code: section.instructionalMethodCode,
                title: getInstructionalMethodTitle(section.instructionalMethodCode),
            }
            : null,
        schedule: section.startTime || section.endTime || section.building
            ? {
                daysOfWeek: section.daysOfWeek,
                startTime: section.startTime || null,
                endTime: section.endTime || null,
                room: section.building && section.roomNumber
                    ? {
                        building: section.building,
                        number: section.roomNumber,
                    }
                    : null,
            }
            : null,
        instructors: section.instructor
            ? [
                {
                    person: {
                        id: section.instructor.id,
                    },
                    role: 'primary',
                },
            ]
            : [],
        credits: {
            creditType: section.creditType,
            minimum: Number(section.creditsMinimum),
            maximum: Number(section.creditsMaximum),
        },
    };
}
// Section Registration mapper
function dbToBannerSectionRegistration(registration) {
    return {
        id: registration.id,
        student: {
            id: registration.studentId,
        },
        section: {
            id: registration.sectionId,
        },
        academicPeriod: {
            id: registration.academicPeriodId,
            code: registration.academicPeriod.code,
        },
        status: {
            code: registration.statusCode,
            title: getRegistrationStatusTitle(registration.statusCode),
        },
        registrationDate: formatDateTime(registration.registrationDate),
        registeredOn: formatDate(registration.registeredOn),
        creditType: registration.creditType,
        credits: Number(registration.credits),
        gradingOption: registration.gradingOptionCode
            ? {
                code: registration.gradingOptionCode,
                title: getGradingOptionTitle(registration.gradingOptionCode),
            }
            : null,
        academicLoad: registration.academicLoad || null,
        residencyStatus: registration.residencyStatus || null,
    };
}
// Academic Program mapper
function dbToBannerAcademicProgram(program) {
    return {
        id: program.id,
        code: program.code,
        title: program.title,
        type: program.type,
        level: program.level,
        degree: program.degreeCode
            ? {
                code: program.degreeCode,
                title: getDegreeTitle(program.degreeCode),
            }
            : null,
        status: program.status,
        startOn: formatDate(program.startOn),
        endOn: formatDate(program.endOn),
        accreditation: program.accreditationCode
            ? {
                code: program.accreditationCode,
                title: getAccreditationTitle(program.accreditationCode),
            }
            : null,
        creditsRequired: program.creditsRequired,
        description: program.description || null,
    };
}
// Student Academic Program mapper
function dbToBannerStudentAcademicProgram(studentProgram) {
    return {
        id: studentProgram.id,
        student: {
            id: studentProgram.studentId,
        },
        academicProgram: {
            id: studentProgram.academicProgramId,
            code: studentProgram.academicProgram.code,
        },
        startOn: formatDate(studentProgram.startOn),
        endOn: formatDate(studentProgram.endOn),
        status: studentProgram.status,
        catalogYear: studentProgram.catalogYear || null,
        primary: studentProgram.primary,
    };
}
// Academic Credential mapper
function dbToBannerAcademicCredential(credential) {
    return {
        id: credential.id,
        student: {
            id: credential.studentId,
        },
        credential: {
            code: credential.credentialCode,
            title: getDegreeTitle(credential.credentialCode),
        },
        academicProgram: credential.academicProgram
            ? {
                id: credential.academicProgram.id,
                code: credential.academicProgram.code,
            }
            : null,
        awardedOn: formatDate(credential.awardedOn),
        status: credential.status,
        academicPeriod: credential.academicPeriod
            ? {
                id: credential.academicPeriod.id,
                code: credential.academicPeriod.code,
            }
            : null,
        honors: [], // Not stored in Phase 02
    };
}
// Student Transcript Grade mapper
function dbToBannerStudentTranscriptGrade(grade) {
    return {
        id: grade.id,
        student: {
            id: grade.studentId,
        },
        sectionRegistration: {
            id: grade.sectionRegistrationId,
        },
        section: {
            id: grade.sectionId,
        },
        academicPeriod: {
            id: grade.academicPeriodId,
            code: grade.academicPeriod.code,
        },
        course: {
            id: grade.courseId,
        },
        grade: {
            scheme: grade.gradeSchemeCode
                ? {
                    code: grade.gradeSchemeCode,
                    title: getGradeSchemeTitle(grade.gradeSchemeCode),
                }
                : null,
            value: grade.gradeValue || null,
            title: grade.gradeValue ? getGradeTitle(grade.gradeValue) : null,
        },
        gradePoints: grade.gradePoints ? Number(grade.gradePoints) : null,
        qualityPoints: grade.qualityPoints ? Number(grade.qualityPoints) : null,
        creditsAttempted: Number(grade.creditsAttempted),
        creditsEarned: Number(grade.creditsEarned),
        finalGradeDate: formatDate(grade.finalGradeDate),
        status: grade.status,
        incomplete: grade.incomplete,
        repeat: grade.repeat,
    };
}
// Helper functions for title lookups
function getAcademicStandingTitle(code) {
    const titles = {
        GOOD: 'Good Standing',
        PROBATION: 'Academic Probation',
        SUSPENDED: 'Suspended',
        DISMISSED: 'Dismissed',
    };
    return titles[code] || code;
}
function getSubjectTitle(code) {
    const titles = {
        CS: 'Computer Science',
        MATH: 'Mathematics',
        ENG: 'English',
        HIST: 'History',
    };
    return titles[code] || code;
}
function getInstructionalMethodTitle(code) {
    const titles = {
        LEC: 'Lecture',
        LAB: 'Laboratory',
        SEM: 'Seminar',
        IND: 'Independent Study',
    };
    return titles[code] || code;
}
function getRegistrationStatusTitle(code) {
    const titles = {
        REG: 'Registered',
        DROP: 'Dropped',
        WITHDRAW: 'Withdrawn',
        WAIT: 'Waitlisted',
    };
    return titles[code] || code;
}
function getGradingOptionTitle(code) {
    const titles = {
        GRAD: 'Graded',
        P_F: 'Pass/Fail',
        AUD: 'Audit',
    };
    return titles[code] || code;
}
function getDegreeTitle(code) {
    const titles = {
        BS: 'Bachelor of Science',
        BA: 'Bachelor of Arts',
        MS: 'Master of Science',
        MA: 'Master of Arts',
        PHD: 'Doctor of Philosophy',
    };
    return titles[code] || code;
}
function getAccreditationTitle(code) {
    const titles = {
        ABET: 'ABET Accredited',
        AACSB: 'AACSB Accredited',
    };
    return titles[code] || code;
}
function getGradeSchemeTitle(code) {
    const titles = {
        STANDARD: 'Standard Grading',
        P_F: 'Pass/Fail',
    };
    return titles[code] || code;
}
function getGradeTitle(value) {
    const titles = {
        A: 'Excellent',
        'A-': 'Excellent',
        'B+': 'Good Plus',
        B: 'Good',
        'B-': 'Good',
        'C+': 'Satisfactory Plus',
        C: 'Satisfactory',
        'C-': 'Satisfactory',
        D: 'Poor',
        F: 'Failing',
    };
    return titles[value] || value;
}
