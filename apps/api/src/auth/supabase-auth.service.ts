import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('NEXT_PUBLIC_SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY')!,
    );
  }

  get client() {
    return this.supabase;
  }

  async getUserFromToken(token: string) {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  }

  async getUserProfile(authUserId: string) {
    return this.prisma.user.findUnique({
      where: { authUserId },
      include: {
        major: true,
        departmentMemberships: {
          include: { department: true },
        },
      },
    });
  }

  async register(registerDto: any) {
    const { email, password, firstName, lastName, username } = registerDto;
    
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          username: username,
          role: 'STUDENT',
        },
      },
    });

    if (error) {
      throw error;
    }

    return {
      success: true,
      message: 'User registered successfully. Please verify email if required.',
      data: data,
    };
  }

  async login(loginDto: any) {
    const { email, password } = loginDto;

    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    let userProfile: any = null;
    if (data.user) {
      userProfile = await this.getUserProfile(data.user.id);
    }

    return {
      success: true,
      data: {
        session: data.session,
        profile: userProfile,
      },
    };
  }

  async logout(token: string) {
    const { error } = await this.client.auth.admin.signOut(token);
    
    if (error) {
      console.error('Logout error:', error.message);
    }

    return {
      success: true,
      message: 'Successfully logged out.',
    };
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(private supabaseService: SupabaseService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.substring(7);
    const authUser = await this.supabaseService.getUserFromToken(token);

    if (!authUser) {
      throw new UnauthorizedException('Invalid token');
    }

    // Get full user profile with educational context
    const userProfile = await this.supabaseService.getUserProfile(authUser.id);

    if (!userProfile || !userProfile.isActive) {
      throw new UnauthorizedException('User profile not found or inactive');
    }

    // Attach both auth user and profile to request
    request.authUser = authUser;
    request.user = userProfile;

    return true;
  }
}

// Role-based authorization decorator
export const RequireRoles = (...roles: UserRole[]) =>
  SetMetadata('roles', roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) { }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<UserRole[]>(
      'roles',
      context.getHandler(),
    );
    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return requiredRoles.includes(user.role);
  }
}

// Class enrollment guard
@Injectable()
export class ClassMemberGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const classInstanceId =
      request.params.classInstanceId || request.body.classInstanceId;

    if (!classInstanceId) return false;

    // Check if user is enrolled or teaching in the class
    const enrollment = await this.prisma.classEnrollment.findFirst({
      where: {
        classInstanceId,
        userId: user.id,
      },
    });

    if (enrollment) return true;

    // Check if user is teaching assignments in this class
    const teachingAssignment = await this.prisma.assignment.findFirst({
      where: {
        classInstanceId,
        teacherId: user.id,
      },
    });

    return !!teachingAssignment || user.role === 'ADMIN';
  }
}

// Assignment grading permission guard
@Injectable()
export class CanGradeGuard implements CanActivate {
  constructor(private prisma: PrismaService) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const assignmentId =
      request.params.assignmentId || request.body.assignmentId;

    if (!assignmentId) return false;

    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { teacherId: true },
    });

    return assignment?.teacherId === user.id || user.role === 'ADMIN';
  }
}

// Prisma middleware for RLS context
export function createRLSMiddleware() {
  return async (params: any, next: any) => {
    // Set RLS context for user queries
    if (params.model && params.action) {
      const user = getCurrentUser(); // Get from request context
      if (user && 'authUserId' in user && user.authUserId) {
        // Set the user context for RLS policies
        await params.runInTransaction(async (prisma: any) => {
          await prisma.$executeRaw`
            SELECT set_config('request.jwt.claim.sub', ${user.authUserId}, TRUE)
          `;
          return next(params);
        });
      }
    }
    return next(params);
  };
}

// Helper to get current user from context
function getCurrentUser(): { authUserId?: string } | null {
  // Implementation depends on your request context setup
  // This could use AsyncLocalStorage or similar
  return null; // Placeholder
}
