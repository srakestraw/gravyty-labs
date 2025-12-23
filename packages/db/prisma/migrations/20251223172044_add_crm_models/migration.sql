-- CreateEnum
CREATE TYPE "RiskBucket" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "persons" (
    "id" TEXT NOT NULL,
    "birthDate" DATE,
    "gender" TEXT,
    "citizenshipStatus" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "persons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "person_names" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "given" TEXT NOT NULL,
    "middle" TEXT,
    "family" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "person_names_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_addresses" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phones" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "extension" TEXT,
    "type" TEXT NOT NULL,
    "preferred" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "phones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'USA',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "do_not_engage_global" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "emailBlocked" BOOLEAN NOT NULL DEFAULT false,
    "smsBlocked" BOOLEAN NOT NULL DEFAULT false,
    "phoneBlocked" BOOLEAN NOT NULL DEFAULT false,
    "source" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "do_not_engage_global_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "do_not_engage_agents" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" TEXT,

    CONSTRAINT "do_not_engage_agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startOn" DATE NOT NULL,
    "entryAcademicPeriodId" TEXT,
    "academicLevel" TEXT,
    "residency" TEXT,
    "studentClassification" TEXT,
    "studentLoad" TEXT,
    "academicStandingCode" TEXT,
    "studentNumber" TEXT NOT NULL,
    "isFirstGen" BOOLEAN NOT NULL DEFAULT false,
    "isPellEligible" BOOLEAN NOT NULL DEFAULT false,
    "isInState" BOOLEAN NOT NULL DEFAULT true,
    "workHoursPerWeek" INTEGER NOT NULL DEFAULT 0,
    "commuteMinutes" INTEGER NOT NULL DEFAULT 0,
    "hasHousingInstability" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_periods" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startOn" DATE NOT NULL,
    "endOn" DATE NOT NULL,
    "censusOn" DATE,
    "registrationStartOn" DATE,
    "registrationEndOn" DATE,
    "academicYear" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "subjectCode" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "creditType" TEXT NOT NULL,
    "creditsMinimum" DECIMAL(5,2) NOT NULL,
    "creditsMaximum" DECIMAL(5,2) NOT NULL,
    "creditsIncrement" DECIMAL(5,2),
    "courseLevel" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "effectiveStartDate" DATE,
    "effectiveEndDate" DATE,
    "catalogYear" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sections" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "academicPeriodId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "title" TEXT,
    "crn" TEXT NOT NULL,
    "startOn" DATE NOT NULL,
    "endOn" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "enrolled" INTEGER NOT NULL DEFAULT 0,
    "available" INTEGER NOT NULL DEFAULT 0,
    "waitlistCapacity" INTEGER,
    "waitlistEnrolled" INTEGER DEFAULT 0,
    "instructionalMethodCode" TEXT,
    "daysOfWeek" TEXT[],
    "startTime" TEXT,
    "endTime" TEXT,
    "building" TEXT,
    "roomNumber" TEXT,
    "creditType" TEXT NOT NULL,
    "creditsMinimum" DECIMAL(5,2) NOT NULL,
    "creditsMaximum" DECIMAL(5,2) NOT NULL,
    "instructorPersonId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section_registrations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "academicPeriodId" TEXT NOT NULL,
    "statusCode" TEXT NOT NULL,
    "registrationDate" TIMESTAMP(3) NOT NULL,
    "registeredOn" DATE NOT NULL,
    "creditType" TEXT NOT NULL,
    "credits" DECIMAL(5,2) NOT NULL,
    "gradingOptionCode" TEXT,
    "academicLoad" TEXT,
    "residencyStatus" TEXT,
    "attendanceRate" DOUBLE PRECISION DEFAULT 1.0,
    "midtermGrade" TEXT,
    "finalGrade" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "section_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_transcript_grades" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "sectionRegistrationId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "academicPeriodId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "gradeSchemeCode" TEXT,
    "gradeValue" TEXT,
    "gradePoints" DECIMAL(3,2),
    "qualityPoints" DECIMAL(6,2),
    "creditsAttempted" DECIMAL(5,2) NOT NULL,
    "creditsEarned" DECIMAL(5,2) NOT NULL,
    "finalGradeDate" DATE,
    "status" TEXT NOT NULL,
    "incomplete" BOOLEAN NOT NULL DEFAULT false,
    "repeat" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_transcript_grades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_programs" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "degreeCode" TEXT,
    "status" TEXT NOT NULL,
    "startOn" DATE,
    "endOn" DATE,
    "accreditationCode" TEXT,
    "creditsRequired" INTEGER NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_academic_programs" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicProgramId" TEXT NOT NULL,
    "startOn" DATE NOT NULL,
    "endOn" DATE,
    "status" TEXT NOT NULL,
    "catalogYear" TEXT,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "student_academic_programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "academic_credentials" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "credentialCode" TEXT NOT NULL,
    "academicProgramId" TEXT,
    "awardedOn" DATE NOT NULL,
    "status" TEXT NOT NULL,
    "academicPeriodId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "academic_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "student_risks" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicPeriodId" TEXT NOT NULL,
    "attendanceRiskScore" DOUBLE PRECISION NOT NULL,
    "academicSupportRiskScore" DOUBLE PRECISION NOT NULL,
    "overallRiskBucket" "RiskBucket" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "simulation_state" (
    "id" TEXT NOT NULL,
    "currentSimDate" DATE NOT NULL,
    "lastTickDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "simulation_state_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_contacts" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_accounts" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_opportunities" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "contactId" TEXT,
    "accountId" TEXT,
    "amount" DECIMAL(15,2),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crm_opportunities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crm_activities" (
    "id" TEXT NOT NULL,
    "workspace" TEXT NOT NULL,
    "app" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "contactId" TEXT,
    "accountId" TEXT,
    "opportunityId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_activities_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "email_addresses_personId_address_key" ON "email_addresses"("personId", "address");

-- CreateIndex
CREATE UNIQUE INDEX "do_not_engage_global_personId_key" ON "do_not_engage_global"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "do_not_engage_agents_personId_agentId_key" ON "do_not_engage_agents"("personId", "agentId");

-- CreateIndex
CREATE UNIQUE INDEX "students_personId_key" ON "students"("personId");

-- CreateIndex
CREATE UNIQUE INDEX "students_studentNumber_key" ON "students"("studentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "academic_periods_code_key" ON "academic_periods"("code");

-- CreateIndex
CREATE UNIQUE INDEX "courses_subjectCode_number_catalogYear_key" ON "courses"("subjectCode", "number", "catalogYear");

-- CreateIndex
CREATE UNIQUE INDEX "sections_academicPeriodId_crn_key" ON "sections"("academicPeriodId", "crn");

-- CreateIndex
CREATE UNIQUE INDEX "section_registrations_studentId_sectionId_key" ON "section_registrations"("studentId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "student_transcript_grades_sectionRegistrationId_key" ON "student_transcript_grades"("sectionRegistrationId");

-- CreateIndex
CREATE UNIQUE INDEX "academic_programs_code_key" ON "academic_programs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "student_risks_studentId_academicPeriodId_key" ON "student_risks"("studentId", "academicPeriodId");

-- CreateIndex
CREATE INDEX "crm_contacts_workspace_app_idx" ON "crm_contacts"("workspace", "app");

-- CreateIndex
CREATE INDEX "crm_accounts_workspace_app_idx" ON "crm_accounts"("workspace", "app");

-- CreateIndex
CREATE INDEX "crm_opportunities_workspace_app_idx" ON "crm_opportunities"("workspace", "app");

-- CreateIndex
CREATE INDEX "crm_opportunities_contactId_idx" ON "crm_opportunities"("contactId");

-- CreateIndex
CREATE INDEX "crm_opportunities_accountId_idx" ON "crm_opportunities"("accountId");

-- CreateIndex
CREATE INDEX "crm_activities_workspace_app_idx" ON "crm_activities"("workspace", "app");

-- CreateIndex
CREATE INDEX "crm_activities_contactId_idx" ON "crm_activities"("contactId");

-- CreateIndex
CREATE INDEX "crm_activities_accountId_idx" ON "crm_activities"("accountId");

-- CreateIndex
CREATE INDEX "crm_activities_opportunityId_idx" ON "crm_activities"("opportunityId");

-- AddForeignKey
ALTER TABLE "person_names" ADD CONSTRAINT "person_names_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_addresses" ADD CONSTRAINT "email_addresses_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phones" ADD CONSTRAINT "phones_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "do_not_engage_global" ADD CONSTRAINT "do_not_engage_global_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "do_not_engage_agents" ADD CONSTRAINT "do_not_engage_agents_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_personId_fkey" FOREIGN KEY ("personId") REFERENCES "persons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_entryAcademicPeriodId_fkey" FOREIGN KEY ("entryAcademicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sections" ADD CONSTRAINT "sections_instructorPersonId_fkey" FOREIGN KEY ("instructorPersonId") REFERENCES "persons"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_registrations" ADD CONSTRAINT "section_registrations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_registrations" ADD CONSTRAINT "section_registrations_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "section_registrations" ADD CONSTRAINT "section_registrations_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transcript_grades" ADD CONSTRAINT "student_transcript_grades_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transcript_grades" ADD CONSTRAINT "student_transcript_grades_sectionRegistrationId_fkey" FOREIGN KEY ("sectionRegistrationId") REFERENCES "section_registrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transcript_grades" ADD CONSTRAINT "student_transcript_grades_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transcript_grades" ADD CONSTRAINT "student_transcript_grades_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_transcript_grades" ADD CONSTRAINT "student_transcript_grades_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_programs" ADD CONSTRAINT "student_academic_programs_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_academic_programs" ADD CONSTRAINT "student_academic_programs_academicProgramId_fkey" FOREIGN KEY ("academicProgramId") REFERENCES "academic_programs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_credentials" ADD CONSTRAINT "academic_credentials_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_credentials" ADD CONSTRAINT "academic_credentials_academicProgramId_fkey" FOREIGN KEY ("academicProgramId") REFERENCES "academic_programs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "academic_credentials" ADD CONSTRAINT "academic_credentials_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_risks" ADD CONSTRAINT "student_risks_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "student_risks" ADD CONSTRAINT "student_risks_academicPeriodId_fkey" FOREIGN KEY ("academicPeriodId") REFERENCES "academic_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_opportunities" ADD CONSTRAINT "crm_opportunities_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "crm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "crm_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "crm_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crm_activities" ADD CONSTRAINT "crm_activities_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "crm_opportunities"("id") ON DELETE CASCADE ON UPDATE CASCADE;
