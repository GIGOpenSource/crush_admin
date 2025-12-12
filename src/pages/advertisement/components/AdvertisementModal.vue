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

      <a-form-item label="广告位置" name="positions" required>
        <a-select
          v-model:value="formState.positions"
          placeholder="请选择位置"
          :disabled="isViewMode"
          allow-clear
        >
          <a-select-option value="banner">首页</a-select-option>
          <a-select-option value="center">个人中心</a-select-option>
          <a-select-option value="cover">封面</a-select-option>
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

      <a-form-item label="跳转链接" name="redirect_url" required>
        <a-input
          v-model:value="formState.redirect_url"
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
          <a-select-option value="active">上线中</a-select-option>
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

      <a-form-item label="投放时段" name="schedule_type" required>
        <a-radio-group v-model:value="formState.schedule_type" :disabled="isViewMode">
          <a-radio value="all_time">全时段</a-radio>
          <a-radio value="specified">指定时段</a-radio>
        </a-radio-group>
        <template v-if="formState.schedule_type === 'specified'">
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 8px;">
            <a-form-item 
              name="deliver_start_time" 
              :rules="scheduleTypeRules.deliver_start_time"
              style="flex: 1; margin-bottom: 0;"
            >
              <a-time-picker
                v-model:value="formState.deliver_start_time"
                format="HH:mm"
                style="width: 100%"
                :disabled="isViewMode"
                placeholder="开始时间"
              />
            </a-form-item>
            <!-- <span style="color: #999;disflex:block">至</span> -->
            <a-form-item 
              name="deliver_end_time" 
              :rules="scheduleTypeRules.deliver_end_time"
              style="flex: 1; margin-bottom: 0;"
            >
              <a-time-picker
                v-model:value="formState.deliver_end_time"
                format="HH:mm"
                style="width: 100%"
                :disabled="isViewMode"
                placeholder="结束时间"
              />
            </a-form-item>
          </div>
        </template>
      </a-form-item>

      <a-form-item label="推送人群" name="audience_type" required>
        <a-radio-group v-model:value="formState.audience_type" :disabled="isViewMode">
          <a-radio value="all">全部人群</a-radio>
          <a-radio value="non_vip">非会员用户</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, nextTick } from "vue";
import { message } from "ant-design-vue";
import type { FormInstance } from "ant-design-vue";
import dayjs, { type Dayjs } from "dayjs";
import type { AdvertisementItem} from "@/api/advertisement";
import  { updateAdvertisementApi,createAdvertisementApi} from "@/api/advertisement";
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
  positions: string;
  api_key: string;
  api_secret: string;
  access_token: string;
  redirect_url: string;
  weight: number | null;
  status: string;
  display_time: [Dayjs, Dayjs] | null;
  schedule_type: string;
  deliver_start_time: Dayjs | null;
  deliver_end_time: Dayjs | null;
  audience_type: string;
  end_time: string,
  start_time: string
}>({
  name: "",
  positions: "",
  api_key: "",
  api_secret: "",
  access_token: "",
  redirect_url: "",
  weight: null,
  status: "pending",
  display_time: null,
  schedule_type: "all_time",
  deliver_start_time: null,
  deliver_end_time: null,
  audience_type: "all",
  end_time:'',
  start_time:''
});

const rules = {
  name: [
    { required: true, message: "请输入广告名称", trigger: "blur" },
    { max: 40, message: "最多支持40个字符", trigger: "blur" },
  ],
  positions: [{ required: true, message: "请选择广告位置", trigger: "change" }],
  redirect_url: [{ required: true, message: "请输入跳转链接", trigger: "blur" }],
  weight: [
    { required: true, message: "请输入权重排序", trigger: "blur" },
    { type: "number", min: 0, max: 100, message: "请输入0-100之间的数字", trigger: "blur" },
  ],
  status: [{ required: true, message: "请选择状态", trigger: "change" }],
  display_time: [
    { required: true, message: "请选择广告开始/停止展示时间", trigger: "change" },
  ],
  schedule_type: [{ required: true, message: "请选择投放时段", trigger: "change" }],
  audience_type: [{ required: true, message: "请选择推送人群", trigger: "change" }],
};

// 动态验证规则：当选择指定时段时，开始时间和结束时间必填
const scheduleTypeRules = computed(() => {
  if (formState.schedule_type === "specified") {
    return {
      deliver_start_time: [
        { required: true, message: "请选择开始时间", trigger: "change" },
      ],
      deliver_end_time: [
        { required: true, message: "请选择结束时间", trigger: "change" },
      ],
    };
  }
  return {
    deliver_start_time: [],
    deliver_end_time: [],
  };
});

