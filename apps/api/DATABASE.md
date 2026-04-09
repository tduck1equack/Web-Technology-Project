# Teams LMS Database Setup

This document provides instructions for setting up the Teams LMS database using Prisma and Supabase.

## Prerequisites

- Node.js 18+ installed
- A Supabase account and project
- PostgreSQL database (via Supabase)

## Environment Setup

1. **Copy Environment Variables**

   Copy the `.env` file to `.env.local` and fill in your Supabase credentials:

   ```bash
   cp .env .env.local
   ```

   Update the following variables in `.env.local`:

   ```env
   # Replace with your actual Supabase database URL
   DATABASE_URL="postgresql://postgres:your-password@your-project-ref.supabase.co:5432/postgres"

   # Supabase API Configuration
   NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
   SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

## Database Commands

### Generate Prisma Client

Generate the Prisma client from the schema:

```bash
pnpm prisma:generate
```

### Create and Apply Migrations

Create your first migration:

```bash
pnpm prisma:migrate
# Follow the prompts to name your migration
```

### Seed the Database

Populate the database with sample data:

```bash
pnpm prisma:seed
```

### Database Studio

Open Prisma Studio to view and edit data:

```bash
pnpm prisma:studio
```

### Reset Database

⚠️ **Warning**: This will delete all data!

```bash
pnpm db:reset
```

### Complete Setup

Run all setup commands in sequence:

```bash
pnpm db:setup
```

## Database Schema Overview

The Teams LMS database includes the following main sections:

### 1. Academic Structure

- **Organizations**: Educational institutions
- **Departments**: Academic departments within organizations
- **Majors**: Student majors (Ngành/Khoa) within departments
- **Courses**: Individual courses offered by departments
- **Class Instances**: Specific instances of courses per semester
- **Users**: Students, teachers, and administrators

### 2. Communication & Messaging

- **Channels**: Text channels within class instances
- **Messages**: Chat messages with support for threads
- **Reactions**: Message reactions and interactions
- **Announcements**: Course-wide announcements

### 3. File Management

- **Files**: File metadata with versioning support
- **Folders**: Hierarchical folder organization
- **Storage Integration**: Links to external storage (Supabase Storage/SeaweedFS)

### 4. Assignments & Grading

- **Assignments**: Course assignments with due dates and settings
- **Submissions**: Student submissions with file attachments
- **Rubrics**: Grading rubrics with multiple criteria
- **Grading**: Point-based and rubric-based grading system

### 5. Video Meetings & Attendance

- **Meetings**: Scheduled and ad-hoc video meetings
- **Attendance**: Detailed attendance tracking with participation scores
- **Recordings**: Meeting recordings with access control
- **Call Participants**: Real-time participant state management

### 6. Notifications & Real-time

- **Notifications**: Multi-channel notification system
- **Real-time Events**: WebSocket event management
- **User Presence**: Online status and activity tracking
- **Notification Preferences**: User-customizable notification settings

### 7. External Integrations

- **Integrations**: Third-party service integrations (LTI, OAuth, etc.)
- **External Tools**: Educational tools and applications
- **Webhooks**: Event-driven integrations
- **Activity Tracking**: Integration usage and activity logs

## Sample Data

The seed script creates sample data including:

- Springfield University (organization)
- Computer Science and Mathematics departments
- Software Engineering and Computer Science majors
- Sample courses: Web Technologies (CSE401) and Database Systems (CSE301)
- One teacher and two students
- Class enrollments and channels
- A sample assignment with rubric

## Troubleshooting

### Migration Issues

If migrations fail, check:

1. Database connection string is correct
2. Database server is accessible
3. User has sufficient permissions

### Seeding Issues

If seeding fails:

1. Ensure migrations have been applied
2. Check for existing data conflicts
3. Verify environment variables are set correctly

### Connection Issues

Common connection problems:

1. **Wrong password**: Double-check your Supabase password
2. **Network issues**: Ensure your IP is allowed in Supabase settings
3. **SSL issues**: Supabase requires SSL connections

## Development Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Generate a new migration: `pnpm prisma:migrate`
3. Apply migration to development database
4. Update seed data if needed
5. Test changes with Prisma Studio

## Production Deployment

For production deployment:

1. Set up production Supabase project
2. Configure production environment variables
3. Run migrations against production database
4. **Do NOT run seed script in production**

## Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Teams LMS Database Design Specification](../../docs/superpowers/specs/2026-04-07-teams-lms-database-design.md)
