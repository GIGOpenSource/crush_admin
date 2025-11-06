<template>
  <div class="ai-config">
    <a-card :bordered="false">
      <template #title>
        <span>AI配置</span>
      </template>
      <div class="config-wrapper">
        <a-form :model="formState" layout="vertical" @finish="handleSubmit">
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="API Key" name="apiKey">
                <a-input-password v-model:value="formState.apiKey" placeholder="请输入 API Key" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="API Secret" name="apiSecret">
                <a-input-password v-model:value="formState.apiSecret" placeholder="请输入 API Secret" />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item label="模型名称" name="model">
                <a-input v-model:value="formState.model" placeholder="请输入模型名称" />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="温度参数" name="temperature">
                <a-input-number
                  v-model:value="formState.temperature"
                  :min="0"
                  :max="2"
                  :step="0.1"
                  style="width: 100%"
                  placeholder="0.0 - 2.0"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="24">
              <a-form-item label="基础提示词" name="prompt">
                <a-textarea
                  v-model:value="formState.prompt"
                  :rows="4"
                  placeholder="请输入基础提示词"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-form-item>
            <a-button type="primary" html-type="submit" :loading="loading">保存配置</a-button>
            <a-button style="margin-left: 8px" @click="handleReset">重置</a-button>
          </a-form-item>
        </a-form>
      </div>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';

interface ConfigForm {
  apiKey: string;
  apiSecret: string;
  model: string;
  temperature: number;
  prompt: string;
}

const loading = ref(false);
const formState = reactive<ConfigForm>({
  apiKey: '',
  apiSecret: '',
  model: '',
  temperature: 0.7,
  prompt: '',
});

const handleSubmit = async () => {
  loading.value = true;
  try {
    // TODO: 调用保存配置的 API
    await new Promise((resolve) => setTimeout(resolve, 500));
    message.success('配置保存成功');
  } catch (error) {
    message.error('配置保存失败');
  } finally {
    loading.value = false;
  }
};

const handleReset = () => {
  formState.apiKey = '';
  formState.apiSecret = '';
  formState.model = '';
  formState.temperature = 0.7;
  formState.prompt = '';
  message.info('已重置表单');
};

// TODO: 加载配置数据
const loadConfig = () => {
  // 加载配置
};
</script>

<style lang="less" scoped>
.ai-config {
  .config-wrapper {
    margin-top: 16px;
  }
}
</style>

