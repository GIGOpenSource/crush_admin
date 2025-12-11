<template>
  <a-modal
    v-model:open="visible"
    :title="isViewMode ? '数据' : (isEditMode ? '编辑' : '新增广告')"
    :confirm-loading="loading"
    :ok-button-props="{ style: { display: isViewMode ? 'none' : 'inline-block' } }"
    ok-text="提交"
    cancel-text="取消"
    :width="800"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :rules="rules"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
    >
      <a-form-item label="广告名称" name="name" required>
        <a-input
          v-model:value="formState.name"
          placeholder="请输入广告名称"
          :maxlength="40"
          :disabled="isViewMode"
        >
          <template #suffix>
            <span class="char-count">{{ formState.name.length }}/40</span>
          </template>
        </a-input>
      </a-form-item>

      <a-form-item label="广告位置" name="location" required>
        <a-select
          v-model:value="formState.location"
          placeholder="请选择位置"
          :disabled="isViewMode"
          allow-clear
        >
          <a-select-option value="首页弹窗">首页弹窗</a-select-option>
          <a-select-option value="个人中心-上">个人中心-上</a-select-option>
          <a-select-option value="个人中心-下">个人中心-下</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="API Key" name="api_key">
        <a-input
          v-model:value="formState.api_key"
          placeholder="请输入API Key"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="API Secret" name="api_secret">
        <a-input
          v-model:value="formState.api_secret"
          placeholder="请输入API Secret"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="Access Token" name="access_token">
        <a-input
          v-model:value="formState.access_token"
          placeholder="请输入Access Token"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="跳转链接" name="jump_link" required>
        <a-input
          v-model:value="formState.jump_link"
          placeholder="请输入"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="权重排序" name="weight" required>
        <a-input-number
          v-model:value="formState.weight"
          :min="0"
          :max="100"
          placeholder="请输入"
          style="width: 100%"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="状态" name="status" required>
        <a-select
          v-model:value="formState.status"
          placeholder="请选择状态"
          :disabled="isViewMode"
        >
          <a-select-option value="pending">待上线</a-select-option>
          <a-select-option value="active">已上线</a-select-option>
          <a-select-option value="inactive">已下线</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="显示时间" name="display_time" required>
        <a-range-picker
          v-model:value="formState.display_time"
          format="YYYY-MM-DD"
          style="width: 100%"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="投放时段" name="delivery_period" required>
        <a-radio-group v-model:value="formState.delivery_period" :disabled="isViewMode">
          <a-radio value="all">全时段</a-radio>
          <a-radio value="specified">指定时段</a-radio>
        </a-radio-group>
        <a-range-picker
          v-if="formState.delivery_period === 'specified'"
          v-model:value="formState.specified_time"
          format="YYYY-MM-DD"
          style="width: 100%; margin-top: 8px"
          :disabled="isViewMode"
        />
      </a-form-item>

      <a-form-item label="推送人群" name="target_audience" required>
        <a-radio-group v-model:value="formState.target_audience" :disabled="isViewMode">
          <a-radio value="all">全部人群</a-radio>
          <a-radio value="non_member">非会员用户</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import type { AdvertisementItem } from "@/api/advertisement";

interface Props {
  open: boolean;
  advertisementData?: AdvertisementItem | null;
  mode?: "add" | "edit" | "view"; // add-新增, edit-编辑, view-查看数据
}

interface Emits {
  (e: "update:open", value: boolean): void;
  (e: "success"): void;
}

const props = withDefaults(defineProps<Props>(), {
  open: false,
  advertisementData: null,
  mode: "add",
});

const emit = defineEmits<Emits>();

const formRef = ref<FormInstance>();
const loading = ref(false);
const visible = ref(false);

const isViewMode = computed(() => props.mode === "view");
const isEditMode = computed(() => props.mode === "edit");

const formState = reactive<{
  name: string;
  location: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  jump_link: string;
  weight: number | null;
  status: string;
  display_time: [Dayjs, Dayjs] | null;
  delivery_period: string;
  specified_time: [Dayjs, Dayjs] | null;
  target_audience: string;
}>({
  name: "",
  location: "",
  api_key: "",
  api_secret: "",
  access_token: "",
  jump_link: "",
  weight: null,
  status: "pending",
  display_time: null,
  delivery_period: "all",
  specified_time: null,
  target_audience: "all",
});

