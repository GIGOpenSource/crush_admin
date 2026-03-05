import { request } from '@/utils/request';

/**
 * 模板管理接口
 */

export interface TemplateImageDetail {
  id: number;
  name: string;
  is_enabled: boolean;
  description?: string;
  tag_text?: string;
}

export interface TemplateItem {
  id: number;
  name: string;
  is_enabled: boolean;
  description?: string;
  tag_text?: string;
}
/**
 * 获取模板列表
 */
export const getTemplateListApi = (page: number = 1, pageSize: number = 10) => {
  return request.get<TemplateItem[]>({
    url: '/api/project_item/',
    params: {
      page,
      page_size: pageSize,
    },
  });
};


/**
 * 更新模板
 */
export const updateTemplateApi = (id: number, data: Partial<TemplateItem>) => {
  return request.put<TemplateItem>({
    url: `/api/project_item/${id}/`,
    data,
  });
};

/**
 * 详情模板
 */
export const detailsTemplateApi = (id: number) => {
  return request.get<TemplateItem>({
    url: `/api/project_item/${id}/`,
  });
};