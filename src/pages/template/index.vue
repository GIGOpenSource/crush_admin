<template>
  <div class="template-management">
    <a-card :bordered="false">
      <template #title>
        <span>模板管理</span>
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
            <template v-if="column.key === 'status'">
              <a-tag :color="record.status === '启用' ? 'green' : 'default'">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
                <a-button type="link" size="small" @click="handleToggleStatus(record)">
                  {{ record.status === '启用' ? '禁用' : '启用' }}
                </a-button>
                <a-button type="link" size="small" danger @click="handleDelete(record)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';

interface TemplateItem {
  id: number;
  name: string;
  category: string;
  status: string;
  createTime: string;
  updateTime: string;
}

const loading = ref(false);
const dataSource = ref<TemplateItem[]>([]);

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '模板名称',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '分类',
    dataIndex: 'category',
    key: 'category',
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
  },
  {
    title: '更新时间',
    dataIndex: 'updateTime',
    key: 'updateTime',
  },
  {
    title: '操作',
    key: 'action',
    width: 200,
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

const handleEdit = (record: TemplateItem) => {
  message.info(`编辑模板: ${record.name}`);
  // TODO: 实现编辑功能
};

const handleToggleStatus = (record: TemplateItem) => {
  message.info(`${record.status === '启用' ? '禁用' : '启用'}模板: ${record.name}`);
  // TODO: 实现状态切换功能
};

const handleDelete = (record: TemplateItem) => {
  message.warning(`删除模板: ${record.name}`);
  // TODO: 实现删除功能
};

// TODO: 加载数据
const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    dataSource.value = [];
    loading.value = false;
  }, 500);
};

loadData();
</script>

<style lang="less" scoped>
.template-management {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

