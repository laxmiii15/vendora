import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { getStoredToken } from './auth-storage';

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

export const apolloClient = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  cache: new InMemoryCache(),
});
