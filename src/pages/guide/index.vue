<template>
  <div class="guide-management">
    <a-card :bordered="false">
      <template #title>
        <span>新手引导</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAdd">新增</a-button>
      </template>
      <div class="table-wrapper">
        <a-table
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :pagination="paginationConfig"
          row-key="id"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (paginationConfig.current - 1) * paginationConfig.pageSize + index + 1 }}
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="currentEditId ? '编辑' : '新增'"
      :confirm-loading="submitLoading"
      ok-text="保存"
      cancel-text="取消"
      @ok="handleSubmit"
      @cancel="handleCancel"
      :width="600"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
      
         <a-form-item label="引导图片" name="image_url">
          <a-upload
            v-model:file-list="fileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @preview="handlePreview"
            @remove="handleRemove"
            @change="handleFileChange"
            :max-count="1"
            accept="image/*"
          >
            <div v-if="fileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传图片</div>
            </div>
          </a-upload>
        </a-form-item>
        <a-form-item label="引导图注释" name="title">
          <a-input
            v-model:value="formState.title"
            placeholder="请输入引导图注释"
            :maxlength="25"
            show-count
          />
        </a-form-item>
         <a-form-item label="排序" name="order">
          <a-input-number
            v-model:value="formState.order"
            :min="0"
            placeholder="请输入排序值"
            style="width: 100%"
          />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null" centered>
      <img alt="预览" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType, FormInstance, UploadFile, UploadProps } from 'ant-design-vue';
import {
  getGuideListApi,
  createGuideApi,
  updateGuideApi,
  deleteGuideApi,
  getGuideDetailApi,
  type GuideItem,
} from '@/api/guide';
import { uploadImg, getTemplateImagesApi, type TemplateImageItem } from '@/api/template-library';

const loading = ref(false);
const submitLoading = ref(false);
const dataSource = ref<GuideItem[]>([]);
const modalVisible = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const fileList = ref<UploadFile[]>([]);
const previewVisible = ref(false);
const previewImage = ref('');

const formState = reactive<Partial<GuideItem>>({
  order: 0,
  title: '',
  image_url: '',
});

const rules = {
  order: [{ required: true, message: '请输入排序值', trigger: 'blur' }],
  title: [{ required: true, message: '请输入引导图注释', trigger: 'blur' }],
  image_url: [
    { 
      required: true, 
      message: '请上传引导图片', 
      trigger: ['change', 'blur'],
      validator: (_rule: any, value: string) => {
        return new Promise((resolve, reject) => {
          // 如果有值，直接通过
          if (value && value.trim()) {
            resolve(true);
            return;
          }
          
          // 检查文件列表
          if (fileList.value && fileList.value.length > 0) {
            const firstFile = fileList.value[0];
            
            // 如果文件已上传完成，检查是否有 URL
            if (firstFile.status === 'done') {
              const fileUrl = firstFile.url || firstFile.response?.url || firstFile.response?.image_url;
              if (fileUrl) {
                // 如果 formState.image_url 为空，但文件有 URL，更新它
                if (!formState.image_url && fileUrl) {
                  formState.image_url = fileUrl;
                }
                resolve(true);
                return;
              }
            }
            
            // 如果文件正在上传中，等待上传完成
            if (firstFile.status === 'uploading') {
              reject('图片正在上传中，请稍候...');
              return;
            }
            
            // 如果文件上传失败
            if (firstFile.status === 'error') {
              reject('图片上传失败，请重新上传');
              return;
            }
          }
          
          // 默认拒绝
          reject('请上传引导图片');
        });
      }
    }
  ],
};

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
  },
  {
    title: '排序',
    dataIndex: 'order',
    key: 'order',
    width: 100,
  },
  {
    title: '引导图注释',
    dataIndex: 'title',
    key: 'title',
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

const paginationConfig = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showTotal: (total: number) => `共 ${total} 条`,
  onChange: (page: number, pageSize: number) => {
    paginationConfig.current = page;
    paginationConfig.pageSize = pageSize;
    loadData();
  },
});

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };
    const res = await getGuideListApi(params);
    dataSource.value = res.data.results || [];
    paginationConfig.total = res.data.pagination?.count || res.data.pagination?.total || 0;
  } catch (error: any) {
    console.error('加载新手引导列表失败:', error);
    message.error(error?.message || '加载新手引导列表失败');
    dataSource.value = [];
    paginationConfig.total = 0;
  } finally {
    loading.value = false;
  }
};

// 新增
const handleAdd = () => {
  currentEditId.value = null;
  resetForm();
  modalVisible.value = true;
};

