import { request } from '@/utils/request';

/**
 * AI配置相关接口
 */

export interface AIModelItem {
  id: number;
  email: string;
  name: string;
  provider: string;
  model: string;
  enabled: boolean;
  is_default: boolean;
  priority: number;
  api_key: string;
  base_url: string;
  region: string;
  api_version: string;
  organization_id: string;
  created_at: string;
  updated_at: string;
  user: number;
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
  provider: string;
  model: string;
  api_key: string;
  base_url: string;
  region?: string;
  api_version?: string;
  organization_id?: string;
  enabled: boolean;
  is_default: boolean;
  priority: number;
  email?: string;
}

export interface UpdateAIModelParams extends Partial<CreateAIModelParams> {}

/**
 * 获取AI模型列表
 */
const API_PREFIX = '/api/aiconfig/';
const CREATE_API = '/api/aiconfig/';

export const getAIModelListApi = (params?: AIModelListParams) => {
  return request.get<AIModelListResponse>({ url: API_PREFIX, params });
};

/**
 * 创建AI模型
 */
export const createAIModelApi = (data: CreateAIModelParams) => {
  return request.post({ url: CREATE_API, data });
};

/**
 * 更新AI模型
 */
export const updateAIModelApi = (id: number, data: UpdateAIModelParams) => {
  return request.put({ url: `${API_PREFIX}${id}/`, data });
};

/**
 * 删除AI模型
 */
export const deleteAIModelApi = (id: number) => {
  return request.delete({ url: `${API_PREFIX}${id}/` });
};

