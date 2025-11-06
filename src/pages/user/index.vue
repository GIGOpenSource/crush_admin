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
            <template v-if="column.key === 'membershipStatus'">
              <a-tag
                :color="
                  record.membershipStatus === 'member' ? 'green' : 'default'
                "
              >
                {{ record.membershipStatus === "member" ? "会员" : "非会员" }}
              </a-tag>
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button
                  type="link"
                  size="small"
                  @click="handleFreeze(record)"
                >
                  {{ record.isFrozen ? "解冻" : "冻结" }}
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import type { TableColumnsType } from "ant-design-vue";
import {
  getUserListApi,
  freezeUserApi,
  getUserRecordsApi,
  type UserItem,
} from "@/api/user";

const loading = ref(false);
const dataSource = ref<UserItem[]>([]);
const searchKeyword = ref("");

const columns: TableColumnsType = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
    width: 200,
  },
  {
    title: "昵称",
    dataIndex: "nickname",
    key: "nickname",
  },
  {
    title: "注册时间",
    dataIndex: "registerTime",
    key: "registerTime",
  },
  {
    title: "会员状态",
    dataIndex: "membershipStatus",
    key: "membershipStatus",
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
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

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params = {
      page: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      keyword: searchKeyword.value || undefined,
    };
    const res = await getUserListApi(params);
    dataSource.value = res.list || [];
    paginationConfig.total = res.total || 0;
  } catch (error) {
    console.error("加载用户列表失败:", error);
    message.error("加载用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 冻结/解冻用户
const handleFreeze = (record: UserItem) => {
  const action = record.isFrozen ? "解冻" : "冻结";
  Modal.confirm({
    title: `确认${action}用户`,
    content: `确定要${action}用户 "${record.nickname}" 吗？`,
    onOk: async () => {
      try {
        await freezeUserApi(record.id, !record.isFrozen);
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
  message.info(`编辑用户: ${record.nickname}`);
  // TODO: 实现编辑功能，打开编辑弹窗
};

// 查看记录
const handleViewRecords = async (record: UserItem) => {
  try {
    const res = await getUserRecordsApi(record.id);
    message.info(`查看用户 "${record.nickname}" 的记录`);
    // TODO: 实现查看记录功能，打开记录弹窗或跳转到记录页面
    console.log("用户记录:", res);
  } catch (error) {
    console.error("获取用户记录失败:", error);
    message.error("获取用户记录失败");
  }
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
