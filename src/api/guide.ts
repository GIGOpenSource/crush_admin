import { request } from '@/utils/request';

/**
 * 新手引导相关接口
 */

export interface GuideItem {
  id: number;
  order: number; // 排序
  title: string; // 引导图注释
  image_url?: string; // 引导图片URL
  created_at?: string;
  updated_at?: string;
}

export interface GuideListParams {
  currentPage?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  count?: number;
  total?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface GuideListData {
  results: GuideItem[];
  pagination: PaginationInfo;
}

export interface GuideListResponse {
  data: GuideListData;
}

/**
 * 获取新手引导列表
 */
export const getGuideListApi = (params?: GuideListParams) => {
  return request.get<GuideListResponse>({ url: '/api/guid/', params });
};

/**
 * 创建新手引导
 */
export const createGuideApi = (data: Partial<GuideItem>) => {
  return request.post({ url: '/api/guid/', data });
};

/**
 * 更新新手引导
 */
export const updateGuideApi = (id: number, data: Partial<GuideItem>) => {
  return request.put({ url: `/api/guid/${id}/`, data });
};

/**
 * 删除新手引导
 */
export const deleteGuideApi = (id: number) => {
  return request.delete({ url: `/api/guid/${id}/` });
};

/**
 * 获取新手引导详情
 */
export const getGuideDetailApi = (id: number) => {
  return request.get<{ data: GuideItem }>({ url: `/api/guid/${id}/` });
};

