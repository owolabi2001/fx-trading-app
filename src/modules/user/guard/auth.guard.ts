import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from 'src/common';


@Injectable()
export class UserAuthGuard extends AuthGuard('fx-user-strategy') {
  private readonly logger = new Logger(UserAuthGuard.name);
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  handleRequest(err: any, user, info: Error | undefined) {
    this.logger.log(info?.message ?? 'Allowing passage');

    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
