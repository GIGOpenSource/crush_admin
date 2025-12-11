<template>
  <a-modal
    v-model:open="visible"
    title="编辑"
    :confirm-loading="loading"
    ok-text="确认"
    cancel-text="取消"
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
      <a-form-item label="用户ID">
        <a-input :value="formState.user_id?.toString()" disabled />
      </a-form-item>
      <a-form-item label="用户昵称">
        <a-input :value="formState.username" disabled />
      </a-form-item>
      <a-form-item label="累计邀请数" name="total_invitations">
        <a-input-number
          v-model:value="formState.total_invitations"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="新增用户数" name="new_users">
        <a-input-number
          v-model:value="formState.new_users"
          :min="0"
          style="width: 100%"
        />
      </a-form-item>
      <a-form-item label="奖励金额">
        <a-input :value="formatAmount(formState.reward_amount)" disabled />
      </a-form-item>
      <a-form-item label="提现总金额">
        <a-input :value="formatAmount(formState.withdrawal_amount)" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import { updateInvitationApi, type InvitationItem } from "@/api/invitation";

interface Props {
  open: boolean;
  invitationData: InvitationItem | null;
}

interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  invitationData: null,
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const visible = ref(false);

const formState = reactive<{
  id: number | null;
  user_id: number | null;
  username: string;
  total_invitations: number;
  new_users: number;
  reward_amount: number;
  withdrawal_amount: number;
}>({
  id: null,
  user_id: null,
  username: "",
  total_invitations: 0,
  new_users: 0,
  reward_amount: 0,
  withdrawal_amount: 0,
});

// 格式化金额显示
const formatAmount = (amount: number) => {
  return `¥${amount.toFixed(2)}`;
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal && props.invitationData) {
      // 初始化表单数据
      formState.id = props.invitationData.id;
      formState.user_id = props.invitationData.user_id;
      formState.username = props.invitationData.username;
      formState.total_invitations = props.invitationData.total_invitations;
      formState.new_users = props.invitationData.new_users;
      formState.reward_amount = props.invitationData.reward_amount;
      formState.withdrawal_amount = props.invitationData.withdrawal_amount;
    }
  }
);

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit("update:open", newVal);
});

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    await updateInvitationApi(formState.id!, {
      total_invitations: formState.total_invitations,
      new_users: formState.new_users,
    });
    
    message.success("更新成功");
    emit("success");
    visible.value = false;
  } catch (error) {
    console.error("更新邀请信息失败:", error);
    message.error("更新邀请信息失败");
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

.tip-text {
  margin-top: 16px;
  padding: 12px;
  background: #fff7e6;
  border-left: 3px solid #ff4d4f;
  font-size: 12px;
}
</style>

