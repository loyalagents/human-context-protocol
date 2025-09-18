import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Observable } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  UserParamsDto,
  UserEmailParamsDto,
  User,
  ApiResponse,
  createUserId
} from '@personal-context-router/shared';
import { UserService } from './user.service';

@ApiTags('users')
@Controller('api/users')
@UseGuards(ThrottlerGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  createUser(@Body() createUserDto: CreateUserDto): Observable<ApiResponse<User>> {
    return this.userService.createUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users or filter users' })
  getUsers(@Query() filter: UserFilterDto): Observable<ApiResponse<User[]>> {
    return Object.keys(filter).length > 0
      ? this.userService.findUsers(filter)
      : this.userService.getAllUsers();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  getUser(@Param() params: UserParamsDto): Observable<ApiResponse<User>> {
    const userId = createUserId(params.id);
    return this.userService.getUserById(userId);
  }

  @Get('by-email/:email')
  @ApiOperation({ summary: 'Get user by email' })
  @ApiParam({ name: 'email', description: 'User email' })
  getUserByEmail(@Param() params: UserEmailParamsDto): Observable<ApiResponse<User>> {
    return this.userService.getUserByEmail(params.email);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  updateUser(
    @Param() params: UserParamsDto,
    @Body() updateUserDto: UpdateUserDto,
  ): Observable<ApiResponse<User>> {
    const userId = createUserId(params.id);
    return this.userService.updateUser(userId, updateUserDto);
  }

  @Put(':id/login')
  @ApiOperation({ summary: 'Record user login' })
  @ApiParam({ name: 'id', description: 'User ID' })
  recordLogin(@Param() params: UserParamsDto): Observable<ApiResponse<User>> {
    const userId = createUserId(params.id);
    return this.userService.recordLogin(userId);
  }

  @Put(':id/deactivate')
  @ApiOperation({ summary: 'Deactivate user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  deactivateUser(@Param() params: UserParamsDto): Observable<ApiResponse<User>> {
    const userId = createUserId(params.id);
    return this.userService.deactivateUser(userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  deleteUser(@Param() params: UserParamsDto): Observable<ApiResponse<void>> {
    const userId = createUserId(params.id);
    return this.userService.deleteUser(userId);
  }
}