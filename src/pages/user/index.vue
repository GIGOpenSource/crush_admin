<template>
  <div class="user-management">
    <a-card :bordered="false">
      <template #title>
        <span>用户管理</span>
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
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
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

interface UserItem {
  id: number;
  username: string;
  email: string;
  phone: string;
  status: string;
  createTime: string;
}

const loading = ref(false);
const dataSource = ref<UserItem[]>([]);

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    key: 'phone',
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

const handleEdit = (record: UserItem) => {
  message.info(`编辑用户: ${record.username}`);
  // TODO: 实现编辑功能
};

const handleDelete = (record: UserItem) => {
  message.warning(`删除用户: ${record.username}`);
  // TODO: 实现删除功能
};

// TODO: 加载数据
const loadData = () => {
  loading.value = true;
  // 模拟数据
  setTimeout(() => {
    dataSource.value = [];
    loading.value = false;
  }, 500);
};

loadData();
</script>

<style lang="less" scoped>
.user-management {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

