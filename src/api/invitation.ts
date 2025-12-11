import { request } from '@/utils/request';

/**
 * 邀请管理相关接口
 */

export interface InvitationItem {
  id: number;
  user_id: number;
  username: string;
  total_invitations: number; // 累计邀请数
  new_users: number; // 新增用户数
  reward_amount: number; // 奖励金额
  withdrawal_amount: number; // 提现金额
  platform?: string; // 平台
}

export interface InvitationListParams {
  currentPage?: number;
  pageSize?: number;
  search?: string; // 搜索关键词（用户ID、昵称）
  platform?: string; // 平台筛选
  startDate?: string; // 开始日期
  endDate?: string; // 结束日期
}

export interface InvitationStatistics {
  totalInvitations: number; // 累计邀请数
  newUsers: number; // 新增用户数
  totalAmount: number; // 总发金额
}

export interface PaginationInfo {
  count?: number;
  total?: number;
  currentPage?: number;
  pageSize?: number;
}

export interface InvitationListData {
  results: InvitationItem[];
  pagination: PaginationInfo;
  statistics?: InvitationStatistics;
}

export interface InvitationListResponse {
  data: InvitationListData;
}

/**
 * 获取邀请列表
 */
export const getInvitationListApi = (params?: InvitationListParams) => {
  return request.get<InvitationListResponse>({ url: '/api/invitation/', params });
};

/**
 * 封禁用户
 * @param userId 用户ID
 */
export const banUserApi = (userId: string | number) => {
  return request.post({
    url: '/api/invitation/ban/',
    data: {
      user_id: userId,
    },
  });
};

/**
 * 更新邀请信息
 * @param id 邀请记录ID
 * @param data 更新数据
 */
export const updateInvitationApi = (
  id: string | number,
  data: { total_invitations?: number; new_users?: number }
) => {
  return request.put({
    url: `/api/invitation/${id}/`,
    data,
  });
};

