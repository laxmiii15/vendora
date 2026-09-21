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

export const GET_PRODUCT_BY_SLUG = gql`
  query GetProductBySlug($slug: String!) {
    productBySlug(slug: $slug) {
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

const ORDER_FIELDS = `
  id
  customerId
  status
  total
  createdAt
  items {
    id
    productId
    quantity
    unitPrice
    product {
      id
      name
      imageUrl
      size
    }
  }
`;

export const GET_MY_ORDERS = gql`
  query GetMyOrders {
    myOrders {
      ${ORDER_FIELDS}
    }
  }
`;

export const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    order(id: $id) {
      ${ORDER_FIELDS}
    }
  }
`;
