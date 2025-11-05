import { request } from '@/utils/request';

/**
 * 示例 API
 */
export const exampleApi = {
  /**
   * 获取示例数据
   */
  getExampleData: (params?: any) => {
    return request.get('/example/data', { params });
  },

  /**
   * 创建示例数据
   */
  createExampleData: (data: any) => {
    return request.post('/example/data', { data });
  },

  /**
   * 更新示例数据
   */
  updateExampleData: (id: string, data: any) => {
    return request.put(`/example/data/${id}`, { data });
  },

  /**
   * 删除示例数据
   */
  deleteExampleData: (id: string) => {
    return request.delete(`/example/data/${id}`);
  },
};

