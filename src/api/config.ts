import { request } from '@/utils/request';

/**
 * 配置管理相关接口
 */

export interface ConfigItem {
  id?: number;
  privacy_policy?: string; // 隐私政策
  user_agreement?: string; // 用户协议
  about_us?: string; // 关于我们
  version?: string; // 审核模式开关
  platform?: string; // 平台类型
  updated_at?: string; // 更新时间
  qr_code_url?: string; // 二维码
  pay_agreement?: string; // 会员服务协议
  trial_agreement?: string; // 恋爱裁判所协议
}

export interface ConfigResponse {
  data: ConfigItem;
}

/**
 * 获取配置信息
 */
export const getConfigApi = (params: {platform: string}) => {
  return request.get<ConfigResponse>({ url: '/api/wx_system/', params });
};

/**
 * 更新配置信息
 */
export const updateConfigApi = (data: Partial<ConfigItem>) => {
  return request.put({ url: `/api/wx_system/${data.id}/`, data });
};

/**
 * 创建配置信息
 */
export const createConfigApi = (data: Partial<ConfigItem>) => {
  return request.post({ url: '/api/wx_system/', data });
};

