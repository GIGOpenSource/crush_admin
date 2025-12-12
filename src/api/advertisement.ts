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
  location?: string; // 位置（列表接口）
  positions?: string; // 位置（详情接口）
  weight?: number; // 权重
  status: boolean | string; // 状态：true-启用，false-禁用，或字符串 'pending'/'active'
  jump_link?: string; // 跳转链接（列表接口）
  redirect_url?: string; // 跳转链接（详情接口）
  display_start_time?: string; // 显示开始时间（列表接口）
  display_end_time?: string; // 显示结束时间（列表接口）
  start_time?: string; // 显示开始时间（详情接口）
  end_time?: string; // 显示结束时间（详情接口）
  delivery_period?: string; // 投放时段：all-全时段，specified-指定时段（列表接口）
  schedule_type?: string; // 投放时段：all_time-全时段，specified-指定时段（详情接口）
  specified_start_time?: string; // 指定时段开始时间（旧字段，兼容）
  specified_end_time?: string; // 指定时段结束时间（旧字段，兼容）
  deliver_start_time?: string; // 投放开始时间（HH:mm格式）
  deliver_end_time?: string; // 投放结束时间（HH:mm格式）
  target_audience?: string; // 推送人群：all-全部人群，non_member-非会员用户（列表接口）
  audience_type?: string; // 推送人群：all-全部人群，non_vip-非会员用户（详情接口）
  platform?: string; // 平台类型：xhs_mini-小红书, fbook_mini-feekbook, ins_mini-ins, google_mini-googole, ios_mini-苹果, apk_mini-安卓
  created_at: string; // 创建时间
}

export interface AdvertisementListParams {
  currentPage?: number;
  pageSize?: number;
  search?: string; // 搜索关键词（广告名称）
  name?: string; // 广告名称搜索
  status?: string; // 状态筛选：active-启用，inactive-禁用
  platform?: string; // 平台筛选：xhs_mini, fbook_mini, ins_mini, google_mini, ios_mini, apk_mini
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
  return request.get<AdvertisementListResponse>({ url: '/api/adv/', params });
};
/**
 * 广告详情
 * @param id 广告ID
 */
export const detailsAdvertisementApi = (id: number) => {
  return request.get({
    url: `/api/adv/${id}/`,
  });
};

/**
 * 删除广告
 * @param id 广告ID
 */
export const deleteAdvertisementApi = (id: number) => {
  return request.delete({
    url: `/api/adv/${id}/`,
  });
};

/**
 * 修改广告状态
 * @param id 广告ID
 * @param status 状态
 */
export const updateAdvertisementStatusApi = (id: number, status:string) => {
  return request.put({
    url: `/api/adv/${id}/`,
    data: {
      status,
    },
  });
};
//新增
export const createAdvertisementApi = (params?: AdvertisementItem) => {
  return request.post<AdvertisementListResponse>({ url: '/api/adv/', params });
};
//更新
export const updateAdvertisementApi = (id: number,params?:AdvertisementItem) => {
  return request.put<AdvertisementListResponse>({ url: `/api/adv/${id}/`, params });
};

