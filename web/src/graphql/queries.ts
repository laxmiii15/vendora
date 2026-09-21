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
      size
      imageUrl
      categoryId
      category {
        id
        name
        slug
      }
    }
  }
`;
