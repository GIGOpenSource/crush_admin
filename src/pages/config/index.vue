<template>
  <div class="config-management">
    <a-card :bordered="false">
      <template #title>
        <span>配置管理</span>
      </template>
      <a-tabs v-model:activeKey="activePlatform" @change="handlePlatformChange">
        <a-tab-pane
          v-for="platform in platformList"
          :key="platform.key"
          :tab="platform.label"
        >
        </a-tab-pane>
      </a-tabs>
      
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 4 }"
        :wrapper-col="{ span: 20 }"
        layout="vertical"
      >
        <a-form-item label="隐私政策" name="privacy_policy">
          <a-textarea
            v-model:value="formState.privacy_policy"
            placeholder="请输入隐私政策内容"
            :rows="10"
            show-count
            :maxlength="10000"
          />
        </a-form-item>

        <a-form-item label="用户协议" name="user_agreement">
          <a-textarea
            v-model:value="formState.user_agreement"
            placeholder="请输入用户协议内容"
            :rows="10"
            show-count
            :maxlength="10000"
          />
        </a-form-item>

        <a-form-item label="关于我们" name="about_us">
          <a-textarea
            v-model:value="formState.about_us"
            placeholder="请输入关于我们的内容"
            :rows="10"
            show-count
            :maxlength="10000"
          />
        </a-form-item>
          <a-form-item label="会员服务协议" name="pay_agreement">
          <a-textarea
            v-model:value="formState.pay_agreement"
            placeholder="请输入会员服务协议的内容"
            :rows="10"
            show-count
            :maxlength="10000"
          />
        </a-form-item>
        
        <!-- <a-form-item v-if="activePlatform === 'ios'" label="审核模式" name="version">
          <a-switch
            :checked="versionSwitchValue"
            checked-children="开启"
            un-checked-children="关闭"
            @change="handleVersionChange"
          />
        </a-form-item> -->
        
        <a-form-item label="二维码" name="qr_code_url">
          <a-upload
            v-model:file-list="qrCodeFileList"
            list-type="picture-card"
            :before-upload="beforeUpload"
            @preview="handlePreview"
            @remove="handleRemove"
            @change="handleFileChange"
            :max-count="1"
            accept="image/*"
          >
            <div v-if="qrCodeFileList.length < 1">
              <plus-outlined />
              <div style="margin-top: 8px">上传二维码</div>
            </div>
          </a-upload>
        </a-form-item>
        
        <a-form-item :wrapper-col="{ offset: 4, span: 20 }">
          <a-space>
            <a-button type="primary" :loading="submitLoading" @click="handleSubmit">
              保存
            </a-button>
            <a-button @click="handleReset">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
    
    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null" centered>
      <img alt="预览" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { FormInstance, UploadFile, UploadProps } from 'ant-design-vue';
import {
  getConfigApi,
  updateConfigApi,
  createConfigApi,
  type ConfigItem,
} from '@/api/config';
import { uploadImg, getTemplateImagesApi, type TemplateImageItem } from '@/api/template-library';

interface PlatformItem {
  key: string;
  label: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInstance>();
const originalData = ref<Partial<ConfigItem>>({});
const activePlatform = ref<string>('ios');
const qrCodeFileList = ref<UploadFile[]>([]);
const previewVisible = ref(false);
const previewImage = ref('');

// 平台列表
const platformList = ref<PlatformItem[]>([
  { key: 'ios', label: 'ios' },
  { key: 'android', label: '安卓' },
  { key: 'wx', label: '微信小程序' },
]);

const formState = reactive<Partial<ConfigItem>>({
  privacy_policy: '',
  user_agreement: '',
  about_us: '',
  version: '1',
  platform: 'ios', // 添加平台字段
  qr_code_url: '',
  pay_agreement:''
});

const rules = {
  privacy_policy: [
    { required: true, message: '请输入隐私政策内容', trigger: 'blur' },
  ],
  user_agreement: [
    { required: true, message: '请输入用户协议内容', trigger: 'blur' },
  ],
  about_us: [
    { required: true, message: '请输入关于我们的内容', trigger: 'blur' },
  ],
  pay_agreement: [
    { required: false, message: '请输入会员服务协议内容', trigger: 'blur' },
  ],
};

// 审核模式开关值：version 为 '1' 时关闭(false)，'2' 时开启(true)
const versionSwitchValue = computed(() => formState.version === '2');

// 处理审核模式开关变化
const handleVersionChange = (checked: boolean) => {
  formState.version = checked ? '2' : '1';
};

// 平台切换
const handlePlatformChange = (key: string) => {
  activePlatform.value = key;
  formState.platform = key;
  loadData();
};

// 加载配置数据
const loadData = async () => {
  try {
    loading.value = true;
    // TODO: 根据平台加载配置，这里可能需要修改API调用方式
    const res = await getConfigApi({platform: activePlatform.value});
    const configData = Array.isArray(res.data) ? res.data[0] : res.data;
    const config = configData || {};
    
    // 保存原始数据
    originalData.value = { ...config };
    
    // 填充表单
    formState.privacy_policy = config.privacy_policy || '';
    formState.user_agreement = config.user_agreement || '';
    formState.about_us = config.about_us || '';
    formState.version = config.version || '1';
    formState.id = config.id || '';
    formState.qr_code_url = config.qr_code_url;
    formState.pay_agreement = config.pay_agreement || '';
    
    // 设置二维码文件列表
    if (config.qr_code_url) {
      qrCodeFileList.value = [
        {
          uid: '-1',
          name: 'qr_code',
          status: 'done',
          url: config.qr_code_url,
        },
      ];
    } else {
      qrCodeFileList.value = [];
    }
  } catch (error: any) {
    // 如果接口返回404或数据不存在，使用默认值
    if (error?.response?.status === 404) {
      console.log('配置不存在，将使用默认值');
      formState.privacy_policy = '';
      formState.user_agreement = '';
      formState.about_us = '';
      formState.version = '1'
    } else {
      console.error('加载配置失败:', error);
      message.error(error?.message || '加载配置失败');
    }
  } finally {
    loading.value = false;
  }
};

// 提交配置
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    // 检查二维码是否已上传
    if (qrCodeFileList.value.length > 0) {
      const firstFile = qrCodeFileList.value[0];
      if (firstFile.status === 'done') {
        const imageUrl = firstFile.url || firstFile.response?.url || firstFile.response?.image_url;
        if (imageUrl && !formState.qr_code_url) {
          formState.qr_code_url = imageUrl;
        }
      } else if (firstFile.status === 'uploading') {
        message.warning('二维码正在上传中，请稍候...');
        return;
      } else if (firstFile.status === 'error') {
        message.error('二维码上传失败，请重新上传');
        return;
      }
    }
    
