import type { AxiosRequestConfig } from 'axios';

/**
 * Axios请求配置
 */
export interface RequestOptions {
  /**
   * 接口地址
   */
  apiUrl?: string;
  /**
   * 是否自动添加接口前缀
   */
  isJoinPrefix?: boolean;
  /**
   * 接口前缀
   */
  urlPrefix?: string;
  /**
   * POST请求的时候添加参数到Url中
   */
  joinParamsToUrl?: boolean;
  /**
   * 格式化提交参数时间
   */
  formatDate?: boolean;
  /**
   * 是否需要对响应数据进行处理
   */
  isTransformResponse?: boolean;
  /**
   * 是否返回原生响应头
   */
  isReturnNativeResponse?: boolean;
  /**
   * 是否忽略请求取消令牌
   */
  ignoreCancelToken?: boolean;
  /**
   * 自动对请求添加时间戳参数
   */
  joinTime?: boolean;
  /**
   * 是否携带Token
   */
  withToken?: boolean;
  /**
   * 重试配置
   */
  retry?: {
    count: number;
    delay: number;
  };
}

export interface Result<T = any> {
  code: number;
  data: T;
  message?: string;
}

export interface AxiosRequestConfigRetry extends AxiosRequestConfig {
  retryCount?: number;
  requestOptions?: RequestOptions;
}

export type Recordable<T = any> = Record<string, T>;

