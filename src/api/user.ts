import { request } from '@/utils/request';

/**
 * 用户管理相关接口
 */

export interface UserItem {
  id: string;
  nickname: string;
  registerTime: string;
  membershipStatus: 'member' | 'non-member'; // 会员状态：'member' 会员, 'non-member' 非会员
  isFrozen?: boolean; // 是否冻结
}

export interface UserListParams {
  currentPage?: number;
  pageSize?: number;
  keyword?: string; // 搜索关键词（用户ID、昵称）
}

export interface UserListResponse {
  list: UserItem[];
  total: number;
  currentPage: number;
  pageSize: number;
}

/**
 * 获取用户列表
 */
export const getUserListApi = (params?: UserListParams) => {
  return request.get<UserListResponse>({ url: '/wechat/', params });
};

/**
 * 冻结/解冻用户
 */
export const freezeUserApi = (id: string, isFrozen: boolean) => {
  return request.post({ url: `/users/${id}/freeze`, data: { isFrozen } });
};

/**
 * 编辑用户
 */
export const updateUserApi = (id: string, data: Partial<UserItem>) => {
  return request.put({ url: `/users/${id}`, data });
};

/**
 * 查看用户记录
 */
export const getUserRecordsApi = (id: string) => {
  return request.get({ url: `/users/${id}/records` });
};

