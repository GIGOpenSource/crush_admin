<template>
  <div class="advertisement-management">
    <a-card :bordered="false">
      <template #title>
        <span>广告管理</span>
      </template>
      <template #extra>
        <a-button type="primary" @click="handleAdd">新增广告</a-button>
      </template>
      
      <!-- 搜索区域 -->
      <div class="search-wrapper">
        <a-input
          v-model:value="searchKeyword"
          placeholder="可输入广告名称"
          allow-clear
          style="width: 300px"
          @press-enter="handleSearch"
        >
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>
        <a-select
          v-model:value="selectedStatus"
          placeholder="全部"
          allow-clear
          style="width: 120px; margin-left: 8px"
        >
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="active">启用</a-select-option>
          <a-select-option value="inactive">禁用</a-select-option>
        </a-select>
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
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              {{ (paginationConfig.current - 1) * paginationConfig.pageSize + index + 1 }}
            </template>
            <template v-if="column.key === 'api_key'">
              {{ record.api_key || '-' }}
            </template>
            <template v-if="column.key === 'api_secret'">
              {{ record.api_secret || '-' }}
            </template>
            <template v-if="column.key === 'access_token'">
              {{ record.access_token || '-' }}
            </template>
            <template v-if="column.key === 'location'">
              {{ record.location || '-' }}
            </template>
            <template v-if="column.key === 'weight'">
              {{ record.weight || '-' }}
            </template>
            <template v-if="column.key === 'status'">
              <a-switch
                v-model:checked="record.status"
                checked-children="启用"
                un-checked-children="禁用"
                @change="handleStatusChange(record)"
              />
            </template>
            <template v-if="column.key === 'created_at'">
              {{ formatDateTime(record.created_at) }}
            </template>
            <template v-if="column.key === 'action'">
              <a-space>
                <a-button type="link" size="small" @click="handleViewData(record)">
                  数据
                </a-button>
                <a-button type="link" size="small" @click="handleEdit(record)">
                  编辑
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  danger
                  @click="handleDelete(record)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>
    
    <!-- 广告弹窗 -->
    <AdvertisementModal
      v-model:open="modalVisible"
      :advertisement-data="currentAdvertisement"
      :mode="modalMode"
      @success="handleModalSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { message, Modal } from "ant-design-vue";
import { SearchOutlined } from "@ant-design/icons-vue";
import type { TableColumnsType } from "ant-design-vue";
import { getAdvertisementListApi, deleteAdvertisementApi, updateAdvertisementStatusApi, type AdvertisementItem } from "@/api/advertisement";
import AdvertisementModal from "./components/AdvertisementModal.vue";

const loading = ref(false);
const dataSource = ref<AdvertisementItem[]>([]);
const searchKeyword = ref("");
const selectedStatus = ref<string>("");
const modalVisible = ref(false);
const currentAdvertisement = ref<AdvertisementItem | null>(null);
const modalMode = ref<"add" | "edit" | "view">("add");

const columns: TableColumnsType = [
  {
    title: "序号",
    key: "index",
    width: 80,
  },
  {
    title: "广告名称",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "API Key",
    dataIndex: "api_key",
    key: "api_key",
  },
  {
    title: "API Secret",
    dataIndex: "api_secret",
    key: "api_secret",
  },
  {
    title: "Access Token",
    dataIndex: "access_token",
    key: "access_token",
  },
  {
    title: "位置",
    dataIndex: "location",
    key: "location",
  },
  {
    title: "权重",
    dataIndex: "weight",
    key: "weight",
    width: 100,
  },
  {
    title: "状态",
    key: "status",
    width: 120,
  },
  {
    title: "创建时间",
    dataIndex: "created_at",
    key: "created_at",
    width: 180,
  },
  {
    title: "操作",
    key: "action",
    fixed: "right",
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
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
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
    
    if (selectedStatus.value) {
      params.status = selectedStatus.value;
    }
    
    try {
      const res = await getAdvertisementListApi(params);
      dataSource.value = res.data.results || [];
      paginationConfig.total =
        res.data.pagination.count || res.data.pagination.total || 0;
    } catch (apiError) {
      // API调用失败时使用假数据
      console.warn("API调用失败，使用假数据:", apiError);
      const mockData = generateMockData();
      let filteredData = mockData;
      
      if (searchKeyword.value) {
        const keyword = searchKeyword.value.toLowerCase();
        filteredData = filteredData.filter((item) =>
          item.name.toLowerCase().includes(keyword)
        );
      }
      
      if (selectedStatus.value) {
        filteredData = filteredData.filter((item) => {
          const status = item.status ? "active" : "inactive";
          return status === selectedStatus.value;
        });
      }
      
      dataSource.value = filteredData;
      paginationConfig.total = filteredData.length;
    }
  } catch (error) {
    console.error("加载广告列表失败:", error);
    message.error("加载广告列表失败");
  } finally {
    loading.value = false;
  }
};

