<template>
  <a-modal
    v-model:open="visible"
    title="查看记录"
    :footer="null"
    width="900px"
    @cancel="handleCancel"
  >
    <a-table
      :columns="columns"
      :data-source="flattenedRecords"
      :loading="loading"
      :pagination="false"
      row-key="id"
      size="small"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'file_type'">
          {{ record.file_type || "-" }}
        </template>
        <template v-if="column.key === 'upload_material'">
          <img
            v-if="record.upload_material"
            :src="record.upload_material"
            alt="上传资料"
            style="max-width: 100px; max-height: 100px; cursor: pointer"
            @click="previewImage(record.upload_material)"
          />
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'poster'">
          <img
            v-if="record.poster"
            :src="record.poster"
            alt="海报"
            style="max-width: 100px; max-height: 100px; cursor: pointer"
            @click="previewImage(record.poster)"
          />
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'advanced_report'">
          <img
            v-if="record.advanced_report"
            :src="record.advanced_report"
            alt="高级报告"
            style="max-width: 100px; max-height: 100px; cursor: pointer"
            @click="previewImage(record.advanced_report)"
          />
          <span v-else>-</span>
        </template>
        <template v-if="column.key === 'time'">
          {{ record.time ? formatDateTime(record.time) : "-" }}
        </template>
      </template>
    </a-table>
    <div v-if="!loading && flattenedRecords.length === 0" class="empty-tip">
      暂无记录
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, watch, computed, h } from "vue";
import { Modal } from "ant-design-vue";
import type { TableColumnsType } from "ant-design-vue";
import {
  getUserRecordsApi,
  type UserRecordItem,
  type FlattenedRecordItem,
} from "@/api/user";

interface Props {
  open: boolean;
  wxId: number | null;
  userName?: string;
}

interface Emits {
  (e: "update:open", value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  wxId: null,
  userName: "",
});

const emit = defineEmits<Emits>();

const visible = ref(false);
const loading = ref(false);
const recordList = ref<UserRecordItem[]>([]);

// 解析图片URL列表
const parseImageUrls = (images: any): string[] => {
  if (!images || !images.url_list) return [];
  try {
    const urls = JSON.parse(images.url_list);
    return Array.isArray(urls) ? urls : [];
  } catch {
    return [];
  }
};

// 展平记录数据
const flattenedRecords = computed<FlattenedRecordItem[]>(() => {
  const result: FlattenedRecordItem[] = [];

  recordList.value.forEach((record) => {
    // 处理主记录
    const imageUrls = parseImageUrls(record.images);
    const uploadMaterial = imageUrls.length > 0 ? imageUrls[0] : "";

    result.push({
      id: record.id,
      file_type: record.prompt_template?.name || "-",
      upload_material: uploadMaterial,
      poster: record.parse_type === "once" ? record.file_url : "",
      advanced_report: record.child_list?.[0]?.file_url || "",
      time: record.created_time,
      isChild: false,
    });

    // 处理子记录（如果有）
    if (record.child_list && record.child_list.length > 0) {
      record.child_list.forEach((child) => {
        const childImageUrls = parseImageUrls(child.images);
        const childUploadMaterial =
          childImageUrls.length > 0 ? childImageUrls[0] : "";

        result.push({
          id: child.id,
          file_type: child.prompt_template?.name || "-",
          upload_material: childUploadMaterial,
          poster: "",
          advanced_report: child.file_url || "",
          time: child.created_time,
          isChild: true,
        });
      });
    }
  });

  return result;
});

const columns: TableColumnsType = [
  {
    title: "文件类型",
    dataIndex: "file_type",
    key: "file_type",
    width: 120,
  },
  {
    title: "上传资料",
    dataIndex: "upload_material",
    key: "upload_material",
    width: 150,
  },
  {
    title: "海报",
    dataIndex: "poster",
    key: "poster",
    width: 150,
  },
  {
    title: "高级报告",
    dataIndex: "advanced_report",
    key: "advanced_report",
    width: 150,
  },
  {
    title: "时间",
    dataIndex: "time",
    key: "time",
    width: 180,
  },
];

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

// 加载记录数据
const loadRecords = async () => {
  if (!props.wxId) return;

  try {
    loading.value = true;
    const res = await getUserRecordsApi(props.wxId);
    // 如果返回的是数组，直接使用；如果是对象包含数组，需要提取
    if (Array.isArray(res)) {
      recordList.value = res;
    } else if (res && typeof res === "object" && "data" in res) {
      recordList.value = (res as any).data || [];
    } else if (res && typeof res === "object" && "results" in res) {
      recordList.value = (res as any).results || [];
    } else {
      recordList.value = [];
    }
  } catch (error) {
    console.error("获取用户记录失败:", error);
    recordList.value = [];
  } finally {
    loading.value = false;
  }
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.wxId) {
      loadRecords();
    } else {
      recordList.value = [];
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

// 预览图片
const previewImage = (imageUrl: string) => {
  Modal.info({
    title: "图片预览",
    width: 800,
    content: h("div", { style: "text-align: center; padding: 20px;" }, [
      h("img", {
        src: imageUrl,
        alt: "预览图片",
        style: "max-width: 100%; max-height: 600px;",
      }),
    ]),
    okText: "关闭",
  });
};
</script>

<style lang="less" scoped>
.empty-tip {
  text-align: center;
  padding: 40px 0;
  color: #999;
}
</style>
