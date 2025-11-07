<template>
  <div class="template-management">
    <a-card :bordered="false">
      <template #title>
        <span>模板管理</span>
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
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'template_purpose'">
              <span>{{ record.template_purpose === 'poster' ? '海报' : '报告' }}</span>
            </template>
            <template v-else-if="column.key === 'template_belong'">
              <span>
                {{ record.template_belong === 'chat' ? '历史聊天' : 
                   record.template_belong === 'social' ? '社交平台' : 
                   record.template_belong === 'physical' ? '实物场景' : 
                   record.template_belong === 'consume' ? '消费行程' : '--' }}
              </span>
            </template>
            <template v-else-if="column.key === 'score'">
              <span>
                {{ record.min_score }} ~ {{ record.max_score }}
              </span>
            </template>
            <template v-else-if="column.key === 'is_active'">
              <a-tag :color="record.is_active ? 'green' : 'default'">
                {{ record.is_active ? '启用' : '禁用' }}
              </a-tag>
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
      <a-spin :spinning="detailLoading">
        <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
        >
          <a-form-item label="模板类型" name="template_purpose">
            <a-radio-group v-model:value="formState.template_purpose">
              <a-radio value="poster">海报</a-radio>
              <a-radio value="report">报告</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="模板名称" name="name">
            <a-input v-model:value="formState.name" placeholder="请输入模板名称" />
          </a-form-item>
          <a-form-item label="模板归属" name="template_belong">
            <a-select v-model:value="formState.template_belong" placeholder="请选择模板归属" allow-clear>
              <a-select-option value="chat">历史聊天</a-select-option>
              <a-select-option value="social">社交平台</a-select-option>
              <a-select-option value="physical">实物场景</a-select-option>
              <a-select-option value="consume">消费行程</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="模板分数" name="score_range">
            <a-space>
              <a-input-number
                v-model:value="formState.min_score"
                :min="0"
                :max="100"
                placeholder="最小值"
                style="width: 120px"
              />
              <span>至</span>
              <a-input-number
                v-model:value="formState.max_score"
                :min="0"
                :max="100"
                placeholder="最大值"
                style="width: 120px"
              />
            </a-space>
          </a-form-item>
          <a-form-item label="模板图片" name="image_ids">
            <div class="selected-images">
              <div v-if="imageFileList.length === 0" class="selected-images__empty">暂未选择图片</div>
              <div v-else class="selected-images__list" style="display: flex;flex-wrap: wrap;">
                <div
                  v-for="item in imageFileList"
                  :key="item.uid"
                  class="selected-images__item"
                  style="width: 20%;margin-right: 10px;position: relative;"
                  @click="handlePreview(item)"
                >
                  <img :src="item.url" alt="模板图片" style="width: 100%; height: 100%; object-fit: cover;"/>
                  <div
                    type="text"
                    size="small"
                    danger
                    class="selected-images__remove"
                    style="position: absolute;top: 0px;right: 0px;font-size: 20px;color: red;"
                    @click.stop="handleRemoveImage(item)"
                  >×</div>
                </div>
              </div>
            </div>
            <a-button type="dashed" block @click="openImagePicker">
              <PlusOutlined />
              <span style="margin-left: 8px">选择图片</span>
            </a-button>
          </a-form-item>
          <a-form-item label="是否启用" name="is_active">
            <a-select v-model:value="formState.is_active" placeholder="请选择">
              <a-select-option :value="true">启用</a-select-option>
              <a-select-option :value="false">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-spin>
    </a-modal>

    <!-- 图片选择弹窗 -->
    <a-modal
      v-model:open="imagePickerVisible"
      title="选择模板图片"
      :confirm-loading="imagePickerLoading"
      ok-text="确定"
      cancel-text="取消"
      @ok="handleImagePickerOk"
      @cancel="closeImagePicker"
      width="900px"
    >
      <a-spin :spinning="imagePickerLoading">
        <div class="image-picker">
          <div class="image-picker__toolbar">
            <a-checkbox :checked="isCurrentPageAllSelected" @change="handleImagePickerSelectAll">
              全选当前页
            </a-checkbox>
            <a-button type="link" size="small" @click="clearAllImageSelections">清空已选</a-button>
            <span class="image-picker__counter">已选 {{ imagePickerSelectedIds.length }} 张</span>
          </div>
          <a-row :gutter="[16, 16]">
            <a-col v-for="item in imagePickerImages" :key="item.id" :xs="6" :sm="4" :md="3" :lg="3" :xl="3">
              <div
                :class="['image-picker__item', imagePickerSelectedIds.includes(Number(item.id)) ? 'image-picker__item--active' : '']"
                @click="toggleImageSelection(item.id)"
              >
                <div class="image-picker__thumb">
                  <img style="width: 100%; height: 100%; object-fit: cover;" :src="item.image_url || defaultImagePlaceholder" alt="模板图片" />
                  <div v-if="imagePickerSelectedIds.includes(Number(item.id))" class="image-picker__checkmark">
                    <span class="image-picker__checkmark-icon" style="font-size: 12px;color: red;position: absolute;top: 0;right: 0;">✓</span>
                  </div>
                </div>
              </div>
            </a-col>
          </a-row>
          <div class="image-picker__pagination" v-if="imagePickerPagination.total > imagePickerPagination.pageSize">
            <a-pagination
              :current="imagePickerPagination.current"
              :page-size="imagePickerPagination.pageSize"
              :total="imagePickerPagination.total"
              :show-size-changer="false"
              size="small"
              @change="handleImagePickerPageChange"
            />
          </div>
        </div>
      </a-spin>
    </a-modal>

    <!-- 图片预览 -->
    <a-modal v-model:open="previewVisible" :footer="null" centered>
      <img alt="预览" style="width: 100%" :src="previewImage" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { message, Modal } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import type { TableColumnsType, FormInstance } from 'ant-design-vue';
