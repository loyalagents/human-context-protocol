import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserDto,
  UserFilterDto,
  User,
  ApiResponse,
  UserId
} from '@personal-context-router/shared';

@Injectable()
export class UserService {
  constructor(
    @Inject('USER_SERVICE') private userClient: ClientProxy,
  ) {}

  createUser(createUserDto: CreateUserDto): Observable<ApiResponse<User>> {
    return this.userClient.send('createUser', createUserDto);
  }

  getUserById(id: UserId): Observable<ApiResponse<User>> {
    return this.userClient.send('getUserById', { id });
  }

  getUserByEmail(email: string): Observable<ApiResponse<User>> {
    return this.userClient.send('getUserByEmail', { email });
  }

  updateUser(id: UserId, updateUserDto: UpdateUserDto): Observable<ApiResponse<User>> {
    return this.userClient.send('updateUser', { id, updateUserDto });
  }

  recordLogin(id: UserId): Observable<ApiResponse<User>> {
    return this.userClient.send('recordLogin', { id });
  }

  deactivateUser(id: UserId): Observable<ApiResponse<User>> {
    return this.userClient.send('deactivateUser', { id });
  }

  deleteUser(id: UserId): Observable<ApiResponse<void>> {
    return this.userClient.send('deleteUser', { id });
  }

  findUsers(filter: UserFilterDto): Observable<ApiResponse<User[]>> {
    return this.userClient.send('findUsers', filter);
  }

  getAllUsers(): Observable<ApiResponse<User[]>> {
    return this.userClient.send('getAllUsers', {});
  }
}