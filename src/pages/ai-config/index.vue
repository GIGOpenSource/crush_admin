<template>
  <div class="ai-config">
    <a-card :bordered="false">
      <template #title>
        <span>AI配置</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAdd"> 新增 </a-button>
      </template>
      <!-- 表格区域 -->
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
              {{
                (paginationConfig.current - 1) * paginationConfig.pageSize +
                index +
                1
              }}
            </template>
            <template v-if="column.key === 'enabled'">
              <a-tag :color="record.enabled ? 'green' : 'default'">
                {{ record.enabled ? "开启" : "关闭" }}
              </a-tag>
            </template>
            <template v-if="column.key === 'is_default'">
              <a-tag :color="record.is_default ? 'blue' : 'default'">
                {{ record.is_default ? "默认" : "-" }}
              </a-tag>
            </template>
            <template v-if="column.key === 'created_at'">
              {{ formatDateTime(record.created_at) }}
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  danger
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    <!-- 新增/编辑弹窗 -->
    <a-modal
      v-model:open="modalVisible"
      :title="isEdit ? '新增/编辑' : '新增/编辑'"
      :confirm-loading="submitLoading"
      @ok="handleSubmit"
      @cancel="handleCancel"
      width="600px"
    >
      <a-form
        ref="formRef"
        :model="formState"
        :rules="rules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="名称" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="请输入平台名称"
          />
        </a-form-item>
        <a-form-item label="模型地址" name="base_url">
          <a-input
            v-model:value="formState.base_url"
            placeholder="请输入平台地址"
          />
        </a-form-item>
        <a-form-item label="模型apikey" name="api_key">
          <a-input-password
            v-model:value="formState.api_key"
            placeholder="请输入平台apikey"
          />
        </a-form-item>
        <a-form-item label="状态" name="enabled">
          <a-select
            v-model:value="formState.enabled"
            placeholder="请选择状态"
            :options="statusOptions"
          />
        </a-form-item>
        <a-form-item label="优先级" name="priority">
          <a-input-number
            v-model:value="formState.priority"
            :min="0"
            placeholder="请输入优先级"
            style="width: 100%"
          />
          <div style="color: #999; font-size: 12px; margin-top: 4px">
            (数字越大,优先级越高)
          </div>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { message, Modal } from "ant-design-vue";
import type { TableColumnsType, FormInstance } from "ant-design-vue";
import {
  getAIModelListApi,
  createAIModelApi,
  updateAIModelApi,
  deleteAIModelApi,
  type AIModelItem,
} from "@/api/ai-config";

const loading = ref(false);
const submitLoading = ref(false);
const dataSource = ref<AIModelItem[]>([]);
const modalVisible = ref(false);
const isEdit = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();

const formState = reactive({
  name: "",
  provider: "",
  model: "",
  api_key: "",
  base_url: "",
  region: "",
  api_version: "",
  organization_id: "",
  email: "",
  enabled: true,
  is_default: false,
  priority: 0,
});

const statusOptions = [
  { label: "开启", value: true },
  { label: "关闭", value: false },
];

const rules = {
  name: [{ required: true, message: "请输入名称", trigger: "blur" }],
  api_key: [{ required: true, message: "请输入 API Key", trigger: "blur" }],
  base_url: [
    { required: true, message: "请输入模型地址", trigger: "blur" },
    {
      validator: (_rule: any, value: string) => {
        if (!value) {
          return Promise.reject("请输入模型地址");
        }
        if (!/^https?:\/\//i.test(value)) {
          return Promise.reject("模型地址必须以 http:// 或 https:// 开头");
        }
        return Promise.resolve();
      },
      trigger: "blur",
    },
  ],
  priority: [{ required: true, message: "请输入优先级", trigger: "blur" }],
};

const columns: TableColumnsType = [
  {
    title: "序号",
    key: "index",
    width: 80,
  },
  {
    title: "模型名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "启用",
    dataIndex: "enabled",
    key: "enabled",
    width: 100,
  },
  {
    title: "优先级",
    dataIndex: "priority",
    key: "priority",
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 150,
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

// 格式化日期时间
const formatDateTime = (dateTimeStr: string) => {
  if (!dateTimeStr) return "";
  const date = new Date(dateTimeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };
    const res = await getAIModelListApi(params);
    dataSource.value = res.data.results || [];
    paginationConfig.total =
      res.data.pagination.count || res.data.pagination.total || 0;
  } catch (error) {
    console.error("加载AI模型列表失败:", error);
    message.error("加载AI模型列表失败");
  } finally {
    loading.value = false;
  }
};

// 新增
const handleAdd = async () => {
  isEdit.value = false;
  currentEditId.value = null;
  resetForm();
  modalVisible.value = true;
  await nextTick();
  formRef.value?.resetFields();
};

// 编辑
const handleEdit = (record: AIModelItem) => {
  isEdit.value = true;
  currentEditId.value = record.id;
  formState.name = record.name;
  formState.provider = record.provider;
  formState.model = record.model;
  formState.api_key = record.api_key;
  formState.base_url = record.base_url;
  formState.region = record.region;
  formState.api_version = record.api_version;
  formState.organization_id = record.organization_id;
  formState.email = record.email || "";
  formState.enabled = record.enabled;
  formState.is_default = record.is_default;
  formState.priority = record.priority;
  modalVisible.value = true;
};

// 删除
const handleDelete = (record: AIModelItem) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除模型 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        await deleteAIModelApi(record.id);
        message.success("删除成功");
        loadData();
      } catch (error) {
        console.error("删除AI模型失败:", error);
        message.error("删除AI模型失败");
      }
    },
  });
};

// 提交表单
const handleSubmit = async () => {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    const submitData = {
      name: formState.name,
      provider: formState.provider,
      model: formState.model,
      api_key: formState.api_key,
      base_url: formState.base_url,
      region: formState.region || undefined,
      api_version: formState.api_version || undefined,
      organization_id: formState.organization_id || undefined,
      email: formState.email || undefined,
      enabled: formState.enabled,
      is_default: formState.is_default,
      priority: formState.priority,
    };

    if (isEdit.value && currentEditId.value) {
      await updateAIModelApi(currentEditId.value, submitData);
      message.success("更新成功");
    } else {
      await createAIModelApi(submitData);
      message.success("创建成功");
    }

    modalVisible.value = false;
    loadData();
  } catch (error: any) {
    if (error?.errorFields) {
      // 表单验证错误
      return;
    }
    console.error("保存AI模型失败:", error);
    message.error("保存AI模型失败");
  } finally {
    submitLoading.value = false;
  }
};

// 取消
const handleCancel = () => {
  modalVisible.value = false;
  resetForm();
};

// 重置表单
const resetForm = () => {
  formState.name = "";
  formState.provider = "";
  formState.model = "";
  formState.api_key = "";
  formState.base_url = "";
  formState.region = "";
  formState.api_version = "";
  formState.organization_id = "";
  formState.email = "";
  formState.enabled = true;
  formState.is_default = false;
  formState.priority = 0;
  formRef.value?.resetFields();
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.ai-config {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>