import {
  getTemplateListApi,
  createTemplateApi,
  updateTemplateApi,
  deleteTemplateApi,
  detailsTemplateApi,
  type TemplateItem,
  type TemplateParams,
} from '@/api/template';
import { getTemplateImagesApi, type TemplateImageItem } from '@/api/template-library';

interface SelectedImageItem {
  uid: string;
  imageId: number;
  url: string;
}

const loading = ref(false);
const submitLoading = ref(false);
const dataSource = ref<TemplateItem[]>([]);
const modalVisible = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const imageFileList = ref<SelectedImageItem[]>([]);
const previewVisible = ref(false);
const previewImage = ref('');
const detailLoading = ref(false);
const templateImageMap = ref<Record<number, string>>({});
const defaultImagePlaceholder = 'https://via.placeholder.com/200x200?text=Preview';
const imagePickerVisible = ref(false);
const imagePickerLoading = ref(false);
const imagePickerImages = ref<TemplateImageItem[]>([]);
const imagePickerSelectedIds = ref<number[]>([]);
const imagePickerPagination = reactive({
  current: 1,
  pageSize: 20,
  total: 0,
});

const formState = reactive<Partial<TemplateParams>>({
  name: '',
  template_purpose: 'poster',
  template_belong: undefined,
  min_score: undefined,
  max_score: undefined,
  image_ids: [],
  is_active: true,
});

const rules = {
  name: [{ required: true, message: '请输入模板名称', trigger: 'blur' }],
  template_purpose: [{ required: true, message: '请选择模板类型', trigger: 'change' }],
  is_active: [{ required: true, message: '请选择是否启用', trigger: 'change' }],
};

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => (paginationConfig.current - 1) * paginationConfig.pageSize + index + 1,
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '模板类型',
    dataIndex: 'template_purpose',
    key: 'template_purpose',
    width: 100,
  },
  {
    title: '模板归属',
    dataIndex: 'template_belong',
    key: 'template_belong',
    width: 120,
  },
  {
    title: '模板分数',
    key: 'score',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'created_time',
    key: 'created_time',
  },
  {
    title: '操作',
    key: 'action',
    width: 150,
    fixed: 'right',
  },
];

const fetchTemplateImageMap = async () => {
  try {
    const response: any = await getTemplateImagesApi(1, 1000);
    const images: TemplateImageItem[] = Array.isArray(response?.data)
      ? response.data
      : response?.data?.results || [];

    const map: Record<number, string> = {};
    images.forEach((img) => {
      if (img.id !== undefined) {
        map[img.id] = img.image_url || img.url;
      }
    });
    templateImageMap.value = map;
  } catch (error) {
    console.error('加载模板图片失败:', error);
    templateImageMap.value = {};
  }
};

const loadImagePickerImages = async (page: number = imagePickerPagination.current) => {
  imagePickerLoading.value = true;
  try {
    const response: any = await getTemplateImagesApi(page, imagePickerPagination.pageSize);
    const { data } = response || {};
    const list: TemplateImageItem[] = Array.isArray(data) ? data : data?.results || [];
    imagePickerImages.value = list;
    list.forEach((img) => {
      if (img.id !== undefined) {
        templateImageMap.value[img.id] = img.image_url || img.url;
      }
    });
    imagePickerPagination.total = data?.pagination?.total || data?.count || list.length;
    imagePickerPagination.current = page;
  } catch (error) {
    console.error('加载模板库图片失败:', error);
    imagePickerImages.value = [];
    imagePickerPagination.total = 0;
  } finally {
    imagePickerLoading.value = false;
  }
};

