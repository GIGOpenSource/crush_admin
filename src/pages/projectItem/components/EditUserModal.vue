<template>
  <a-modal
    v-model:open="visible"
    title="编辑项目"
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
      <a-form-item label="标题">
        <a-input v-model:value="formState.name"  />
      </a-form-item>
      <a-form-item label="描述">
        <a-input v-model:value="formState.description" />
      </a-form-item>
      <a-form-item label="是否开启" name="is_enabled">
        <a-switch
          v-model:checked="formState.is_enabled"
          :checked-children="true"
          :un-checked-children="false"
          @change="handleVipStatusChange"
        />
      </a-form-item>
   <a-form-item label="类型">
        <!-- <a-input v-model:value="formState.tag_text" /> -->
           <a-select
          v-model:value="formState.tag_text"
          placeholder="类型"
          allow-clear
          style="width: 120px; margin-left: 8px"
        >
         <a-select-option value="HOT">热门</a-select-option>
          <a-select-option value="NEW">最新</a-select-option>
        </a-select>
      </a-form-item>
          
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import { updateTemplateApi, type TemplateItem } from "@/api/projectItem";

interface Props {
  open: boolean;
  userData: TemplateItem | null;
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
  name: string;
  description: string;
  is_enabled: boolean;
  tag_text: string;
}>({
  id: null,
  name: "",
  description: "",
  is_enabled: false,
  tag_text: "",
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
      formState.name = props.userData.name;
      formState.description = props.userData.description || ''
      formState.is_enabled = props.userData.is_enabled;
      formState.tag_text = props.userData.tag_text
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
    // formState.tag_text = null;
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    loading.value = true;
    // const submitData: {
    //   is_enabled: boolean;
    //   tag_text?: string | null;
    // } = {
    //   is_enabled: formState.is_enabled,
    // };
     const submitData = {
        is_enabled: formState.is_enabled,
        tag_text:formState.tag_text,
        name:formState.name,
        description:formState.description,


     }

    // 只有是会员状态时才提交会员到期日
    // if (formState.is_enabled && formState.tag_text) {
    //   // submitData.tag_text = formState.tag_text.format(
    //   //   "YYYY-MM-DD HH:mm:ss"
    //   // );
    // } else {
    //   submitData.tag_text = null;
    // }

    await updateTemplateApi(String(formState.id!), submitData);
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