// 生成假数据
const generateMockData = (): AdvertisementItem[] => {
  return [
    {
      id: 1,
      name: "广告1",
      api_key: "",
      api_secret: "",
      access_token: "",
      location: "首页弹窗,个人中心-上",
      weight: 3,
      status: true,
      jump_link: "https://example.com/ad1",
      display_start_time: "2025-12-01",
      display_end_time: "2025-12-31",
      delivery_period: "all",
      target_audience: "all",
      created_at: "2025-12-03 11:11:11",
    },
    {
      id: 2,
      name: "广告2",
      api_key: "",
      api_secret: "",
      access_token: "",
      location: "首页弹窗,个人中心-下",
      weight: 2,
      status: true,
      jump_link: "https://example.com/ad2",
      display_start_time: "2025-12-01",
      display_end_time: "2025-12-31",
      delivery_period: "specified",
      specified_start_time: "2025-12-05",
      specified_end_time: "2025-12-20",
      target_audience: "non_member",
      created_at: "2025-12-03 11:11:11",
    },
    {
      id: 3,
      name: "广告3",
      api_key: "",
      api_secret: "",
      access_token: "",
      location: "首页弹窗,个人中心-下",
      weight: 4,
      status: true,
      jump_link: "https://example.com/ad3",
      display_start_time: "2025-12-01",
      display_end_time: "2025-12-31",
      delivery_period: "all",
      target_audience: "all",
      created_at: "2025-12-03 11:11:11",
    },
  ];
};

// 新增广告
const handleAdd = () => {
  currentAdvertisement.value = null;
  modalMode.value = "add";
  modalVisible.value = true;
};

// 查看数据
const handleViewData = (record: AdvertisementItem) => {
  currentAdvertisement.value = record;
  modalMode.value = "view";
  modalVisible.value = true;
};

// 编辑广告
const handleEdit = (record: AdvertisementItem) => {
  currentAdvertisement.value = record;
  modalMode.value = "edit";
  modalVisible.value = true;
};

// 弹窗成功回调
const handleModalSuccess = () => {
  loadData();
};

// 删除广告
const handleDelete = (record: AdvertisementItem) => {
  Modal.confirm({
    title: "确认删除",
    content: `确定要删除广告 "${record.name}" 吗？`,
    onOk: async () => {
      try {
        await deleteAdvertisementApi(record.id);
        message.success("删除成功");
        loadData();
      } catch (error) {
        console.error("删除广告失败:", error);
        message.error("删除广告失败");
      }
    },
  });
};

// 状态切换
const handleStatusChange = async (record: AdvertisementItem) => {
  try {
    await updateAdvertisementStatusApi(record.id, record.status);
    message.success(record.status ? "已启用" : "已禁用");
  } catch (error) {
    console.error("更新状态失败:", error);
    message.error("更新状态失败");
    // 恢复原状态
    record.status = !record.status;
  }
};

onMounted(() => {
  loadData();
});
</script>

<style lang="less" scoped>
.advertisement-management {
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

