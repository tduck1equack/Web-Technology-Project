# Teams Clone LMS Database Design

**Date:** April 7, 2026  
**Project:** Web Technology Project - Teams Clone LMS  
**Technology Stack:** Supabase (PostgreSQL) + Prisma ORM

## Overview

This document specifies the database schema for a comprehensive Learning Management System (LMS) that functions as a Teams clone specifically designed for educational environments. The system supports Vietnamese educational contexts with features like student majors (Ngành/Khoa), comprehensive assignment management, video conferencing, and extensive third-party integrations.

## Requirements Summary

- **Target Scale:** Small to medium educational institutions (< 500 users)
- **User Roles:** Students, Teachers, System Administrators
- **Core Features:**
  - Full Teams replica functionality (chat, video calls, file sharing, screen sharing)
  - Academic structure (Organizations → Departments → Courses → Class Instances)
  - Student major (Ngành/Khoa) support for course filtering
  - Comprehensive assignment system with rubric-based grading
  - Meeting management with attendance tracking
  - Real-time notifications and presence
  - External tool integrations (LTI, OAuth, webhooks)

## Architecture Decisions

### Database Choice

- **Primary Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma for type safety and migrations
- **File Storage:** External storage (SeaweedFS/Supabase Storage) with metadata in database
- **Real-time:** WebSocket integration with database event system

### Design Principles

- **Single Database:** All entities in one PostgreSQL instance for simplicity and ACID transactions
- **Education-First:** Schema optimized for academic workflows, not generic team collaboration
- **Scalable Foundation:** Can migrate to microservices architecture if needed beyond 10K users
- **Integration-Ready:** Built-in support for external educational tools and services

## Database Schema

### Section 1: Academic Structure & User Management

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  username  String   @unique
  firstName String
  lastName  String
  avatar    String?
  role      UserRole @default(STUDENT)
  status    UserStatus @default(OFFLINE)
  lastSeen  DateTime @default(now())

  // Student-specific fields
  majorId   String?  // Only for students
  year      Int?     // Academic year (1st year, 2nd year, etc.)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  major                 Major?               @relation(fields: [majorId], references: [id])
  classEnrollments      ClassEnrollment[]
  departmentMemberships DepartmentMember[]   // Only for teachers
  sentMessages          Message[]
  reactions             MessageReaction[]
  calls                 CallParticipant[]
  files                 File[]
  assignments           Assignment[]
  submissions           Submission[]
  hostedMeetings        Meeting[] @relation("HostedMeetings")
  attendance            Attendance[]
  notifications         Notification[]
  notificationPrefs     NotificationPreference?
  receivedEvents        RealTimeEvent[] @relation("ReceivedEvents")
  triggeredEvents       RealTimeEvent[] @relation("TriggeredEvents")
  presence              UserPresence?
  toolLaunches          ToolLaunch[]
  integrationActivities IntegrationActivity[]
  gradedSubmissions     Submission[] @relation("GradedSubmissions")

  @@map("users")
}

model Organization {
  id          String @id @default(cuid())
  name        String  // e.g., "Springfield University"
  slug        String @unique
  description String?
  avatar      String?
  settings    Json   @default("{}")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  departments  Department[]
  integrations Integration[]

  @@map("organizations")
}

model Department {
  id     String @id @default(cuid())
  name   String  // e.g., "Computer Science Department"
  code   String  // e.g., "CS"
  orgId  String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization Organization      @relation(fields: [orgId], references: [id], onDelete: Cascade)
  courses      Course[]
  members      DepartmentMember[]
  majors       Major[]            // A department can have multiple majors

  @@unique([orgId, code])
  @@map("departments")
}

model Major {
  id           String @id @default(cuid())
  name         String  // e.g., "Computer Science", "Software Engineering"
  code         String  // e.g., "CS", "SE"
  departmentId String
  description  String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  department Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  students   User[]
  courses    CourseMajor[] // Many-to-many with courses

  @@unique([departmentId, code])
  @@map("majors")
}

model Course {
  id           String @id @default(cuid())
  name         String
  code         String
  description  String?
  credits      Int     @default(3)
  departmentId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  department     Department      @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  classInstances ClassInstance[]
  majors         CourseMajor[]   // Which majors this course is relevant for

  @@unique([departmentId, code])
  @@map("courses")
}

