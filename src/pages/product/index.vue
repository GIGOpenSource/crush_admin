<template>
  <div class="product-management">
    <a-card :bordered="false">
      <template #title>
        <span>商品管理</span>
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
            <template v-if="column.key === 'price'">
              <span>¥{{ record.price }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
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

interface ProductItem {
  id: number;
  productType: string;
  price: number;
  validityPeriod: string;
}

const loading = ref(false);
const dataSource = ref<ProductItem[]>([
  {
    id: 1,
    productType: '单次付费',
    price: 1.0,
    validityPeriod: '-',
  },
  {
    id: 2,
    productType: '周期付费',
    price: 49.9,
    validityPeriod: '30日',
  },
]);

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '商品类型',
    dataIndex: 'productType',
    key: 'productType',
  },
  {
    title: '商品价格',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '有效期',
    dataIndex: 'validityPeriod',
    key: 'validityPeriod',
  },
  {
    title: '操作',
    key: 'action',
    width: 100,
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

const handleEdit = (record: ProductItem) => {
  message.info(`编辑商品: ${record.productType}`);
  // TODO: 实现编辑功能
};

// TODO: 加载数据
const loadData = () => {
  loading.value = true;
  setTimeout(() => {
    // 模拟数据已加载
    paginationConfig.total = dataSource.value.length;
    loading.value = false;
  }, 500);
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

