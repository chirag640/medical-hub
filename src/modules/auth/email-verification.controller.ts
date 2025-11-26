import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
import { EmailVerificationService } from './email-verification.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { IsString, IsNotEmpty } from 'class-validator';

class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token received via email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @ApiOperation({
    summary: 'Resend email verification link',
    description: `
      Request a new email verification link.
      
      **Authentication Required:** Yes (JWT Bearer Token)
      
      **Use Cases:**
      - Original verification email expired
      - Verification email not received
      - Email address changed
      
      **What Happens:**
      1. New verification token generated
      2. Email sent with verification link
      3. Previous token invalidated
      
      **Link Format:** {FRONTEND_URL}/verify-email?token=...
      
      **Expiration:** Verification links expire after 24 hours
      
      **Note:** Cannot resend if email already verified.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Verification email sent successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Verification email sent' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Email already verified',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Email is already verified' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing token',
  })
  @Post('resend-verification')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async resendVerification(@Request() req: any) {
    await this.emailVerificationService.sendVerificationEmail(req.user.sub);
    return { message: 'Verification email sent' };
  }

  @ApiOperation({
    summary: 'Verify email address',
    description: `
      Verify user's email address using token from verification email.
      
      **Authentication Required:** No (public endpoint)
      
      **Workflow:**
      1. User registers → Verification email sent
      2. User clicks link in email → Redirects to frontend
      3. Frontend extracts token → Calls this endpoint
      4. Email verified → User can access full features
      
      **Token Source:** Sent via email after registration
      
      **Token Format:** JWT containing user ID and expiration
      
      **Expiration:** 24 hours from email send
      
      **After Verification:**
      - Email marked as verified in user record
      - User gains full account access
      - Some features may require verified email
      
      **Error Cases:**
      - Token expired: Request new token via /auth/resend-verification
      - Token invalid: Contact support
      - Already verified: No action needed
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Email successfully verified',
    schema: {
      properties: {
        message: { type: 'string', example: 'Email verified successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid or expired verification token' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @Post('verify-email')
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.emailVerificationService.verifyEmail(dto.token);
  }
}
