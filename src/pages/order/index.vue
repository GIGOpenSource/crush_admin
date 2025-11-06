<template>
  <div class="order-management">
    <a-card :bordered="false">
      <template #title>
        <span>订单管理</span>
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
              <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleView(record)">查看</a-button>
                <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
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

interface OrderItem {
  id: number;
  orderNo: string;
  username: string;
  productName: string;
  amount: number;
  status: string;
  createTime: string;
}

const loading = ref(false);
const dataSource = ref<OrderItem[]>([]);

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '订单号',
    dataIndex: 'orderNo',
    key: 'orderNo',
  },
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
  },
  {
    title: '商品名称',
    dataIndex: 'productName',
    key: 'productName',
  },
  {
    title: '金额',
    dataIndex: 'amount',
    key: 'amount',
    customRender: ({ text }) => `¥${text}`,
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

const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    待支付: 'orange',
    已支付: 'green',
    已取消: 'default',
    已完成: 'blue',
  };
  return statusMap[status] || 'default';
};

const handleView = (record: OrderItem) => {
  message.info(`查看订单: ${record.orderNo}`);
  // TODO: 实现查看功能
};

const handleEdit = (record: OrderItem) => {
  message.info(`编辑订单: ${record.orderNo}`);
  // TODO: 实现编辑功能
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
.order-management {
  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

