import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';
import { GitHubService } from './github.service';

@ApiTags('github')
@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('repo/:owner/:repo')
  @ApiOperation({ summary: 'Get a specific GitHub repository' })
  @ApiParam({ name: 'owner', description: 'Repository owner username' })
  @ApiParam({ name: 'repo', description: 'Repository name' })
  @ApiResponse({ status: 200, description: 'Repository data retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Repository not found' })
  async getRepo(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getRepo(owner, repo);
  }

  @Get('user/:username/repos')
  @ApiOperation({ summary: 'Get all repositories for a GitHub user' })
  @ApiParam({ name: 'username', description: 'GitHub username' })
  @ApiResponse({ status: 200, description: 'User repositories retrieved successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRepos(@Param('username') username: string) {
    return this.githubService.getUserRepos(username);
  }

  @Get('test')
  @ApiOperation({ summary: 'Test endpoint to verify service is running' })
  @ApiResponse({ status: 200, description: 'Service status' })
  async test() {
    return {
      message: 'GitHub service is running!',
      timestamp: new Date().toISOString()
    };
  }
}