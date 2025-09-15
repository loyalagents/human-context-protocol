import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class GitHubService {
  private readonly githubServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const host = this.configService.get<string>('services.github.host');
    const port = this.configService.get<number>('services.github.port');
    this.githubServiceUrl = `http://${host}:${port}`;
  }

  getRepo(owner: string, repo: string): Observable<any> {
    return this.httpService
      .get(`${this.githubServiceUrl}/github/repo/${owner}/${repo}`)
      .pipe(map(response => response.data));
  }

  getUserRepos(username: string): Observable<any> {
    return this.httpService
      .get(`${this.githubServiceUrl}/github/user/${username}/repos`)
      .pipe(map(response => response.data));
  }

  test(): Observable<any> {
    return this.httpService
      .get(`${this.githubServiceUrl}/github/test`)
      .pipe(map(response => response.data));
  }

  healthCheck(): Observable<any> {
    return this.httpService
      .get(`${this.githubServiceUrl}/health`)
      .pipe(map(response => response.data));
  }
}