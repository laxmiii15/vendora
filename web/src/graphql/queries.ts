import { gql } from '@apollo/client';

export const GET_CATEGORIES = gql`
  query GetCategories {
    getCategories {
      id
      name
      slug
    }
  }
`;

export const GET_PRODUCTS = gql`
  query GetProducts {
    getProducts {
      id
      name
      slug
      description
      price
      stock
      status
      categoryId
      category {
        id
        name
        slug
      }
    }
  }
`;
