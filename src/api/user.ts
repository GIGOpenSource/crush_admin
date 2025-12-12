import { request } from '@/utils/request';

/**
 * 用户管理相关接口
 */

export interface UserItem {
  id: number;
  open_id: string;
  username: string; // 昵称
  user_avatar: string;
  user_gender: string;
  user_telphone: string;
  is_vip: boolean; // 会员状态
  vip_type: string | null;
  session_key: string;
  share_count: number;
  success_count: number;
  fail_count: number;
  vip_expire_date: string | null;
  created_at: string; // 注册时间
  status?: number; // 用户状态：1-冻结, 2-正常（解冻）
  platform?: string; // 平台类型：xhs_mini-小红书, fbook_mini-feekbook, ins_mini-ins, google_mini-googole, ios_mini-苹果, apk_mini-安卓, wechat_mini-微信, douyin_mini-抖音, mock_mini-苹果
}

export interface UserListParams {
  currentPage?: number;
  pageSize?: number;
  keyword?: string; // 搜索关键词（用户ID、昵称）
  search?: string; // 搜索关键词（用户ID、昵称）
  platform?: string; // 平台筛选：xhs_mini, fbook_mini, ins_mini, google_mini, ios_mini, apk_mini, wechat_mini, douyin_mini, mock_mini
}

export interface PaginationInfo {
  count?: number; // 总数
  total?: number; // 总数（兼容字段）
  currentPage?: number;
  pageSize?: number;
}

export interface UserListData {
  results: UserItem[];
  pagination: PaginationInfo;
}

export interface UserListResponse {
  data: UserListData;
}

/**
 * 获取用户列表
 */
export const getUserListApi = (params?: UserListParams) => {
  return request.get<UserListResponse>({ url: '/api/wechat/', params });
};

/**
 * 冻结/解冻用户
 * @param wxId 用户ID
 * @param status 1-冻结, 0-解冻
 */
export const freezeUserApi = (wxId: string | number, status: 0 | 1) => {
  return request.post({
    url: '/api/wechat/wx_user_status/',
    data: {
      wx_id: wxId,
      status: status,
    },
  });
};

/**
 * 编辑用户
 */
export const updateUserApi = (id: string, data: Partial<UserItem>) => {
  return request.put({ url: `/api/wechat/${id}/`, data });
};

/**
 * 提示词模板
 */
export interface PromptTemplate {
  id: number;
  name: string;
  template_type: string;
  description: string;
}

/**
 * 图片信息
 */
export interface ImagesInfo {
  url_list: string; // JSON字符串数组
}

/**
 * 用户记录项（子记录）
 */
export interface UserRecordChildItem {
  id: number;
  prompt_template: PromptTemplate;
  child_list: any[];
  created_time: string;
  file_name: string;
  file_url: string;
  content: string;
  status: string;
  usage_count: number;
  last_used_time: string;
  score: number;
  images: ImagesInfo | null;
  summary: string | null;
  parse_type: string; // "once" | "deep"
  parent_id: number | null;
  user: number;
  poster_type: number;
}

/**
 * 用户记录项（主记录）
 */
export interface UserRecordItem {
  id: number;
  prompt_template: PromptTemplate;
  child_list: UserRecordChildItem[];
  created_time: string;
  file_name: string;
  file_url: string;
  content: string;
  status: string;
  usage_count: number;
  last_used_time: string;
  score: number;
  images: ImagesInfo | null;
  summary: string | null;
  parse_type: string; // "once" | "deep"
  parent_id: number | null;
  user: number;
  poster_type: number;
}

/**
 * 展平后的记录项（用于表格显示）
 */
export interface FlattenedRecordItem {
  id: number;
  file_type: string; // 文件类型（prompt_template.name）
  upload_material: string; // 上传资料（images.url_list）
  poster: string; // 海报（file_url when parse_type is "once"）
  advanced_report: string; // 高级报告（child_list[0].file_url）
  time: string; // 时间（created_time）
  isChild?: boolean; // 是否为子记录
}

/**
 * 查看用户记录
 * @param wxId 用户ID
 */
export const getUserRecordsApi = (wxId: string | number) => {
  return request.post<UserRecordItem[]>({
    url: '/api/poster/wx_user_poster_record/',
    data: {
      wx_id: wxId,
    },
  });
};

