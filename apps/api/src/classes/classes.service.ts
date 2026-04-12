import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MessageType } from '@prisma/client';

@Injectable()
export class ClassesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieve all class instances
   * Uses RLS context to filter classes based on user permissions
   */
  async findAll(authUserId: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classInstance.findMany({
        include: { course: true },
      });
    });
  }

  /**
   * Get a single class instance by ID
   */
  async findOne(authUserId: string, id: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classInstance.findUnique({
        where: { id },
        include: { course: true },
      });
    });
  }

  /**
   * Create a new class instance
   */
  async create(authUserId: string, classData: any) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classInstance.create({
        data: classData,
      });
    });
  }

  /**
   * Update existing class information
   */
  async update(authUserId: string, id: string, updateData: any) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classInstance.update({
        where: { id },
        data: updateData,
      });
    });
  }

  /**
   * Delete a class instance
   */
  async remove(authUserId: string, id: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classInstance.delete({
        where: { id },
      });
    });
  }

  /**
   * Fetch classes that the current user is enrolled in
   */
  async findMyClasses(authUserId: string, userId: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.classEnrollment.findMany({
        where: { userId },
        include: {
          classInstance: {
            include: {
              course: { include: { department: true } },
            },
          },
        },
      });
    });
  }

  /**
   * Retrieve messages for a specific channel within a class
   * Filtered by RLS and excludes deleted messages
   */
  async getChannelMessages(authUserId: string, channelId: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.message.findMany({
        where: { channelId, isDeleted: false },
        include: {
          author: {
            select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
          },
          reactions: true,
        },
        orderBy: { createdAt: 'asc' },
        take: 50,
      });
    });
  }

  /**
   * Post a new message to a class channel
   */
  async postMessage(authUserId: string, userId: string, channelId: string, messageData: any) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.message.create({
        data: {
          content: messageData.content,
          type: (messageData.type as MessageType) || MessageType.TEXT,
          authorId: userId,
          channelId,
        },
        include: {
          author: {
            select: { id: true, username: true, firstName: true, lastName: true, avatar: true },
          },
        },
      });
    });
  }

  /**
   * List all assignments for a specific class instance
   */
  async getAssignments(authUserId: string, classInstanceId: string) {
    return this.prisma.withUserContext(authUserId, async () => {
      return this.prisma.assignment.findMany({
        where: { classInstanceId },
        include: {
          teacher: { select: { id: true, username: true, firstName: true, lastName: true } },
          rubric: { include: { criteria: true } },
        },
        orderBy: { dueDate: 'asc' },
      });
    });
  }

  /**
   * Create a new assignment for a class
   * Automatically resolves courseId from the class instance
   */
  async createAssignment(authUserId: string, userId: string, classInstanceId: string, assignmentData: any) {
    return this.prisma.withUserContext(authUserId, async () => {
      const classInstance = await this.prisma.classInstance.findUniqueOrThrow({
        where: { id: classInstanceId },
        select: { courseId: true },
      });

      return this.prisma.assignment.create({
        data: {
          title: assignmentData.title,
          description: assignmentData.description,
          instructions: assignmentData.instructions,
          maxPoints: assignmentData.maxPoints,
          dueDate: new Date(assignmentData.dueDate),
          submissionTypes: assignmentData.submissionTypes,
          classInstanceId,
          teacherId: userId,
          courseId: classInstance.courseId,
        },
      });
    });
  }
}