const rules = {
  name: [
    { required: true, message: "请输入广告名称", trigger: "blur" },
    { max: 40, message: "最多支持40个字符", trigger: "blur" },
  ],
  location: [{ required: true, message: "请选择广告位置", trigger: "change" }],
  jump_link: [{ required: true, message: "请输入跳转链接", trigger: "blur" }],
  weight: [
    { required: true, message: "请输入权重排序", trigger: "blur" },
    { type: "number", min: 0, max: 100, message: "请输入0-100之间的数字", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  display_time: [
    { required: true, message: "请选择广告开始/停止展示时间", trigger: "change" },
  ],
  delivery_period: [{ required: true, message: "请选择投放时段", trigger: "change" }],
  target_audience: [{ required: true, message: "请选择推送人群", trigger: "change" }],
};

// 监听 open 变化
watch(
  () => props.open,
  (newVal) => {
    visible.value = newVal;
    if (newVal) {
      if (props.advertisementData && (props.mode === "edit" || props.mode === "view")) {
        // 编辑或查看模式，填充数据
        formState.name = props.advertisementData.name || "";
        formState.location = props.advertisementData.location || "";
        formState.api_key = props.advertisementData.api_key || "";
        formState.api_secret = props.advertisementData.api_secret || "";
        formState.access_token = props.advertisementData.access_token || "";
        formState.jump_link = props.advertisementData.jump_link || "";
        formState.weight = props.advertisementData.weight || null;
        // 状态映射：true->active, false->inactive
        formState.status = props.advertisementData.status ? "active" : "inactive";
        // 解析显示时间（如果有）
        if (props.advertisementData.display_start_time && props.advertisementData.display_end_time) {
          formState.display_time = [
            dayjs(props.advertisementData.display_start_time),
            dayjs(props.advertisementData.display_end_time),
          ];
        } else {
          formState.display_time = null;
        }
        formState.delivery_period = props.advertisementData.delivery_period || "all";
        if (props.advertisementData.specified_start_time && props.advertisementData.specified_end_time) {
          formState.specified_time = [
            dayjs(props.advertisementData.specified_start_time),
            dayjs(props.advertisementData.specified_end_time),
          ];
        } else {
          formState.specified_time = null;
        }
        formState.target_audience = props.advertisementData.target_audience || "all";
      } else {
        // 新增模式，重置表单
        resetForm();
      }
    }
  }
);

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit("update:open", newVal);
});

// 重置表单
const resetForm = () => {
  formState.name = "";
  formState.location = "";
  formState.api_key = "";
  formState.api_secret = "";
  formState.access_token = "";
  formState.jump_link = "";
  formState.weight = null;
  formState.status = "pending";
  formState.display_time = null;
  formState.delivery_period = "all";
  formState.specified_time = null;
  formState.target_audience = "all";
  formRef.value?.resetFields();
};

// 提交表单
const handleSubmit = async () => {
  if (isViewMode.value) {
    // 查看模式不应该触发提交
    return;
  }

  try {
    await formRef.value?.validate();
    loading.value = true;

    const submitData: any = {
      name: formState.name,
      location: formState.location,
      api_key: formState.api_key,
      api_secret: formState.api_secret,
      access_token: formState.access_token,
      jump_link: formState.jump_link,
      weight: formState.weight,
      status: formState.status === "active", // 转换为boolean
      delivery_period: formState.delivery_period,
      target_audience: formState.target_audience,
    };

    if (formState.display_time) {
      submitData.display_start_time = formState.display_time[0].format("YYYY-MM-DD");
      submitData.display_end_time = formState.display_time[1].format("YYYY-MM-DD");
    }

    if (formState.delivery_period === "specified" && formState.specified_time) {
      submitData.specified_start_time = formState.specified_time[0].format("YYYY-MM-DD");
      submitData.specified_end_time = formState.specified_time[1].format("YYYY-MM-DD");
    }

    // 这里应该调用API
    // if (props.mode === "edit") {
    //   await updateAdvertisementApi(props.advertisementData!.id, submitData);
    // } else {
    //   await createAdvertisementApi(submitData);
    // }

    message.success(props.mode === "edit" ? "更新成功" : "创建成功");
    emit("success");
    visible.value = false;
  } catch (error: any) {
    if (error?.errorFields) {
      // 表单验证错误
      return;
    }
    console.error("提交失败:", error);
    message.error("提交失败");
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
.form-tip {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
  line-height: 1.5;

  div {
    margin-top: 4px;

    &:first-child {
      margin-top: 0;
    }
  }
}

:deep(.ant-form-item-label) {
  font-weight: 500;
}

.char-count {
  font-size: 12px;
  color: #999;
}
</style>