model CourseMajor {
  id       String @id @default(cuid())
  courseId String
  majorId  String
  required Boolean @default(false) // Is this course required for this major?

  course Course @relation(fields: [courseId], references: [id], onDelete: Cascade)
  major  Major  @relation(fields: [majorId], references: [id], onDelete: Cascade)

  @@unique([courseId, majorId])
  @@map("course_majors")
}

model ClassInstance {
  id          String   @id @default(cuid())
  courseId    String
  semester    Semester
  year        Int
  section     String?   // e.g., "A", "B" for multiple sections
  maxStudents Int?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  course                ClassInstance         @relation(fields: [courseId], references: [id], onDelete: Cascade)
  enrollments           ClassEnrollment[]
  channels              Channel[]
  assignments           Assignment[]
  meetings              Meeting[]
  folders               Folder[]
  files                 File[]
  notifications         Notification[]
  toolLaunches          ToolLaunch[]
  integrationActivities IntegrationActivity[]
  webhooks              Webhook[]
  integrations          Integration[]
  realTimeEvents        RealTimeEvent[]
  currentPresenceUsers  UserPresence[]

  @@unique([courseId, semester, year, section])
  @@map("class_instances")
}

model ClassEnrollment {
  id            String @id @default(cuid())
  userId        String
  classId       String
  role          ClassRole @default(STUDENT)
  enrolledAt    DateTime  @default(now())

  user  User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  class ClassInstance @relation(fields: [classId], references: [id], onDelete: Cascade)

  @@unique([userId, classId])
  @@map("class_enrollments")
}

model DepartmentMember {
  id           String @id @default(cuid())
  userId       String
  departmentId String
  role         DeptRole @default(FACULTY)

  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  department Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)

  @@unique([userId, departmentId])
  @@map("department_members")
}

enum UserRole {
  STUDENT   // Enrolls in classes
  TEACHER   // Belongs to departments, teaches classes
  ADMIN     // System-wide admin, can access everything
}

enum ClassRole {
  STUDENT
  TEACHER
  TA  // Teaching Assistant
}

enum DeptRole {
  FACULTY   // Regular faculty member
  HEAD      // Department head (still a teacher, just with more dept permissions)
}

enum UserStatus {
  ONLINE
  AWAY
  BUSY
  OFFLINE
}

enum Semester {
  FALL
  SPRING
  SUMMER
  WINTER
}
```

### Section 2: Communication & Messaging

```prisma
model Channel {
  id          String      @id @default(cuid())
  name        String      // e.g., "general", "announcements", "assignments"
  description String?
  type        ChannelType @default(TEXT)
  classId     String

  // Channel settings
  isPrivate   Boolean @default(false)
  isReadOnly  Boolean @default(false)  // Only teachers can post

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  class               ClassInstance  @relation(fields: [classId], references: [id], onDelete: Cascade)
  messages            Message[]
  threads             Thread[]
  realTimeEvents      RealTimeEvent[]
  currentPresenceUsers UserPresence[]

  @@unique([classId, name])
  @@map("channels")
}

model Message {
  id        String      @id @default(cuid())
  content   String
  type      MessageType @default(TEXT)
  authorId  String
  channelId String?
  threadId  String?     // For threaded replies

  // Message metadata
  isEdited  Boolean   @default(false)
  editedAt  DateTime?
  isDeleted Boolean   @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author    User               @relation(fields: [authorId], references: [id])
  channel   Channel?           @relation(fields: [channelId], references: [id], onDelete: Cascade)
  thread    Thread?            @relation(fields: [threadId], references: [id], onDelete: Cascade)
  reactions MessageReaction[]
  files     MessageFile[]      // Attached files

  @@map("messages")
}

model Thread {
  id        String @id @default(cuid())
  title     String?
  channelId String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  channel  Channel   @relation(fields: [channelId], references: [id], onDelete: Cascade)
  messages Message[]

  @@map("threads")
}

model MessageReaction {
  id        String @id @default(cuid())
  messageId String
  userId    String
  emoji     String  // e.g., "👍", "❤️", "😀"

  createdAt DateTime @default(now())

  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([messageId, userId, emoji])
  @@map("message_reactions")
}

model MessageFile {
  id        String @id @default(cuid())
  messageId String
  fileId    String

  message Message @relation(fields: [messageId], references: [id], onDelete: Cascade)
  file    File    @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@unique([messageId, fileId])
  @@map("message_files")
}

