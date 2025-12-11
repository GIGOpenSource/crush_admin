<template>
  <div class="invitation-management">
    <a-card :bordered="false">
      <template #title>
        <span>邀请管理</span>
      </template>
      
      <!-- 日期范围选择 -->
      <div class="date-range-wrapper">
        <a-space>
          <a-button
            v-if="selectedDateRange && selectedDateRange !== 'custom'"
            type="primary"
          >
            {{ formatSelectedDate() }}
          </a-button>
          <a-button
            v-for="item in dateRangeOptions"
            :key="item.value"
            :type="selectedDateRange === item.value ? 'primary' : 'default'"
            @click="handleDateRangeChange(item.value)"
          >
            {{ item.label }}
          </a-button>
          <a-range-picker
            v-if="selectedDateRange === 'custom'"
            v-model:value="customDateRange"
            format="YYYY-MM-DD"
            @change="handleCustomDateChange"
          />
        </a-space>
      </div>

      <!-- 统计信息 -->
      <div class="statistics-wrapper">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-statistic title="累计邀请数" :value="statistics.totalInvitations" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="新增用户数" :value="statistics.newUsers" />
          </a-col>
          <a-col :span="8">
            <a-statistic title="总发金额" prefix="¥" :value="statistics.totalAmount"  />
          </a-col>
        </a-row>
      </div>

      <!-- 搜索和操作区域 -->
      <div class="search-wrapper">
        <div class="search-bar">
          <a-input
            v-model:value="searchKeyword"
            placeholder="可输入用户ID、昵称"
            allow-clear
            style="width: 300px"
            @press-enter="handleSearch"
          >
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
          <a-select
            v-model:value="selectedPlatform"
            placeholder="选择平台"
            allow-clear
            style="width: 150px; margin-left: 8px"
          >
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="微信">微信</a-select-option>
            <a-select-option value="抖音">抖音</a-select-option>
            <a-select-option value="小红书">小红书</a-select-option>
            <a-select-option value="APP">APP</a-select-option>
            <a-select-option value="APP（海外）">APP（海外）</a-select-option>
          </a-select>
          <a-button type="primary" @click="handleSearch" style="margin-left: 8px">
            搜索
          </a-button>
          <a-button type="default" @click="handleWithdrawalReview" style="margin-left: 8px">
            提现审核
          </a-button>
        </div>
      </div>

      <!-- 表格区域 -->
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
                <a-button
                  type="link"
                  size="small"
                  danger
                  @click="handleBan(record)"
                >
                  封禁
                </a-button>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="handleViewRecords(record)"
                >
                  查看记录
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    
    <!-- 编辑邀请弹窗 -->
    <EditInvitationModal
      v-model:open="editModalVisible"
      :invitation-data="currentEditInvitation"
      @success="handleEditSuccess"
    />
    <!-- 查看记录弹窗 -->
    <ViewInvitationRecordsModal
      v-model:open="viewRecordsModalVisible"
      :user-id="currentViewRecordsUserId"
      :user-name="currentViewRecordsUserName"
    />
    <!-- 提现审核弹窗 -->
    <WithdrawalReviewModal
      v-model:open="withdrawalReviewModalVisible"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import type { TableColumnsType } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import { getInvitationListApi, banUserApi, type InvitationItem } from "@/api/invitation";
import EditInvitationModal from "./components/EditInvitationModal.vue";
import ViewInvitationRecordsModal from "./components/ViewInvitationRecordsModal.vue";
import WithdrawalReviewModal from "./components/WithdrawalReviewModal.vue";

const loading = ref(false);
const dataSource = ref<InvitationItem[]>([]);
const searchKeyword = ref("");
const selectedPlatform = ref<string>("");
const selectedDateRange = ref<string>("");
const customDateRange = ref<[Dayjs, Dayjs] | null>(null);
const editModalVisible = ref(false);
const currentEditInvitation = ref<InvitationItem | null>(null);
const viewRecordsModalVisible = ref(false);
const currentViewRecordsUserId = ref<number | null>(null);
const currentViewRecordsUserName = ref<string>("");
const withdrawalReviewModalVisible = ref(false);