// 编辑
const handleEdit = async (record: GuideItem) => {
  currentEditId.value = record.id;
  modalVisible.value = true;

  try {
    const res = await getGuideDetailApi(record.id);
    const detail = res.data;

    formState.order = detail.order;
    formState.title = detail.title;
    formState.image_url = detail.image_url || '';

    // 设置文件列表
    if (detail.image_url) {
      fileList.value = [
        {
          uid: '-1',
          name: 'image_url',
          status: 'done',
          url: detail.image_url,
        },
      ];
    } else {
      fileList.value = [];
    }
  } catch (error: any) {
    console.error('获取新手引导详情失败:', error);
    message.error(error?.message || '获取新手引导详情失败');
  }
};

// 删除
const handleDelete = (record: GuideItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除这条新手引导吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteGuideApi(record.id);
        message.success('删除成功！');
        await loadData();
      } catch (error: any) {
        console.error('删除失败:', error);
        message.error(error?.message || '删除失败，请重试');
      }
    },
  });
};

// 提交
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    // 先检查文件状态和 image_url，再执行表单验证
    console.log('提交前检查:', {
      fileListLength: fileList.value.length,
      fileList: fileList.value,
      image_url: formState.image_url,
    });
    
    // 检查文件是否已上传
    if (!fileList.value.length) {
      message.warning('请上传引导图片');
      return;
    }
    
    const firstFile = fileList.value[0];
    console.log('第一个文件状态:', {
      status: firstFile.status,
      url: firstFile.url,
      response: firstFile.response,
      uid: firstFile.uid,
    });
    
    // 检查文件是否正在上传中
    if (firstFile.status === 'uploading') {
      message.warning('图片正在上传中，请稍候...');
      return;
    }
    
    // 检查文件是否上传失败
    if (firstFile.status === 'error') {
      message.error('图片上传失败，请重新上传');
      return;
    }
    
    // 检查 image_url 是否已设置，如果没有则尝试从文件对象中获取
    if (!formState.image_url || formState.image_url.trim() === '') {
      if (firstFile.status === 'done') {
        const imageUrl = firstFile.url || firstFile.response?.url || firstFile.response?.image_url;
        if (imageUrl) {
          console.log('从文件对象获取 image_url:', imageUrl);
          formState.image_url = imageUrl;
        } else {
          console.warn('文件状态为 done，但无法获取 URL');
          message.warning('图片上传未完成，请等待上传完成后再提交');
          return;
        }
      } else {
        console.warn('文件状态不是 done:', firstFile.status);
        message.warning('图片上传未完成，请等待上传完成后再提交');
        return;
      }
    }
    
    // 最终验证 image_url
    if (!formState.image_url || formState.image_url.trim() === '') {
      message.error('图片URL无效，请重新上传');
      return;
    }
    
    // 执行表单验证
    await formRef.value.validate();
    
    submitLoading.value = true;
    console.log('提交数据:', {
      order: formState.order,
      title: formState.title,
      image_url: formState.image_url,
    });

    const params: Partial<GuideItem> = {
      order: formState.order,
      title: formState.title,
      image_url: formState.image_url,
    };

    if (currentEditId.value) {
      await updateGuideApi(currentEditId.value, params);
      message.success('更新成功！');
    } else {
      await createGuideApi(params);
      message.success('创建成功！');
    }

    modalVisible.value = false;
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    console.error('提交失败:', error);
    message.error(error?.message || '提交失败，请重试');
  } finally {
    submitLoading.value = false;
  }
};

// 取消
const handleCancel = () => {
  resetForm();
  modalVisible.value = false;
};

// 重置表单
const resetForm = () => {
  formState.order = 0;
  formState.title = '';
  formState.image_url = '';
  fileList.value = [];
  formRef.value?.resetFields();
};

// 上传前检查（与模板库保持一致）
const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    message.error('只能上传图片文件！');
    return false;
  }
  const isLt10M = file.size / 1024 / 1024 < 10;
  if (!isLt10M) {
    message.error('图片大小不能超过 10MB！');
    return false;
  }
  return false; // 阻止自动上传，手动控制
};

