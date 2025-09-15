import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { Observable } from 'rxjs';
import { GitHubService } from './github.service';

@ApiTags('github')
@Controller('api/github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('repo/:owner/:repo')
  @ApiOperation({ summary: 'Get a specific GitHub repository' })
  @ApiParam({ name: 'owner', description: 'Repository owner username' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiResponse({ status: 200, description: 'Repository data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Repository not found' })
  getRepo(@Param('owner') owner: string, @Param('repo') repo: string): Observable<any> {
    return this.githubService.getRepo(owner, repo);
  }

  @Get('user/:username/repos')
  @ApiOperation({ summary: 'Get all repositories for a GitHub user' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({ status: 200, description: 'User repositories retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  getUserRepos(@Param('username') username: string): Observable<any> {
    return this.githubService.getUserRepos(username);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test GitHub service connectivity' })
  @ApiResponse({ status: 200, description: 'GitHub service status' })
  test(): Observable<any> {
    return this.githubService.test();
  }

  @Get('health')
  @ApiOperation({ summary: 'GitHub service health check' })
  @ApiResponse({ status: 200, description: 'GitHub service is healthy' })
  @ApiResponse({ status: 503, description: 'GitHub service is unhealthy' })
  healthCheck(): Observable<any> {
    return this.githubService.healthCheck();
  }
}