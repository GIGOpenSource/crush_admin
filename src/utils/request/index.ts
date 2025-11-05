import type { AxiosInstance } from 'axios';
import { message } from 'ant-design-vue';
import { ContentTypeEnum } from '@/constants';
import { useUserStore } from '@/store/modules/user';
import { VAxios } from './Axios';
import type { AxiosTransform, CreateAxiosOptions } from './Axios';
import { formatRequestDate, joinTimestamp, setObjToUrlParams } from './utils';
import type { Recordable } from '@/types/axios';

// 是否启用代理，如果启用代理则使用 Vite 代理，否则使用完整 URL
// 默认使用 Vite 代理（开发环境），如需直连服务器，设置 VITE_IS_REQUEST_PROXY=false
const host = import.meta.env.VITE_IS_REQUEST_PROXY === 'false' ? import.meta.env.VITE_API_URL : '';

// 数据处理
const transform: AxiosTransform = {
  // 处理请求数据
  transformRequestHook: (res, options) => {
    const { isTransformResponse, isReturnNativeResponse } = options;

    // 是否返回原生响应头
    if (isReturnNativeResponse) {
      return res;
    }

    // 不进行任何处理，直接返回
    if (!isTransformResponse) {
      return res.data;
    }

    // 错误的时候返回
    const { data } = res;
    if (!data) {
      throw new Error('请求接口错误');
    }

    // 这里 code 为后台统一的字段，根据实际项目修改
    const { code } = data;

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && code === 200;
    if (hasSuccess) {
      return data.data;
    }

    // 错误提示
    const errorMessage = data.message || `请求接口错误, 错误码: ${code}`;
    message.error(errorMessage);
    throw new Error(errorMessage);
  },

  // 请求前处理配置
  beforeRequestHook: (config, options) => {
    const { apiUrl, isJoinPrefix, urlPrefix, joinParamsToUrl, formatDate, joinTime = true } = options;

    // 添加接口前缀
    if (isJoinPrefix && urlPrefix) {
      config.url = `${urlPrefix}${config.url}`;
    }

    // 将baseUrl拼接
    if (apiUrl) {
      config.url = `${apiUrl}${config.url}`;
    }

    const params = config.params || {};
    const data = config.data || false;

    if (formatDate && data && typeof data === 'object') {
      formatRequestDate(data);
    }

    if (config.method?.toUpperCase() === 'GET') {
      // GET 请求支持 params 和 data 参数
      const getParams = { ...params, ...(typeof data === 'object' ? data : {}) };

      if (typeof getParams === 'object') {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据
        config.params = Object.assign(getParams || {}, joinTimestamp(joinTime, false));
        // 清空 data，GET 请求应该使用 params
        config.data = undefined;
      } else {
        // 兼容restful风格
        config.url = `${config.url + getParams}${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
        config.data = undefined;
      }
    } else if (typeof params === 'object') {
      if (formatDate) {
        formatRequestDate(params);
      }
      if (
        Reflect.has(config, 'data') &&
        config.data &&
        (Object.keys(config.data as Recordable).length > 0 || data instanceof FormData)
      ) {
        config.data = data;
        config.params = params;
      } else {
        // 非GET请求如果没有提供data，则将params视为data
        config.data = params;
        config.params = undefined;
      }
      if (joinParamsToUrl) {
        config.url = setObjToUrlParams(config.url as string, { ...config.params, ...config.data } as Recordable);
      }
    } else {
      // 兼容restful风格
      config.url += params;
      config.params = undefined;
    }
    return config;
  },

  // 请求拦截器处理
  requestInterceptors: (config, options) => {
    // 请求之前处理config
    const userStore = useUserStore();
    const { token } = userStore;

    if (token && (config as Recordable)?.requestOptions?.withToken !== false) {
      // jwt token
      const authenticationScheme = options.authenticationScheme || '';
      (config.headers as Recordable).Authorization = authenticationScheme
        ? `${authenticationScheme} ${token}`
        : `Bearer ${token}`;
    }
    return config;
  },

  // 响应拦截器处理
  responseInterceptors: (res) => {
    return res;
  },

  // 响应错误处理
  responseInterceptorsCatch: (error: any, instance: AxiosInstance) => {
    const { response } = error;

    // 处理 401 未授权
    if (response && response.status === 401) {
      const userStore = useUserStore();
      userStore.logout();
      message.error('登录已过期，请重新登录');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 处理 403 权限错误
    if (response && response.status === 403) {
      const errorMessage = response.data?.message || response.data?.detail || '没有权限访问';
      message.error(errorMessage);
      return Promise.reject(error);
    }

    // 处理其他 HTTP 错误
    if (response) {
      const errorMessage = response.data?.message || response.data?.detail || `请求失败 (${response.status})`;
      message.error(errorMessage);
      return Promise.reject(error);
    }

    // 处理网络错误
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      message.error('网络连接失败，请检查网络设置');
      return Promise.reject(error);
    }

    const { config } = error;
    if (!config || !config.requestOptions?.retry) return Promise.reject(error);

    config.retryCount = config.retryCount || 0;

    if (config.retryCount >= config.requestOptions.retry.count) return Promise.reject(error);

    config.retryCount += 1;

    const backoff = new Promise((resolve) => {
      setTimeout(() => {
        resolve(config);
      }, config.requestOptions.retry.delay || 1000);
    });

    config.headers = { ...config.headers, 'Content-Type': ContentTypeEnum.Json };
    return backoff.then((config) => instance.request(config));
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios({
    // 认证方案
    authenticationScheme: 'Bearer',
    // 超时
    timeout: 10 * 1000,
    // 携带Cookie
    withCredentials: true,
    // 头信息
    headers: { 'Content-Type': ContentTypeEnum.Json },
    // 数据处理方式
    transform,
    // 配置项
    requestOptions: {
      // 接口地址
      apiUrl: host,
      // 是否自动添加接口前缀
      isJoinPrefix: true,
      // 接口前缀
      urlPrefix: import.meta.env.VITE_API_URL_PREFIX || '/api',
      // 是否返回原生响应头
      isReturnNativeResponse: false,
      // 需要对返回数据进行处理
      isTransformResponse: true,
      // post请求的时候添加参数到url
      joinParamsToUrl: false,
      // 格式化提交参数时间
      formatDate: true,
      // 是否加入时间戳
      joinTime: true,
      // 是否忽略请求取消令牌
      ignoreCancelToken: true,
      // 是否携带token
      withToken: true,
      // 重试
      retry: {
        count: 3,
        delay: 1000,
      },
    },
    ...opt,
  });
}

export const request = createAxios();

