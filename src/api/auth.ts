import { request } from '@/utils/request';

/**
 * 登录接口
 */
export interface LoginParams {
  username: string;
  password: string;
}

// API 实际返回的数据格式
export interface LoginResponseData {
  token: string;
  user_id: number;
  username: string;
}

export interface LoginResponse {
  token: string;
  userInfo: {
    id: string;
    name: string;
    avatar?: string;
    role?: string;
  };
}

/**
 * 用户登录
 */
export const loginApi = (data: LoginParams) => {
  return request.post<LoginResponseData>(
    { url: '/api/users/login/', data },
    { withToken: false }
  );
};

/**
 * 获取用户信息
 */
export const getUserInfoApi = () => {
  return request.get({ url: '/auth/userInfo' });
};

/**
 * 退出登录
 */
export const logoutApi = () => {
  return request.post({ url: '/auth/logout' });
};

