import { request } from '@/utils/request';

/**
 * 广告管理相关接口
 */

export interface AdvertisementItem {
  id: number;
  name: string; // 广告名称
  api_key?: string; // API Key
  api_secret?: string; // API Secret
  access_token?: string; // Access Token
  location?: string; // 位置
  weight?: number; // 权重
  status: boolean; // 状态：true-启用，false-禁用
  jump_link?: string; // 跳转链接
  display_start_time?: string; // 显示开始时间
  display_end_time?: string; // 显示结束时间
  delivery_period?: string; // 投放时段：all-全时段，specified-指定时段
  specified_start_time?: string; // 指定时段开始时间
  specified_end_time?: string; // 指定时段结束时间
  target_audience?: string; // 推送人群：all-全部人群，non_member-非会员用户
  created_at: string; // 创建时间
}

export interface AdvertisementListParams {
  currentPage?: number;
  pageSize?: number;
  search?: string; // 搜索关键词（广告名称）
  status?: string; // 状态筛选：active-启用，inactive-禁用
}

export interface PaginationInfo {
  count?: number;
  total?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface AdvertisementListData {
  results: AdvertisementItem[];
  pagination: PaginationInfo;
}

export interface AdvertisementListResponse {
  data: AdvertisementListData;
}

/**
 * 获取广告列表
 */
export const getAdvertisementListApi = (params?: AdvertisementListParams) => {
  return request.get<AdvertisementListResponse>({ url: '/api/advertisement/', params });
};

/**
 * 删除广告
 * @param id 广告ID
 */
export const deleteAdvertisementApi = (id: number) => {
  return request.delete({
    url: `/api/advertisement/${id}/`,
  });
};

/**
 * 更新广告状态
 * @param id 广告ID
 * @param status 状态
 */
export const updateAdvertisementStatusApi = (id: number, status: boolean) => {
  return request.patch({
    url: `/api/advertisement/${id}/`,
    data: {
      status,
    },
  });
};

