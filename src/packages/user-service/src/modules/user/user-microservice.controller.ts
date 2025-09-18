import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { User, UserId, createUserId, CreateUserDto, UpdateUserDto, UserFilterDto, ApiResponse } from '@personal-context-router/shared';
import { UserService } from '../../services/user.service';

@Controller()
export class UserMicroserviceController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('createUser')
  async createUser(@Payload() createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.createUser(createUserDto);
      return {
        success: true,
        data: user,
        message: 'User created successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create user',
      };
    }
  }

  @MessagePattern('getUserById')
  async getUserById(@Payload() payload: { id: UserId }): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.getUserById(payload.id);
      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user',
      };
    }
  }

  @MessagePattern('getUserByEmail')
  async getUserByEmail(@Payload() payload: { email: string }): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.getUserByEmail(payload.email);
      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user',
      };
    }
  }

  @MessagePattern('updateUser')
  async updateUser(@Payload() payload: { id: UserId; updateUserDto: UpdateUserDto }): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.updateUser(payload.id, payload.updateUserDto);
      return {
        success: true,
        data: user,
        message: 'User updated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update user',
      };
    }
  }

  @MessagePattern('recordLogin')
  async recordLogin(@Payload() payload: { id: UserId }): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.recordLogin(payload.id);
      return {
        success: true,
        data: user,
        message: 'Login recorded successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to record login',
      };
    }
  }

  @MessagePattern('deactivateUser')
  async deactivateUser(@Payload() payload: { id: UserId }): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.deactivateUser(payload.id);
      return {
        success: true,
        data: user,
        message: 'User deactivated successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to deactivate user',
      };
    }
  }

  @MessagePattern('deleteUser')
  async deleteUser(@Payload() payload: { id: UserId }): Promise<ApiResponse<void>> {
    try {
      await this.userService.deleteUser(payload.id);
      return {
        success: true,
        message: 'User deleted successfully',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete user',
      };
    }
  }

  @MessagePattern('findUsers')
  async findUsers(@Payload() filter: UserFilterDto): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userService.findUsers(filter);
      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to find users',
      };
    }
  }

  @MessagePattern('getAllUsers')
  async getAllUsers(): Promise<ApiResponse<User[]>> {
    try {
      const users = await this.userService.getAllUsers();
      return {
        success: true,
        data: users,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get users',
      };
    }
  }

  @MessagePattern('user.validate')
  async validateUser(@Payload() userId: string): Promise<{ valid: boolean; user?: User }> {
    try {
      const id = createUserId(userId);
      return await this.userService.validateUserId(id);
    } catch (error) {
      return { valid: false };
    }
  }

  @MessagePattern('user.validate_bulk')
  async validateBulkUsers(@Payload() userIds: string[]): Promise<Array<{ id: string; valid: boolean; user?: User }>> {
    try {
      const ids = userIds.map(id => createUserId(id));
      const results = await this.userService.validateMultipleUserIds(ids);

      // Convert back to string IDs for response
      return results.map(result => ({
        id: result.id as string,
        valid: result.valid,
        user: result.user,
      }));
    } catch (error) {
      return userIds.map(id => ({ id, valid: false }));
    }
  }

  @MessagePattern('user.get_by_id')
  async getUserByIdLegacy(@Payload() userId: string): Promise<User | null> {
    try {
      const id = createUserId(userId);
      return await this.userService.getUserById(id);
    } catch (error) {
      return null;
    }
  }

  @MessagePattern('user.get_by_email')
  async getUserByEmailLegacy(@Payload() email: string): Promise<User | null> {
    try {
      return await this.userService.getUserByEmail(email);
    } catch (error) {
      return null;
    }
  }

  @MessagePattern('user.exists_by_email')
  async checkUserExistsByEmail(@Payload() email: string): Promise<{ exists: boolean; user?: User }> {
    try {
      const user = await this.userService.getUserByEmail(email);
      return { exists: true, user };
    } catch (error) {
      return { exists: false };
    }
  }

  @MessagePattern('user.record_login')
  async recordLoginLegacy(@Payload() userId: string): Promise<User | null> {
    try {
      const id = createUserId(userId);
      return await this.userService.recordLogin(id);
    } catch (error) {
      return null;
    }
  }

  @MessagePattern('user.get_active_users')
  async getActiveUsers(): Promise<User[]> {
    try {
      return await this.userService.findUsers({ isActive: true });
    } catch (error) {
      return [];
    }
  }
}