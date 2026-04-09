import { PrismaClient, UserRole } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Teams LMS database seeding...');

  // Create sample organization
  const org = await prisma.organization.upsert({
    where: { slug: 'springfield-university' },
    update: {},
    create: {
      name: 'Springfield University',
      slug: 'springfield-university',
      description: 'A sample educational institution for demonstration',
      settings: {
        academicYear: '2024-2025',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi-VN',
      },
    },
  });

  console.log(`✅ Created organization: ${org.name}`);

  // Create sample departments
  const csDept = await prisma.department.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'computer-science',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Khoa Khoa học Máy tính', // Computer Science Faculty
      slug: 'computer-science',
      description: 'Department of Computer Science and Information Technology',
    },
  });

  const mathDept = await prisma.department.upsert({
    where: {
      organizationId_slug: {
        organizationId: org.id,
        slug: 'mathematics',
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      name: 'Khoa Toán học', // Mathematics Faculty
      slug: 'mathematics',
      description: 'Department of Mathematics and Statistics',
    },
  });

  console.log(`✅ Created departments: ${csDept.name}, ${mathDept.name}`);

  // Create sample majors
  const seMajor = await prisma.major.upsert({
    where: {
      departmentId_code: {
        departmentId: csDept.id,
        code: 'SE',
      },
    },
    update: {},
    create: {
      departmentId: csDept.id,
      name: 'Kỹ thuật Phần mềm', // Software Engineering
      slug: 'software-engineering',
      code: 'SE',
      description:
        'Software Engineering major focusing on modern development practices',
    },
  });

  const csMajor = await prisma.major.upsert({
    where: {
      departmentId_code: {
        departmentId: csDept.id,
        code: 'CS',
      },
    },
    update: {},
    create: {
      departmentId: csDept.id,
      name: 'Khoa học Máy tính', // Computer Science
      slug: 'computer-science',
      code: 'CS',
      description: 'Computer Science major with focus on algorithms and theory',
    },
  });

  console.log(`✅ Created majors: ${seMajor.name}, ${csMajor.name}`);

  // Create sample users
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@springfield.edu.vn' },
    update: {},
    create: {
      email: 'teacher@springfield.edu.vn',
      username: 'prof_nguyen',
      firstName: 'Nguyễn',
      lastName: 'Văn Anh',
      role: UserRole.TEACHER,
    },
  });

  const student1 = await prisma.user.upsert({
    where: { email: 'student1@springfield.edu.vn' },
    update: {},
    create: {
      email: 'student1@springfield.edu.vn',
      username: 'tran_thi_lan',
      firstName: 'Trần',
      lastName: 'Thị Lan',
      role: UserRole.STUDENT,
      majorId: seMajor.id,
      year: 3,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'student2@springfield.edu.vn' },
    update: {},
    create: {
      email: 'student2@springfield.edu.vn',
      username: 'le_van_duc',
      firstName: 'Lê',
      lastName: 'Văn Đức',
      role: UserRole.STUDENT,
      majorId: csMajor.id,
      year: 2,
    },
  });

  console.log(
    `✅ Created users: ${teacher.username}, ${student1.username}, ${student2.username}`,
  );

  // Add teacher to department
  await prisma.departmentMember.upsert({
    where: {
      departmentId_userId: {
        departmentId: csDept.id,
        userId: teacher.id,
      },
    },
    update: {},
    create: {
      departmentId: csDept.id,
      userId: teacher.id,
      role: 'LECTURER',
    },
  });

  // Create sample courses
  const webTechCourse = await prisma.course.upsert({
    where: {
      departmentId_code: {
        departmentId: csDept.id,
        code: 'CSE401',
      },
    },
    update: {},
    create: {
      departmentId: csDept.id,
      name: 'Công nghệ Web', // Web Technologies
      code: 'CSE401',
      description: 'Modern web development technologies and frameworks',
      credits: 3,
    },
  });

  const databaseCourse = await prisma.course.upsert({
    where: {
      departmentId_code: {
        departmentId: csDept.id,
        code: 'CSE301',
      },
    },
    update: {},
    create: {
      departmentId: csDept.id,
      name: 'Cơ sở dữ liệu', // Database Systems
      code: 'CSE301',
      description: 'Database design and management systems',
      credits: 4,
    },
  });

  console.log(
    `✅ Created courses: ${webTechCourse.name}, ${databaseCourse.name}`,
  );

  // Connect courses to majors
  await prisma.course.update({
    where: { id: webTechCourse.id },
    data: {
      majors: {
        connect: [{ id: seMajor.id }, { id: csMajor.id }],
      },
    },
  });

  await prisma.course.update({
    where: { id: databaseCourse.id },
    data: {
      majors: {
        connect: [{ id: seMajor.id }, { id: csMajor.id }],
      },
    },
  });

  // Create class instances
  const webTechClass = await prisma.classInstance.upsert({
    where: {
      courseId_semester_year: {
        courseId: webTechCourse.id,
        semester: 'Fall 2024',
        year: 2024,
      },
    },
    update: {},
    create: {
      courseId: webTechCourse.id,
      name: 'CSE401 - Fall 2024',
      semester: 'Fall 2024',
      year: 2024,
    },
  });

  const databaseClass = await prisma.classInstance.upsert({
    where: {
      courseId_semester_year: {
        courseId: databaseCourse.id,
        semester: 'Fall 2024',
        year: 2024,
      },
    },
    update: {},
    create: {
      courseId: databaseCourse.id,
      name: 'CSE301 - Fall 2024',
      semester: 'Fall 2024',
      year: 2024,
    },
  });

  console.log(
    `✅ Created class instances: ${webTechClass.name}, ${databaseClass.name}`,
  );

  // Enroll students in classes
  await prisma.classEnrollment.upsert({
    where: {
      classInstanceId_userId: {
        classInstanceId: webTechClass.id,
        userId: student1.id,
      },
    },
    update: {},
    create: {
      classInstanceId: webTechClass.id,
      userId: student1.id,
    },
  });

  await prisma.classEnrollment.upsert({
    where: {
      classInstanceId_userId: {
        classInstanceId: webTechClass.id,
        userId: student2.id,
      },
    },
    update: {},
    create: {
      classInstanceId: webTechClass.id,
      userId: student2.id,
    },
  });

  await prisma.classEnrollment.upsert({
    where: {
      classInstanceId_userId: {
        classInstanceId: databaseClass.id,
        userId: student2.id,
      },
    },
    update: {},
    create: {
      classInstanceId: databaseClass.id,
      userId: student2.id,
    },
  });

  console.log(`✅ Enrolled students in classes`);

  // Create sample channels
  const generalChannel = await prisma.channel.upsert({
    where: {
      classInstanceId_name: {
        classInstanceId: webTechClass.id,
        name: 'general',
      },
    },
    update: {},
    create: {
      classInstanceId: webTechClass.id,
      name: 'general',
      description: 'General discussion channel',
    },
  });

  const announcementsChannel = await prisma.channel.upsert({
    where: {
      classInstanceId_name: {
        classInstanceId: webTechClass.id,
        name: 'announcements',
      },
    },
    update: {},
    create: {
      classInstanceId: webTechClass.id,
      name: 'announcements',
      description: 'Course announcements',
      type: 'ANNOUNCEMENT',
      isReadOnly: true,
    },
  });

  console.log(
    `✅ Created channels: ${generalChannel.name}, ${announcementsChannel.name}`,
  );

  // Create sample assignment
  const assignment = await prisma.assignment.create({
    data: {
      title: 'Web Development Project',
      description:
        'Create a responsive web application using modern frameworks',
      instructions:
        'Build a full-stack web application with user authentication, database integration, and responsive design.',
      classInstanceId: webTechClass.id,
      courseId: webTechCourse.id,
      teacherId: teacher.id,
      maxPoints: 100,
      dueDate: new Date('2024-12-15'),
      availableFrom: new Date(),
      submissionTypes: JSON.stringify(['file', 'url']),
      isPublished: true,
    },
  });

  console.log(`✅ Created assignment: ${assignment.title}`);

  // Create sample rubric
  const rubric = await prisma.rubric.create({
    data: {
      name: 'Web Development Rubric',
      description: 'Rubric for evaluating web development projects',
    },
  });

  // Create rubric criteria
  await prisma.rubricCriterion.createMany({
    data: [
      {
        rubricId: rubric.id,
        name: 'Code Quality',
        description: 'Clean, well-structured, and documented code',
        maxPoints: 25,
        order: 1,
      },
      {
        rubricId: rubric.id,
        name: 'Functionality',
        description: 'All features work correctly as specified',
        maxPoints: 30,
        order: 2,
      },
      {
        rubricId: rubric.id,
        name: 'User Interface',
        description: 'Professional and user-friendly design',
        maxPoints: 25,
        order: 3,
      },
      {
        rubricId: rubric.id,
        name: 'Documentation',
        description: 'Clear README and technical documentation',
        maxPoints: 20,
        order: 4,
      },
    ],
  });

  console.log(`✅ Created rubric with criteria`);

  // Create notification preferences for users
  await prisma.notificationPreference.upsert({
    where: { userId: student1.id },
    update: {},
    create: {
      userId: student1.id,
      newMessage: JSON.stringify(['WEB']),
      newAssignment: JSON.stringify(['WEB', 'EMAIL']),
      assignmentDue: JSON.stringify(['WEB', 'EMAIL']),
      meetingReminder: JSON.stringify(['WEB']),
      gradePosted: JSON.stringify(['WEB', 'EMAIL']),
      classAnnouncement: JSON.stringify(['WEB', 'EMAIL']),
    },
  });

  console.log(`✅ Created notification preferences`);

  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