enum ChannelType {
  TEXT
  VOICE
  VIDEO
  ANNOUNCEMENT  // Special read-only channel for announcements
}

enum MessageType {
  TEXT
  FILE
  SYSTEM       // System-generated messages (user joined, assignment posted, etc.)
}
```

### Section 3: File Management & Storage

```prisma
model File {
  id          String   @id @default(cuid())
  filename    String
  originalName String  // User's original filename
  mimeType    String
  size        BigInt   // File size in bytes
  path        String   // Storage path/key

  // File metadata
  uploaderId  String
  classId     String?  // Which class this file belongs to
  folderId    String?  // Optional folder organization

  // Access control
  isPublic    Boolean  @default(false)

  // File processing status (for videos, images, etc.)
  status      FileStatus @default(UPLOADED)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  uploader        User            @relation(fields: [uploaderId], references: [id])
  class          ClassInstance?   @relation(fields: [classId], references: [id], onDelete: Cascade)
  folder         Folder?         @relation(fields: [folderId], references: [id])
  messageFiles   MessageFile[]   // Files attached to messages
  assignmentFiles AssignmentFile[] // Files attached to assignments
  submissionFiles SubmissionFile[] // Files in student submissions

  @@map("files")
}

model Folder {
  id       String  @id @default(cuid())
  name     String
  parentId String? // For nested folders
  classId  String

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  parent   Folder?        @relation("FolderHierarchy", fields: [parentId], references: [id])
  children Folder[]       @relation("FolderHierarchy")
  class    ClassInstance  @relation(fields: [classId], references: [id], onDelete: Cascade)
  files    File[]

  @@unique([classId, parentId, name]) // No duplicate folder names in same location
  @@map("folders")
}

model AssignmentFile {
  id           String @id @default(cuid())
  assignmentId String
  fileId       String

  assignment Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  file       File       @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@unique([assignmentId, fileId])
  @@map("assignment_files")
}

model SubmissionFile {
  id           String @id @default(cuid())
  submissionId String
  fileId       String

  submission Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  file       File       @relation(fields: [fileId], references: [id], onDelete: Cascade)

  @@unique([submissionId, fileId])
  @@map("submission_files")
}

enum FileStatus {
  UPLOADING     // Currently being uploaded
  UPLOADED      // Successfully uploaded
  PROCESSING    // Being processed (thumbnails, video conversion, etc.)
  READY         // Fully processed and ready
  ERROR         // Processing failed
}
```

### Section 4: Assignments & Grading System

```prisma
model Assignment {
  id          String   @id @default(cuid())
  title       String
  description String
  instructions String?  // Detailed instructions in rich text/markdown

  // Assignment settings
  classId     String
  teacherId   String
  maxPoints   Int      @default(100)

  // Timing
  dueDate     DateTime
  availableFrom DateTime @default(now())
  availableUntil DateTime?

  // Submission settings
  allowLateSubmissions Boolean @default(true)
  maxSubmissions      Int     @default(1)  // How many times can student resubmit
  submissionTypes     Json    @default("[]") // ["file", "text", "url"] what types allowed

  // Grading
  gradingType    GradingType @default(POINTS)
  rubricId       String?
  isPublished    Boolean     @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  class           ClassInstance    @relation(fields: [classId], references: [id], onDelete: Cascade)
  teacher         User            @relation(fields: [teacherId], references: [id])
  rubric          Rubric?         @relation(fields: [rubricId], references: [id])
  submissions     Submission[]
  files           AssignmentFile[]
  toolAssignments ToolAssignment[]

  @@map("assignments")
}

model Submission {
  id           String   @id @default(cuid())
  assignmentId String
  studentId    String

  // Submission content
  textContent  String?          // For text submissions
  url          String?          // For URL submissions

  // Submission metadata
  attempt      Int     @default(1)  // Which attempt this is
  isLate       Boolean @default(false)

  // Grading
  grade        Decimal? @db.Decimal(5,2)  // e.g., 87.50
  feedback     String?  // Teacher feedback
  gradedAt     DateTime?
  gradedById   String?  // Which teacher graded this

  // Status tracking
  status       SubmissionStatus @default(SUBMITTED)

  submittedAt DateTime @default(now())
  updatedAt   DateTime @updatedAt

  assignment Assignment       @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  student    User            @relation(fields: [studentId], references: [id])
  grader     User?           @relation("GradedSubmissions", fields: [gradedById], references: [id])
  files      SubmissionFile[]

  @@unique([assignmentId, studentId, attempt])
  @@map("submissions")
}

