import { request } from '@/utils/request';

/**
 * 登录接口
 */
export interface LoginParams {
  username: string;
  password: string;
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
  return request.post<LoginResponse>('/auth/login', { data });
};

/**
 * 获取用户信息
 */
export const getUserInfoApi = () => {
  return request.get('/auth/userInfo');
};

/**
 * 退出登录
 */
export const logoutApi = () => {
  return request.post('/auth/logout');
};

