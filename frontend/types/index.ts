export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  sku?: string;
  category?: string;
  imageUrl?: string;
  active: boolean;
}

export interface PageResult<T> {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  content: T[];
}

export interface CreateOrderItemDto {
  productId: number;
  quantity: number;
}

export interface CreateOrderDto {
  userId: number;
  shippingAddress: string;
  items: CreateOrderItemDto[];
  idempotencyKey?: string;
}

export interface OrderDto {
  id: number;
  orderCode: string;
  userId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  shippingAddress: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName?: string;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface PaymentRequest {
  paymentMethod: 'COD' | 'MOMO' | 'VNPAY';
  amount?: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}
