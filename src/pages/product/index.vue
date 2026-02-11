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
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'price'">
              <span>¥{{ record.price }}</span>
            </template>
            <template v-else-if="column.key === 'days'">
              <span>{{ record.days === 0 || record.days === null || record.days === undefined ? '--' : `${record.days}日` }}</span>
            </template>
            <template v-else-if="column.key === 'action'">
              <a-button type="link" size="small" @click="handleEdit(record)">编辑</a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑商品"
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
        <!-- <a-form-item label="商品类型" name="productType">
          <a-input v-model:value="formState.productType" placeholder="请输入商品类型" />
        </a-form-item> -->
        <a-form-item label="商品价格" name="price">
          <a-input-number
            v-model:value="formState.price"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入商品价格"
          />
        </a-form-item>
        <a-form-item label="有效期" name="days">
          <a-input-number
            v-model:value="formState.days"
            :min="0"
            :precision="0"
            style="width: 100%"
            placeholder="请输入有效期天数"
          />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import type { TableColumnsType } from 'ant-design-vue';
import type { FormInstance } from 'ant-design-vue';
import { getProductListApi, updateProductApi, type ProductItem } from '@/api/product';

const loading = ref(false);
const submitLoading = ref(false);
const editModalVisible = ref(false);
const currentEditId = ref<number | null>(null);
const formRef = ref<FormInstance>();

const dataSource = ref<ProductItem[]>([]);

const formState = reactive({
  productType: '',
  price: 0,
  days: 0,
});

const rules = {
  // productType: [{ required: true, message: '请输入商品类型', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  days: [{ required: true, message: '请输入有效期', trigger: 'blur' }],
};

const columns: TableColumnsType = [
  {
    title: '序号',
    key: 'index',
    width: 80,
    customRender: ({ index }) => index + 1,
  },
  {
    title: '商品类型',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: '商品价格',
    dataIndex: 'price',
    key: 'price',
  },
  {
    title: '有效期',
    dataIndex: 'days',
    key: 'days',
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
  currentEditId.value = record.id;
  formState.price = record.price;
  formState.days = record.days;
  editModalVisible.value = true;
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    submitLoading.value = true;

    if (currentEditId.value === null) {
      message.error('商品ID不存在');
      return;
    }

    await updateProductApi(currentEditId.value, {
      price: formState.price,
      days: formState.days,
    });

    message.success('修改成功');
    editModalVisible.value = false;
    loadData(); // 重新加载数据
  } catch (error: any) {
    if (error?.errorFields) {
      // 表单验证错误
      return;
    }
    message.error(error?.message || '修改失败');
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
    const response: any = await getProductListApi(paginationConfig.current, paginationConfig.pageSize);
    // 响应拦截器返回的是完整的 data 对象，包含 { code, message, data: { results, pagination } }
    if (response && response.data) {
      dataSource.value = response.data.results || [];
      const pagination = response.data.pagination || {};
      paginationConfig.total = pagination.total || 0;
      // 更新当前页码（如果接口返回了页码信息）
      if (pagination.page !== undefined && pagination.page !== null) {
        paginationConfig.current = pagination.page;
      }
    } else {
      dataSource.value = [];
      paginationConfig.total = 0;
    }
    console.log('商品列表数据:', dataSource.value);
    console.log('分页信息:', {
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      total: paginationConfig.total
    });
  } catch (error: any) {
    console.error('获取商品列表失败:', error);
    message.error(error?.message || '获取商品列表失败');
    dataSource.value = [];
    paginationConfig.total = 0;
  } finally {
    loading.value = false;
  }
};

// 处理表格变化事件（分页、排序、筛选）
const handleTableChange = (pag: any) => {
  console.log('表格变化事件:', pag);
  if (pag) {
    paginationConfig.current = pag.current || paginationConfig.current;
    paginationConfig.pageSize = pag.pageSize || paginationConfig.pageSize;
    loadData();
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

