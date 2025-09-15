import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Octokit } from '@octokit/rest';

@Injectable()
export class GitHubService {
  private octokit: Octokit;

  constructor(private configService: ConfigService) {
    const token = this.configService.get<string>('github.token');
    this.octokit = new Octokit({
      auth: token,
    });
  }

  async getRepo(owner: string, repo: string) {
    try {
      const response = await this.octokit.rest.repos.get({
        owner,
        repo,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch repo: ${error.message}`);
    }
  }

  async getUserRepos(username: string) {
    try {
      const response = await this.octokit.rest.repos.listForUser({
        username,
        type: 'all',
        sort: 'updated',
        per_page: 100,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch user repos: ${error.message}`);
    }
  }
}