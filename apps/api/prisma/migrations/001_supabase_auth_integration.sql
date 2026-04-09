-- CreateSupabaseAuthIntegration
-- This migration adds Supabase Auth integration with RLS policies

-- =============================================
-- 1. AUTH INTEGRATION FUNCTIONS
-- =============================================

-- Function to get current user ID from Supabase auth
CREATE OR REPLACE FUNCTION auth.user_id()
RETURNS uuid
LANGUAGE sql STABLE
AS $$
  SELECT 
    COALESCE(
      nullif(current_setting('request.jwt.claim.sub', true), ''),
      (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
    )::uuid
$$;

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT role FROM users WHERE auth_user_id = auth.user_id();
$$;

-- Function to sync user creation from auth.users
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.users (
    auth_user_id,
    email,
    username, 
    first_name,
    last_name,
    is_email_verified
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    NEW.email_confirmed_at IS NOT NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger on auth.users for automatic profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION handle_new_user();

-- Function to update user login timestamp
CREATE OR REPLACE FUNCTION update_user_login()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.users 
  SET last_login = NOW()
  WHERE auth_user_id = NEW.user_id;
  RETURN NEW;
END;
$$;

-- Trigger on auth.sessions for login tracking
DROP TRIGGER IF EXISTS on_user_login ON auth.sessions;
CREATE TRIGGER on_user_login
  AFTER INSERT ON auth.sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_login();

-- =============================================
-- 2. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE majors ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 3. CORE USER POLICIES
-- =============================================

-- Users can view and update their own profile
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth_user_id = auth.user_id());

CREATE POLICY "users_update_own" ON users  
  FOR UPDATE USING (auth_user_id = auth.user_id());

-- Admins can view all users
CREATE POLICY "users_select_admin" ON users
  FOR SELECT USING (get_current_user_role() = 'ADMIN');

-- Teachers can view users in their classes
CREATE POLICY "users_select_teacher" ON users
  FOR SELECT USING (
    get_current_user_role() = 'TEACHER' AND
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN class_instances ci ON ci.id = ce.class_instance_id
      JOIN assignments a ON a.class_instance_id = ci.id
      JOIN users teacher ON teacher.id = a.teacher_id
      WHERE ce.user_id = users.id
      AND teacher.auth_user_id = auth.user_id()
    )
  );

-- =============================================
-- 4. ACADEMIC STRUCTURE POLICIES
-- =============================================

-- Organizations: Admin only
CREATE POLICY "organizations_admin_all" ON organizations
  FOR ALL USING (get_current_user_role() = 'ADMIN');

-- Departments: View if user belongs to organization
CREATE POLICY "departments_select_member" ON departments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      JOIN department_members dm ON dm.user_id = u.id
      WHERE dm.department_id = departments.id
      AND u.auth_user_id = auth.user_id()
    ) OR
    get_current_user_role() = 'ADMIN'
  );

-- Class instances: View if enrolled or teaching
CREATE POLICY "class_instances_select_member" ON class_instances
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN users u ON u.id = ce.user_id  
      WHERE ce.class_instance_id = class_instances.id
      AND u.auth_user_id = auth.user_id()
    ) OR
    EXISTS (
      SELECT 1 FROM assignments a
      JOIN users u ON u.id = a.teacher_id
      WHERE a.class_instance_id = class_instances.id
      AND u.auth_user_id = auth.user_id()
    ) OR
    get_current_user_role() = 'ADMIN'
  );

-- =============================================
-- 5. MESSAGING POLICIES 
-- =============================================

-- Messages: View if member of channel's class
CREATE POLICY "messages_select_class_member" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM channels ch
      JOIN class_instances ci ON ci.id = ch.class_instance_id
      JOIN class_enrollments ce ON ce.class_instance_id = ci.id
      JOIN users u ON u.id = ce.user_id
      WHERE ch.id = messages.channel_id
      AND u.auth_user_id = auth.user_id()
    )
  );

-- Messages: Insert if member of class and channel allows
CREATE POLICY "messages_insert_class_member" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM channels ch
      JOIN class_instances ci ON ci.id = ch.class_instance_id  
      JOIN class_enrollments ce ON ce.class_instance_id = ci.id
      JOIN users u ON u.id = ce.user_id
      WHERE ch.id = messages.channel_id
      AND u.auth_user_id = auth.user_id()
      AND u.id = messages.author_id
      AND (ch.is_read_only = false OR u.role IN ('TEACHER', 'ADMIN'))
    )
  );

