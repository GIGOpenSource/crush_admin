<template>
  <div class="template-library">
    <a-card :bordered="false">
      <template #title>
        <span>模板背景图片</span>
      </template>
      <template #extra>
        <a-space>
          <a-button type="primary" @click="handleAdd">新增</a-button>
        </a-space>
      </template>
      <div class="library-wrapper">
        <a-row :gutter="[12, 12]">
          <a-col :xs="6" :sm="4" :md="3" :lg="3" :xl="3" v-for="item in imageList" :key="item.id">
            <div class="image-item">
              <div class="image-wrapper">
                <img :src="item.image_url" alt="模板背景" />
                <div class="image-overlay">
                  <a-button
                    type="text"
                    danger
                    class="delete-btn"
                    @click="handleDelete(item)"
                    :loading="deletingId === item.id"
                  >
                    <template #icon>
                      <CloseOutlined />
                    </template>
                  </a-button>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
        <a-empty v-if="imageList.length === 0 && !loading" description="暂无图片" />
        <a-spin :spinning="loading" style="width: 100%; text-align: center; padding: 40px 0">
          <div v-if="loading"></div>
        </a-spin>
        <!-- 分页组件 -->
        <div class="pagination-wrapper" v-if="imageList.length > 0 || paginationConfig.total > 0">
          <a-pagination
            v-model:current="paginationConfig.current"
            v-model:page-size="paginationConfig.pageSize"
            :total="paginationConfig.total"
            :show-size-changer="false"
            :show-total="(total: number) => `共 ${total} 条`"
            @change="handlePageChange"
            @show-size-change="handlePageSizeChange"
          />
        </div>
      </div>
    </a-card>

    <!-- 批量上传弹窗 -->
    <a-modal
      v-model:open="uploadModalVisible"
      title="批量上传图片"
      :confirm-loading="uploading"
      ok-text="上传"
      cancel-text="取消"
      @ok="handleUpload"
      @cancel="handleCancelUpload"
      :width="600"
    >
      <a-upload
        v-model:file-list="fileList"
        list-type="picture-card"
        :multiple="true"
        :before-upload="beforeUpload"
        @preview="handlePreview"
        @remove="handleRemove"
        accept="image/*"
      >
        <div v-if="fileList.length < 20">
          <PlusOutlined />
          <div style="margin-top: 8px">上传图片</div>
        </div>
      </a-upload>
      <div class="upload-tip">
        <a-alert
          message="提示"
          description="支持批量上传，最多可选择20张图片。支持的格式：JPG、PNG、GIF等图片格式。"
          type="info"
          show-icon
          style="margin-top: 16px"
        />
      </div>
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
import { PlusOutlined, CloseOutlined } from '@ant-design/icons-vue';
import type { UploadFile, UploadProps } from 'ant-design-vue';
import {
  getTemplateImagesApi,
  uploadTemplateImagesApi,
  deleteTemplateImageApi,
  type TemplateImageItem,
} from '@/api/template-library';

const loading = ref(false);
const uploading = ref(false);
const imageList = ref<TemplateImageItem[]>([]);
const uploadModalVisible = ref(false);
const previewVisible = ref(false);
const previewImage = ref('');
const fileList = ref<UploadFile[]>([]);
const deletingId = ref<number | null>(null);

// 分页配置
const paginationConfig = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
  showSizeChanger: false,
  showTotal: (total: number) => `共 ${total} 条`,
});

// 加载图片列表
const loadData = async () => {
  loading.value = true;
  try {
    const response: any = await getTemplateImagesApi(paginationConfig.current, paginationConfig.pageSize);
    if (response && response.data) {
      // 处理分页数据
      if (response.data.results) {
        imageList.value = response.data.results || [];
        paginationConfig.total = response.data.pagination?.total || response.data.count || 0;
      } else if (Array.isArray(response.data)) {
        imageList.value = response.data;
        // 如果是数组，可能需要从其他地方获取总数
        paginationConfig.total = response.data.length;
      } else {
        imageList.value = [];
        paginationConfig.total = 0;
      }
    } else {
      imageList.value = [];
      paginationConfig.total = 0;
    }
  } catch (error: any) {
    console.error('获取图片列表失败:', error);
    message.error(error?.message || '获取图片列表失败');
    imageList.value = [];
    paginationConfig.total = 0;
  } finally {
    loading.value = false;
  }
};

