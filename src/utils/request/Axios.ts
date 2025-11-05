import type {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import axios from 'axios';
import { message } from 'ant-design-vue';
import type { AxiosRequestConfigRetry, RequestOptions, Result } from '@/types/axios';
import { ContentTypeEnum } from '@/constants';
import { useUserStore } from '@/store/modules/user';

export interface CreateAxiosOptions extends AxiosRequestConfig {
  authenticationScheme?: string;
  transform?: AxiosTransform;
  requestOptions?: RequestOptions;
}

export interface AxiosTransform {
  /**
   * 请求之前处理config
   */
  beforeRequestHook?: (config: AxiosRequestConfig, options: RequestOptions) => AxiosRequestConfig;
  /**
   * 请求成功处理
   */
  transformRequestHook?: (res: AxiosResponse<Result>, options: RequestOptions) => any;
  /**
   * 请求失败处理
   */
  requestCatchHook?: (e: Error, options: RequestOptions) => Promise<any>;
  /**
   * 请求之前的拦截器
   */
  requestInterceptors?: (config: InternalAxiosRequestConfig, options: CreateAxiosOptions) => InternalAxiosRequestConfig;
  /**
   * 请求之后的拦截器
   */
  responseInterceptors?: (res: AxiosResponse<any>) => AxiosResponse<any>;
  /**
   * 请求之前的拦截器错误处理
   */
  requestInterceptorsCatch?: (error: Error) => void;
  /**
   * 请求之后的拦截器错误处理
   */
  responseInterceptorsCatch?: (error: AxiosError, instance: AxiosInstance) => Promise<any>;
}

/**
 * Axios 封装类
 */
export class VAxios {
  private instance: AxiosInstance;
  private readonly options: CreateAxiosOptions;

  constructor(options: CreateAxiosOptions) {
    this.options = options;
    this.instance = axios.create(options);
    this.setupInterceptors();
  }

  /**
   * 获取transform
   */
  private getTransform() {
    const { transform } = this.options;
    return transform;
  }

  /**
   * 获取Axios实例
   */
  getAxios(): AxiosInstance {
    return this.instance;
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors() {
    const transform = this.getTransform();
    if (!transform) return;

    const {
      requestInterceptors,
      requestInterceptorsCatch,
      responseInterceptors,
      responseInterceptorsCatch,
    } = transform;

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (requestInterceptors) {
          config = requestInterceptors(config, this.options) as InternalAxiosRequestConfig;
        }
        return config;
      },
      (error) => {
        if (requestInterceptorsCatch) {
          requestInterceptorsCatch(error);
        }
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        if (responseInterceptors) {
          res = responseInterceptors(res);
        }
        return res;
      },
      (error: AxiosError) => {
        if (responseInterceptorsCatch) {
          return responseInterceptorsCatch(error, this.instance);
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * 请求方法
   */
  request<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    const transform = this.getTransform();
    const requestOptions = { ...this.options.requestOptions, ...options };

    const { beforeRequestHook, transformRequestHook, requestCatchHook } = transform || {};
    let conf: AxiosRequestConfig = { ...config };

    // 请求前处理
    if (beforeRequestHook) {
      conf = beforeRequestHook(conf, requestOptions);
    }

    return new Promise((resolve, reject) => {
      this.instance
        .request<any, AxiosResponse<Result>>(conf)
        .then((res: AxiosResponse<Result>) => {
          if (transformRequestHook) {
            try {
              const ret = transformRequestHook(res, requestOptions);
              resolve(ret);
            } catch (err) {
              reject(err || new Error('请求错误!'));
            }
            return;
          }
          resolve(res as unknown as Promise<T>);
        })
        .catch((e: Error | AxiosError) => {
          if (requestCatchHook) {
            reject(requestCatchHook(e, requestOptions));
            return;
          }
          reject(e);
        });
    });
  }

  get<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'GET' }, options);
  }

  post<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'POST' }, options);
  }

  put<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PUT' }, options);
  }

  delete<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'DELETE' }, options);
  }

  patch<T = any>(config: AxiosRequestConfigRetry, options?: RequestOptions): Promise<T> {
    return this.request({ ...config, method: 'PATCH' }, options);
  }
}

