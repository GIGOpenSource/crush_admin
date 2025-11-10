<template>
  <div class="user-management">
    <a-card :bordered="false">
      <template #title>
        <span>用户管理</span>
      </template>
      <!-- 搜索区域 -->
      <div class="search-wrapper">
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
        <a-button type="primary" @click="handleSearch" style="margin-left: 8px">
          搜索
        </a-button>
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
            <template v-if="column.key === 'created_at'">
              {{ formatDateTime(record.created_at) }}
            </template>
            <template v-if="column.key === 'membershipStatus'">
              <a-tag :color="record.is_vip ? 'green' : 'default'">
                {{ record.is_vip ? "会员" : "非会员" }}
              </a-tag>
            </template>
            <template v-if="column.key === 'vip_expire_date'">
              {{
                record.vip_expire_date
                  ? formatDateTime(record.vip_expire_date)
                  : "-"
              }}
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  :danger="record.status !== 1"
                  @click="handleFreeze(record)"
                >
                  {{ record.status === 1 ? "解冻" : "冻结" }}
                </a-button>
                <a-button type="link" size="small" @click="handleEdit(record)"
                  >编辑</a-button
                >
                <a-button
                  type="link"
                  size="small"
                  @click="handleViewRecords(record)"
                  >查看记录</a-button
                >
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    <!-- 编辑用户弹窗 -->
    <EditUserModal
      v-model:open="editModalVisible"
      :user-data="currentEditUser"
      @success="handleEditSuccess"
    />
    <!-- 查看记录弹窗 -->
    <ViewRecordsModal
      v-model:open="viewRecordsModalVisible"
      :wx-id="currentViewRecordsUserId"
      :user-name="currentViewRecordsUserName"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import type { TableColumnsType } from "ant-design-vue";
import { getUserListApi, freezeUserApi, type UserItem } from "@/api/user";
import EditUserModal from "./components/EditUserModal.vue";
import ViewRecordsModal from "./components/ViewRecordsModal.vue";

const loading = ref(false);
const dataSource = ref<UserItem[]>([]);
const searchKeyword = ref("");
const editModalVisible = ref(false);
const currentEditUser = ref<UserItem | null>(null);
const viewRecordsModalVisible = ref(false);
const currentViewRecordsUserId = ref<number | null>(null);
const currentViewRecordsUserName = ref<string>("");

const columns: TableColumnsType = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "昵称",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "注册时间",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "会员状态",
    dataIndex: "is_vip",
    key: "membershipStatus",
  },
  {
    title: "会员到期日",
    dataIndex: "vip_expire_date",
    key: "vip_expire_date",
    width: 180,
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

// 搜索
const handleSearch = () => {
  paginationConfig.current = 1;
  loadData();
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

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      search: searchKeyword.value || undefined,
    };
    const res = await getUserListApi(params);
    dataSource.value = res.data.results || [];
    paginationConfig.total =
      res.data.pagination.count || res.data.pagination.total || 0;
  } catch (error) {
    console.error("加载用户列表失败:", error);
    message.error("加载用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 冻结/解冻用户
const handleFreeze = (record: UserItem) => {
  const isFrozen = record.status === 1; // 1-冻结状态
  const action = isFrozen ? "解冻" : "冻结";
  const status = isFrozen ? 0 : 1; // 如果已冻结则解冻(0)，否则冻结(1)

  Modal.confirm({
    title: `确认${action}用户`,
    content: `确定要${action}用户 "${record.username}" 吗？`,
    onOk: async () => {
      try {
        // wx_id 使用 id
        await freezeUserApi(record.id, status as 0 | 1);
        message.success(`${action}成功`);
        loadData();
      } catch (error) {
        console.error(`${action}用户失败:`, error);
        message.error(`${action}用户失败`);
      }
    },
  });
};

// 编辑用户
const handleEdit = (record: UserItem) => {
  currentEditUser.value = record;
  editModalVisible.value = true;
};

// 编辑成功后的回调
const handleEditSuccess = () => {
  loadData();
};

// 查看记录
const handleViewRecords = (record: UserItem) => {
  currentViewRecordsUserId.value = record.id;
  currentViewRecordsUserName.value = record.username;
  viewRecordsModalVisible.value = true;
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.user-management {
  .search-wrapper {
    margin-bottom: 16px;
    display: flex;
    align-items: center;
  }

  .table-wrapper {
    margin-top: 16px;
  }
}
</style>