model Rubric {
  id          String @id @default(cuid())
  name        String
  description String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  criteria    RubricCriterion[]
  assignments Assignment[]

  @@map("rubrics")
}

model RubricCriterion {
  id          String @id @default(cuid())
  rubricId    String
  name        String   // e.g., "Code Quality"
  description String?
  maxPoints   Int
  order       Int      @default(0)  // Display order

  rubric Rubric @relation(fields: [rubricId], references: [id], onDelete: Cascade)
  levels RubricLevel[]

  @@map("rubric_criteria")
}

model RubricLevel {
  id          String @id @default(cuid())
  criterionId String
  name        String   // e.g., "Excellent", "Good", "Needs Improvement"
  description String
  points      Int
  order       Int      @default(0)

  criterion RubricCriterion @relation(fields: [criterionId], references: [id], onDelete: Cascade)

  @@map("rubric_levels")
}

enum GradingType {
  POINTS        // Traditional point-based (0-100)
  LETTER        // Letter grades (A, B, C, D, F)
  PASS_FAIL     // Pass/Fail only
  RUBRIC        // Rubric-based grading
  NO_GRADE      // Ungraded assignment
}

enum SubmissionStatus {
  DRAFT         // Student is working on it
  SUBMITTED     // Submitted, awaiting grading
  GRADED        // Teacher has graded
  RETURNED      // Graded and returned to student
  RESUBMITTED   // Student resubmitted after feedback
}
```

### Section 5: Video Meetings & Attendance

```prisma
model Meeting {
  id          String      @id @default(cuid())
  title       String
  description String?

  classId     String?
  hostId      String
  type        MeetingType @default(CLASS)

  scheduledStart DateTime?
  scheduledEnd   DateTime?
  actualStart    DateTime?
  actualEnd      DateTime?

  isRecorded     Boolean @default(false)
  recordingUrl   String?
  password       String?

  status         MeetingStatus @default(SCHEDULED)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  class        ClassInstance? @relation(fields: [classId], references: [id])
  host         User          @relation("HostedMeetings", fields: [hostId], references: [id])
  attendance   Attendance[]
  recordings   Recording[]
  participants CallParticipant[]

  @@map("meetings")
}

model Attendance {
  id        String @id @default(cuid())
  meetingId String
  userId    String

  // Core attendance data
  joinedAt  DateTime?
  leftAt    DateTime?
  duration  Int?      // Total time in seconds

  // Participation tracking
  participationScore Int @default(0)  // 0-100 based on engagement
  activities        Json @default("[]") // ["presented", "asked_question", "shared_screen"]

  // Attendance status
  status    AttendanceStatus @default(ABSENT)
  notes     String?          // Teacher can add notes

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@unique([meetingId, userId])
  @@map("attendance")
}

model CallParticipant {
  id        String @id @default(cuid())
  meetingId String
  userId    String

  // Current state (for real-time UI)
  isMuted         Boolean @default(false)
  isVideoOff      Boolean @default(false)
  isScreenSharing Boolean @default(false)
  role            ParticipantRole @default(PARTICIPANT)

  joinedAt DateTime @default(now())

  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)
  user    User    @relation(fields: [userId], references: [id])

  @@unique([meetingId, userId])
  @@map("call_participants")
}

model Recording {
  id        String @id @default(cuid())
  meetingId String

  // Recording metadata
  filename     String
  duration     Int      // Duration in seconds
  fileSize     BigInt   // File size in bytes
  format       String   // e.g., "mp4", "webm"

  // Storage
  storageUrl   String   // URL to the recording file
  thumbnailUrl String?  // Thumbnail/preview image

  // Processing status
  status       RecordingStatus @default(PROCESSING)

  // Access control
  isPublic     Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  meeting Meeting @relation(fields: [meetingId], references: [id], onDelete: Cascade)

  @@map("recordings")
}

enum MeetingType {
  CLASS          // Regular class meeting
  OFFICE_HOURS   // Teacher office hours
  STUDY_GROUP    // Student study group
  PRESENTATION   // Student presentations
  EXAM           // Online exam/quiz
  AD_HOC         // Spontaneous meeting
}

enum MeetingStatus {
  SCHEDULED      // Future meeting
  ACTIVE         // Currently happening
  ENDED          // Completed
  CANCELLED      // Cancelled before starting
}