const openImagePicker = async () => {
  imagePickerVisible.value = true;
  // 确保ID类型统一为数字
  const selectedIds = (formState.image_ids || []).map(id => Number(id)).filter(id => !isNaN(id));
  imagePickerSelectedIds.value = [...selectedIds];
  await loadImagePickerImages(1);
};

const closeImagePicker = () => {
  imagePickerVisible.value = false;
};

const toggleImageSelection = (id: number) => {
  // 确保ID类型统一为数字
  const numId = Number(id);
  if (isNaN(numId)) return;
  
  const index = imagePickerSelectedIds.value.indexOf(numId);
  if (index > -1) {
    imagePickerSelectedIds.value.splice(index, 1);
  } else {
    imagePickerSelectedIds.value.push(numId);
  }
  imagePickerSelectedIds.value = [...imagePickerSelectedIds.value];
};

const handleImagePickerPageChange = async (page: number) => {
  await loadImagePickerImages(page);
};

const handleImagePickerOk = async () => {
  formState.image_ids = [...imagePickerSelectedIds.value];
  await populateImageFileList(formState.image_ids);
  imagePickerVisible.value = false;
};

watch(imagePickerVisible, async (visible) => {
  if (!visible && formState.image_ids?.length) {
    await populateImageFileList(formState.image_ids);
  }
});

const populateImageFileList = async (imageIds: number[] = []) => {
  if (!imageIds.length) {
    imageFileList.value = [];
    return;
  }

  if (Object.keys(templateImageMap.value).length === 0) {
    await fetchTemplateImageMap();
  }

  imageFileList.value = imageIds.map((id, index) => ({
    uid: `selected-${id}-${index}`,
    imageId: id,
    url: templateImageMap.value[id] || defaultImagePlaceholder,
  }));
  imagePickerSelectedIds.value = [...imageIds];
};

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
  onShowSizeChange: (_current: number, size: number) => {
    paginationConfig.current = 1;
    paginationConfig.pageSize = size;
    loadData();
  },
});

