<template>
  <a-modal
    v-model:open="visible"
    title="编辑用户"
    :confirm-loading="loading"
    @ok="handleSubmit"
    @cancel="handleCancel"
    width="600px"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="昵称">
        <a-input v-model:value="formState.username" disabled />
      </a-form-item>
      <a-form-item label="注册时间">
        <a-input v-model:value="formState.created_at" disabled />
      </a-form-item>
      <a-form-item label="会员状态" name="is_vip">
        <a-switch
          v-model:checked="formState.is_vip"
          checked-children="会员"
          un-checked-children="非会员"
          @change="handleVipStatusChange"
        />
      </a-form-item>
      <a-form-item label="会员到期日" name="vip_expire_date">
        <a-date-picker
          v-model:value="formState.vip_expire_date"
          :disabled="!formState.is_vip"
          show-time
          format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
          placeholder="请选择会员到期日"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import { updateUserApi, type UserItem } from "@/api/user";

interface Props {
  open: boolean;
  userData: UserItem | null;
}

interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  userData: null,
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const visible = ref(false);

const formState = reactive<{
  id: number | null;
  username: string;
  created_at: string;
  is_vip: boolean;
  vip_expire_date: Dayjs | null;
}>({
  id: null,
  username: "",
  created_at: "",
  is_vip: false,
  vip_expire_date: null,
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
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.userData) {
      // 初始化表单数据
      formState.id = props.userData.id;
      formState.username = props.userData.username;
      formState.created_at = formatDateTime(props.userData.created_at);
      formState.is_vip = props.userData.is_vip;
      formState.vip_expire_date = props.userData.vip_expire_date
        ? dayjs(props.userData.vip_expire_date)
        : null;
    }
  }
);

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit("update:open", newVal);
});

// 会员状态改变时的处理
const handleVipStatusChange = (checked: boolean) => {
  // 如果不是会员，清空会员到期日
  if (!checked) {
    formState.vip_expire_date = null;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    const submitData: {
      is_vip: boolean;
      vip_expire_date?: string | null;
    } = {
      is_vip: formState.is_vip,
    };

    // 只有是会员状态时才提交会员到期日
    if (formState.is_vip && formState.vip_expire_date) {
      submitData.vip_expire_date = formState.vip_expire_date.format(
        "YYYY-MM-DD HH:mm:ss"
      );
    } else {
      submitData.vip_expire_date = null;
    }

    await updateUserApi(String(formState.id!), submitData);
    message.success("更新成功");
    emit("success");
    visible.value = false;
  } catch (error) {
    console.error("更新用户失败:", error);
    message.error("更新用户失败");
  } finally {
    loading.value = false;
  }
};

// 取消
const handleCancel = () => {
  visible.value = false;
};
</script>

<style lang="less" scoped>
:deep(.ant-form-item-label) {
  font-weight: 500;
}
</style>
