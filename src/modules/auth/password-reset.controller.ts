import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { PasswordResetService } from './password-reset.service';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';

@ApiTags('Authentication')
@Controller('auth')
export class PasswordResetController {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @ApiOperation({
    summary: 'Request password reset email',
    description: `
      Request a password reset link to be sent via email.
      
      **Authentication Required:** No (public endpoint)
      
      **Security:** Generic response prevents email enumeration
      - Always returns success message
      - Email sent only if account exists
      - No indication if email not found
      
      **Workflow:**
      1. User enters email
      2. If account exists, reset email sent
      3. User clicks link in email
      4. Frontend extracts token
      5. User enters new password
      6. Call /auth/reset-password with token
      
      **Email Contents:**
      - Password reset link: {FRONTEND_URL}/reset-password?token=...
      - Link expires in 1 hour
      - One-time use token
      
      **Rate Limiting:** Limited to prevent abuse
      
      **Use Cases:**
      - Forgot password
      - Compromised account recovery
      - Password change request
    `,
  })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Request processed - Check email if account exists',
    schema: {
      properties: {
        message: {
          type: 'string',
          example: 'If the email exists, a password reset link has been sent',
        },
      },
    },
  })
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.passwordResetService.requestPasswordReset(dto.email);
  }

  @ApiOperation({
    summary: 'Reset password using token',
    description: `
      Reset password using token received via email.
      
      **Authentication Required:** No (public endpoint - token-based)
      
      **Workflow:**
      1. User receives reset email
      2. Clicks link → Redirected to frontend reset page
      3. Frontend extracts token from URL
      4. User enters new password
      5. Frontend calls this endpoint with token + new password
      6. Password updated → User can login
      
      **Token Properties:**
      - One-time use (invalidated after use)
      - Expires in 1 hour
      - Cannot be reused
      
      **Password Requirements:**
      - Minimum 8 characters
      - At least 1 uppercase letter
      - At least 1 lowercase letter
      - At least 1 number
      - At least 1 special character
      
      **After Reset:**
      - All existing sessions invalidated
      - Refresh tokens revoked
      - User must login with new password
      
      **Error Cases:**
      - Token expired: Request new reset via /auth/forgot-password
      - Token invalid/used: Request new reset
      - Weak password: Returns validation error
    `,
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successfully',
    schema: {
      properties: {
        message: { type: 'string', example: 'Password has been reset successfully' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired token, or password validation error',
    schema: {
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: {
          type: 'string',
          example: 'Invalid or expired reset token',
        },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.passwordResetService.resetPassword(dto.token, dto.newPassword);
  }
}
