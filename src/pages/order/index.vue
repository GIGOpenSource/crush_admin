<template>
  <div class="order-management">
    <a-card :bordered="false">
      <template #title>
        <span>订单管理</span>
      </template>
      <!-- 筛选区域 -->
      <div class="filter-wrapper">
        <a-select
          v-model:value="filterStatus"
          style="width: 150px"
          placeholder="请选择状态"
          @change="handleStatusFilterChange"
        >
          <a-select-option value="all">全部</a-select-option>
          <a-select-option value="NOTPAY">待支付</a-select-option>
          <a-select-option value="SUCCESS">已完成</a-select-option>
          <a-select-option value="REFUND">已退款</a-select-option>
        </a-select>
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
            <template v-if="column.key === 'order_no'">
              {{ record.out_trade_no || record.order_no || "-" }}
            </template>
            <template v-if="column.key === 'product_info'">
              {{ record.product_name || record.product_info || "-" }}
            </template>
            <template v-if="column.key === 'user_id'">
              {{ record.payer || record.user_id || "-" }}
            </template>
            <template v-if="column.key === 'product_type'">
              {{
                record.product_name ||
                record.product_type_name ||
                record.product_type ||
                "-"
              }}
            </template>
            <template v-if="column.key === 'amount'">
              {{
                record.payer_total !== null && record.payer_total !== undefined
                  ? `¥${(record.payer_total / 100).toFixed(2)}`
                  : record.total_fee !== null && record.total_fee !== undefined
                  ? `¥${(record.total_fee / 100).toFixed(2)}`
                  : record.amount
                  ? `¥${record.amount}`
                  : "-"
              }}
            </template>
            <template v-if="column.key === 'payment_status'">
              <a-tag :color="getPaymentStatusColor(record.trade_state)">
                {{ getPaymentStatusText(record.trade_state) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'created_at'">
              {{
                record.created_time || record.created_at
                  ? formatDateTime(record.created_time || record.created_at)
                  : "-"
              }}
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import { getOrderListApi, type OrderItem } from "@/api/order";

const loading = ref(false);
const dataSource = ref<OrderItem[]>([]);
const filterStatus = ref<string>("all");

const columns: TableColumnsType = [
  {
    title: "订单号",
    dataIndex: "out_trade_no",
    key: "order_no",
    width: 200,
  },
  {
    title: "商品信息",
    dataIndex: "product_name",
    key: "product_info",
  },
  {
    title: "用户ID",
    dataIndex: "payer",
    key: "user_id",
    width: 100,
  },
  {
    title: "商品类型",
    dataIndex: "product_name",
    key: "product_type",
  },
  {
    title: "金额",
    dataIndex: "payer_total",
    key: "amount",
    width: 120,
  },
  {
    title: "支付状态",
    dataIndex: "trade_state",
    key: "payment_status",
    width: 100,
  },
  {
    title: "时间",
    dataIndex: "created_time",
    key: "created_at",
    width: 180,
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

// 获取支付状态文本
const getPaymentStatusText = (status: string | number) => {
  if (typeof status === "number") {
    const statusMap: Record<number, string> = {
      0: "待支付",
      1: "已完成",
      2: "已取消",
      3: "已退款",
    };
    return statusMap[status] || "未知";
  }
  const statusMap: Record<string, string> = {
    NOTPAY: "待支付",
    SUCCESS: "已完成",
    REFUND: "已退款",
    // 兼容旧数据
    "0": "待支付",
    "1": "已完成",
    "2": "已取消",
    "3": "已退款",
    unpaid: "待支付",
    completed: "已完成",
    cancelled: "已取消",
    refunded: "已退款",
    paid: "已完成",
  };
  return statusMap[status] || status || "未知";
};

// 获取支付状态颜色
const getPaymentStatusColor = (status: string | number) => {
  if (typeof status === "number") {
    const statusMap: Record<number, string> = {
      0: "orange",
      1: "green",
      2: "default",
      3: "red",
    };
    return statusMap[status] || "default";
  }
  const statusMap: Record<string, string> = {
    NOTPAY: "orange",
    SUCCESS: "green",
    REFUND: "red",
    // 兼容旧数据
    "0": "orange",
    "1": "green",
    "2": "default",
    "3": "red",
    unpaid: "orange",
    completed: "green",
    cancelled: "default",
    refunded: "red",
    paid: "green",
  };
  return statusMap[status] || "default";
};

// 状态筛选改变
const handleStatusFilterChange = () => {
  paginationConfig.current = 1;
  loadData();
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params: any = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
    };
    // 如果不是"全部"，添加状态筛选参数
    if (filterStatus.value !== "all") {
      params.trade_state = filterStatus.value;
    }
    const res = await getOrderListApi(params);
    dataSource.value = res.data.results || [];
    paginationConfig.total =
      res.data.pagination.count || res.data.pagination.total || 0;
  } catch (error) {
    console.error("加载订单列表失败:", error);
    message.error("加载订单列表失败");
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.order-management {
  .filter-wrapper {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }

  .table-wrapper {
    margin-top: 16px;
  }
}
</style>