// 统计信息
const statistics = reactive({
  totalInvitations: 0,
  newUsers: 0,
  totalAmount: 0,
});

// 日期范围选项
const dateRangeOptions = [
  { label: "今天", value: "0" },
  { label: "近3日", value: "3" },
  { label: "近7日", value: "7" },
  { label: "近14日", value: "14" },
  { label: "近30日", value: "30" },
  { label: "自定义日期", value: "custom" },
];

const columns: TableColumnsType = [
  {
    title: "用户ID",
    dataIndex: "user_id",
    key: "user_id",
  },
  {
    title: "用户昵称",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "累计邀请数",
    dataIndex: "total_invitations",
    key: "total_invitations",
  },
  {
    title: "新增用户数",
    dataIndex: "new_users",
    key: "new_users",
  },
  {
    title: "奖励金额(¥)",
    dataIndex: "reward_amount",
    key: "reward_amount",
  },
  {
    title: "提现金额(¥)",
    dataIndex: "withdrawal_amount",
    key: "withdrawal_amount",
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
    width: 220,
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

// 格式化选中的日期显示
const formatSelectedDate = () => {
  if (selectedDateRange.value === "custom" && customDateRange.value) {
    return `${customDateRange.value[0].format("YYYY-MM-DD")} - ${customDateRange.value[1].format("YYYY-MM-DD")}`;
  }
  
  if (selectedDateRange.value) {
    const days = parseInt(selectedDateRange.value);
    if (!isNaN(days)) {
      const endDate = dayjs();
      const startDate = days === 0 ? endDate : endDate.subtract(days, "day");
      // 如果是今天，只显示一个日期
      if (days === 0) {
        return endDate.format("YYYY-MM-DD");
      }
      return `${startDate.format("YYYY-MM-DD")} - ${endDate.format("YYYY-MM-DD")}`;
    }
  }
  
  return dayjs().format("YYYY-MM-DD");
};

// 日期范围变化
const handleDateRangeChange = (value: string) => {
  selectedDateRange.value = value;
  if (value !== "custom") {
    customDateRange.value = null;
  }
  paginationConfig.current = 1;
  loadData();
};

// 自定义日期变化
const handleCustomDateChange = () => {
  if (customDateRange.value) {
    selectedDateRange.value = "custom";
  }
  paginationConfig.current = 1;
  loadData();
};

// 获取日期范围参数
const getDateRangeParams = () => {
  if (selectedDateRange.value === "custom" && customDateRange.value) {
    return {
      startDate: customDateRange.value[0].format("YYYY-MM-DD"),
      endDate: customDateRange.value[1].format("YYYY-MM-DD"),
    };
  }
  
  if (selectedDateRange.value) {
    const days = parseInt(selectedDateRange.value);
    if (!isNaN(days)) {
      const endDate = dayjs();
      const startDate = days === 0 ? endDate : endDate.subtract(days, "day");
      return {
        startDate: startDate.format("YYYY-MM-DD"),
        endDate: endDate.format("YYYY-MM-DD"),
      };
    }
  }
  
  return {};
};

// 搜索
const handleSearch = () => {
  paginationConfig.current = 1;
  loadData();
};

// 生成假数据
const generateMockData = (): InvitationItem[] => {
  return [
    {
      id: 1,
      user_id: 1001,
      username: "张三",
      total_invitations: 25,
      new_users: 18,
      reward_amount: 1250.50,
      withdrawal_amount: 800.00,
      platform: "微信",
    },
    {
      id: 2,
      user_id: 1002,
      username: "李四",
      total_invitations: 42,
      new_users: 35,
      reward_amount: 2100.00,
      withdrawal_amount: 1500.00,
      platform: "抖音",
    },
    {
      id: 3,
      user_id: 1003,
      username: "王五",
      total_invitations: 18,
      new_users: 12,
      reward_amount: 900.00,
      withdrawal_amount: 600.00,
      platform: "小红书",
    }
  ];
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const dateParams = getDateRangeParams();
    const params: any = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      search: searchKeyword.value || undefined,
      ...dateParams,
    };
    
    if (selectedPlatform.value) {
      params.platform = selectedPlatform.value;
    }
    
    try {
      const res = await getInvitationListApi(params);
      dataSource.value = res.data.results || [];
      paginationConfig.total =
        res.data.pagination.count || res.data.pagination.total || 0;
      
      // 更新统计信息
      if (res.data.statistics) {
        statistics.totalInvitations = res.data.statistics.totalInvitations || 0;
        statistics.newUsers = res.data.statistics.newUsers || 0;
        statistics.totalAmount = res.data.statistics.totalAmount || 0;
      }
    } catch (apiError) {
      // API调用失败时使用假数据
      console.warn("API调用失败，使用假数据:", apiError);
      const mockData = generateMockData();
      // 根据搜索关键词过滤
      let filteredData = mockData;
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filteredData = mockData.filter(
          (item) =>
            item.user_id.toString().includes(keyword) ||
            item.username.toLowerCase().includes(keyword)
        );
      }
      // 根据平台过滤
      if (selectedPlatform.value) {
        filteredData = filteredData.filter(
          (item) => item.platform === selectedPlatform.value
        );
      }
      dataSource.value = filteredData;
      paginationConfig.total = filteredData.length;
      
      // 计算统计信息
      statistics.totalInvitations = filteredData.reduce(
        (sum, item) => sum + item.total_invitations,
        0
      );
      statistics.newUsers = filteredData.reduce(
        (sum, item) => sum + item.new_users,
        0
      );
      statistics.totalAmount = filteredData.reduce(
        (sum, item) => sum + item.reward_amount,
        0
      );
    }
  } catch (error) {
    console.error("加载邀请列表失败:", error);
    message.error("加载邀请列表失败");
  } finally {
    loading.value = false;
  }
};