-- Messages: Update/delete own messages
CREATE POLICY "messages_update_own" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = messages.author_id 
      AND u.auth_user_id = auth.user_id()
    )
  );

-- =============================================
-- 6. ASSIGNMENT POLICIES
-- =============================================

-- Assignments: Students see published assignments in enrolled classes
CREATE POLICY "assignments_select_student" ON assignments
  FOR SELECT USING (
    (is_published = true AND EXISTS (
      SELECT 1 FROM class_enrollments ce
      JOIN users u ON u.id = ce.user_id
      WHERE ce.class_instance_id = assignments.class_instance_id
      AND u.auth_user_id = auth.user_id()
      AND u.role = 'STUDENT'
    )) OR
    -- Teachers see all assignments they created
    (EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = assignments.teacher_id
      AND u.auth_user_id = auth.user_id()
    )) OR
    get_current_user_role() = 'ADMIN'
  );

-- Assignments: Teachers can manage their assignments
CREATE POLICY "assignments_teacher_manage" ON assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = assignments.teacher_id
      AND u.auth_user_id = auth.user_id()
      AND u.role IN ('TEACHER', 'ADMIN')
    )
  );

-- =============================================
-- 7. NOTIFICATION POLICIES
-- =============================================

-- Notifications: Users see only their own
CREATE POLICY "notifications_select_own" ON notifications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = notifications.user_id
      AND u.auth_user_id = auth.user_id()
    )
  );

CREATE POLICY "notifications_update_own" ON notifications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = notifications.user_id
      AND u.auth_user_id = auth.user_id()
    )
  );

-- =============================================
-- 8. ADVANCED INDEXES FOR PERFORMANCE
-- =============================================

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_messages_content_gin 
ON messages USING gin(to_tsvector('english', content));

CREATE INDEX IF NOT EXISTS idx_assignments_search_gin
ON assignments USING gin(to_tsvector('english', title || ' ' || description));

-- Conditional indexes for active data
CREATE INDEX IF NOT EXISTS idx_users_active_role
ON users (role, created_at) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_notifications_unread
ON notifications (user_id, created_at DESC) WHERE is_read = false;

CREATE INDEX IF NOT EXISTS idx_assignments_published_due
ON assignments (class_instance_id, due_date) WHERE is_published = true;

-- Composite indexes for common join patterns
CREATE INDEX IF NOT EXISTS idx_class_enrollments_lookup
ON class_enrollments (class_instance_id, user_id);

CREATE INDEX IF NOT EXISTS idx_messages_channel_thread
ON messages (channel_id, thread_id, created_at) WHERE is_deleted = false;

-- =============================================
-- 9. HELPER FUNCTIONS FOR APPLICATION
-- =============================================

-- Check if user is enrolled in class
CREATE OR REPLACE FUNCTION is_enrolled_in_class(class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM class_enrollments ce
    JOIN users u ON u.id = ce.user_id
    WHERE ce.class_instance_id = class_id
    AND u.auth_user_id = auth.user_id()
  );
$$;

-- Check if user can grade assignment  
CREATE OR REPLACE FUNCTION can_grade_assignment(assignment_id UUID)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM assignments a
    JOIN users u ON u.id = a.teacher_id
    WHERE a.id = assignment_id
    AND u.auth_user_id = auth.user_id()
    AND u.role IN ('TEACHER', 'ADMIN')
  );
$$;

-- Get user's accessible class instances
CREATE OR REPLACE FUNCTION get_accessible_classes()
RETURNS TABLE(class_id UUID, role TEXT)
LANGUAGE sql SECURITY DEFINER STABLE
AS $$
  -- Classes where user is enrolled as student
  SELECT ce.class_instance_id, 'STUDENT'::TEXT
  FROM class_enrollments ce
  JOIN users u ON u.id = ce.user_id
  WHERE u.auth_user_id = auth.user_id()
  
  UNION
  
  -- Classes where user is teaching
  SELECT DISTINCT a.class_instance_id, 'TEACHER'::TEXT  
  FROM assignments a
  JOIN users u ON u.id = a.teacher_id
  WHERE u.auth_user_id = auth.user_id()
$$;