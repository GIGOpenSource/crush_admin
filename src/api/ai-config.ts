import { request } from '@/utils/request';

/**
 * AI配置相关接口
 */

export interface AIModelItem {
  id: number;
  name: string; // 模型名称
  address: string; // 模型地址
  api_key: string; // 模型apikey
  status: number; // 状态：1-开启, 0-关闭
  priority: number; // 优先级
  created_at: string; // 创建时间
}

export interface AIModelListParams {
  currentPage?: number;
  pageSize?: number;
}

export interface PaginationInfo {
  count?: number;
  total?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface AIModelListData {
  results: AIModelItem[];
  pagination: PaginationInfo;
}

export interface AIModelListResponse {
  data: AIModelListData;
}

export interface CreateAIModelParams {
  name: string;
  address: string;
  api_key: string;
  status: number;
  priority: number;
}

export interface UpdateAIModelParams extends CreateAIModelParams {
  id: number;
}

/**
 * 获取AI模型列表
 */
const API_PREFIX = '/api/aiconfig/';

export const getAIModelListApi = (params?: AIModelListParams) => {
  return request.get<AIModelListResponse>({ url: API_PREFIX, params });
};

/**
 * 创建AI模型
 */
export const createAIModelApi = (data: CreateAIModelParams) => {
  return request.post({ url: API_PREFIX, data });
};

/**
 * 更新AI模型
 */
export const updateAIModelApi = (id: number, data: Partial<CreateAIModelParams>) => {
  return request.put({ url: `${API_PREFIX}${id}/`, data });
};

/**
 * 删除AI模型
 */
export const deleteAIModelApi = (id: number) => {
  return request.delete({ url: `${API_PREFIX}${id}/` });
};

