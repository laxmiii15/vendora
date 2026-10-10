import type { GraphQLFormattedError } from 'graphql';

// Nest's HttpExceptions (NotFoundException, ForbiddenException, ...) aren't
// GraphQLErrors, so Apollo tags every one of them INTERNAL_SERVER_ERROR. Map
// the HTTP status they carry to a proper code so clients can tell "not found"
// from "server crashed" — the web app relies on UNAUTHENTICATED to log out a
// stale session.
const CODE_BY_STATUS: Record<number, string> = {
  400: 'BAD_USER_INPUT',
  401: 'UNAUTHENTICATED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
};

export function formatGraphqlError(
  formatted: GraphQLFormattedError,
): GraphQLFormattedError {
  const original = formatted.extensions?.originalError as
    { statusCode?: number; message?: string | string[] } | undefined;
  const status = original?.statusCode;
  const code = status ? CODE_BY_STATUS[status] : undefined;

  if (!code) {
    return formatted;
  }

  // ValidationPipe puts the useful per-field messages in an array and leaves
  // the top-level message as a generic "Bad Request Exception".
  const message = Array.isArray(original?.message)
    ? original.message.join('; ')
    : formatted.message;

  return {
    ...formatted,
    message,
    extensions: { ...formatted.extensions, code, status },
  };
}
