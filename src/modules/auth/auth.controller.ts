import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { RefreshDto } from './dtos/refresh.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  AuthResponseDto,
  RefreshResponseDto,
  UserResponseDto,
  ErrorResponseDto,
} from './dtos/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './rbac/roles.guard';
import { Roles } from './rbac/roles.decorator';
import { Role } from './rbac/roles.enum';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({
    summary: 'Register new patient account',
    description: `
      Register a new patient account with automatic profile creation.
      
      **Features:**
      - Creates User account with Patient role
      - Automatically generates Patient profile with QR code
      - Returns JWT tokens for immediate authentication
      - Sends email verification link (optional)
      
      **Rate Limit:** 3 attempts per 5 minutes per IP
      
      **Password Requirements:**
      - Minimum 8 characters
      - At least 1 uppercase letter
      - At least 1 lowercase letter
      - At least 1 number
      - At least 1 special character (@$!%*?&)
      
      **Post-Registration:**
      - Patient can complete profile: PATCH /patients/me/profile
      - Add phone, date of birth, medical information, etc.
    `,
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Registration successful. Returns user info and JWT tokens.',
    type: AuthResponseDto,
    example: {
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: '654abcdef123456789',
        email: 'patient@example.com',
        firstName: 'John',
        lastName: 'Doe',
        roles: ['Patient'],
        createdAt: '2024-11-26T10:30:00.000Z',
        updatedAt: '2024-11-26T10:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already exists',
    type: ErrorResponseDto,
    example: {
      statusCode: 400,
      message: 'User with this email already exists',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many registration attempts. Rate limit exceeded.',
    example: {
      statusCode: 429,
      message: 'ThrottlerException: Too Many Requests',
      error: 'Too Many Requests',
    },
  })
  @Throttle({ default: { limit: 3, ttl: 300000 } })
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @ApiOperation({
    summary: 'Login with email and password',
    description: `
      Authenticate user and receive JWT tokens.
      
      **Features:**
      - Supports all user roles (Patient, Doctor, Nurse, Admin, Receptionist)
      - Returns access token (15 minutes) and refresh token (7 days)
      - Account lockout after 5 failed attempts (60 minutes)
      - Validates email verification status
      
      **Rate Limit:** 5 attempts per 5 minutes per IP
      
      **Token Usage:**
      - **Access Token:** Include in Authorization header for API requests
        \`Authorization: Bearer <access_token>\`
      - **Refresh Token:** Use /auth/refresh endpoint when access token expires
      
      **Account Lockout:**
      - Locks after 5 consecutive failed login attempts
      - Automatic unlock after 60 minutes
      - Contact admin if locked
    `,
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Returns user info and JWT tokens.',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials or account locked',
    type: ErrorResponseDto,
    example: {
      statusCode: 401,
      message: 'Invalid email or password',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Account locked due to too many failed attempts',
    type: ErrorResponseDto,
    example: {
      statusCode: 403,
      message: 'Account is locked. Try again after 60 minutes.',
      error: 'Forbidden',
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many login attempts. Rate limit exceeded.',
  })
  @Throttle({ default: { limit: 5, ttl: 300000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // Rate limit refresh token endpoint (5 attempts per minute)
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary: 'Refresh access token',
    description: `
      Get a new access token using a valid refresh token.
      
      **When to use:**
      - Access token expired (15 minutes lifetime)
      - Received 401 Unauthorized with "Token expired" message
      
      **How it works:**
      1. Access token expires after 15 minutes
      2. Client sends refresh token to this endpoint
      3. Receive new access token + new refresh token
      4. Update stored tokens in client
      5. Continue making API requests
      
      **Refresh Token Lifetime:** 7 days
      
      **Security:**
      - Refresh tokens are single-use (rotation)
      - Old refresh token is invalidated after use
      - Store refresh token securely (HttpOnly cookie recommended)
      
      **Error Handling:**
      - If refresh token is invalid/expired, user must login again
    `,
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 200,
    description: 'Token refresh successful. Returns new tokens.',
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid or expired refresh token',
    type: ErrorResponseDto,
    example: {
      statusCode: 401,
      message: 'Invalid or expired refresh token',
      error: 'Unauthorized',
    },
  })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @ApiOperation({
    summary: 'Get current user profile',
    description: `
      Retrieve profile information for the authenticated user.
      
      **Authentication Required:** Yes (JWT Bearer Token)
      
      **Returns:**
      - User account information (email, name, roles)
      - Account status and timestamps
      
      **Usage:**
      \`\`\`
      GET /auth/profile
      Authorization: Bearer <access_token>
      \`\`\`
      
      **Related Endpoints:**
      - Patients: GET /patients/me/profile (detailed patient info)
      - Doctors: GET /doctors/me/profile (detailed doctor info)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Returns user profile information',
    type: UserResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @ApiOperation({
    summary: 'Logout user',
    description: `
      Logout the current user and invalidate refresh token.
      
      **Authentication Required:** Yes (JWT Bearer Token)
      
      **What happens:**
      - Invalidates the provided refresh token
      - Access token remains valid until expiration (15 minutes)
      - User must login again to get new tokens
      
      **Client Actions:**
      1. Call this endpoint with refresh token
      2. Clear stored access and refresh tokens
      3. Redirect user to login page
      
      **Note:** Access tokens cannot be revoked (stateless JWT). 
      They will expire automatically after 15 minutes.
    `,
  })
  @ApiBody({ type: RefreshDto })
  @ApiResponse({
    status: 204,
    description: 'Logout successful. Refresh token invalidated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiBearerAuth()
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Request() req: any, @Body() dto: RefreshDto) {
    await this.authService.logout(req.user.userId, dto.refreshToken);
  }

  @ApiOperation({
    summary: '[ADMIN ONLY] Create user with specific role',
    description: `
      Admin-only endpoint to create users with any role.
      
      **Authentication Required:** Yes (JWT Bearer Token)
      **Authorization Required:** Admin role
      
      **Use Cases:**
      - Create Doctor accounts for medical staff
      - Create Nurse accounts
      - Create Receptionist accounts
      - Create additional Admin accounts
      
      **Available Roles:**
      - Patient (use /auth/register instead for self-registration)
      - Doctor
      - Nurse
      - Admin
      - Receptionist
      
      **Profile Creation:**
      - Doctor role: Creates Doctor profile automatically
      - Patient role: Creates Patient profile automatically
      - Other roles: User account only (no profile)
      
      **Password Requirements:**
      - Same as registration (strong password validation)
      - User will receive email with login credentials (if email service enabled)
      
      **Post-Creation Steps:**
      1. User created successfully
      2. For doctors: Complete profile at /doctors/me/profile
      3. Send credentials to the new user securely
    `,
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully with specified role',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or email already exists',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin role required',
    type: ErrorResponseDto,
    example: {
      statusCode: 403,
      message: 'Insufficient permissions. Required roles: Admin',
      error: 'Forbidden',
    },
  })
  @Post('admin/create-user')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  async createUser(@Body() dto: CreateUserDto, @Request() req: any) {
    return this.authService.createUserWithRole(dto, req.user.userId);
  }
}