enum ParticipantRole {
  HOST           // Meeting host (usually teacher)
  CO_HOST        // Co-host (TA, other teachers)
  PRESENTER      // Can share screen and present
  PARTICIPANT    // Regular participant
  OBSERVER       // Can only watch, no mic/camera
}

enum RecordingStatus {
  PROCESSING     // Being processed after meeting
  READY          // Available for viewing
  FAILED         // Processing failed
  DELETED        // Marked for deletion
}

enum AttendanceStatus {
  PRESENT     // Attended the full meeting
  LATE        // Joined late but attended
  LEFT_EARLY  // Left before meeting ended
  ABSENT      // Did not attend
  EXCUSED     // Excused absence
}
```

### Section 6: Notifications & Real-time System

```prisma
model Notification {
  id        String   @id @default(cuid())
  userId    String   // Who receives this notification

  // Notification content
  title     String
  message   String
  type      NotificationType

  // Context - what triggered this notification
  entityType String?  // e.g., "message", "assignment", "meeting"
  entityId   String?  // ID of the related entity
  classId    String?  // Which class context

  // Notification state
  isRead     Boolean @default(false)
  readAt     DateTime?

  // Delivery tracking
  channels   Json @default("[]")  // ["web", "email", "push"] - how it was sent
  sentAt     DateTime @default(now())

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user  User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  class ClassInstance? @relation(fields: [classId], references: [id])

  @@index([userId, isRead])
  @@index([userId, createdAt])
  @@map("notifications")
}

model NotificationPreference {
  id     String @id @default(cuid())
  userId String

  // Notification types preferences
  newMessage        NotificationChannel[] @default([WEB])
  newAssignment     NotificationChannel[] @default([WEB, EMAIL])
  assignmentDue     NotificationChannel[] @default([WEB, EMAIL])
  meetingReminder   NotificationChannel[] @default([WEB, EMAIL])
  gradePosted       NotificationChannel[] @default([WEB, EMAIL])
  classAnnouncement NotificationChannel[] @default([WEB, EMAIL])

  // Timing preferences
  quietHoursStart String? // e.g., "22:00"
  quietHoursEnd   String? // e.g., "08:00"
  timezone        String  @default("UTC")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId])
  @@map("notification_preferences")
}

model RealTimeEvent {
  id        String    @id @default(cuid())

  // Event details
  type      EventType
  payload   Json      // Event-specific data

  // Targeting
  classId   String?   // Class-wide events
  userId    String?   // User-specific events
  channelId String?   // Channel-specific events

  // Event metadata
  triggeredBy String? // User who triggered the event
  processed   Boolean @default(false)

  createdAt DateTime @default(now())
  expiresAt DateTime? // Optional expiry for cleanup

  class     ClassInstance? @relation(fields: [classId], references: [id])
  user      User?          @relation("ReceivedEvents", fields: [userId], references: [id])
  triggerer User?          @relation("TriggeredEvents", fields: [triggeredBy], references: [id])
  channel   Channel?       @relation(fields: [channelId], references: [id])

  @@index([type, classId, createdAt])
  @@index([userId, processed])
  @@map("realtime_events")
}

model UserPresence {
  id       String        @id @default(cuid())
  userId   String        @unique
  status   UserStatus    @default(OFFLINE)
  lastSeen DateTime      @default(now())

  // Current context
  currentClassId String?
  currentChannelId String?

  // Device info
  deviceType String?     // "web", "mobile", "desktop"
  userAgent  String?

  updatedAt DateTime @updatedAt

  user           User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  currentClass   ClassInstance? @relation(fields: [currentClassId], references: [id])
  currentChannel Channel?       @relation(fields: [currentChannelId], references: [id])

  @@map("user_presence")
}

enum NotificationType {
  MESSAGE_RECEIVED     // New message in channel/DM
  MESSAGE_MENTION      // You were mentioned in a message
  ASSIGNMENT_POSTED    // New assignment posted
  ASSIGNMENT_DUE_SOON  // Assignment due in 24 hours
  ASSIGNMENT_GRADED    // Your submission was graded
  MEETING_STARTING     // Meeting starts in 15 minutes
  MEETING_RECORDING    // Meeting recording is ready
  CLASS_ANNOUNCEMENT   // Teacher posted announcement
  FILE_SHARED          // New file uploaded to class
  SUBMISSION_RECEIVED  // Teacher: student submitted assignment
}

