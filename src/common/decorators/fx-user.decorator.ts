import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IFXUser } from '../interfaces';


export const FXUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: IFXUser }>();
    const user = request.user;

    return data ? user?.[data as keyof IFXUser] : user;
  },
);
