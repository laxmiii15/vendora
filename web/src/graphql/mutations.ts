import { gql } from '@apollo/client';

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
        status
      }
    }
  }
`;

export const REGISTER = gql`
  mutation Register(
    $email: String!
    $password: String!
    $firstName: String
    $lastName: String
  ) {
    register(
      input: {
        email: $email
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      accessToken
      user {
        id
        email
        firstName
        lastName
        role
        status
      }
    }
  }
`;
