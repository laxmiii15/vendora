import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../../generated/prisma/client";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { GqlExecutionContext } from "@nestjs/graphql";
import { JwtPayload } from "../types/jwt-payload.type";






@Injectable()
export class RolesGuard implements CanActivate  {
 constructor(private readonly reflector: Reflector) {}
 
 canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [context.getHandler(), context.getClass()],
);

if (!requiredRoles || requiredRoles.length === 0)
{
    return true;
}

const gqlContext = GqlExecutionContext.create(context);
const request = gqlContext.getContext().req;

const user = request.user as JwtPayload | undefined;

if (!user) {
    throw new ForbiddenException("User is not authenticated");
}
if (!requiredRoles.includes(user.role)) {
    throw new ForbiddenException("Do not have permission to access this resources");

}
return true;
}
}