enum NotificationChannel {
  WEB    // In-app notification
  EMAIL  // Email notification
  PUSH   // Push notification (mobile/desktop)
  SMS    // SMS (future)
}

enum EventType {
  USER_JOINED_CLASS    // User came online in class
  USER_LEFT_CLASS      // User went offline in class
  MESSAGE_SENT         // New message sent
  MESSAGE_EDITED       // Message was edited
  MESSAGE_DELETED      // Message was deleted
  USER_TYPING          // User is typing
  FILE_UPLOADED        // File was uploaded
  ASSIGNMENT_SUBMITTED // Student submitted assignment
  MEETING_STARTED      // Meeting began
  MEETING_ENDED        // Meeting ended
  SCREEN_SHARE_STARTED // Someone started screen sharing
  SCREEN_SHARE_ENDED   // Screen sharing stopped
}
```

### Section 7: External Integrations

```prisma
model Integration {
  id            String          @id @default(cuid())
  name          String          // e.g., "Khan Academy", "GitHub Classroom"
  description   String?
  type          IntegrationType

  // Integration configuration
  config        Json            // Integration-specific settings
  credentials   Json            // API keys, tokens (encrypted)
  isActive      Boolean         @default(true)

  // Scope
  orgId         String?         // Organization-wide integration
  classId       String?         // Class-specific integration

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  organization  Organization?   @relation(fields: [orgId], references: [id])
  class        ClassInstance?  @relation(fields: [classId], references: [id])
  tools        ExternalTool[]
  activities   IntegrationActivity[]

  @@map("integrations")
}

model ExternalTool {
  id              String @id @default(cuid())
  integrationId   String

  // Tool details
  name            String    // e.g., "Code Playground", "Virtual Whiteboard"
  description     String?
  url             String?   // Launch URL
  iconUrl         String?

  // LTI configuration (if applicable)
  ltiVersion      String?   // "1.1", "1.3"
  consumerKey     String?
  sharedSecret    String?   // Encrypted

  // Tool settings
  launchInNewTab  Boolean   @default(true)
  passCourseInfo  Boolean   @default(true)
  passUserInfo    Boolean   @default(true)

  // Access control
  isEnabled       Boolean   @default(true)
  allowedRoles    Json      @default("[\"TEACHER\", \"STUDENT\"]")

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  integration Integration       @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  launches    ToolLaunch[]
  assignments ToolAssignment[]

  @@map("external_tools")
}

model ToolLaunch {
  id         String @id @default(cuid())
  toolId     String
  userId     String
  classId    String?

  // Launch context
  context    Json    // Assignment ID, custom parameters, etc.
  sessionId  String? // For tracking user session in external tool

  // Launch tracking
  launchedAt DateTime @default(now())
  lastAccessed DateTime @default(now())
  duration     Int?    // Time spent in tool (seconds)

  // Return data from tool
  returnData   Json?   // Grades, completion status, etc.
  status       LaunchStatus @default(ACTIVE)

  tool  ExternalTool   @relation(fields: [toolId], references: [id])
  user  User          @relation(fields: [userId], references: [id])
  class ClassInstance? @relation(fields: [classId], references: [id])

  @@map("tool_launches")
}

model ToolAssignment {
  id           String @id @default(cuid())
  assignmentId String
  toolId       String

  // Tool-specific assignment data
  externalId   String?  // ID in the external system
  launchUrl    String?  // Specific launch URL for this assignment
  parameters   Json     @default("{}")  // Custom launch parameters

  // Grade passback settings
  gradePassback Boolean @default(false)
  maxScore      Decimal? @db.Decimal(5,2)

  assignment Assignment  @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  tool       ExternalTool @relation(fields: [toolId], references: [id])

  @@unique([assignmentId, toolId])
  @@map("tool_assignments")
}

model IntegrationActivity {
  id            String @id @default(cuid())
  integrationId String

  // Activity details
  activity      String    // "user_login", "grade_sync", "content_import"
  status        ActivityStatus @default(SUCCESS)
  message       String?   // Success/error message
  details       Json?     // Additional activity data

  // Context
  userId        String?
  classId       String?

  createdAt DateTime @default(now())

  integration Integration    @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  user        User?         @relation(fields: [userId], references: [id])
  class       ClassInstance? @relation(fields: [classId], references: [id])

  @@index([integrationId, createdAt])
  @@map("integration_activities")
}

