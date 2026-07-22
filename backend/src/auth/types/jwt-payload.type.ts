import { UserRole } from '../../generated/prisma/client';

// Shape of the object attached to `request.user` after the JWT strategy runs.
// The strategy loads the full user from the DB, so `role` is available here.
export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
}
