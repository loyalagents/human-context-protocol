import type { Tool } from '@modelcontextprotocol/sdk/types.js' with { "resolution-mode": "import" };
import { GatewayClientService } from '../services/gateway-client.service';

export class GitHubTools {
  constructor(private gatewayClient: GatewayClientService) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_github_repo',
        description: 'Get detailed information about a specific GitHub repository',
        inputSchema: {
          type: 'object',
          properties: {
            owner: {
              type: 'string',
              description: 'The username or organization that owns the repository'
            },
            repo: {
              type: 'string',
              description: 'The repository name'
            }
          },
          required: ['owner', 'repo']
        }
      },
      {
        name: 'get_user_repos',
        description: 'Get all repositories for a GitHub user or organization',
        inputSchema: {
          type: 'object',
          properties: {
            username: {
              type: 'string',
              description: 'The GitHub username or organization name'
            }
          },
          required: ['username']
        }
      }
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'get_github_repo':
          return await this.gatewayClient.getGitHubRepo(args.owner, args.repo);

        case 'get_user_repos':
          return await this.gatewayClient.getUserRepos(args.username);

        default:
          throw new Error(`Unknown GitHub tool: ${name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to execute ${name}: ${errorMessage}`);
    }
  }
}
