import { request } from '@/utils/request';

/**
 * 模板库接口
 */

export interface TemplateImageItem {
  id: number;
  url: string;
  name?: string;
  createTime?: string;
  image_url: string;
  formState: Array<TemplateImageItem>;
}

// uploadImg 接口返回的数据结构
export interface UploadResponse {
  data?: number[] | { file?:string; file_name?:string,type:string };
}

/**
 * 获取模板背景图片列表
 */
export const getTemplateImagesApi = (page: number = 1, pageSize: number = 20) => {
  return request.get<TemplateImageItem[]>({
    url: '/api/template_img/',
    params: {
      page,
      page_size: pageSize,
    },
  });
};

/**
 * 批量上传模板背景图片（提交文件ID数组或FormData）
 */
export const uploadTemplateImagesApi = (data: number[] | FormData) => {
  // 如果是 FormData，直接传递；如果是数组，包装成对象
  const requestData = data instanceof FormData ? data : { files: data };
  
  return request.post<TemplateImageItem[]>({
    url: '/api/template_img/',
    data: requestData,
  });
};

/**
 * 删除模板背景图片
 */
export const deleteTemplateImageApi = (id: number) => {
  return request.delete({ url: `/api/template_img/${id}/` });
};

// 上传管理 - 上传图片文件，返回文件ID数组
export const uploadImg = (formData: FormData) => {
  return request.post<UploadResponse>({
    url: '/api/upload/',
    data: formData,
  });
};