model Webhook {
  id        String @id @default(cuid())
  url       String
  events    Json   // Array of events to listen for
  secret    String // For signature verification

  // Configuration
  classId   String?
  isActive  Boolean @default(true)

  // Stats
  lastTriggered DateTime?
  totalCalls    Int @default(0)
  failureCount  Int @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  class ClassInstance? @relation(fields: [classId], references: [id])
  calls WebhookCall[]

  @@map("webhooks")
}

model WebhookCall {
  id        String @id @default(cuid())
  webhookId String

  // Request details
  event     String
  payload   Json
  headers   Json

  // Response tracking
  statusCode    Int?
  responseTime  Int?     // Milliseconds
  errorMessage  String?
  retryCount    Int @default(0)

  createdAt DateTime @default(now())

  webhook Webhook @relation(fields: [webhookId], references: [id], onDelete: Cascade)

  @@index([webhookId, createdAt])
  @@map("webhook_calls")
}

enum IntegrationType {
  LTI           // Learning Tools Interoperability
  OAUTH         // OAuth-based integration
  API           // Direct API integration
  SSO           // Single Sign-On
  WEBHOOK       // Webhook-based
}

enum LaunchStatus {
  ACTIVE        // Currently in use
  COMPLETED     // User finished/submitted
  EXPIRED       // Session expired
  ERROR         // Launch failed
}

enum ActivityStatus {
  SUCCESS
  ERROR
  WARNING
  PENDING
}
```

## File Storage Integration

### Storage Architecture

- **Database:** Store file metadata, paths, and access control
- **External Storage:** SeaweedFS (recommended) or Supabase Storage for actual file data
- **Processing Pipeline:** Support for thumbnail generation, video conversion, document preview

### Storage Structure

```
/class-{classId}/
  ├── files/           # General class files
  ├── assignments/     # Assignment files
  ├── submissions/     # Student submissions
  ├── recordings/      # Meeting recordings
  └── avatars/         # Profile pictures
```

### Integration Example

```typescript
// Upload workflow
1. Client uploads file to storage service
2. Storage service returns file path/URL
3. Create File record in database with metadata
4. Process file if needed (thumbnails, etc.)
5. Update File.status to READY
```

## Performance Considerations

### Database Indexes

- Primary performance indexes are included in schema
- Additional indexes on high-query fields (userId, classId, createdAt)
- Composite indexes for common query patterns

### Scaling Strategy

- **Current:** Single PostgreSQL instance (< 500 users)
- **Growth Path:** Read replicas → Horizontal partitioning → Microservices
- **Real-time:** WebSocket server with Redis pub/sub for multi-instance scaling

### Optimization Areas

- Message pagination and real-time updates
- File upload chunking and resumable uploads
- Meeting recording processing queues
- Notification delivery batching

## Security Considerations

### Data Protection

- Encrypt sensitive fields (API keys, tokens, secrets)
- Row-level security for multi-tenant data
- File access control via signed URLs
- Audit logs for sensitive operations

### Authentication Integration

- Support for institutional SSO (SAML, OAuth)
- Role-based access control (RBAC)
- Class-level permissions and enrollment verification
- API rate limiting and abuse prevention

## Migration Strategy

### Database Setup

1. Initialize Prisma schema with Supabase
2. Create initial admin user and organization
3. Set up default notification preferences
4. Configure file storage integration

### Data Migration (if applicable)

- Import existing user data with role mapping
- Migrate course/class structure
- Transfer historical assignment data
- Preserve message history and file attachments

## Success Criteria

### Functional Requirements

- ✅ Support 500+ concurrent users
- ✅ Real-time messaging with <200ms latency
- ✅ File uploads up to 100MB per file
- ✅ Video meetings up to 50 participants
- ✅ Complete assignment workflow (create, submit, grade)
- ✅ Vietnamese education system compatibility

### Performance Requirements

- ✅ Page load times < 2 seconds
- ✅ API response times < 500ms for 95th percentile
- ✅ 99.9% uptime during academic periods
- ✅ File upload reliability > 99%

### Integration Requirements

- ✅ LTI 1.3 compatibility for educational tools
- ✅ OAuth integration with major providers
- ✅ Webhook support for real-time integrations
- ✅ Grade passback functionality

This database design provides a solid foundation for building a comprehensive Teams-like LMS that serves the Vietnamese educational market while maintaining scalability and integration flexibility.
