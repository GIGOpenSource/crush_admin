import { request } from '@/utils/request';

/**
 * 模板管理接口
 */

export interface TemplateItem {
  id: number;
  name: string;
  template_purpose: 'poster' | 'report'; // 模板类型：海报/报告
  template_belong?: 'chat' | 'social' | 'physical' | 'consume'; // 模板归属
  min_score?: number; // 模板分数最小值
  max_score?: number; // 模板分数最大值
  image_ids?: number[]; // 模板图片ID数组
  is_active: boolean; // 是否启用
  created_time?: string;
  updated_time?: string;
}

export interface TemplateParams {
  name: string;
  template_purpose: 'poster' | 'report';
  template_belong?: 'chat' | 'social' | 'physical' | 'consume';
  min_score?: number;
  max_score?: number;
  image_ids?: number[]; // 模板图片ID数组
  is_active: boolean;
}

/**
 * 获取模板列表
 */
export const getTemplateListApi = (page: number = 1, pageSize: number = 10) => {
  return request.get<TemplateItem[]>({
    url: '/api/template_report/',
    params: {
      page,
      page_size: pageSize,
    },
  });
};

/**
 * 创建模板
 */
export const createTemplateApi = (data: TemplateParams) => {
  return request.post<TemplateItem>({
    url: '/api/template_report/',
    data,
  });
};

/**
 * 更新模板
 */
export const updateTemplateApi = (id: number, data: Partial<TemplateParams>) => {
  return request.put<TemplateItem>({
    url: `/api/template_report/${id}/`,
    data,
  });
};

/**
 * 删除模板
 */
export const deleteTemplateApi = (id: number) => {
  return request.delete({
    url: `/api/template_report/${id}/`,
  });
};

/**
 * 详情模板
 */
export const detailsTemplateApi = (id: number) => {
  return request.get<TemplateItem>({
    url: `/api/template_report/${id}/`,
  });
};