// 封禁用户
const handleBan = (record: InvitationItem) => {
  Modal.confirm({
    title: "确认封禁用户",
    content: `确定要封禁用户 "${record.username}" 吗？封禁后用户无法再通过邀请其他人获得相应奖励。`,
    onOk: async () => {
      try {
        await banUserApi(record.user_id);
        message.success("封禁成功");
        loadData();
      } catch (error) {
        console.error("封禁用户失败:", error);
        message.error("封禁用户失败");
      }
    },
  });
};

// 编辑邀请
const handleEdit = (record: InvitationItem) => {
  currentEditInvitation.value = record;
  editModalVisible.value = true;
};

// 编辑成功后的回调
const handleEditSuccess = () => {
  loadData();
};

// 查看记录
const handleViewRecords = (record: InvitationItem) => {
  currentViewRecordsUserId.value = record.user_id;
  currentViewRecordsUserName.value = record.username;
  viewRecordsModalVisible.value = true;
};

// 提现审核
const handleWithdrawalReview = () => {
  withdrawalReviewModalVisible.value = true;
};

onMounted(() => {
  // 默认选择今天
  selectedDateRange.value = "0";
  loadData();
});
</script>

<style lang="less" scoped>
.invitation-management {
  .date-range-wrapper {
    margin-bottom: 24px;
  }

  .statistics-wrapper {
    margin-bottom: 24px;
    padding: 16px;
    background: #fafafa;
    border-radius: 4px;
  }

  .search-wrapper {
    margin-bottom: 16px;

    .search-tip {
      margin-bottom: 8px;

      .tip-text {
        color: #ff4d4f;
        font-size: 12px;
      }
    }

    .search-bar {
      display: flex;
      align-items: center;
      margin-bottom: 8px;
    }

    .warning-text {
      span {
        color: #ff4d4f;
        font-size: 12px;
      }
    }
  }

  .table-wrapper {
    margin-top: 16px;
  }
}
</style>

