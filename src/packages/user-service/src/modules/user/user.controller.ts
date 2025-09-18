import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  UserParamsDto,
  UserEmailParamsDto,
  User,
  createUserId,
  ApiResponse,
} from '@personal-context-router/shared';
import { UserService } from '../../services/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createUser(@Body(ValidationPipe) createUserDto: CreateUserDto): Promise<ApiResponse<User>> {
    const user = await this.userService.createUser(createUserDto);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
    };
  }

  @Get(':id')
  async getUser(@Param(ValidationPipe) params: UserParamsDto): Promise<ApiResponse<User>> {
    const userId = createUserId(params.id);
    const user = await this.userService.getUserById(userId);
    return {
      success: true,
      data: user,
    };
  }

  @Get()
  async getUsers(@Query(ValidationPipe) filter: UserFilterDto): Promise<ApiResponse<User[]>> {
    const users = Object.keys(filter).length > 0
      ? await this.userService.findUsers(filter)
      : await this.userService.getAllUsers();

    return {
      success: true,
      data: users,
    };
  }

  @Get('by-email/:email')
  async getUserByEmail(@Param(ValidationPipe) params: UserEmailParamsDto): Promise<ApiResponse<User>> {
    const user = await this.userService.getUserByEmail(params.email);
    return {
      success: true,
      data: user,
    };
  }

  @Put(':id')
  async updateUser(
    @Param(ValidationPipe) params: UserParamsDto,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ): Promise<ApiResponse<User>> {
    const userId = createUserId(params.id);
    const user = await this.userService.updateUser(userId, updateUserDto);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
    };
  }

  @Put(':id/login')
  async recordLogin(@Param(ValidationPipe) params: UserParamsDto): Promise<ApiResponse<User>> {
    const userId = createUserId(params.id);
    const user = await this.userService.recordLogin(userId);
    return {
      success: true,
      data: user,
      message: 'Login recorded successfully',
    };
  }

  @Put(':id/deactivate')
  async deactivateUser(@Param(ValidationPipe) params: UserParamsDto): Promise<ApiResponse<User>> {
    const userId = createUserId(params.id);
    const user = await this.userService.deactivateUser(userId);
    return {
      success: true,
      data: user,
      message: 'User deactivated successfully',
    };
  }

  @Delete(':id')
  async deleteUser(@Param(ValidationPipe) params: UserParamsDto): Promise<ApiResponse<void>> {
    const userId = createUserId(params.id);
    await this.userService.deleteUser(userId);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}