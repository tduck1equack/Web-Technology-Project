import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Put,
  Delete,
} from '@nestjs/common';
import {
  SupabaseAuthGuard,
  RolesGuard,
  ClassMemberGuard,
  RequireRoles,
} from '../auth/supabase-auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, MessageType } from '../../generated/prisma';

@Controller('classes')
@UseGuards(SupabaseAuthGuard)
export class ClassesController {
  constructor(private prisma: PrismaService) {}

  // Get all classes (accessible by user via RLS)
  @Get()
  async getAllClasses(@Request() req: any) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classInstance.findMany({
        include: {
          course: true,
        },
      });
    });
  }

  // Get class by ID (with RLS protection)
  @Get(':id')
  async getClassById(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classInstance.findUnique({
        where: { id },
        include: {
          course: true,
        },
      });
    });
  }

  // Create a new class (teachers and admins only)
  @Post()
  @UseGuards(RolesGuard)
  @RequireRoles(UserRole.TEACHER, UserRole.ADMIN)
  async createClass(
    @Body()
    classData: {
      name: string;
      semester: string;
      year: number;
      courseId: string;
    },
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classInstance.create({
        data: classData,
      });
    });
  }

  // Update class information (teachers and admins only)
  @Put(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(UserRole.TEACHER, UserRole.ADMIN)
  async updateClass(
    @Param('id') id: string,
    @Body() updateData: any,
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classInstance.update({
        where: { id },
        data: updateData,
      });
    });
  }

  // Delete a class (teachers and admins only)
  @Delete(':id')
  @UseGuards(RolesGuard)
  @RequireRoles(UserRole.TEACHER, UserRole.ADMIN)
  async deleteClass(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classInstance.delete({
        where: { id },
      });
    });
  }
  // Get user's enrolled classes
  @Get('my-classes')
  async getMyClasses(@Request() req: any) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.classEnrollment.findMany({
        where: { userId: user.id },
        include: {
          classInstance: {
            include: {
              course: {
                include: {
                  department: true,
                },
              },
            },
          },
        },
      });
    });
  }

  // Get messages in a class channel (with RLS protection)
  @Get(':classInstanceId/channels/:channelId/messages')
  @UseGuards(ClassMemberGuard)
  async getChannelMessages(
    @Param('classInstanceId') classInstanceId: string,
    @Param('channelId') channelId: string,
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      // RLS policies will automatically filter accessible messages
      return this.prisma.message.findMany({
        where: {
          channelId,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          reactions: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
    });
  }

  // Post a message (teachers and enrolled students only)
  @Post(':classInstanceId/channels/:channelId/messages')
  @UseGuards(ClassMemberGuard)
  async postMessage(
    @Param('channelId') channelId: string,
    @Body() messageData: { content: string; type?: string },
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      // RLS policies will enforce proper channel access
      return this.prisma.message.create({
        data: {
          content: messageData.content,
          type: (messageData.type as MessageType) || MessageType.TEXT,
          authorId: user.id,
          channelId,
        },
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });
    });
  }

  // Get assignments (students see published, teachers see all they created)
  @Get(':classInstanceId/assignments')
  @UseGuards(ClassMemberGuard)
  async getAssignments(
    @Param('classInstanceId') classInstanceId: string,
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      // RLS policies handle visibility rules automatically
      return this.prisma.assignment.findMany({
        where: { classInstanceId },
        include: {
          teacher: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
            },
          },
          rubric: {
            include: {
              criteria: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });
    });
  }
  
  // Create assignment (teachers only)
  @Post(':classInstanceId/assignments')
  @UseGuards(ClassMemberGuard, RolesGuard)
  @RequireRoles(UserRole.TEACHER, UserRole.ADMIN)
  async createAssignment(
    @Param('classInstanceId') classInstanceId: string,
    @Body()
    assignmentData: {
      title: string;
      description: string;
      instructions?: string;
      maxPoints: number;
      dueDate: string;
      submissionTypes: string[];
    },
    @Request() req: any,
  ) {
    const user = req.user;

    return this.prisma.withUserContext(user.authUserId, async () => {
      return this.prisma.assignment.create({
        data: {
          title: assignmentData.title,
          description: assignmentData.description,
          instructions: assignmentData.instructions,
          maxPoints: assignmentData.maxPoints,
          dueDate: new Date(assignmentData.dueDate),
          submissionTypes: assignmentData.submissionTypes,
          classInstanceId,
          teacherId: user.id,
          courseId: (
            await this.prisma.classInstance.findUniqueOrThrow({
              where: { id: classInstanceId },
              select: { courseId: true },
            })
          ).courseId,
        },
      });
    });
  }
}