// 监听 open 和 mode 变化
watch(
  [() => props.open, () => props.mode, () => props.advertisementData],
  ([newVal, mode, data]) => {
    visible.value = newVal;
    if (newVal) {
      // 使用 nextTick 确保 DOM 更新后再操作表单
      nextTick(() => {
        // 明确判断：只有在编辑或查看模式且有数据时才填充数据
        if (mode === "edit" || mode === "view") {
          if (data) {
            // 编辑或查看模式，填充数据
            formState.name = data.name || "";
            formState.positions = data.positions || data.location || "";
            formState.api_key = data.api_key || "";
            formState.api_secret = data.api_secret || "";
            formState.access_token = data.access_token || "";
            formState.redirect_url = data.redirect_url || data.jump_link || "";
            formState.weight = data.weight || null;
            // 直接使用原始 status 值，不进行转换
            formState.status = typeof data.status === 'string' ? data.status : (data.status ? "active" : "pending");
            // 解析显示时间（如果有）
            if (data.start_time && data.end_time) {
              formState.display_time = [
                dayjs(data.start_time),
                dayjs(data.end_time),
              ];
            } else {
              formState.display_time = null;
            }
            formState.schedule_type = data.schedule_type || data.delivery_period || "all_time";
            if (data.deliver_start_time && data.deliver_end_time) {
              // 如果是时间格式（HH:mm），解析为今天的时间
              const startTimeStr = typeof data.deliver_start_time === 'string' 
                ? data.deliver_start_time 
                : String(data.deliver_start_time);
              const endTimeStr = typeof data.deliver_end_time === 'string'
                ? data.deliver_end_time
                : String(data.deliver_end_time);
              formState.deliver_start_time = startTimeStr.includes(':') 
                ? dayjs(`2000-01-01 ${startTimeStr}`, 'YYYY-MM-DD HH:mm')
                : dayjs(startTimeStr);
              formState.deliver_end_time = endTimeStr.includes(':')
                ? dayjs(`2000-01-01 ${endTimeStr}`, 'YYYY-MM-DD HH:mm')
                : dayjs(endTimeStr);
            } else {
              formState.deliver_start_time = null;
              formState.deliver_end_time = null;
            }
            formState.audience_type = data.audience_type || data.target_audience || "all";
          } else {
            // 编辑或查看模式但没有数据，重置表单
            resetForm();
          }
        } else {
          // 新增模式，重置表单
          resetForm();
        }
      });
    } else {
      // 弹窗关闭时也重置表单，确保下次打开时是干净的状态
      resetForm();
    }
  }
);

// 监听 visible 变化，同步到父组件
watch(visible, (newVal) => {
  emit("update:open", newVal);
});

// 重置表单
const resetForm = () => {
  // 先重置所有字段值
  formState.name = "";
  formState.positions = "";
  formState.api_key = "";
  formState.api_secret = "";
  formState.access_token = "";
  formState.redirect_url = "";
  formState.weight = null;
  formState.status = "pending";
  formState.display_time = null;
  formState.schedule_type = "all_time";
  formState.deliver_start_time = null;
  formState.deliver_end_time = null;
  formState.audience_type = "all";
  formState.end_time = "";
  formState.start_time = "";
  // 使用 nextTick 确保表单引用已准备好后再重置表单验证状态
  nextTick(() => {
    formRef.value?.resetFields();
    formRef.value?.clearValidate();
  });
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
      positions: formState.positions,
      api_key: formState.api_key,
      api_secret: formState.api_secret,
      access_token: formState.access_token,
      redirect_url: formState.redirect_url,
      weight: formState.weight,
      status: formState.status, // 保持原始值，不转换为布尔值
      schedule_type: formState.schedule_type,
      audience_type: formState.audience_type,
    };

    if (formState.display_time) {
      submitData.start_time = formState.display_time[0].format("YYYY-MM-DD");
      submitData.end_time = formState.display_time[1].format("YYYY-MM-DD");
    }

    if (formState.schedule_type === "specified" && formState.deliver_start_time && formState.deliver_end_time) {
      submitData.deliver_start_time = formState.deliver_start_time.format("HH:mm");
      submitData.deliver_end_time = formState.deliver_end_time.format("HH:mm");
    }

    // 这里应该调用API
    if (props.mode === "edit") {
      await updateAdvertisementApi(props.advertisementData!.id, submitData);
    } else {
      await createAdvertisementApi(submitData);
    }

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

