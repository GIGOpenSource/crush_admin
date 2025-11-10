import { request } from '@/utils/request';

/**
 * 订单管理相关接口
 */

export interface OrderItem {
  id: number;
  out_trade_no: string; // 订单号
  transaction_id: string | null;
  total_fee: number | null; // 金额
  payer_total: number | null; // 实付金额
  fee_type: string;
  openid: string; // 用户openid
  payer_account: string | null;
  product_name: string; // 商品信息
  product_type_name: string; // 商品类型
  mch_id: string;
  appid: string;
  sub_mch_id: string | null;
  trade_type: string;
  trade_state: string; // 支付状态：NOTPAY-待支付, SUCCESS-已完成, REFUND-已退款
  bank_type: string | null;
  created_time: string; // 创建时间
  pay_time: string | null;
  close_time: string | null;
  update_time: string;
  notify_time: string | null;
  is_notify_processed: boolean;
  body: string | null;
  attach: string | null;
  payer: number; // 用户ID
  product: number; // 商品ID
  // 兼容字段
  order_no?: string;
  product_info?: string;
  user_id?: number;
  product_type?: string;
  amount?: number;
  payment_status?: string | number;
  created_at?: string;
}

export interface OrderListParams {
  currentPage?: number;
  pageSize?: number;
  keyword?: string; // 搜索关键词（订单号等）
  trade_state?: string; // 支付状态筛选：NOTPAY-待支付, SUCCESS-已完成, REFUND-已退款
}

export interface PaginationInfo {
  count?: number;
  total?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface OrderListData {
  results: OrderItem[];
  pagination: PaginationInfo;
}

export interface OrderListResponse {
  data: OrderListData;
}

/**
 * 获取订单列表
 */
export const getOrderListApi = (params?: OrderListParams) => {
  return request.get<OrderListResponse>({ url: '/api/wxpayOrder/', params });
};

