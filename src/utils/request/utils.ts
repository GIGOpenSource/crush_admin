import type { Recordable } from '@/types/axios';

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * 添加时间戳参数
 */
export function joinTimestamp(join: boolean, restful = false): string | Recordable {
  if (!join) {
    return restful ? '' : {};
  }
  const now = new Date().getTime();
  if (restful) {
    return `?_t=${now}`;
  }
  return { _t: now };
}

/**
 * 格式化请求参数中的日期
 */
export function formatRequestDate(params: Recordable): void {
  if (Object.prototype.toString.call(params) !== '[object Object]') {
    return;
  }

  for (const key in params) {
    if (params[key] && typeof params[key] === 'object') {
      formatRequestDate(params[key]);
    }
    if (typeof key === 'string') {
      const value = params[key];
      if (typeof value === 'string') {
        params[key] = value.trim();
      }
    }
  }
}

/**
 * 将对象转为Url参数
 */
export function setObjToUrlParams(baseUrl: string, obj: Recordable): string {
  let parameters = '';
  for (const key in obj) {
    parameters += `${key}=${encodeURIComponent(obj[key])}&`;
  }
  parameters = parameters.replace(/&$/, '');
  return /\?$/.test(baseUrl) ? baseUrl + parameters : baseUrl.replace(/\/?$/, '?') + parameters;
}

