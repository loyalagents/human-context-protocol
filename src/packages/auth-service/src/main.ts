import express from 'express';
import cors from 'cors';
import * as dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

interface AuthRequest {
  username: string;
  password: string;
}

interface AuthResponse {
  valid: boolean;
  userId?: string;
  message?: string;
}

interface ValidateTokenRequest {
  token: string;
}

class AuthService {
  private app: express.Application;
  private port: number;
  private adminUsername: string;
  private adminPasswordHash: string;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3004');

    // Get credentials from environment
    this.adminUsername = process.env.AUTH_USERNAME || 'admin';
    const adminPassword = process.env.AUTH_PASSWORD || 'password123';

    // Hash the password for secure comparison
    this.adminPasswordHash = bcrypt.hashSync(adminPassword, 10);

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes() {
    // Health check
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        service: 'auth-service',
        timestamp: new Date().toISOString()
      });
    });

    // Simple authentication endpoint
    this.app.post('/validate', (req, res) => {
      try {
        const { username, password }: AuthRequest = req.body;

        if (!username || !password) {
          const response: AuthResponse = {
            valid: false,
            message: 'Username and password required'
          };
          return res.status(400).json(response);
        }

        // Check username and password
        const isValidUsername = username === this.adminUsername;
        const isValidPassword = bcrypt.compareSync(password, this.adminPasswordHash);

        if (isValidUsername && isValidPassword) {
          const response: AuthResponse = {
            valid: true,
            userId: 'admin-user-id',
            message: 'Authentication successful'
          };
          res.json(response);
        } else {
          const response: AuthResponse = {
            valid: false,
            message: 'Invalid credentials'
          };
          res.status(401).json(response);
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        const response: AuthResponse = {
          valid: false,
          message: 'Internal server error'
        };
        res.status(500).json(response);
      }
    });

    // Simple token validation (for future use)
    this.app.post('/validate-token', (req, res) => {
      try {
        const { token }: ValidateTokenRequest = req.body;

        // For now, just check if token matches admin credentials base64 encoded
        // This is simple and will be replaced with JWT in the future
        const expectedToken = Buffer.from(`${this.adminUsername}:${process.env.AUTH_PASSWORD}`).toString('base64');

        if (token === expectedToken) {
          const response: AuthResponse = {
            valid: true,
            userId: 'admin-user-id',
            message: 'Token valid'
          };
          res.json(response);
        } else {
          const response: AuthResponse = {
            valid: false,
            message: 'Invalid token'
          };
          res.status(401).json(response);
        }
      } catch (error) {
        console.error('Token validation error:', error);
        const response: AuthResponse = {
          valid: false,
          message: 'Internal server error'
        };
        res.status(500).json(response);
      }
    });

    // Future extension points (commented out for now)
    /*
    this.app.post('/login', (req, res) => {
      // Future: Return JWT token
    });

    this.app.post('/register', (req, res) => {
      // Future: User registration
    });

    this.app.get('/user/:userId', (req, res) => {
      // Future: Get user profile
    });
    */
  }

  public start() {
    this.app.listen(this.port, () => {
      console.log(`🔐 Auth Service started on port ${this.port}`);
      console.log(`🏥 Health check: http://localhost:${this.port}/health`);
      console.log(`👤 Admin username: ${this.adminUsername}`);
      console.log(`⚡ Ready to validate authentication requests`);
    });
  }
}

// Start the auth service
const authService = new AuthService();
authService.start();