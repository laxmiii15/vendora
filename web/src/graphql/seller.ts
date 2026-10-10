import { gql } from '@apollo/client';
import { ADMIN_PRODUCT_FIELDS } from './admin';

export const SELLER_STATS = gql`
  query SellerStats {
    sellerStats {
      revenue
      orderCount
      awaitingShipmentCount
      activeProductCount
      lowStockCount
    }
  }
`;

export const SELLER_PRODUCTS = gql`
  query SellerProducts(
    $page: Int
    $pageSize: Int
    $search: String
    $status: ProductStatus
  ) {
    sellerProducts(
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

export const SELLER_ORDERS = gql`
  query SellerOrders($page: Int, $pageSize: Int, $status: OrderStatus) {
    sellerOrders(page: $page, pageSize: $pageSize, status: $status) {
      total
      page
      pageSize
      items {
        id
        status
        subtotal
        createdAt
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