// 执行上传（与模板库保持一致）
const handleUploadFile = async () => {
  if (fileList.value.length === 0) {
    message.warning('请上传引导图片');
    return;
  }
  
  // 找到需要上传的文件（状态不是 done 的文件）
  const filesToUpload = fileList.value.filter(file => file.status !== 'done' && file.originFileObj);
  
  if (filesToUpload.length === 0) {
    // 如果所有文件都已上传完成，直接返回
    return;
  }
  
  try {
    // 将 fileList.value 中的图片二进制数据转换为 FormData（与模板库保持一致）
    const formData = new FormData();
    filesToUpload.forEach((file) => {
      if (file.originFileObj) {
        formData.append('file', file.originFileObj);
      }
    });

    // 调用上传接口（与模板库使用相同的 uploadImg 函数）
    const res = await uploadImg(formData);
    
    let imageUrl = '';
    let imageId: number | null = null;
    
    // 解析返回的数据
    if (res.data) {
      if (typeof res.data === 'string') {
        imageUrl = res.data;
      } else if (Array.isArray(res.data) && res.data.length > 0) {
        const firstResult = res.data[0];
        if (typeof firstResult === 'string') {
          imageUrl = firstResult;
        } else if (typeof firstResult === 'number') {
          imageId = firstResult;
        }
      } else if (typeof res.data === 'object' && res.data !== null) {
        const data = res.data as any;
        imageUrl = data.url || data.image_url || data.file_url || '';
        if (!imageUrl) {
          if (data.files && Array.isArray(data.files) && data.files.length > 0) {
            imageId = typeof data.files[0] === 'number' ? data.files[0] : null;
          } else if (data.ids && Array.isArray(data.ids) && data.ids.length > 0) {
            imageId = typeof data.ids[0] === 'number' ? data.ids[0] : null;
          }
        }
      }
    }
    
    // 如果返回的是ID，需要通过模板图片接口获取URL
    if (!imageUrl && imageId) {
      try {
        const imageResponse: any = await getTemplateImagesApi(1, 1000);
        const images: TemplateImageItem[] = Array.isArray(imageResponse?.data)
          ? imageResponse.data
          : imageResponse?.data?.results || [];
        
        const targetImage = images.find(img => img.id === imageId);
        if (targetImage) {
          imageUrl = targetImage.image_url || targetImage.url || '';
        }
      } catch (err) {
        console.error('获取图片URL失败:', err);
      }
    }
    
    if (imageUrl) {
      formState.image_url = imageUrl;
      
      // 更新文件列表状态
      filesToUpload.forEach((file) => {
        const fileIndex = fileList.value.findIndex(f => f.uid === file.uid);
        if (fileIndex > -1) {
          fileList.value[fileIndex] = {
            ...fileList.value[fileIndex],
            url: imageUrl,
            status: 'done' as const,
            response: { url: imageUrl, image_url: imageUrl },
          };
        }
      });
      
      // 触发表单验证更新
      setTimeout(() => {
        formRef.value?.validateFields(['image_url']).catch(() => {});
      }, 100);
      
      message.success('上传成功！');
    } else {
      throw new Error('上传失败：未返回图片URL或ID');
    }
  } catch (error: any) {
    console.error('上传失败:', error);
    message.error(error?.message || '上传失败，请重试');
    
    // 更新文件状态为 error
    filesToUpload.forEach((file) => {
      const fileIndex = fileList.value.findIndex(f => f.uid === file.uid);
      if (fileIndex > -1) {
        fileList.value[fileIndex] = {
          ...fileList.value[fileIndex],
          status: 'error' as const,
          error: error,
        };
      }
    });
  }
};

// 预览图片
const handlePreview = (file: UploadFile) => {
  if (file.url) {
    previewImage.value = file.url;
  } else if (file.thumbUrl) {
    previewImage.value = file.thumbUrl;
  } else if (file.originFileObj) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file.originFileObj);
  } else {
    previewImage.value = formState.image_url || '';
  }
  previewVisible.value = true;
};

// 文件变化处理（与模板库保持一致，检测到新文件时立即上传）
const handleFileChange = async (info: any) => {
  fileList.value = info.fileList || [];
  
  // 检测到新文件时，立即上传（与模板库逻辑一致，但这里是自动上传）
  const newFiles = info.fileList?.filter((file: UploadFile) => 
    file.originFileObj && file.status !== 'done' && file.status !== 'uploading' && file.status !== 'error'
  );
  
  if (newFiles && newFiles.length > 0) {
    // 设置文件状态为 uploading
    newFiles.forEach((file: UploadFile) => {
      const fileIndex = fileList.value.findIndex(f => f.uid === file.uid);
      if (fileIndex > -1) {
        fileList.value[fileIndex] = {
          ...fileList.value[fileIndex],
          status: 'uploading' as const,
        };
      }
    });
    
    // 执行上传
    await handleUploadFile();
  }
}

// 移除图片
const handleRemove = () => {
  formState.image_url = '';
  fileList.value = [];
  return true;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.guide-management {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

