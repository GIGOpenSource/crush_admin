<template>
  <div class="user-management">
    <a-card :bordered="false">
      <template #title>
        <span>项目管理</span>
      </template>
      <!-- 搜索区域 -->
      <!-- <div class="search-wrapper">
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
          placeholder="全部平台"
          allow-clear
          style="width: 150px; margin-left: 8px"
        >
          <a-select-option value="">全部平台</a-select-option>
          <a-select-option value="xhs_mini">小红书</a-select-option>
          <a-select-option value="fbook_mini">feekbook</a-select-option>
          <a-select-option value="ins_mini">ins</a-select-option>
          <a-select-option value="google_mini">googole</a-select-option>
          <a-select-option value="ios_mini">苹果</a-select-option>
          <a-select-option value="apk_mini">安卓</a-select-option>
          <a-select-option value="wechat_mini">微信</a-select-option>
          <a-select-option value="douyin_mini">抖音</a-select-option>
          <a-select-option value="mock_mini">苹果</a-select-option>
        </a-select>
        <a-button type="primary" @click="handleSearch" style="margin-left: 8px">
          搜索
        </a-button>
      </div> -->
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
            <template v-if="column.key === 'tag_text'">
             <span>{{ record.tag_text == 'HOT' ? "热门" : "最新" }}</span>
            </template>
            <template v-if="column.key === 'is_enabled'">
              <a-tag :color="record.is_enabled ? 'green' : 'default'">
                {{ record.is_enabled ? "开启" : "关闭" }}
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

                <a-button type="link" size="small" @click="handleEdit(record)"
                  >编辑</a-button
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
import { getTemplateListApi, type TemplateItem } from "@/api/projectItem";
import EditUserModal from "./components/EditUserModal.vue";

const loading = ref(false);
const dataSource = ref<TemplateItem[]>([]);
const searchKeyword = ref("");
const selectedPlatform = ref<string>("");
const editModalVisible = ref(false);
const currentEditUser = ref<TemplateItem | null>(null);
const viewRecordsModalVisible = ref(false);
const currentViewRecordsUserId = ref<number | null>(null);
const currentViewRecordsUserName = ref<string>("");

const columns: TableColumnsType = [
  {
    title: "序号",
    dataIndex: "id",
    key: "id",
    width: 80,
  },
  {
    title: "标题",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "描述",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "类型",
    dataIndex: "tag_text",
    key: "tag_text",
  },
  {
    title: "是否开启",
    dataIndex: "is_enabled",
    key: "is_enabled",
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

// 平台字段语义化映射
const getPlatformLabel = (platform: string | undefined): string => {
  if (!platform) return '-';
  
  const platformMap: Record<string, string> = {
    'xhs_mini': '小红书',
    'fbook_mini': 'feekbook',
    'ins_mini': 'ins',
    'google_mini': 'googole',
    'ios_mini': '苹果',
    'apk_mini': '安卓',
    'wechat_mini': '微信',
    'douyin_mini': '抖音',
    'mock_mini': '苹果',
  };
  
  return platformMap[platform] || platform;
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    const params: any = {
      currentPage: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      search: searchKeyword.value || undefined,
    };
    // 如果选择了平台，添加平台参数
    if (selectedPlatform.value) {
      params.platform = selectedPlatform.value;
    }
    const res = await getTemplateListApi(params);
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


// 编辑用户
const handleEdit = (record: TemplateItem) => {
  currentEditUser.value = record;
  editModalVisible.value = true;
};

// 编辑成功后的回调
const handleEditSuccess = () => {
  loadData();
};

// 查看记录
const handleViewRecords = (record: TemplateItem) => {
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
