import { request } from '@/utils/request';

/**
 * 商品接口
 */

export interface ProductParams {
  price: number;
  days: number;
}

export interface ProductItem {
  id: number;
  name: string;
  price: number;
  days: number;
}

/**
 * 获取商品列表
 * @param currentPage 当前页码
 * @param pageSize 每页数量
 */
export const getProductListApi = (currentPage = 1, pageSize = 10) => {
  return request.get<ProductItem[]>({ 
    url: '/api/products/',
    params: {
      currentPage,
      pageSize
    }
  });
};

/**
 * 更新商品
 */
export const updateProductApi = (id: number, data: ProductParams) => {
  return request.put<ProductItem>({ url: `/api/products/${id}/`, data });
};

/**
 * 创建商品
 */
export const createProductApi = (data: ProductParams) => {
  return request.post<ProductItem>({ url: '/api/products/', data });
};

/**
 * 删除商品
 */
export const deleteProductApi = (id: number) => {
  return request.delete({ url: `/api/products/${id}/` });
};

