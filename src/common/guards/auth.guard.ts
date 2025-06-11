import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      throw new UnauthorizedException(
        'Missing or invalid authorization header',
      );
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf8',
    );

    const configCredentials = process.env.BASIC_AUTH_CREDENTIALS;

    if (!configCredentials) {
      throw new UnauthorizedException('Server configuration error');
    }

    if (!this.safeCompare(credentials, configCredentials)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return true;
  }

  private safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let result = 0;

    for (let i = 0; i < a.length; i++) {
      result |= a.codePointAt(i)! ^ b.codePointAt(i)!;
    }

    return result === 0;
  }
}
