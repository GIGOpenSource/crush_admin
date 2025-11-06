import { request } from '@/utils/request';

/**
 * 商品接口
 */

export interface ProductParams {
  productType: string;
  price: number;
  validityPeriod: string;
}

export interface ProductItem {
  id: number;
  productType: string;
  price: number;
  validityPeriod: string;
}

/**
 * 获取商品列表
 */
export const getProductListApi = () => {
  return request.get<ProductItem[]>({ url: '/api/products/' });
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

