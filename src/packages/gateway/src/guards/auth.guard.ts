import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

interface AuthResponse {
  valid: boolean;
  userId?: string;
  message?: string;
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly authServiceUrl: string;

  constructor(private configService: ConfigService) {
    this.authServiceUrl = this.configService.get<string>('services.auth.url') || 'http://auth-service:3004';
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    // Skip authentication for health checks and other non-protected routes
    if (this.isPublicRoute(request.path)) {
      return true;
    }

    // Extract credentials from Basic Auth header
    const authHeader = request.headers.authorization;
    if (!authHeader?.startsWith('Basic ')) {
      throw new UnauthorizedException({
        error: 'Authentication required',
        message: 'Please provide Basic Auth credentials (username:password)'
      });
    }

    // Decode Basic Auth
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [username, password] = credentials.split(':');

    if (!username || !password) {
      throw new UnauthorizedException({
        error: 'Invalid credentials format',
        message: 'Basic Auth must be in format username:password'
      });
    }

    try {
      // Validate with auth service
      const authResult = await this.validateCredentials(username, password);

      if (authResult.valid && authResult.userId) {
        // Add user context to request for downstream services
        request.userId = authResult.userId;
        request.headers['x-user-id'] = authResult.userId;

        console.log(`✅ Authentication successful for user: ${username}`);
        return true;
      } else {
        console.log(`❌ Authentication failed for user: ${username}`);
        throw new UnauthorizedException({
          error: 'Authentication failed',
          message: authResult.message || 'Invalid credentials'
        });
      }
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      console.error('Authentication guard error:', error);
      throw new UnauthorizedException({
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
  }

  /**
   * Validate credentials with auth service
   */
  private async validateCredentials(username: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${this.authServiceUrl}/validate`, {
        username,
        password
      }, {
        timeout: 5000 // 5 second timeout
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          return {
            valid: false,
            message: 'Invalid credentials'
          };
        }
      }

      console.error('Auth service request failed:', error);
      throw new Error('Auth service unavailable');
    }
  }

  /**
   * Check if route should bypass authentication
   */
  private isPublicRoute(path: string): boolean {
    const publicRoutes = [
      '/health',
      '/api/docs',
      '/api/status'
    ];

    return publicRoutes.some(route => path.startsWith(route));
  }
}