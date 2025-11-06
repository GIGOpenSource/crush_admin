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

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑商品"
      :confirm-loading="submitLoading"
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
        <a-form-item label="商品类型" name="productType">
          <a-input v-model:value="formState.productType" placeholder="请输入商品类型" />
        </a-form-item>
        <a-form-item label="商品价格" name="price">
          <a-input-number
            v-model:value="formState.price"
            :min="0"
            :precision="2"
            style="width: 100%"
            placeholder="请输入商品价格"
          />
        </a-form-item>
        <a-form-item label="有效期" name="validityPeriod">
          <a-input v-model:value="formState.validityPeriod" placeholder="请输入有效期，如：30日 或 -" />
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
  validityPeriod: '',
});

const rules = {
  productType: [{ required: true, message: '请输入商品类型', trigger: 'blur' }],
  price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
  validityPeriod: [{ required: true, message: '请输入有效期', trigger: 'blur' }],
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
  currentEditId.value = record.id;
  formState.productType = record.productType;
  formState.price = record.price;
  formState.validityPeriod = record.validityPeriod;
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
      productType: formState.productType,
      price: formState.price,
      validityPeriod: formState.validityPeriod,
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
    const response = await getProductListApi();
    console.log(response,'responsev')
    // 响应拦截器返回的是完整的 data 对象，包含 { code, message, data: [...] }
    // 从 response.data 中获取实际的商品列表数据
    if (response && typeof response === 'object' && 'data' in response) {
      const listData = (response as any).data;
      if (Array.isArray(listData)) {
        dataSource.value = listData;
      } else {
        dataSource.value = [];
      }
    } else if (Array.isArray(response)) {
      // 兼容直接返回数组的情况
      dataSource.value = response;
    } else {
      dataSource.value = [];
    }
    console.log('商品列表数据:', dataSource.value);
    paginationConfig.total = dataSource.value.length;
  } catch (error: any) {
    console.error('获取商品列表失败:', error);
    message.error(error?.message || '获取商品列表失败');
    dataSource.value = [];
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

