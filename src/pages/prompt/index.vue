<template>
  <div class="product-management">
    <a-card :bordered="false">
      <template #title>
        <span>提示词管理</span>
      </template>
      <div class="search-wrapper">
        <a-space :size="16">
          <a-input
              v-model:value="searchText"
              placeholder="请输入提示词名称或描述"
              allow-clear
              @press-enter="handleSearch"
          />
          <a-button type="primary" @click="handleSearch">搜索</a-button>
          <a-button type="primary" @click="handleReset">重置</a-button>
          <a-button type="primary" @click="handleAdd" ><PlusOutlined/>新增提示词</a-button>
        </a-space>
      </div>
      <div class="table-wrapper">
        <a-table
            :columns="columns"
            :data-source="dataSource"
            :loading="loading"
            :pagination="paginationConfig"
            row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
              <a-popconfirm
                  title="确定要删除这条提示词吗？此操作无法撤销。"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="() => handleDelete(record)"
                  @cancel="() => {}"
              >
                <a-button type="link" size="small">删除</a-button>
              </a-popconfirm>
            </template>

          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 编辑弹窗 -->
    <a-modal
        v-model:open="editModalVisible"
        :title="isEditing ? '编辑提示词' : '新增提示词'"
        :confirm-loading="submitLoading"
        ok-text="确定"
        cancel-text="取消"
        @ok="handleSubmit"
        @cancel="handleCancel"
    >
      <a-form
          ref="formRef"
          :model="formState"
          :rules="rules"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
      >
        <a-form-item label="提示词名称" name="name">
          <a-input v-model:value="formState.name" placeholder="请输入提示词名称"/>
        </a-form-item>

        <a-form-item label="提示词内容" name="prompt_content">
          <a-textarea
              v-model:value="formState.prompt_content"
              :rows="4"
              placeholder="请输入提示词内容"
          />
        </a-form-item>

        <a-form-item label="提示词类型" name="template_type">
          <a-select v-model:value="formState.template_type" placeholder="请选择类型">
            <a-select-option v-for="(value, key) in typeDict" :key="key" :value="key">{{ value }}</a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="描述" name="description">
          <a-input v-model:value="formState.description" placeholder="请输入描述"/>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import {ref, reactive} from 'vue';
import {message} from 'ant-design-vue';
import type {TableColumnsType} from 'ant-design-vue';
import type {FormInstance} from 'ant-design-vue';
import {PlusOutlined } from '@ant-design/icons-vue';
import {getPromptListApi, createPromptApi, type PromptItem, updatePromptApi, deletePromptApi} from '@/api/prompt';

const loading = ref(false);
const submitLoading = ref(false);
const isEditing = ref(false);
const editModalVisible = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();
const searchText = ref('');
const selectedType = ref<string>('');

const dataSource = ref<PromptItem[]>([]);
const typeDict = {"social": "社交", "physical": "场景", "chat": "截图", "consume": "消费场景"}
const formState = reactive({
  name: '',
  prompt_content: '',
  template_type: 'social',
  description: '',
});
const handleSearch = () => {
  loadData();
};
const handleReset = () => {
  // 清空搜索框
  searchText.value = '';
  selectedType.value = '';
  // 重新加载数据
  loadData();
};
const resetForm = () => {
  Object.assign(formState, {
    id: 0,
    name: '',
    prompt_content: '',
    template_type: 'social',
    description: '',
    price: 0,
    days: 0,
  });
};
const handleAdd = () => {
  resetForm();
  isEditing.value = false;
  editModalVisible.value = true
};

const handleEdit = (record: any) => {
  Object.assign(formState, record);
  isEditing.value = true;
  editModalVisible.value = true;
  currentEditId.value = record.id;
};
const handleDelete = async (record: any) => {
  try {
    await deletePromptApi(record.id);
    message.success('删除成功！');
    await loadData();
  } catch (error: any) {
    console.error('删除失败:', error);
    message.error(error?.message || '删除失败，请重试');
  }
};
const rules = {
  name: [{required: true, message: '请输入提示词名称', trigger: 'blur'}],
  prompt_content: [{required: true, message: '请输入提示词内容', trigger: 'blur'}],
  template_type: [{required: true, message: '请选择提示词类型', trigger: 'change'}],
  price: [{required: true, message: '请输入商品价格', trigger: 'blur'}],
  days: [{required: true, message: '请输入有效期', trigger: 'blur'}],
};

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({index}) => index + 1,
  },
  {
    title: '提示词名称',
    dataIndex: 'name',
    key: 'name',
    width: 140
  },
  {
    title: '提示词',
    dataIndex: 'prompt_content',
    key: 'prompt_content',
    ellipsis: true,
    width: 150
  },
  {
    title: '提示词类型',
    dataIndex: 'template_type',
    key: 'template_type',
    width: 150,
    customRender: ({text}) => {
      return typeDict[text];
    }
  },
  {
    title: "描述",
    key: 'description',
    ellipsis: true,
  },
  {
    title: "创建时间",
    dataIndex: 'created_time',
    key: 'created_time',
    // width:100
  },
  {
    title: "更新时间",
    dataIndex: 'updated_time',
    key: 'updated_time',
    // width:100
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
});


const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    if (isEditing.value) {
      // 编辑操作
      await updatePromptApi(currentEditId.value as number, {
        name: formState.name,
        prompt_content: formState.prompt_content,
        template_type: formState.template_type,
        description: formState.description,
      });
    } else {
      // 新增操作
      await createPromptApi({
        name: formState.name,
        prompt_content: formState.prompt_content,
        template_type: formState.template_type,
        description: formState.description,
      });
    }

    message.success(isEditing.value ? '修改成功' : '添加成功');
    editModalVisible.value = false; // 关闭弹窗
    loadData(); // 重新加载数据
  } catch (error: any) {
    if (error?.errorFields) {
      return;
    }
    message.error(error?.message || '操作失败');
  } finally {
    submitLoading.value = false;
  }
};


const handleCancel = () => {
  editModalVisible.value = false;
  formRef.value?.resetFields();
  currentEditId.value = null;
};

const loadData = async () => {
  loading.value = true;
  try {
    const params = {
      name: searchText.value,
      type: selectedType.value,
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };
    const response: any = await getPromptListApi(params);
    // 响应拦截器返回的是完整的 data 对象，包含 { code, message, data: { results, pagination } }
    if (response && response.data) {
      dataSource.value = response.data.results || [];
      paginationConfig.total = response.data.pagination?.total || 0;
    } else {
      dataSource.value = [];
      paginationConfig.total = 0;
    }
    console.log('商品列表数据:', dataSource.value);
  } catch (error: any) {
    console.error('获取商品列表失败:', error);
    message.error(error?.message || '获取商品列表失败');
    dataSource.value = [];
    paginationConfig.total = 0;
  } finally {
    loading.value = false;
  }
};

loadData();
</script>

<style lang="less" scoped>
.product-management {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

