import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { clearStoredSession, getStoredToken } from './auth-storage';

const PUBLIC_AUTH_PATHS = ['/login', '/register'];

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
});

// Reads the token fresh from storage on every request, rather than closing
// over a value, so login/logout take effect immediately without recreating
// the client.
const authLink = new SetContextLink((prevContext) => {
  const token = getStoredToken();
  return {
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
});

// The backend's access tokens are short-lived and there's no refresh-token
// flow yet, so a stale token just gets rejected with UNAUTHENTICATED. Rather
// than let that surface as a raw error on whatever page the user happens to
// be on, drop the stale session and send them back to log in. A full page
// redirect also clears Apollo's in-memory cache.
const errorLink = new ErrorLink(({ error }) => {
  if (typeof window === 'undefined') return;
  if (PUBLIC_AUTH_PATHS.includes(window.location.pathname)) return;

  const isUnauthenticated =
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((e) => e.extensions?.code === 'UNAUTHENTICATED');

  if (isUnauthenticated) {
    clearStoredSession();
    // A full reload (not useRouter, which isn't available in an Apollo Link)
    // is deliberate — it also clears Apollo's in-memory cache of stale data.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.href = '/login';
  }
});

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
