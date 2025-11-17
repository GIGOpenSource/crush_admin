import {request} from '@/utils/request';


export interface PromptItem {
    id: number;
    name: string;
    prompt_content: string;
    description: string;
    variables: string;
    template_type: string;
    is_public: boolean;
    is_active: boolean;
    created_time: string;
    updated_time: string;
}

/**
 * 获取提示词列表
 */
export const getPromptListApi = (params: any) => {
    return request.get<PromptItem[]>({url: '/api/prompt/', params});
};

/**
 * 更新提示词
 */
export const updatePromptApi = (id: number, data: any) => {
    return request.put<PromptItem>({url: `/api/prompt/${id}/`, data});
};

/**
 * 创建提示词
 */
export const createPromptApi = (data: any) => {
    return request.post<PromptItem>({url: '/api/prompt/', data});
};

/**
 * 删除提示词
 */
export const deletePromptApi = (id: number) => {
    return request.delete({url: `/api/prompt/${id}/`});
};