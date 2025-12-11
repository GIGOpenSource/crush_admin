<template>
  <a-modal
    v-model:open="visible"
    title="提现审核"
    :footer="null"
    width="1000px"
    @cancel="handleCancel"
  >
    <!-- 批量操作和审核方式 -->
    <div class="header-actions">
      <a-dropdown>
        <template #overlay>
          <a-menu @click="handleBatchMenuClick">
            <a-menu-item key="approve">全通过</a-menu-item>
            <a-menu-item key="reject">全拒绝</a-menu-item>
          </a-menu>
        </template>
        <a-button type="default">批量</a-button>
      </a-dropdown>
      <div class="review-method">
        <span class="label">审核方式:</span>
        <a-radio-group v-model:value="reviewMethod" @change="handleReviewMethodChange">
          <a-radio value="automatic">自动</a-radio>
          <a-radio value="manual">手动</a-radio>
        </a-radio-group>
      </div>
    </div>

    <!-- 表格 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="paginationConfig"
      :row-selection="rowSelection"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'withdrawal_amount'">
          <div>
            <div>¥{{ record.withdrawal_amount?.toFixed(2) || '0.00' }}</div>
          </div>
        </template>
        <template v-if="column.key === 'application_time'">
          <div>
            <div>{{ formatDateTime(record.application_time) }}</div>
          </div>
        </template>
        <template v-if="column.key === 'audit_status'">
          <div class="audit-actions">
            <a-button
              type="primary"
              size="small"
              @click="handleApprove(record)"
            >
              通过
            </a-button>
            <a-button
              type="primary"
              danger
              size="small"
              style="margin-left: 8px"
              @click="handleReject(record)"
            >
              拒绝
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { message, Modal } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";

interface Props {
  open: boolean;
}

interface Emits {
  (e: "update:open", value: boolean): void;
}

// 提现申请接口
interface WithdrawalApplication {
  id: number;
  user_id: number;
  withdrawal_amount: number;
  application_time: string;
  audit_status: string; // 'pending' | 'approved' | 'rejected'
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
});

const emit = defineEmits<Emits>();

const visible = ref(false);
const loading = ref(false);
const reviewMethod = ref<"automatic" | "manual">("manual");
const selectedRowKeys = ref<number[]>([]);

const dataSource = ref<WithdrawalApplication[]>([]);

const columns: TableColumnsType = [
  {
    title: "用户ID",
    dataIndex: "user_id",
    key: "user_id",
  },
  {
    title: "提现金额",
    dataIndex: "withdrawal_amount",
    key: "withdrawal_amount",
  },
  {
    title: "申请时间",
    dataIndex: "application_time",
    key: "application_time",
  },
  {
    title: "审核状态",
    key: "audit_status",
    width: 300,
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

// 行选择配置
const rowSelection = computed(() => ({
  selectedRowKeys: selectedRowKeys.value,
  onChange: (keys: number[]) => {
    selectedRowKeys.value = keys;
  },
}));

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

// 生成假数据
const generateMockData = (): WithdrawalApplication[] => {
  return [
    {
      id: 1,
      user_id: 1001,
      withdrawal_amount: 500.0,
      application_time: new Date().toISOString(),
      audit_status: "pending",
    },
    {
      id: 2,
      user_id: 1002,
      withdrawal_amount: 300.0,
      application_time: new Date(Date.now() - 86400000).toISOString(),
      audit_status: "pending",
    },
    {
      id: 3,
      user_id: 1003,
      withdrawal_amount: 800.0,
      application_time: new Date(Date.now() - 172800000).toISOString(),
      audit_status: "pending",
    },
  ];
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    // 这里应该调用API
    // const res = await getWithdrawalApplicationsApi({...});
    // 暂时使用假数据
    const mockData = generateMockData();
    dataSource.value = mockData;
    paginationConfig.total = mockData.length;
  } catch (error) {
    console.error("加载提现申请列表失败:", error);
    message.error("加载提现申请列表失败");
  } finally {
    loading.value = false;
  }
};

// 审核方式变化
const handleReviewMethodChange = () => {
  message.info(`已切换到${reviewMethod.value === "manual" ? "手动" : "自动"}审核模式`);
  // 这里可以调用API更新审核方式设置
};

// 批量操作菜单点击
const handleBatchMenuClick = ({ key }: { key: string }) => {
  if (selectedRowKeys.value.length === 0) {
    message.warning("请先选择要处理的记录");
    return;
  }

  const action = key === "approve" ? "通过" : "拒绝";
  const actionText = key === "approve" ? "批量通过" : "批量拒绝";
  const content =
    key === "approve"
      ? `确定要批量通过选中的 ${selectedRowKeys.value.length} 条提现申请吗？通过后将公司账户资金打到对方提供的账户上。`
      : `确定要批量拒绝选中的 ${selectedRowKeys.value.length} 条提现申请吗？拒绝用户提现,并将通知用户。`;

  Modal.confirm({
    title: actionText,
    content: content,
    onOk: async () => {
      try {
        // 这里应该调用批量审核API
        // await batchAuditWithdrawalApi(selectedRowKeys.value, key);
        message.success(`批量${action}成功`);
        selectedRowKeys.value = [];
        loadData();
      } catch (error) {
        console.error(`批量${action}失败:`, error);
        message.error(`批量${action}失败`);
      }
    },
  });
};

// 通过审核
const handleApprove = (record: WithdrawalApplication) => {
  Modal.confirm({
    title: "确认通过",
    content: `确定要通过用户 ${record.user_id} 的提现申请吗？通过后将公司账户资金打到对方提供的账户上。`,
    onOk: async () => {
      try {
        // 这里应该调用审核API
        // await approveWithdrawalApi(record.id);
        message.success("审核通过");
        loadData();
      } catch (error) {
        console.error("审核失败:", error);
        message.error("审核失败");
      }
    },
  });
};

// 拒绝审核
const handleReject = (record: WithdrawalApplication) => {
  Modal.confirm({
    title: "确认拒绝",
    content: `确定要拒绝用户 ${record.user_id} 的提现申请吗？拒绝用户提现,并将通知用户。`,
    onOk: async () => {
      try {
        // 这里应该调用审核API
        // await rejectWithdrawalApi(record.id);
        message.success("已拒绝");
        loadData();
      } catch (error) {
        console.error("审核失败:", error);
        message.error("审核失败");
      }
    },
  });
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      selectedRowKeys.value = [];
      loadData();
    } else {
      dataSource.value = [];
    }
  }
);

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit("update:open", newVal);
});

// 取消
const handleCancel = () => {
  visible.value = false;
};
</script>

<style lang="less" scoped>
.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;

  .review-method {
    display: flex;
    align-items: center;
    gap: 12px;

    .label {
      font-weight: 500;
    }

    .method-tips {
      margin-left: 16px;

      .tip-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #666;

        .tip-label {
          font-weight: 500;
          color: #262626;
        }
      }
    }
  }
}

.field-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.audit-actions {
  position: relative;

  .action-tips {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px dashed #e8e8e8;

    .tip-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 12px;
      color: #666;
      margin-bottom: 8px;

      &:last-child {
        margin-bottom: 0;
      }

      .tip-label {
        font-weight: 500;
        color: #262626;
        min-width: 40px;
      }

      &.approve-tip .tip-label {
        color: #1890ff;
      }

      &.reject-tip .tip-label {
        color: #ff4d4f;
      }
    }
  }
}
</style>

