-- CreateEnum
CREATE TYPE "DoctorStatus" AS ENUM ('AVAILABLE', 'WITH_PATIENT', 'OFFLINE');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('FULL_DAY', 'PARTIAL_DAY');

-- CreateEnum
CREATE TYPE "StaffRole" AS ENUM ('ADMIN', 'RECEPTION');

-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('SCHEDULED', 'WALK_IN');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('confirmed', 'cancelled', 'completed', 'no_show', 'in_consultation');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('waiting', 'called', 'in_consultation', 'completed', 'skipped');

-- CreateEnum
CREATE TYPE "QueueAction" AS ENUM ('CALLED', 'SKIPPED', 'REORDERED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ConversationChannel" AS ENUM ('WEB', 'WHATSAPP', 'VOICE', 'APP');

-- CreateEnum
CREATE TYPE "ConversationStatus" AS ENUM ('ACTIVE', 'RESOLVED', 'ESCALATED', 'ABANDONED');

-- CreateEnum
CREATE TYPE "MessageSender" AS ENUM ('PATIENT', 'AI', 'HUMAN_STAFF');

-- CreateTable
CREATE TABLE "Specialization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Specialization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Clinic" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "pincode" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "qrToken" TEXT NOT NULL,
    "logoUrl" TEXT,
    "coverImageUrl" TEXT,
    "photoUrls" TEXT[],
    "parentClinicId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Clinic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Doctor" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "specializationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "experienceYears" INTEGER NOT NULL,
    "consultationFee" INTEGER NOT NULL,
    "languages" TEXT[],
    "bio" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL,
    "avgConsultationMinutes" INTEGER NOT NULL,
    "profileImageUrl" TEXT,
    "coverImageUrl" TEXT,
    "avgRating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "currentStatus" "DoctorStatus" NOT NULL DEFAULT 'OFFLINE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Doctor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "slotDurationMinutes" INTEGER NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorLeave" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "dateFrom" DATE NOT NULL,
    "dateTo" DATE NOT NULL,
    "leaveType" "LeaveType" NOT NULL DEFAULT 'FULL_DAY',
    "customStartTime" TEXT,
    "customEndTime" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorLeave_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "FAQ_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffUser" (
    "id" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "StaffRole" NOT NULL DEFAULT 'RECEPTION',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patient" (
    "id" TEXT NOT NULL,
    "clerkUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "type" "AppointmentType" NOT NULL,
    "status" "AppointmentStatus" NOT NULL,
    "date" DATE NOT NULL,
    "startTime" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
    "id" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "queueDate" DATE NOT NULL,
    "queueNumber" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "estimatedWaitMinutes" INTEGER,
    "status" "QueueStatus" NOT NULL DEFAULT 'waiting',
    "joinedAt" TIMESTAMP(3) NOT NULL,
    "calledAt" TIMESTAMP(3),
    "consultationStartedAt" TIMESTAMP(3),
    "consultationEndedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueAuditLog" (
    "id" TEXT NOT NULL,
    "queueEntryId" TEXT NOT NULL,
    "staffUserId" TEXT,
    "action" "QueueAction" NOT NULL,
    "reason" TEXT,
    "previousPosition" INTEGER,
    "newPosition" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QueueAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "clinicId" TEXT NOT NULL,
    "channel" "ConversationChannel" NOT NULL DEFAULT 'WEB',
    "status" "ConversationStatus" NOT NULL DEFAULT 'ACTIVE',
    "assignedStaffId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "sender" "MessageSender" NOT NULL,
    "senderStaffId" TEXT,
    "content" TEXT NOT NULL,
    "agentName" TEXT,
    "toolCalled" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "reviewText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AILog" (
    "id" TEXT NOT NULL,
    "messageId" TEXT,
    "agentName" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "actionTaken" TEXT NOT NULL,
    "dbFunctionCalled" TEXT,
    "success" BOOLEAN NOT NULL,
    "executionTimeMs" INTEGER NOT NULL,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AILog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_name_key" ON "Specialization"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Clinic_qrToken_key" ON "Clinic"("qrToken");

-- CreateIndex
CREATE INDEX "Clinic_latitude_longitude_idx" ON "Clinic"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "Clinic_city_area_idx" ON "Clinic"("city", "area");

-- CreateIndex
CREATE INDEX "Doctor_clinicId_idx" ON "Doctor"("clinicId");

-- CreateIndex
CREATE INDEX "Doctor_specializationId_idx" ON "Doctor"("specializationId");

-- CreateIndex
CREATE INDEX "Doctor_avgRating_idx" ON "Doctor"("avgRating");

-- CreateIndex
CREATE INDEX "Availability_doctorId_dayOfWeek_idx" ON "Availability"("doctorId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "DoctorLeave_doctorId_dateFrom_dateTo_idx" ON "DoctorLeave"("doctorId", "dateFrom", "dateTo");

-- CreateIndex
CREATE INDEX "FAQ_clinicId_idx" ON "FAQ"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_clerkUserId_key" ON "StaffUser"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "StaffUser_email_key" ON "StaffUser"("email");

-- CreateIndex
CREATE INDEX "StaffUser_clinicId_idx" ON "StaffUser"("clinicId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_clerkUserId_key" ON "Patient"("clerkUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");

-- CreateIndex
CREATE INDEX "Appointment_doctorId_date_idx" ON "Appointment"("doctorId", "date");

-- CreateIndex
CREATE INDEX "Appointment_patientId_idx" ON "Appointment"("patientId");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_appointmentId_key" ON "QueueEntry"("appointmentId");

-- CreateIndex
CREATE INDEX "QueueEntry_doctorId_queueDate_status_idx" ON "QueueEntry"("doctorId", "queueDate", "status");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_doctorId_queueDate_position_key" ON "QueueEntry"("doctorId", "queueDate", "position");

-- CreateIndex
CREATE UNIQUE INDEX "QueueEntry_doctorId_queueDate_queueNumber_key" ON "QueueEntry"("doctorId", "queueDate", "queueNumber");

-- CreateIndex
CREATE INDEX "QueueAuditLog_queueEntryId_idx" ON "QueueAuditLog"("queueEntryId");

-- CreateIndex
CREATE INDEX "Conversation_patientId_idx" ON "Conversation"("patientId");

-- CreateIndex
CREATE INDEX "Conversation_clinicId_status_idx" ON "Conversation"("clinicId", "status");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Review_appointmentId_key" ON "Review"("appointmentId");

-- CreateIndex
CREATE INDEX "Review_doctorId_idx" ON "Review"("doctorId");

-- CreateIndex
CREATE INDEX "AILog_agentName_createdAt_idx" ON "AILog"("agentName", "createdAt");

-- CreateIndex
CREATE INDEX "AILog_messageId_idx" ON "AILog"("messageId");

-- AddForeignKey
ALTER TABLE "Clinic" ADD CONSTRAINT "Clinic_parentClinicId_fkey" FOREIGN KEY ("parentClinicId") REFERENCES "Clinic"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Doctor" ADD CONSTRAINT "Doctor_specializationId_fkey" FOREIGN KEY ("specializationId") REFERENCES "Specialization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorLeave" ADD CONSTRAINT "DoctorLeave_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FAQ" ADD CONSTRAINT "FAQ_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffUser" ADD CONSTRAINT "StaffUser_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueAuditLog" ADD CONSTRAINT "QueueAuditLog_queueEntryId_fkey" FOREIGN KEY ("queueEntryId") REFERENCES "QueueEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QueueAuditLog" ADD CONSTRAINT "QueueAuditLog_staffUserId_fkey" FOREIGN KEY ("staffUserId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "Clinic"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_assignedStaffId_fkey" FOREIGN KEY ("assignedStaffId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderStaffId_fkey" FOREIGN KEY ("senderStaffId") REFERENCES "StaffUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "Doctor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AILog" ADD CONSTRAINT "AILog_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE SET NULL ON UPDATE CASCADE;
