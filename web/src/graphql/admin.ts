import { gql } from '@apollo/client';

const ADMIN_PRODUCT_FIELDS = `
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
  }
  createdAt
`;

const ADMIN_USER_FIELDS = `
  id
  email
  firstName
  lastName
  role
  status
  createdAt
`;

export const ADMIN_STATS = gql`
  query AdminStats {
    adminStats {
      revenue
      orderCount
      pendingOrderCount
      customerCount
      activeProductCount
      lowStockCount
    }
  }
`;

export const ADMIN_ORDERS = gql`
  query AdminOrders(
    $page: Int
    $pageSize: Int
    $search: String
    $status: OrderStatus
  ) {
    adminOrders(
      page: $page
      pageSize: $pageSize
      search: $search
      status: $status
    ) {
      total
      page
      pageSize
      items {
        id
        status
        total
        createdAt
        customer {
          id
          email
          firstName
          lastName
        }
        items {
          id
          quantity
          unitPrice
          product {
            id
            name
            size
          }
        }
      }
    }
  }
`;

export const ADMIN_PRODUCTS = gql`
  query AdminProducts(
    $page: Int
    $pageSize: Int
    $search: String
    $status: ProductStatus
  ) {
    adminProducts(
      page: $page
      pageSize: $pageSize
      search: $search
      status: $status
    ) {
      total
      page
      pageSize
      items {
        ${ADMIN_PRODUCT_FIELDS}
      }
    }
  }
`;

export const ADMIN_USERS = gql`
  query AdminUsers(
    $page: Int
    $pageSize: Int
    $search: String
    $role: UserRole
    $status: UserStatus
  ) {
    adminUsers(
      page: $page
      pageSize: $pageSize
      search: $search
      role: $role
      status: $status
    ) {
      total
      page
      pageSize
      items {
        ${ADMIN_USER_FIELDS}
      }
    }
  }
`;

export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: OrderStatus!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`;

export const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id) {
      id
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      slug
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: String!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      slug
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: String!) {
    deleteCategory(id: $id) {
      id
    }
  }
`;

export const UPDATE_USER_ROLE = gql`
  mutation UpdateUserRole($id: ID!, $role: UserRole!) {
    updateUserRole(id: $id, role: $role) {
      ${ADMIN_USER_FIELDS}
    }
  }
`;

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
    updateUserStatus(id: $id, status: $status) {
      ${ADMIN_USER_FIELDS}
    }
  }
`;