// 分页变化处理
const handlePageChange = (page: number, pageSize: number) => {
  paginationConfig.current = page;
  paginationConfig.pageSize = pageSize;
  loadData();
};

// 每页条数变化处理
const handlePageSizeChange = (_current: number, size: number) => {
  paginationConfig.current = 1;
  paginationConfig.pageSize = size;
  loadData();
};

// 点击新增按钮
const handleAdd = () => {
  fileList.value = [];
  uploadModalVisible.value = true;
};

// 上传前的验证
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
  }
  previewVisible.value = true;
};

// 移除文件
const handleRemove = (file: UploadFile) => {
  const index = fileList.value.indexOf(file);
  const newFileList = fileList.value.slice();
  newFileList.splice(index, 1);
  fileList.value = newFileList;
};

// 执行上传
const handleUpload = async () => {
  if (fileList.value.length === 0) {
    message.warning('请至少选择一张图片！');
    return;
  }
  uploading.value = true;
  try {
    // 将 fileList.value 中的图片二进制数据转换为 FormData
    const formData = new FormData();
    fileList.value.forEach((file) => {
      if (file.originFileObj) {
        // 根据后端接口要求，可能需要使用 'files' 或 'file' 作为字段名
        // 如果支持多文件，可以使用 files[] 或 files
        formData.append('files', file.originFileObj);
      }
    });

    // 直接传递二进制数据
    await uploadTemplateImagesApi(formData);
    message.success('上传成功！');
    uploadModalVisible.value = false;
    fileList.value = [];
    // 上传成功后，跳转到第一页查看新上传的图片
    paginationConfig.current = 1;
    await loadData(); // 重新加载列表
  } catch (error: any) {
    console.error('上传失败:', error);
    message.error(error?.message || '上传失败，请重试');
  } finally {
    uploading.value = false;
  }
};

// 取消上传
const handleCancelUpload = () => {
  fileList.value = [];
  uploadModalVisible.value = false;
};

// 删除图片
const handleDelete = (item: TemplateImageItem) => {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这张图片吗？',
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      deletingId.value = item.id;
      try {
        await deleteTemplateImageApi(item.id);
        message.success('删除成功！');
        // 如果当前页删除后没有数据了，且不是第一页，则跳转到上一页
        if (imageList.value.length === 1 && paginationConfig.current > 1) {
          paginationConfig.current -= 1;
        }
        await loadData(); // 重新加载列表
      } catch (error: any) {
        console.error('删除失败:', error);
        message.error(error?.message || '删除失败，请重试');
      } finally {
        deletingId.value = null;
      }
    },
  });
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.template-library {
  .library-wrapper {
    margin-top: 16px;
  }

  .image-item {
    position: relative;
    width: 100%;
    padding-bottom: 100%; // 保持正方形
    height: 0;
    overflow: hidden;
    border-radius: 4px;
    background: #f5f5f5;

    .image-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        .image-overlay {
          opacity: 1;
        }
      }

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }

      .image-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        transition: opacity 0.3s;

        .delete-btn {
          color: #fff;
          font-size: 20px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;

          &:hover {
            background: rgba(255, 77, 79, 0.8);
            color: #fff;
          }
        }
      }
    }
  }

  .upload-tip {
    margin-top: 16px;
  }

  .pagination-wrapper {
    margin-top: 24px;
    display: flex;
    justify-content: flex-end;
    padding: 16px 0;
  }
}

:deep(.ant-upload-select-picture-card) {
  width: 100%;
  height: 100%;
}

:deep(.ant-upload-list-picture-card) {
  .ant-upload-list-item {
    width: 100%;
    height: 100%;
  }
}
</style>

