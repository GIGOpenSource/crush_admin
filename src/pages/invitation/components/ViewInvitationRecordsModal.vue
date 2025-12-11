<template>
  <a-modal
    v-model:open="visible"
    title="查看记录"
    :footer="null"
    width="1200px"
    @cancel="handleCancel"
  >
    <!-- 标签页 -->
    <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
      <a-tab-pane key="invitation" tab="邀请记录">
        <a-table
          :columns="invitationColumns"
          :data-source="invitationData"
          :loading="loading"
          :pagination="invitationPagination"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'invitation_time'">
              {{ formatDateTime(record.invitation_time) }}
            </template>
            <template v-if="column.key === 'status'">
              <a-tag :color="getStatusColor(record.status)">
                {{ getStatusText(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.key === 'reward_amount'">
              ¥{{ record.reward_amount?.toFixed(2) || '0.00' }}
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="audit" tab="审核记录">
        <a-table
          :columns="auditColumns"
          :data-source="auditData"
          :loading="loading"
          :pagination="auditPagination"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'withdrawal_amount'">
              ¥{{ record.withdrawal_amount?.toFixed(2) || '0.00' }}
            </template>
            <template v-if="column.key === 'application_time'">
              {{ formatDateTime(record.application_time) }}
            </template>
            <template v-if="column.key === 'audit_status'">
              <a-tag :color="getAuditStatusColor(record.audit_status)">
                {{ getAuditStatusText(record.audit_status) }}
              </a-tag>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
    </a-tabs>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import type { TableColumnsType } from "ant-design-vue";

interface Props {
  open: boolean;
  userId: number | null;
  userName?: string;
}

interface Emits {
  (e: "update:open", value: boolean): void;
}

// 邀请记录接口
interface InvitationRecord {
  id: number;
  user_id: number;
  invitation_time: string;
  invited_user_id: number;
  status: string; // 'success' | 'pending' | 'failed'
  reward_amount: number;
}

// 审核记录接口
interface AuditRecord {
  id: number;
  user_id: number;
  withdrawal_amount: number;
  application_time: string;
  audit_status: string; // 'pending' | 'approved' | 'rejected'
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  userId: null,
  userName: "",
});

const emit = defineEmits<Emits>();

const visible = ref(false);
const loading = ref(false);
const activeTab = ref("invitation");

// 邀请记录数据
const invitationData = ref<InvitationRecord[]>([]);
const invitationPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    invitationPagination.current = page;
    invitationPagination.pageSize = pageSize;
    loadInvitationRecords();
  },
});

// 审核记录数据
const auditData = ref<AuditRecord[]>([]);
const auditPagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  onChange: (page: number, pageSize: number) => {
    auditPagination.current = page;
    auditPagination.pageSize = pageSize;
    loadAuditRecords();
  },
});

// 邀请记录表格列
const invitationColumns: TableColumnsType = [
  {
    title: "用户ID",
    dataIndex: "user_id",
    key: "user_id",
  },
  {
    title: "邀请时间",
    dataIndex: "invitation_time",
    key: "invitation_time",
  },
  {
    title: "被邀请人ID",
    dataIndex: "invited_user_id",
    key: "invited_user_id",
  },
  {
    title: "状态",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "奖励金额",
    dataIndex: "reward_amount",
    key: "reward_amount",
  },
];

// 审核记录表格列
const auditColumns: TableColumnsType = [
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
    dataIndex: "audit_status",
    key: "audit_status",
  },
];

// 标签页切换
const handleTabChange = (key: string) => {
  activeTab.value = key;
  if (key === "invitation") {
    loadInvitationRecords();
  } else {
    loadAuditRecords();
  }
};


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

// 获取状态颜色
const getStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    success: "green",
    pending: "orange",
    failed: "red",
  };
  return statusMap[status] || "default";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    success: "成功",
    pending: "待处理",
    failed: "失败",
  };
  return statusMap[status] || status;
};

// 获取审核状态颜色
const getAuditStatusColor = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "orange",
    approved: "green",
    rejected: "red",
  };
  return statusMap[status] || "default";
};

// 获取审核状态文本
const getAuditStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
  };
  return statusMap[status] || status;
};

// 生成假数据 - 邀请记录
const generateMockInvitationRecords = (): InvitationRecord[] => {
  return [
    {
      id: 1,
      user_id: props.userId || 1001,
      invitation_time: new Date().toISOString(),
      invited_user_id: 2001,
      status: "success",
      reward_amount: 50.0,
    },
    {
      id: 2,
      user_id: props.userId || 1001,
      invitation_time: new Date(Date.now() - 86400000).toISOString(),
      invited_user_id: 2002,
      status: "success",
      reward_amount: 50.0,
    },
    {
      id: 3,
      user_id: props.userId || 1001,
      invitation_time: new Date(Date.now() - 172800000).toISOString(),
      invited_user_id: 2003,
      status: "pending",
      reward_amount: 0,
    },
  ];
};

// 生成假数据 - 审核记录
const generateMockAuditRecords = (): AuditRecord[] => {
  return [
    {
      id: 1,
      user_id: props.userId || 1001,
      withdrawal_amount: 500.0,
      application_time: new Date().toISOString(),
      audit_status: "pending",
    },
    {
      id: 2,
      user_id: props.userId || 1001,
      withdrawal_amount: 300.0,
      application_time: new Date(Date.now() - 86400000).toISOString(),
      audit_status: "approved",
    },
    {
      id: 3,
      user_id: props.userId || 1001,
      withdrawal_amount: 200.0,
      application_time: new Date(Date.now() - 172800000).toISOString(),
      audit_status: "rejected",
    },
  ];
};

// 加载邀请记录
const loadInvitationRecords = async () => {
  if (!props.userId) return;

  try {
    loading.value = true;
    // 这里应该调用API
    // const res = await getInvitationRecordsApi(props.userId, {...});
    // 暂时使用假数据
    const mockData = generateMockInvitationRecords();
    invitationData.value = mockData;
    invitationPagination.total = mockData.length;
  } catch (error) {
    console.error("加载邀请记录失败:", error);
    invitationData.value = [];
  } finally {
    loading.value = false;
  }
};

// 加载审核记录
const loadAuditRecords = async () => {
  if (!props.userId) return;

  try {
    loading.value = true;
    // 这里应该调用API
    // const res = await getAuditRecordsApi(props.userId, {...});
    // 暂时使用假数据
    const mockData = generateMockAuditRecords();
    auditData.value = mockData;
    auditPagination.total = mockData.length;
  } catch (error) {
    console.error("加载审核记录失败:", error);
    auditData.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.userId) {
      if (activeTab.value === "invitation") {
        loadInvitationRecords();
      } else {
        loadAuditRecords();
      }
    } else {
      invitationData.value = [];
      auditData.value = [];
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
:deep(.ant-tabs) {
  margin-top: 0;
}
</style>

