import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  valid: boolean;
  userId?: string;
  message?: string;
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export class AuthMiddleware {
  private authServiceUrl: string;

  constructor(authServiceUrl: string = 'http://auth-service:3004') {
    this.authServiceUrl = authServiceUrl;
  }

  /**
   * Express middleware to validate authentication
   */
  public authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      // Skip authentication for health checks and other non-protected routes
      if (this.isPublicRoute(req.path)) {
        return next();
      }

      // Extract credentials from Basic Auth header
      const authHeader = req.headers.authorization;
      if (!authHeader?.startsWith('Basic ')) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'Please provide Basic Auth credentials (username:password)'
        });
      }

      // Decode Basic Auth
      const base64Credentials = authHeader.split(' ')[1];
      const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
      const [username, password] = credentials.split(':');

      if (!username || !password) {
        return res.status(401).json({
          error: 'Invalid credentials format',
          message: 'Basic Auth must be in format username:password'
        });
      }

      // Validate with auth service
      const authResult = await this.validateCredentials(username, password);

      if (authResult.valid && authResult.userId) {
        // Add user context to request for downstream services
        req.userId = authResult.userId;
        req.headers['x-user-id'] = authResult.userId;

        console.log(`✅ Authentication successful for user: ${username}`);
        next();
      } else {
        console.log(`❌ Authentication failed for user: ${username}`);
        res.status(401).json({
          error: 'Authentication failed',
          message: authResult.message || 'Invalid credentials'
        });
      }
    } catch (error) {
      console.error('Authentication middleware error:', error);
      res.status(500).json({
        error: 'Authentication service unavailable',
        message: 'Please try again later'
      });
    }
  };

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

// Create singleton instance
export const authMiddleware = new AuthMiddleware();

// Export the middleware function for easy use
export const authenticate = authMiddleware.authenticate;