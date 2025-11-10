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
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === 1 ? 'green' : 'default'">
                {{ record.status === 1 ? "开启" : "关闭" }}
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
        <a-form-item label="模型名称" name="name">
          <a-input
            v-model:value="formState.name"
            placeholder="请输入平台名称"
          />
        </a-form-item>
        <a-form-item label="模型地址" name="address">
          <a-input
            v-model:value="formState.address"
            placeholder="请输入平台地址"
          />
        </a-form-item>
        <a-form-item label="模型apikey" name="api_key">
          <a-input-password
            v-model:value="formState.api_key"
            placeholder="请输入平台apikey"
          />
        </a-form-item>
        <a-form-item label="状态" name="status">
          <a-select v-model:value="formState.status" placeholder="请选择状态">
            <a-select-option :value="1">开启</a-select-option>
            <a-select-option :value="0">关闭</a-select-option>
          </a-select>
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
import { ref, reactive, onMounted } from "vue";
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
  address: "",
  api_key: "",
  status: 1,
  priority: 0,
});

const rules = {
  name: [{ required: true, message: "请输入模型名称", trigger: "blur" }],
  address: [{ required: true, message: "请输入模型地址", trigger: "blur" }],
  api_key: [{ required: true, message: "请输入模型apikey", trigger: "blur" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
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
    title: "状态",
    dataIndex: "status",
    key: "status",
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
const handleAdd = () => {
  isEdit.value = false;
  currentEditId.value = null;
  resetForm();
  modalVisible.value = true;
};

// 编辑
const handleEdit = (record: AIModelItem) => {
  isEdit.value = true;
  currentEditId.value = record.id;
  formState.name = record.name;
  formState.address = record.address;
  formState.api_key = record.api_key;
  formState.status = record.status;
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
      address: formState.address,
      api_key: formState.api_key,
      status: formState.status,
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
  formState.address = "";
  formState.api_key = "";
  formState.status = 1;
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