    const submitData: Partial<ConfigItem> = {
      privacy_policy: formState.privacy_policy,
      user_agreement: formState.user_agreement,
      about_us: formState.about_us,
      version: formState.version,
      platform: formState.platform,
      id: formState.id,
      qr_code_url: formState.qr_code_url,
      pay_agreement: formState.pay_agreement,
    };

    // 如果已有配置ID，则更新；否则创建
    if (originalData.value.id) {
      await updateConfigApi(submitData);
      message.success('配置更新成功！');
    } else {
      await createConfigApi(submitData);
      message.success('配置创建成功！');
    }

    // 重新加载数据以获取最新状态
    await loadData();
  } catch (error: any) {
    if (error?.errorFields) {
      // 表单验证错误
      return;
    }
    console.error('保存配置失败:', error);
    message.error(error?.message || '保存配置失败，请重试');
  } finally {
    submitLoading.value = false;
  }
};

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields();
  // 恢复到原始数据
  formState.privacy_policy = originalData.value.privacy_policy || '';
  formState.user_agreement = originalData.value.user_agreement || '';
  formState.about_us = originalData.value.about_us || '';
  formState.version = originalData.value.version || '1';
  formState.qr_code_url = originalData.value.qr_code_url;
  
  // 恢复二维码文件列表
  if (originalData.value.qr_code_url) {
    qrCodeFileList.value = [
      {
        uid: '-1',
        name: 'qr_code',
        status: 'done',
        url: originalData.value.qr_code_url,
      },
    ];
  } else {
    qrCodeFileList.value = [];
  }
};

// 上传前检查
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

// 执行上传
const handleUploadFile = async () => {
  if (qrCodeFileList.value.length === 0) {
    return;
  }
  
  // 找到需要上传的文件（状态不是 done 的文件）
  const filesToUpload = qrCodeFileList.value.filter(file => file.status !== 'done' && file.originFileObj);
  
  if (filesToUpload.length === 0) {
    return;
  }
  
  try {
    const formData = new FormData();
    filesToUpload.forEach((file) => {
      if (file.originFileObj) {
        formData.append('file', file.originFileObj);
      }
    });

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
      formState.qr_code_url = imageUrl;
      
      // 更新文件列表状态
      filesToUpload.forEach((file) => {
        const fileIndex = qrCodeFileList.value.findIndex(f => f.uid === file.uid);
        if (fileIndex > -1) {
          qrCodeFileList.value[fileIndex] = {
            ...qrCodeFileList.value[fileIndex],
            url: imageUrl,
            status: 'done' as const,
            response: { url: imageUrl, image_url: imageUrl },
          };
        }
      });
      
      message.success('上传成功！');
    } else {
      throw new Error('上传失败：未返回图片URL或ID');
    }
  } catch (error: any) {
    console.error('上传失败:', error);
    message.error(error?.message || '上传失败，请重试');
    
    // 更新文件状态为 error
    filesToUpload.forEach((file) => {
      const fileIndex = qrCodeFileList.value.findIndex(f => f.uid === file.uid);
      if (fileIndex > -1) {
        qrCodeFileList.value[fileIndex] = {
          ...qrCodeFileList.value[fileIndex],
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
    previewImage.value = formState.qr_code_url || '';
  }
  previewVisible.value = true;
};

// 文件变化处理
const handleFileChange = async (info: any) => {
  qrCodeFileList.value = info.fileList || [];
  
  // 检测到新文件时，立即上传
  const newFiles = info.fileList?.filter((file: UploadFile) => 
    file.originFileObj && file.status !== 'done' && file.status !== 'uploading' && file.status !== 'error'
  );
  
  if (newFiles && newFiles.length > 0) {
    // 设置文件状态为 uploading
    newFiles.forEach((file: UploadFile) => {
      const fileIndex = qrCodeFileList.value.findIndex(f => f.uid === file.uid);
      if (fileIndex > -1) {
        qrCodeFileList.value[fileIndex] = {
          ...qrCodeFileList.value[fileIndex],
          status: 'uploading' as const,
        };
      }
    });
    
    // 执行上传
    await handleUploadFile();
  }
};

// 移除图片
const handleRemove = () => {
  formState.qr_code_url = undefined;
  qrCodeFileList.value = [];
  return true;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.config-management {
  :deep(.ant-form-item-label) {
    font-weight: 500;
  }
}
</style>