// 加载数据
const loadData = async () => {
  loading.value = true;
  try {
    const response: any = await getTemplateListApi(paginationConfig.current, paginationConfig.pageSize);
    if (response && response.data) {
      if (response.data.results) {
        dataSource.value = response.data.results || [];
        paginationConfig.total = response.data.pagination?.total || response.data.count || 0;
      } else if (Array.isArray(response.data)) {
        dataSource.value = response.data;
        paginationConfig.total = response.data.length;
      } else {
        dataSource.value = [];
        paginationConfig.total = 0;
      }
    } else {
      dataSource.value = [];
      paginationConfig.total = 0;
    }
  } catch (error: any) {
    console.error('获取模板列表失败:', error);
    message.error(error?.message || '获取模板列表失败');
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
  detailLoading.value = false;
  modalVisible.value = true;
};

// 编辑
const handleEdit = async (record: TemplateItem) => {
  currentEditId.value = record.id;
  detailLoading.value = true;
  modalVisible.value = true;

  try {
    const response: any = await detailsTemplateApi(record.id);
    const detail: TemplateItem = response?.data || response;

    formState.name = detail.name;
    formState.template_purpose = detail.template_purpose;
    formState.template_belong = detail.template_belong;
    formState.min_score = detail.min_score;
    formState.max_score = detail.max_score;
    formState.image_ids = detail.image_ids || [];
    formState.is_active = detail.is_active;

    // 优先使用 images_detail 中的 image_url 进行回显
    if (detail.images_detail && detail.images_detail.length > 0) {
      // 从 images_detail 中提取图片ID
      const imageIds = detail.images_detail.map((img) => img.id).filter((id) => id !== undefined);
      formState.image_ids = imageIds;
      
      imageFileList.value = detail.images_detail.map((img, index) => ({
        uid: `selected-${img.id}-${index}`,
        imageId: img.id,
        url: img.image_url || defaultImagePlaceholder,
      }));
      // 同步更新 templateImageMap
      detail.images_detail.forEach((img) => {
        if (img.id !== undefined && img.image_url) {
          templateImageMap.value[img.id] = img.image_url;
        }
      });
      // 同步更新 imagePickerSelectedIds，确保打开弹窗时显示选中状态
      imagePickerSelectedIds.value = [...imageIds];
    } else {
      // 如果没有 images_detail，使用原来的逻辑
      await populateImageFileList(detail.image_ids || []);
    }
  } catch (error: any) {
    console.error('获取模板详情失败:', error);
    message.error(error?.message || '获取模板详情失败');
    imageFileList.value = [];
  } finally {
    detailLoading.value = false;
  }
};

// 删除
const handleDelete = (record: TemplateItem) => {
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除模板"${record.name}"吗？`,
    okText: '确定',
    cancelText: '取消',
    onOk: async () => {
      try {
        await deleteTemplateApi(record.id);
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
    await formRef.value.validate();
    submitLoading.value = true;

    const imageIds = (formState.image_ids || [])
      .map((id) => Number(id))
      .filter((id) => !Number.isNaN(id));

    const params: TemplateParams = {
      name: formState.name!,
      template_purpose: formState.template_purpose!,
      template_belong: formState.template_belong,
      min_score: formState.min_score,
      max_score: formState.max_score,
      image_ids: imageIds,
      is_active: formState.is_active!,
    };

    if (currentEditId.value) {
      await updateTemplateApi(currentEditId.value, params);
      message.success('更新成功！');
    } else {
      await createTemplateApi(params);
      message.success('创建成功！');
    }

    formState.image_ids = imageIds;
    imagePickerSelectedIds.value = [...imageIds];

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
  detailLoading.value = false;
  modalVisible.value = false;
};

// 重置表单
const resetForm = () => {
  formState.name = '';
  formState.template_purpose = 'poster';
  formState.template_belong = undefined;
  formState.min_score = undefined;
  formState.max_score = undefined;
  formState.image_ids = [];
  formState.is_active = true;
  imageFileList.value = [];
  imagePickerSelectedIds.value = [];
  formRef.value?.resetFields();
};

// 预览图片
const handlePreview = (item: SelectedImageItem) => {
  const previewUrl = item.url || templateImageMap.value[item.imageId] || defaultImagePlaceholder;
  previewImage.value = previewUrl;
  previewVisible.value = true;
};

// 移除图片
const handleRemoveImage = (item: SelectedImageItem) => {
  imageFileList.value = imageFileList.value.filter((img) => img.imageId !== item.imageId);
  formState.image_ids = imageFileList.value.map((img) => img.imageId);
  imagePickerSelectedIds.value = imagePickerSelectedIds.value.filter((id) => id !== item.imageId);
};

const isCurrentPageAllSelected = computed(() => {
  if (!imagePickerImages.value.length) return false;
  return imagePickerImages.value.every((item) => imagePickerSelectedIds.value.includes(Number(item.id)));
});

const handleImagePickerSelectAll = (e: any) => {
  const checked = e.target?.checked;
  // 确保ID类型统一为数字
  const currentIds = imagePickerImages.value.map((item) => Number(item.id)).filter(id => !isNaN(id));
  if (checked) {
    const merged = new Set([...imagePickerSelectedIds.value, ...currentIds]);
    imagePickerSelectedIds.value = Array.from(merged);
  } else {
    imagePickerSelectedIds.value = imagePickerSelectedIds.value.filter((id) => !currentIds.includes(id));
  }
};

const clearAllImageSelections = () => {
  imagePickerSelectedIds.value = [];
};

onMounted(() => {
  loadData();
  fetchTemplateImageMap();
});
</script>

<style lang="less" scoped>
.template-management {
  .table-wrapper {
    margin-top: 16px;
  }

  .selected-images {
    margin-bottom: 12px;

    &__empty {
      color: #999;
      margin-bottom: 12px;
    }

    &__list {
      display: flex;
      align-items: flex-end;
      gap: 16px;
      margin-bottom: 12px;
      flex-wrap: wrap;
    }

    &__item {
      position: relative;
      display: inline-block;
      flex: 0 0 auto;
      border: 1px solid #e5e5e5;
      border-radius: 6px;
      background: #fff;
      padding: 4px;

      img {
        display: block;
        height: 120px;
        width: auto;
        object-fit: contain;
        border-radius: 4px;
        position: relative;
      }
    }

    &__remove {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 20px;
      height: 20px;
      line-height: 18px;
      padding: 0;
      border-radius: 50%;
      border: none;
      background: rgba(0, 0, 0, 0.6);
      color: #fff;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }
  }

  .image-picker {
    min-height: 200px;

    &__toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    &__counter {
      color: #666;
    }

    &__item {
      border: 2px solid transparent;
      border-radius: 6px;
      overflow: hidden;
      cursor: pointer;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      background: #f5f5f5;
      position: relative;

      &--active {
        border-color: #1890ff;
        box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
      }
    }

    &__thumb {
      position: relative;
      width: 100%;
      padding-bottom: 100%;
      height: 0;
      overflow: hidden;

      img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
    }

    &__checkmark {
      position: absolute;
      top: 4px;
      right: 4px;
      width: 24px;
      height: 24px;
      background: #ff4d4f;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
      transition: background 0.2s, box-shadow 0.2s;
    }

    &__item:active &__checkmark {
      background: transparent;
      box-shadow: none;
    }

    &__checkmark-icon {
      color: #fff;
      font-size: 16px;
      font-weight: bold;
      line-height: 1;
    }

    &__pagination {
      margin-top: 16px;
      text-align: right;
    }
  }
}

</style>

